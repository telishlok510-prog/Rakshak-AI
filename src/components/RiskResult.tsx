"use client";

import { useI18n } from "@/lib/i18n";
import type { AnalysisResult, RiskLevel } from "@/lib/types";
import VoiceButton from "./VoiceButton";

const STYLES: Record<
  RiskLevel,
  { bar: string; ring: string; icon: string }
> = {
  safe: { bar: "bg-safe", ring: "text-safe", icon: "✅" },
  suspicious: { bar: "bg-accent", ring: "text-accent", icon: "⚠️" },
  scam: { bar: "bg-danger", ring: "text-danger", icon: "🚫" },
};

/** Escape a string for safe use inside a RegExp. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlighted({
  text,
  terms,
}: {
  text: string;
  terms: string[];
}) {
  const clean = terms.filter((t) => t && t.trim().length > 1);
  if (clean.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${clean.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        clean.some((c) => c.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="rounded bg-danger/20 px-1 font-semibold text-danger">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function RiskResult({
  result,
  originalText,
}: {
  result: AnalysisResult;
  originalText?: string;
}) {
  const { t, lang } = useI18n();
  const s = STYLES[result.risk];

  // Everything spoken aloud, in reading order — includes the prevention /
  // recommended-action steps so the voice output isn't just the verdict.
  const spoken = [
    t(`result.${result.risk}`),
    result.reason,
    ...result.recommendedActions,
    result.safetyTip,
  ].join(". ");

  return (
    <section
      className="card mt-6 border-l-8"
      style={{
        borderLeftColor:
          result.risk === "scam"
            ? "#D32F2F"
            : result.risk === "suspicious"
            ? "#FF9933"
            : "#2E7D32",
      }}
      aria-live="polite"
    >
      {/* Header: verdict + probability */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-4xl">{s.icon}</span>
          <div>
            <h2 className={`text-2xl font-extrabold ${s.ring}`}>
              {t(`result.${result.risk}`)}
            </h2>
            <p className="text-sm text-gray-500">
              {result.source === "gemini"
                ? t("result.source.ai")
                : t("result.source.heuristic")}
            </p>
          </div>
        </div>
        <VoiceButton text={spoken} autoPlay={lang === "gu"} />
      </div>

      {/* Scam probability meter */}
      <div className="mt-5">
        <div className="mb-1 flex items-center justify-between text-sm font-semibold">
          <span className="uppercase tracking-wide text-gray-500">
            {t("result.confidence")}
          </span>
          <span className={s.ring}>{result.confidence}%</span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-valuenow={result.confidence}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full ${s.bar} transition-all`}
            style={{ width: `${result.confidence}%` }}
          />
        </div>
      </div>

      {/* One-line reason */}
      <div className="mt-5 rounded-xl bg-canvas p-4">
        <p className="text-lg font-medium">{result.reason}</p>
      </div>

      {/* Original text with suspicious words highlighted */}
      {originalText && result.highlights.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-gray-500">
            {t("check.screenshot.extracted")}
          </p>
          <div className="whitespace-pre-wrap break-words rounded-xl border border-gray-100 bg-white p-3 text-gray-700">
            <Highlighted text={originalText} terms={result.highlights} />
          </div>
        </div>
      )}

      {/* Explainable AI: which indicators were detected and why */}
      {result.indicators.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-bold text-primary">
            🔍 {t("result.reason")}
          </h3>
          <ul className="space-y-3">
            {result.indicators.map((ind, i) => (
              <li
                key={i}
                className="rounded-xl border border-black/5 bg-canvas p-4"
              >
                <p className="font-semibold text-gray-900">• {ind.label}</p>
                {ind.detail && (
                  <p className="mt-1 text-sm text-gray-600">{ind.detail}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended actions */}
      {result.recommendedActions.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-bold text-primary">
            ✅ {t("result.tip")}
          </h3>
          <ul className="space-y-2">
            {result.recommendedActions.map((a, i) => (
              <li key={i} className="flex gap-2 text-gray-800">
                <span aria-hidden className="text-primary">›</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety tip */}
      <div className="mt-6 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-4">
        <p className="font-medium text-primary">💡 {result.safetyTip}</p>
      </div>

      {/* Escalation for high risk */}
      {result.risk === "scam" && (
        <a
          href="tel:1930"
          className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-danger px-5 py-4 text-lg font-bold text-white"
        >
          📞 Call 1930 (Cyber Crime Helpline)
        </a>
      )}
    </section>
  );
}
