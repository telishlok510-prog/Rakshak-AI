"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { analyze } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import RiskResult from "@/components/RiskResult";
import { logCheck } from "@/lib/activity";

/**
 * Screenshot Analyzer (spec section 4.2).
 *
 * OCR runs fully in the browser via Tesseract.js — the image never leaves the
 * user's device. Extracted text is shown for verification, then passed through
 * the same detection pipeline as the SMS analyzer.
 */
export default function ScreenshotChecker() {
  const { t, lang } = useI18n();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extracted, setExtracted] = useState("");
  const [status, setStatus] = useState<"idle" | "ocr" | "analyzing">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setResult(null);
    setExtracted("");
    setImageUrl(URL.createObjectURL(file));
    setStatus("ocr");
    setProgress(0);

    try {
      // Load Tesseract only when needed (keeps initial bundle small).
      const { default: Tesseract } = await import("tesseract.js");
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const textOut = data.text.trim();
      setExtracted(textOut);

      if (!textOut) {
        setError(t("check.emptyError"));
        setStatus("idle");
        return;
      }

      setStatus("analyzing");
      const r = await analyze("screenshot", textOut, lang);
      setResult(r);
      logCheck("screenshot", r.risk);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read the image.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-canvas p-8 text-center transition hover:border-primary/60">
        <span aria-hidden className="text-4xl">🖼️</span>
        <span className="font-semibold text-primary">
          {t("check.screenshot.upload")}
        </span>
        <span className="text-sm text-gray-500">SMS · WhatsApp · UPI notification</span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </label>

      {status === "ocr" && (
        <p className="mt-4 font-medium text-primary">
          {t("check.screenshot.reading")} {progress}%
        </p>
      )}
      {status === "analyzing" && (
        <p className="mt-4 font-medium text-primary">{t("check.analyzing")}</p>
      )}
      {error && <p className="mt-3 font-medium text-danger">{error}</p>}

      {(imageUrl || extracted) && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt="Uploaded screenshot"
              className="max-h-72 w-full rounded-xl border border-black/5 object-contain"
            />
          )}
          {extracted && (
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-500">
                {t("check.screenshot.extracted")}
              </p>
              <div className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-gray-100 bg-white p-3 text-sm text-gray-700">
                {extracted}
              </div>
            </div>
          )}
        </div>
      )}

      {result && <RiskResult result={result} originalText={extracted} />}
    </div>
  );
}
