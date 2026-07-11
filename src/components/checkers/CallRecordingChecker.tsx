"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { analyze } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import { logCheck } from "@/lib/activity";
import RiskResult from "@/components/RiskResult";

/**
 * Call Recording Analyzer.
 *
 * Honest technical note: there is no speech-to-text API configured in this
 * project (only GEMINI_API_KEY, and Gemini's API does not transcribe
 * audio). Rather than silently fail or add a new paid third-party dependency,
 * this component:
 *   1. Lets the user upload/play the recording (always works).
 *   2. Provides a transcript box to type what was said (primary, reliable
 *      path — reuses the same detection pipeline as every other checker).
 *   3. Offers an EXPERIMENTAL auto-transcribe using the browser's Web Speech
 *      API listening through the mic while the recording plays. This is
 *      clearly labeled experimental since accuracy depends on speaker volume
 *      and background noise — it is a bonus convenience, not the primary flow.
 */

// Minimal ambient types for the non-standard SpeechRecognition API.
interface SpeechRecognitionResultLike {
  [index: number]: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike> & { length: number };
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognitionLike };
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
  }
}

const BCP47: Record<string, string> = { en: "en-IN", gu: "gu-IN" };

export default function CallRecordingChecker() {
  const { t, lang } = useI18n();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [autoSupported] = useState(
    () =>
      typeof window !== "undefined" &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFile = (file: File) => {
    setResult(null);
    setError(null);
    setAudioUrl(URL.createObjectURL(file));
  };

  const startAutoTranscribe = () => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = BCP47[lang] ?? "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let text = "";
      for (let i = 0; i < ev.results.length; i++) {
        text += ev.results[i][0].transcript + " ";
      }
      setTranscript(text.trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    setListening(true);
    rec.start();
    audioRef.current?.play();
  };

  const stopAutoTranscribe = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const run = async () => {
    if (!transcript.trim()) {
      setError(t("check.emptyError"));
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const r = await analyze("call", transcript, lang);
      setResult(r);
      logCheck("call", r.risk);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Step 1: upload the recording */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-canvas p-8 text-center transition hover:border-primary/60">
        <span aria-hidden className="text-4xl">🎙️</span>
        <span className="font-semibold text-primary">
          {lang === "gu" ? "કૉલ રેકોર્ડિંગ અપલોડ કરો" : "Upload a call recording"}
        </span>
        <span className="text-sm text-gray-500">
          {lang === "gu" ? "MP3, M4A, WAV — તમારા ડિવાઇસ પર જ રહે છે" : "MP3, M4A, WAV — stays on your device"}
        </span>
        <input
          type="file"
          accept="audio/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </label>

      {audioUrl && (
        <div className="mt-4 space-y-4">
          <audio ref={audioRef} src={audioUrl} controls className="w-full" />

          {/* Step 2: experimental auto-transcribe (bonus, not primary) */}
          {autoSupported && (
            <div className="rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-4">
              <p className="mb-2 text-sm font-semibold text-primary">
                🧪 {lang === "gu" ? "પ્રયોગાત્મક: આપોઆપ લખાણ" : "Experimental: Auto-transcribe"}
              </p>
              <p className="mb-3 text-xs text-gray-600">
                {lang === "gu"
                  ? "રેકોર્ડિંગ ભજવો અને સ્પીકર પર રાખો — માઇક સાંભળીને લખશે. ચોકસાઈ અવાજ પર આધારિત છે."
                  : "Plays the recording near your mic and listens along. Accuracy depends on speaker volume — always double-check the text below."}
              </p>
              <button
                type="button"
                onClick={listening ? stopAutoTranscribe : startAutoTranscribe}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-primary transition hover:brightness-95"
              >
                {listening
                  ? `⏹ ${lang === "gu" ? "બંધ કરો" : "Stop listening"}`
                  : `🎧 ${lang === "gu" ? "સાંભળીને લખો" : "Listen & auto-fill"}`}
              </button>
            </div>
          )}

          {/* Step 3: transcript — the primary, always-reliable path */}
          <div>
            <label className="mb-1 block font-semibold text-gray-700">
              {lang === "gu" ? "કૉલમાં શું કહ્યું હતું?" : "What was said in the call?"}
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={5}
              placeholder={t("check.placeholder.call")}
              className="field resize-y"
            />
            <p className="mt-1 text-xs text-gray-500">
              {lang === "gu"
                ? "ઉપરનું બટન લખાણ ભરી શકે, પણ ચકાસીને જરૂર મુજબ સુધારો."
                : "Auto-fill is a starting point — please review and correct it before checking."}
            </p>
          </div>

          {error && <p className="font-medium text-danger">{error}</p>}

          <button onClick={run} disabled={loading} className="btn-primary w-full sm:w-auto">
            {loading ? t("check.analyzing") : t("check.analyze")}
          </button>
        </div>
      )}

      {result && <RiskResult result={result} originalText={transcript} />}
    </div>
  );
}
