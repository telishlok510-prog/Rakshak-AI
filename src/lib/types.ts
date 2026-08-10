export type RiskLevel = "safe" | "suspicious" | "scam";

export type CheckKind = "sms" | "upi" | "url" | "call" | "screenshot";

export type LanguageCode = "en" | "gu";

/** Fixed scam categories for alert system notifications */
export type ScamCategory =
  | "UPI Collect Request Scam"
  | "Digital Arrest / Fake Police Call"
  | "KYC Phishing SMS"
  | "Loan App Harassment"
  | "Investment / Trading Scam"
  | "Lottery / Prize Scam"
  | "Job Scam"
  | "OTP Sharing Scam"
  | "Other";

/** Stable codes for each detectable phishing / scam indicator. */
export type IndicatorCode =
  | "URGENCY"
  | "CREDENTIALS"
  | "LOAN"
  | "PRIZE"
  | "SHORTENER"
  | "FAKE_DOMAIN"
  | "RISKY_TLD"
  | "UPI_COLLECT"
  | "UPI_SMALL_AMOUNT"
  | "CALL_IMPERSONATION"
  /** Visual / image-specific indicators (used by multimodal AI analysis) */
  | "FAKE_LOGO"
  | "SUSPICIOUS_UI"
  | "VISUAL_MISMATCH"
  | "GENERIC";

export interface DetectedIndicator {
  code: IndicatorCode;
  /** Short localized label, e.g. "Asks for OTP / PIN" */
  label: string;
  /** Localized plain-language explanation of WHY this is risky */
  detail: string;
  /** Substrings from the input that triggered this indicator */
  matches: string[];
}

/** Standard text-only analysis request. */
export interface AnalyzeRequest {
  kind: CheckKind;
  text: string;
  language: LanguageCode;
}

/** Image analysis request (screenshot with optional AI visual analysis). */
export interface AnalyzeImageRequest extends AnalyzeRequest {
  /** Base64-encoded image (with or without data: prefix) */
  image: string;
  /** When true, sends image to Gemini for visual analysis.
   *  When false/omitted, uses on-device OCR + heuristic only. */
  useAI: boolean;
}

export interface AnalysisResult {
  /** Overall classification */
  risk: RiskLevel;
  /** 0 - 100 probability that this is a scam */
  confidence: number;
  /** One-line summary reason, localized */
  reason: string;
  /** Explainable AI: the specific indicators that were detected */
  indicators: DetectedIndicator[];
  /** Concrete, localized next steps for the user */
  recommendedActions: string[];
  /** Short, practical safety tip, localized */
  safetyTip: string;
  /** Substrings from the input to highlight in the UI */
  highlights: string[];
  /** Whether the answer came from the AI provider or the offline fallback */
  source: "gemini" | "heuristic";
}