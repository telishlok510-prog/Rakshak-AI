"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { analyze } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import RiskResult from "@/components/RiskResult";
import { logCheck } from "@/lib/activity";

/**
 * Screenshot Analyzer (spec section 4.2) — NOW WITH MULTIMODAL AI.
 *
 * TWO MODES:
 * 1. BASIC OCR (Private) — OCR runs fully in the browser via Tesseract.js.
 *    The image NEVER leaves the device. Only extracted text is analyzed.
 * 2. ADVANCED AI ANALYSIS — Sends image to Gemini for visual scam detection.
 *    Catches fake logos, suspicious UI, forged screens that OCR misses.
 *    User must explicitly opt in with a privacy warning.
 */
export default function ScreenshotChecker({
  initialFile,
}: {
  /** If set (e.g. a photo shared in from the Android share sheet), this
   * file is analyzed automatically on mount — same as if the user had
   * just picked it from the file input. */
  initialFile?: File | null;
}) {
  const { t, lang } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Tracks which initialFile we've already auto-analyzed, so we don't
  // re-trigger if the parent re-renders with the same file.
  const handledInitialFileRef = useRef<File | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState("");
  const [status, setStatus] = useState<"idle" | "ocr" | "analyzing" | "ai-analyzing">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  // Default to Advanced AI mode when a photo was shared in from Gallery
  // (initialFile set) — catches fake logos/UI that basic OCR would miss.
  // Otherwise starts in Basic OCR mode as before.
  const [useAI, setUseAI] = useState(!!initialFile);

  const reset = () => {
    setImageUrl(null);
    setFile(null);
    setExtracted("");
    setResult(null);
    setError(null);
    setStatus("idle");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = async (selectedFile: File, forceAI?: boolean) => {
    // forceAI lets a caller (like the shared-photo auto-analyze effect
    // below) explicitly choose AI mode for THIS call, without depending on
    // the `useAI` state value — which can still be stale/false at this
    // point due to how React batches state updates, even right after
    // calling setUseAI(true). Falls back to the current toggle state for
    // normal manual uploads.
    const aiModeForThisRun = forceAI ?? useAI;

    setError(null);
    setResult(null);
    setExtracted("");
    setImageUrl(URL.createObjectURL(selectedFile));
    setFile(selectedFile);
    setStatus("ocr");
    setProgress(0);

    try {
      // Load Tesseract only when needed (keeps initial bundle small).
      const { default: Tesseract } = await import("tesseract.js");
      const { data } = await Tesseract.recognize(selectedFile, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const textOut = data.text.trim();
      setExtracted(textOut);

      if (!textOut) {
        setError(t("check.emptyError") || "Could not read any text from the image.");
        setStatus("idle");
        return;
      }

      if (aiModeForThisRun) {
        await runImageAnalysis(selectedFile, textOut);
      } else {
        await runTextAnalysis(textOut);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read the image.");
      setStatus("idle");
    }
  };

  // useAI's initial value above can miss initialFile if it arrives AFTER
  // first mount (the parent converts it from sessionStorage asynchronously).
  // Switch to AI mode when it shows up, same fix as the auto-analyze effect
  // below and as CallChecker's mode switch.
  useEffect(() => {
    if (initialFile) {
      setUseAI(true);
    }
  }, [initialFile]);

  // If a file was shared in from another app (Android share sheet ->
  // Gallery), analyze it automatically once it arrives. initialFile often
  // arrives AFTER first mount (the parent converts it from sessionStorage
  // asynchronously), so this must depend on initialFile — not run once on
  // mount with an empty array — or it fires too early with null and never
  // fires again.
  useEffect(() => {
    if (initialFile && handledInitialFileRef.current !== initialFile) {
      handledInitialFileRef.current = initialFile;
      // forceAI: true — shared photos always get Advanced AI analysis,
      // regardless of the useAI toggle's current (possibly stale) state.
      handleFile(initialFile, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile]);

  /** Text-only analysis via existing API helper (OCR text, no image upload). */
  const runTextAnalysis = async (textOut: string) => {
    setStatus("analyzing");
    try {
      const r = await analyze("screenshot", textOut, lang);
      setResult(r);
      logCheck("screenshot", r.risk);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setStatus("idle");
    }
  };

  /** Multimodal image analysis — sends base64 image + OCR text to Gemini. */
  const runImageAnalysis = async (imageFile: File, textOut: string) => {
    setStatus("ai-analyzing");
    try {
      const base64 = await fileToBase64(imageFile);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "screenshot",
          text: textOut,
          language: lang,
          image: base64,
          useAI: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      const r: AnalysisResult = await res.json();
      setResult(r);
      logCheck("screenshot", r.risk);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image analysis failed.");
    } finally {
      setStatus("idle");
    }
  };

  /** Convert File to base64 data URL (includes mimeType prefix). */
  const fileToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  };

  return (
    <div className="space-y-4">
      {/* ── Mode Toggle ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-gray-700">
          {t("check.screenshot.modeLabel") || "Analysis Mode"}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setUseAI(false);
              if (file) reset();
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              !useAI
                ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>🛡️</span>
            <span>{t("check.screenshot.modeOCR") || "Basic OCR (Private)"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setUseAI(true);
              if (file) reset();
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              useAI
                ? "bg-amber-100 text-amber-800 ring-2 ring-amber-400"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>🤖</span>
            <span>{t("check.screenshot.modeAI") || "Advanced AI Analysis"}</span>
          </button>
        </div>

        {/* Mode description */}
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          {!useAI ? (
            <>
              <span className="font-semibold text-emerald-700">
                {t("check.screenshot.ocrPrivacy") || "Privacy-first:"}
              </span>{" "}
              {t("check.screenshot.ocrDesc") ||
                "Image stays on your device. Only extracted text is analyzed. Good for most screenshots."}
            </>
          ) : (
            <>
              <span className="font-semibold text-amber-700">
                {t("check.screenshot.aiWarning") || "Privacy notice:"}
              </span>{" "}
              {t("check.screenshot.aiDesc") ||
                "The image will be sent to Google Gemini AI to detect fake logos, suspicious designs, and visual fraud that text alone cannot catch. No personal data is stored."}
            </>
          )}
        </p>
      </div>

      {/* ── File Upload ── */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-canvas p-8 text-center transition hover:border-primary/60">
        <span aria-hidden className="text-4xl">🖼️</span>
        <span className="font-semibold text-primary">
          {t("check.screenshot.upload")}
        </span>
        <span className="text-sm text-gray-500">SMS · WhatsApp · UPI notification</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </label>

      {/* ── Status ── */}
      {status === "ocr" && (
        <p className="mt-2 font-medium text-primary">
          {t("check.screenshot.reading")} {progress}%
        </p>
      )}
      {status === "analyzing" && (
        <p className="mt-2 font-medium text-primary">{t("check.analyzing")}</p>
      )}
      {status === "ai-analyzing" && (
        <p className="mt-2 font-medium text-amber-600">
          {t("check.screenshot.aiAnalyzing") ||
            "Analyzing image with AI... checking logos, layout, and text..."}
        </p>
      )}
      {error && <p className="mt-3 font-medium text-danger">{error}</p>}

      {/* ── Preview + Extracted text ── */}
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