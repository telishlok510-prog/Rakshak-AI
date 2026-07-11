import type {
  AnalysisResult,
  CheckKind,
  LanguageCode,
} from "./types";

/** Client-side helper to call the analysis API. */
export async function analyze(
  kind: CheckKind,
  text: string,
  language: LanguageCode
): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, text, language }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Analysis failed. Please try again.");
  }

  return (await res.json()) as AnalysisResult;
}
