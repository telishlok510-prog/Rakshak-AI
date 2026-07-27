"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { analyze } from "@/lib/api";
import { parseQrContent, describeUpiIntent, type UpiIntent } from "@/lib/upi";
import type { AnalysisResult } from "@/lib/types";
import { logCheck } from "@/lib/activity";
import RiskResult from "@/components/RiskResult";

/**
 * QR Code Scanner — spec section "QR Code Scams" + future-scope item.
 *
 * Uses the native browser BarcodeDetector API where available (Chrome/Edge on
 * Android — the primary target device — decode natively, no dependency, best
 * performance). Falls back to the lightweight jsqr library on browsers that
 * lack native support (Safari/Firefox). Frames are decoded and discarded on
 * the device; only the decoded text is ever sent to the analyzer.
 */

// Minimal shape for the experimental BarcodeDetector API (not yet in lib.dom.d.ts).
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
}
declare global {
  interface Window {
    BarcodeDetector?: { new (opts: { formats: string[] }): BarcodeDetectorLike };
  }
}

type Status = "idle" | "starting" | "scanning" | "found" | "analyzing" | "error";

export default function QrScanner() {
  const { t, lang } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<string | null>(null);
  const [upiIntent, setUpiIntent] = useState<UpiIntent | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stop(), []);

  const handleDecoded = async (text: string) => {
    stop();
    setStatus("found");
    setDecoded(text);

    const parsed = parseQrContent(text);
    setUpiIntent(parsed.isUpi ? parsed : null);

    setStatus("analyzing");
    try {
      if (parsed.isUpi) {
        const r = await analyze("upi", describeUpiIntent(parsed), lang);
        setResult(r);
        logCheck("upi", r.risk);
      } else {
        const r = await analyze("url", parsed.raw, lang);
        setResult(r);
        logCheck("url", r.risk);
      }
    } catch {
      setError(t("check.emptyError"));
    } finally {
      setStatus("found");
    }
  };

  const start = async () => {
    setError(null);
    setDecoded(null);
    setUpiIntent(null);
    setResult(null);
    setStatus("starting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("scanning");
      scanLoop();
    } catch {
      setStatus("error");
      setError(
        lang === "gu"
          ? "કેમેરા એક્સેસ મળી નથી. કૃપા કરીને પરવાનગી આપો."
          : "Could not access the camera. Please allow camera permission."
      );
    }
  };

  const scanLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    detectFrame(canvas, ctx).then((text) => {
      if (text) {
        handleDecoded(text);
      } else {
        rafRef.current = requestAnimationFrame(scanLoop);
      }
    });
  };

  // Try native BarcodeDetector first; fall back to jsqr.
  const detectFrame = async (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ): Promise<string | null> => {
    if (typeof window !== "undefined" && window.BarcodeDetector) {
      try {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const codes = await detector.detect(canvas);
        if (codes.length > 0) return codes[0].rawValue;
        return null;
      } catch {
        // fall through to jsqr
      }
    }
    const { default: jsQR } = await import("jsqr");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return code?.data ?? null;
  };

  const reset = () => {
    setStatus("idle");
    setDecoded(null);
    setUpiIntent(null);
    setResult(null);
    setError(null);
  };

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">
        🔒{" "}
        {lang === "gu"
          ? "કેમેરા ફ્રેમ ફક્ત તમારા ડિવાઇસ પર જ ડિકોડ થાય છે અને ક્યાંય મોકલાતી નથી."
          : "Camera frames are decoded only on your device and never uploaded."}
      </p>

      {status === "idle" && (
        <button onClick={start} className="btn-primary w-full">
          📷 {lang === "gu" ? "QR કોડ સ્કેન કરો" : "Scan a QR Code"}
        </button>
      )}

      {(status === "starting" || status === "scanning") && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl bg-black">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} className="w-full" muted playsInline />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-2xl border-4 border-accent/80" />
            </div>
          </div>
          <p className="text-center text-sm text-gray-500">
            {lang === "gu" ? "QR કોડને ફ્રેમમાં રાખો..." : "Point the camera at a QR code..."}
          </p>
          <button onClick={() => { stop(); reset(); }} className="btn-ghost w-full">
            {lang === "gu" ? "રદ કરો" : "Cancel"}
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-3">
          <p className="font-medium text-danger">{error}</p>
          <button onClick={start} className="btn-primary w-full">
            {lang === "gu" ? "ફરી પ્રયાસ કરો" : "Try again"}
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {decoded && (status === "analyzing" || status === "found") && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-gray-100 bg-canvas p-3">
            <p className="mb-1 text-xs font-semibold text-gray-500">
              {lang === "gu" ? "ડિકોડ થયેલ QR ડેટા:" : "Decoded QR content:"}
            </p>
            <p className="break-all text-sm text-gray-700">{decoded}</p>
          </div>

          {/* Deterministic warning — always correct regardless of AI confidence */}
          {upiIntent && (
            <div className="rounded-xl border-2 border-danger/40 bg-danger/5 p-4">
              <p className="font-bold text-danger">
                {lang === "gu"
                  ? `⚠️ આ QR સ્કેન કરી ચૂકવણી કરવાથી ${upiIntent.amount ? `₹${upiIntent.amount}` : "પૈસા"} ${upiIntent.payeeAddress ? `'${upiIntent.payeeAddress}' ને` : ""} મોકલાશે. તે તમારા ખાતામાં પૈસા ઉમેરશે નહીં!`
                  : `⚠️ Scanning and paying this QR will SEND ${upiIntent.amount ? `₹${upiIntent.amount}` : "money"} ${upiIntent.payeeAddress ? `to '${upiIntent.payeeAddress}'` : "out"}. It will NOT add money to your account.`}
              </p>
            </div>
          )}

          {status === "analyzing" && (
            <p className="text-center font-medium text-primary">{t("check.analyzing")}</p>
          )}

          {result && <RiskResult result={result} originalText={decoded} />}

          <button onClick={reset} className="btn-ghost w-full">
            {lang === "gu" ? "બીજો QR સ્કેન કરો" : "Scan another QR"}
          </button>
        </div>
      )}
    </div>
  );
}
