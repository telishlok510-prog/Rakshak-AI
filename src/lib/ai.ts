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

export async function analyzeWithAI(
  kind: CheckKind,
  text: string,
  language: LanguageCode
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // No key configured -> offline demo mode.
  if (!apiKey) return heuristicAnalyze(kind, text, language);

  const signals = collectSignals(kind, text);
  const signalHint = signals.length
    ? `Detected signals (codes): ${signals.map((s) => s.code).join(", ")}.`
    : "No strong rule-based signals were detected.";

  const fallback = heuristicAnalyze(kind, text, language);

  try {
    const client = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

    const response = await client.models.generateContent({
      model,
      contents: buildUserPrompt(kind, text, signalHint),
      config: {
        systemInstruction: buildSystemPrompt(language),
        responseMimeType: "application/json",
        maxOutputTokens: 900,
      },
    });

    const raw = response.text;
    const parsed = raw ? parseJson(raw) : null;
    if (!parsed) return fallback;

    return toAnalysisResult(parsed, fallback, "gemini");
  } catch (err) {
    console.error("[RakshakAI] Gemini analysis failed, using fallback:", err);
    return fallback;
  }
}
