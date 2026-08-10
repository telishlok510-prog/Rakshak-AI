import { GoogleGenAI } from "@google/genai";
import type {
  AnalysisResult,
  CheckKind,
  DetectedIndicator,
  LanguageCode,
  RiskLevel,
  ScamCategory,
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
 *
 * MULTIMODAL IMAGE ANALYSIS (NEW):
 * When a user opts in, screenshots are sent to Gemini as inline images.
 * Gemini analyzes BOTH visual elements (logos, UI, colors, layout) AND
 * text content to detect visual phishing, fake app interfaces, and forged
 * bank screens that OCR alone cannot catch.
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
  screenshot: "a screenshot image",
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
// Prompt building
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

/** System prompt specifically for image analysis — asks Gemini to look at visuals. */
function buildImageSystemPrompt(language: LanguageCode): string {
  return [
    "You are the scam-detection engine for Rakshak AI, a tool that protects",
    "first-time digital-banking users in rural India from financial fraud.",
    "You are analyzing a SCREENSHOT IMAGE. Look at BOTH the visual design",
    "(logos, colors, layout, buttons, URL bar) AND any text in the image.",
    "",
    "Visual checks to perform:",
    "- Is this a fake bank/app login screen? (wrong logo, misspelled name,",
    "  unusual colors, low-quality graphics)",
    "- Is the URL in the address bar suspicious? (typosquatting, not https,",
    "  weird domain like sbi-verify.xyz instead of sbi.co.in)",
    "- Are there fake urgency banners (red warnings, countdown timers)?",
    "- Does it ask for OTP/PIN/CVV on a screen that looks like a bank?",
    "- Is it a fake UPI payment screen with wrong payee details?",
    "- Are there visual inconsistencies (blurry logos, mismatched fonts)?",
    "",
    "Text checks to perform:",
    "- Fake bank domains, urgency words, prize/lottery bait",
    "- Requests for OTP, PIN, CVV, passwords",
    "- UPI collect requests disguised as receive requests",
    "",
    "Rules:",
    "- Real banks / RBI NEVER ask for OTP, PIN, CVV or passwords.",
    "- A UPI 'collect' request DEDUCTS money; it never adds money.",
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

/** Build prompt for image analysis — includes OCR text as grounding context. */
function buildImageUserPrompt(
  kind: CheckKind,
  text: string,
  signalHint: string
): string {
  return [
    `Please analyze this screenshot image.`,
    signalHint,
    "",
    "Additionally, here is the text extracted from the image by OCR (for reference):",
    '"""',
    text.slice(0, 2000),
    '"""',
    "",
    "Look carefully at the image for visual scam signs like fake logos,",
    "suspicious URLs, fake bank interfaces, urgency banners, and incorrect",
    "UPI screens. Combine visual clues with the text above.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Single-key call (one attempt against one specific key)
// ---------------------------------------------------------------------------

/**
 * Call Gemini with text-only content.
 */
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

/**
 * Call Gemini with image + text (multimodal).
 * Sends the image as inlineData alongside the analysis prompt.
 */
async function callGeminiImageOnce(
  apiKey: string,
  model: string,
  kind: CheckKind,
  text: string,
  imageBase64: string,
  mimeType: string,
  language: LanguageCode,
  signalHint: string
): Promise<Record<string, unknown> | null> {
  const client = new GoogleGenAI({ apiKey });

  const response = await client.models.generateContent({
    model,
    contents: [
      { text: buildImageUserPrompt(kind, text, signalHint) },
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ],
    config: {
      systemInstruction: buildImageSystemPrompt(language),
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
// Main entry points
// ---------------------------------------------------------------------------

/**
 * Analyze text-only content (existing behavior, unchanged).
 */
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

/**
 * NEW: Analyze a screenshot image using Gemini's multimodal vision capability.
 * Sends the image + OCR text + heuristic signals to Gemini.
 * Falls back to heuristicAnalyze if no API keys or all fail.
 */
export async function analyzeImageWithAI(
  kind: CheckKind,
  text: string,
  imageBase64: string,
  mimeType: string,
  language: LanguageCode
): Promise<AnalysisResult> {
  const keys = getRotatedKeys();

  console.log(
    `[RakshakAI][DEBUG][Image] Found ${keys.length} Gemini key(s) at runtime.`
  );

  // No key configured -> offline demo mode (OCR + heuristic only).
  if (keys.length === 0) return heuristicAnalyze(kind, text, language);

  const signals = collectSignals(kind, text);
  const signalHint = signals.length
    ? `Detected signals (codes): ${signals.map((s) => s.code).join(", ")}.`
    : "No strong rule-based signals were detected.";

  const fallback = heuristicAnalyze(kind, text, language);
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

  let lastErr: unknown;

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    console.log(
      `[RakshakAI][DEBUG][Image] Trying key #${i + 1} of ${keys.length}...`
    );
    try {
      const parsed = await callGeminiImageOnce(
        apiKey,
        model,
        kind,
        text,
        imageBase64,
        mimeType,
        language,
        signalHint
      );
      console.log(`[RakshakAI][DEBUG][Image] Key #${i + 1} succeeded.`);
      if (!parsed) return fallback;
      return toAnalysisResult(parsed, fallback, "gemini");
    } catch (e: unknown) {
      lastErr = e;
      const status = (e as { status?: number }).status;
      const message = e instanceof Error ? e.message : String(e);

      console.error(
        `[RakshakAI][DEBUG][Image] Key #${i + 1} FAILED. status=${status} message=${message}`
      );

      if (status === 429) {
        console.warn(
          `[RakshakAI][Image] Key #${i + 1} rate-limited (429), trying next key...`
        );
        continue;
      }
      break;
    }
  }

  console.error(
    "[RakshakAI][Image] All Gemini keys failed, using fallback:",
    lastErr
  );
  return fallback;
}

// ---------------------------------------------------------------------------
// Report Analysis for Alert System
// ---------------------------------------------------------------------------

/**
 * NEW: Analyze a scam report to generate category, summary, and prevention tip
 * for the location-based alert system. Reuses multi-key rotation pattern.
 */
export async function analyzeReportForAlert(
  reportText: string,
  language: LanguageCode
): Promise<{
  category: ScamCategory;
  summary: string;
  preventionTip: string;
}> {
  const keys = getRotatedKeys();

  console.log(`[RakshakAI][DEBUG][Report] Found ${keys.length} Gemini key(s) for report analysis.`);

  // No key configured -> generic fallback
  if (keys.length === 0) {
    return createFallbackReportAnalysis(reportText, language);
  }

  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const systemPrompt = buildReportAnalysisSystemPrompt(language);
  const userPrompt = buildReportAnalysisUserPrompt(reportText, language);

  let lastErr: unknown;

  // Try each key with same multi-key rotation logic
  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    console.log(`[RakshakAI][DEBUG][Report] Trying key #${i + 1} of ${keys.length}...`);
    
    try {
      const client = new GoogleGenAI({ apiKey });
      
      const response = await client.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 1024,
        },
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = (parts as any[])
        .filter((p) => typeof p.text === "string" && !p.thought)
        .map((p) => p.text as string)
        .join("");

      console.log(`[RakshakAI][DEBUG][Report] Key #${i + 1} succeeded, parsing response...`);
      
      const parsed = parseJson(raw);
      if (parsed && isValidReportAnalysis(parsed)) {
        return {
          category: parsed.category as ScamCategory,
          summary: String(parsed.summary),
          preventionTip: String(parsed.preventionTip),
        };
      }
      
      // Invalid response format, try next key
      console.warn(`[RakshakAI][Report] Key #${i + 1} returned invalid format, trying next...`);
      continue;
      
    } catch (e: unknown) {
      lastErr = e;
      const status = (e as { status?: number }).status;
      const message = e instanceof Error ? e.message : String(e);

      console.error(
        `[RakshakAI][DEBUG][Report] Key #${i + 1} FAILED. status=${status} message=${message}`
      );

      if (status === 429) {
        console.warn(`[RakshakAI][Report] Key #${i + 1} rate-limited (429), trying next key...`);
        continue;
      }
      
      // Non-rate-limit error, stop trying
      break;
    }
  }

  console.error("[RakshakAI][Report] All Gemini keys failed, using fallback:", lastErr);
  return createFallbackReportAnalysis(reportText, language);
}

function buildReportAnalysisSystemPrompt(language: LanguageCode): string {
  const langName = language === "en" ? "English" : "Gujarati";
  
  return [
    "You are analyzing scam reports for Rakshak AI's alert system.",
    "Your task: categorize the report, write a one-line summary, and provide",
    "a short prevention tip.",
    "",
    "Category options (choose ONE, exactly as written):",
    "- UPI Collect Request Scam",
    "- Digital Arrest / Fake Police Call",
    "- KYC Phishing SMS",
    "- Loan App Harassment",
    "- Investment / Trading Scam",
    "- Lottery / Prize Scam",
    "- Job Scam",
    "- OTP Sharing Scam",
    "- Other",
    "",
    "Rules:",
    `- Summary must be one line, maximum 100 characters, in ${langName}`,
    `- Prevention tip must be short (1-2 sentences), actionable, in ${langName}`,
    "- Category MUST be one of the exact strings above (in English)",
    "",
    "Respond with ONLY a JSON object (no markdown, no code fences):",
    "{",
    '  "category": "<one of the categories above>",',
    `  "summary": "<one line in ${langName}>",`,
    `  "preventionTip": "<short tip in ${langName}>"`,
    "}",
  ].join("\n");
}

function buildReportAnalysisUserPrompt(reportText: string, language: LanguageCode): string {
  return [
    "Please analyze this scam report and categorize it:",
    "",
    '"""',
    reportText.slice(0, 2000), // Cap at 2000 chars for efficiency
    '"""',
  ].join("\n");
}

function isValidReportAnalysis(parsed: Record<string, unknown>): boolean {
  const validCategories = [
    "UPI Collect Request Scam",
    "Digital Arrest / Fake Police Call",
    "KYC Phishing SMS",
    "Loan App Harassment",
    "Investment / Trading Scam",
    "Lottery / Prize Scam",
    "Job Scam",
    "OTP Sharing Scam",
    "Other",
  ];
  
  return (
    typeof parsed.category === "string" &&
    validCategories.includes(parsed.category) &&
    typeof parsed.summary === "string" &&
    parsed.summary.length > 0 &&
    parsed.summary.length <= 200 &&
    typeof parsed.preventionTip === "string" &&
    parsed.preventionTip.length > 0
  );
}

function createFallbackReportAnalysis(
  reportText: string,
  language: LanguageCode
): {
  category: ScamCategory;
  summary: string;
  preventionTip: string;
} {
  // Extract first ~100 chars as summary
  const summary = reportText.slice(0, 100).trim() + (reportText.length > 100 ? "..." : "");
  
  // Generic prevention tip
  const preventionTip = language === "gu"
    ? "કોઈને પણ OTP, PIN અથવા કાર્ડ વિગતો શેર કરશો નહીં. શંકા હોય તો 1930 પર કૉલ કરો."
    : "Never share OTP, PIN, or card details with anyone. Call 1930 if suspicious.";
  
  return {
    category: "Other" as ScamCategory,
    summary,
    preventionTip,
  };
}