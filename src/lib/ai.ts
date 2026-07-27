import { GoogleGenAI } from "@google/genai";
import type {
  AnalysisResult,
  CheckKind,
  DetectedIndicator,
  LanguageCode,
  RiskLevel,
} from "./types";
import { collectSignals, heuristicAnalyze } from "./detection";

/**
 * AI Detection Engine (Google Gemini API — free tier, no credit card).
 *
 * The heuristic engine provides structured signals that are fed to Gemini as
 * grounding context. Gemini then produces an explainable, localized result.
 * If no API key is configured or the call fails, we gracefully fall back to
 * the offline heuristic engine so the product always returns a useful answer.
 *
 * MULTI-KEY ROTATION:
 * Free-tier Gemini keys are limited to 15 requests/min and 1000/day EACH.
 * To avoid hitting that limit quickly, we support multiple API keys and
 * rotate between them. If a key gets rate-limited (429), we automatically
 * try the next key before giving up and falling back to the heuristic engine.
 */

const LANG_NAME: Record<LanguageCode, string> = {
  en: "English",
  gu: "Gujarati",
};

const KIND_LABEL: Record<CheckKind, string> = {
  sms: "an SMS / text message",
  upi: "a UPI payment request",
  url: "a website or payment link",
  call: "a description of a phone call",
  screenshot: "text extracted from a screenshot",
};

// ---------------------------------------------------------------------------
// Multi-key support
// ---------------------------------------------------------------------------

/**
 * Collect all configured Gemini API keys.
 * Supports two env styles so you can pick whichever is easier in Vercel:
 *   1) GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_API_KEY_3, ...
 *   2) GEMINI_API_KEYS="key1,key2,key3" (comma-separated, single var)
 * Falls back to the original single GEMINI_API_KEY for backward compatibility.
 */
export function getApiKeys(): string[] {
  const keys: string[] = [];

  // Style 1: numbered vars GEMINI_API_KEY_1..GEMINI_API_KEY_10
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key) keys.push(key);
  }

  // Style 2: single comma-separated var
  if (process.env.GEMINI_API_KEYS) {
    for (const k of process.env.GEMINI_API_KEYS.split(",")) {
      const trimmed = k.trim();
      if (trimmed) keys.push(trimmed);
    }
  }

  // Backward compatibility: original single-key var
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);

  // De-duplicate in case the same key was set in more than one place
  return Array.from(new Set(keys));
}

// Round-robin pointer. NOTE: on serverless (Vercel), each function
// invocation may get a fresh module instance, so this mainly helps
// during warm invocations / local dev. See note at the bottom for a
// stateless alternative.
let rotationIndex = 0;

/** Returns keys starting at the current rotation pointer, wrapping around. */
export function getRotatedKeys(): string[] {
  const keys = getApiKeys();
  if (keys.length === 0) return [];
  const start = rotationIndex % keys.length;
  rotationIndex = (rotationIndex + 1) % keys.length;
  return [...keys.slice(start), ...keys.slice(0, start)];
}

// ---------------------------------------------------------------------------
// Prompt building (unchanged)
// ---------------------------------------------------------------------------

function buildSystemPrompt(language: LanguageCode): string {
  return [
    "You are the scam-detection engine for Rakshak AI, a tool that protects",
    "first-time digital-banking users in rural India from financial fraud.",
    "You classify content as scam, suspicious, or safe and explain WHY in",
    "simple, jargon-free language a first-time user can understand.",
    "",
    "Rules:",
    "- Real banks / RBI NEVER ask for OTP, PIN, CVV or passwords.",
    "- A UPI 'collect' request DEDUCTS money; it never adds money.",
    "- Urgency, threats, prize/lottery bait, and shortened or look-alike bank",
    "  domains are strong scam signals.",
    "- Be protective but not alarmist. If genuinely safe, say so.",
    `- Write 'reason', 'safetyTip', every indicator 'label'/'detail', and each`,
    `  recommended action in ${LANG_NAME[language]}.`,
    "",
    "Respond with ONLY a JSON object (no markdown, no code fences) shaped like:",
    "{",
    '  "risk": "scam" | "suspicious" | "safe",',
    '  "confidence": number (0-100, probability it is a scam),',
    '  "reason": string,',
    '  "indicators": [{ "label": string, "detail": string }],',
    '  "recommendedActions": [string],',
    '  "safetyTip": string,',
    '  "highlights": [string]',
    "}",
  ].join("\n");
}

function coerceRisk(value: unknown): RiskLevel {
  return value === "scam" || value === "suspicious" || value === "safe"
    ? value
    : "suspicious";
}

