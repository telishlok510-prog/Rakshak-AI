"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { analyze } from "@/lib/api";
import type { AnalysisResult, CheckKind } from "@/lib/types";
import RiskResult from "@/components/RiskResult";
import { logCheck } from "@/lib/activity";

/**
 * Shared text-input analyzer used by the SMS, UPI, URL and Call tabs.
 * Each tab passes its own `kind` and placeholder so a single, well-tested
 * component powers all four flows (spec section 5: consistent detection).
 */
export default function TextChecker({
  kind,
  placeholderKey,
  sample,
  initialValue,
}: {
  kind: CheckKind;
  placeholderKey: string;
  sample?: string;
  initialValue?: string;
}) {
  const { t, lang } = useI18n();
  const [text, setText] = useState(initialValue || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const run = async (overrideText?: string) => {
    const value = overrideText ?? text;
    if (!value.trim()) {
      setError(t("check.emptyError"));
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const r = await analyze(kind, value, lang);
      setResult(r);
      logCheck(kind, r.risk);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // If this checker was opened with content shared in from another app
  // (e.g. the Android share sheet), analyze it automatically once on
  // mount — the user already chose to share it here specifically to
  // have it checked, so don't make them tap "Analyze" again.
  useEffect(() => {
    if (initialValue && initialValue.trim()) {
      run(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t(placeholderKey)}
        rows={5}
        className="field resize-y"
        aria-label={t(placeholderKey)}
      />

      {sample && (
        <button
          type="button"
          onClick={() => setText(sample)}
          className="mt-2 text-sm font-semibold text-primary underline underline-offset-2"
        >
          Try an example
        </button>
      )}

      {error && <p className="mt-3 font-medium text-danger">{error}</p>}

      <button onClick={() => run()} disabled={loading} className="btn-primary mt-4 w-full sm:w-auto">
        {loading ? t("check.analyzing") : t("check.analyze")}
      </button>

      {result && <RiskResult result={result} originalText={text} />}
    </div>
  );
}