/** Safely pull the first JSON object out of a model response. */
function parseJson(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

/** Turn the raw parsed JSON (from any provider) into a validated AnalysisResult. */
function toAnalysisResult(
  parsed: Record<string, unknown>,
  fallback: AnalysisResult,
  source: AnalysisResult["source"]
): AnalysisResult {
  const rawIndicators = Array.isArray(parsed.indicators)
    ? (parsed.indicators as Array<Record<string, unknown>>)
    : [];
  const indicators: DetectedIndicator[] = rawIndicators
    .filter((i) => typeof i.label === "string")
    .map((i) => ({
      code: "GENERIC",
      label: String(i.label),
      detail: typeof i.detail === "string" ? i.detail : "",
      matches: [],
    }));

  const actions = Array.isArray(parsed.recommendedActions)
    ? (parsed.recommendedActions as unknown[]).map(String)
    : [];
  const highlights = Array.isArray(parsed.highlights)
    ? (parsed.highlights as unknown[]).map(String)
    : [];

  const confidence = Number(parsed.confidence);

  return {
    risk: coerceRisk(parsed.risk),
    confidence:
      Number.isFinite(confidence) && confidence >= 0 && confidence <= 100
        ? Math.round(confidence)
        : fallback.confidence,
    reason: typeof parsed.reason === "string" ? parsed.reason : fallback.reason,
    indicators: indicators.length ? indicators : fallback.indicators,
    recommendedActions: actions.length ? actions : fallback.recommendedActions,
    safetyTip:
      typeof parsed.safetyTip === "string" ? parsed.safetyTip : fallback.safetyTip,
    highlights: highlights.length ? highlights : fallback.highlights,
    source,
  };
}

function buildUserPrompt(kind: CheckKind, text: string, signalHint: string): string {
  return [
    `Please analyze ${KIND_LABEL[kind]}.`,
    signalHint,
    "",
    "Content:",
    '"""',
    text.slice(0, 4000),
    '"""',
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Single-key call (one attempt against one specific key)
// ---------------------------------------------------------------------------

async function callGeminiOnce(
  apiKey: string,
  model: string,
  kind: CheckKind,
  text: string,
  language: LanguageCode,
  signalHint: string
): Promise<Record<string, unknown> | null> {
  const client = new GoogleGenAI({ apiKey });

  const response = await client.models.generateContent({
    model,
    contents: buildUserPrompt(kind, text, signalHint),
    config: {
      systemInstruction: buildSystemPrompt(language),
      maxOutputTokens: 8192,
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (parts as any[])
    .filter((p) => typeof p.text === "string" && !p.thought)
    .map((p) => p.text as string)
    .join("");

  return raw.length > 20 ? parseJson(raw) : null;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function analyzeWithAI(
  kind: CheckKind,
  text: string,
  language: LanguageCode
): Promise<AnalysisResult> {
  const keys = getRotatedKeys();

  // TEMPORARY DEBUG LOG — remove once the issue is fixed.
  // This prints to Vercel's Runtime Logs so we can see exactly how many
  // keys were found at runtime, without ever printing the key values.
  console.log(`[RakshakAI][DEBUG] Found ${keys.length} Gemini key(s) at runtime.`);

  // No key configured -> offline demo mode.
  if (keys.length === 0) return heuristicAnalyze(kind, text, language);

  const signals = collectSignals(kind, text);
  const signalHint = signals.length
    ? `Detected signals (codes): ${signals.map((s) => s.code).join(", ")}.`
    : "No strong rule-based signals were detected.";

  const fallback = heuristicAnalyze(kind, text, language);
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

  let lastErr: unknown;

  // Try each key in rotated order. On 429 (rate limit) move to the next key
  // immediately — no point retrying the same exhausted key. On any other
  // error, stop and fall back to heuristics right away.
  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    // TEMPORARY DEBUG LOG — shows which key SLOT is being tried (never the
    // key value itself) so we can see exactly how far the loop gets.
    console.log(`[RakshakAI][DEBUG] Trying key #${i + 1} of ${keys.length}...`);
    try {
      const parsed = await callGeminiOnce(apiKey, model, kind, text, language, signalHint);
      console.log(`[RakshakAI][DEBUG] Key #${i + 1} succeeded.`);
      if (!parsed) return fallback; // model responded but gave unusable output
      return toAnalysisResult(parsed, fallback, "gemini");
    } catch (e: unknown) {
      lastErr = e;
      const status = (e as { status?: number }).status;
      const message = e instanceof Error ? e.message : String(e);

      // TEMPORARY DEBUG LOG — full error detail for this specific key.
      console.error(
        `[RakshakAI][DEBUG] Key #${i + 1} FAILED. status=${status} message=${message}`
      );

      if (status === 429) {
        console.warn(
          `[RakshakAI] Key #${i + 1} rate-limited (429), trying next key...`
        );
        continue; // try next key in the list
      }

      // Non-rate-limit error (network issue, invalid key, etc.) — no point
      // hammering every remaining key with the same request, fall back now.
      break;
    }
  }

  console.error("[RakshakAI] All Gemini keys failed, using fallback:", lastErr);
  return fallback;
}