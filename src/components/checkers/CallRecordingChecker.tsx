"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { analyze } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import { logCheck } from "@/lib/activity";
import RiskResult from "@/components/RiskResult";

/**
 * Call Recording Analyzer with Gemini-powered audio transcription.
 *
 * Flow: Upload audio → AI transcribes it → transcript shown → AI analyzes
 * for scam indicators. The user can edit the transcript before checking.
 */

export default function CallRecordingChecker() {
  const { t, lang } = useI18n();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFile = async (file: File) => {
    setResult(null);
    setError(null);
    setTranscript("");
    setAudioUrl(URL.createObjectURL(file));

    // Convert file to base64 and send to transcription API
    setTranscribing(true);
    try {
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), "")
      );

      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64, mimeType: file.type || "audio/mpeg" }),
      });

      if (res.ok) {
        const data = (await res.json()) as { transcript: string };
        setTranscript(data.transcript);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(
          data.error ??
            (lang === "gu"
              ? "ટ્રાન્સક્રિપ્શન નિષ્ફળ. કૃપા કરીને જાતે ટાઇપ કરો."
              : "Transcription failed. Please type manually.")
        );
      }
    } catch {
      setError(
        lang === "gu"
          ? "ટ્રાન્સક્રિપ્શન નિષ્ફળ. કૃપા કરીને જાતે ટાઇપ કરો."
          : "Transcription failed. Please type manually."
      );
    } finally {
      setTranscribing(false);
    }
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
    <div className="space-y-4">
      {/* Step 1: Upload recording */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-canvas p-6 text-center transition hover:border-primary/60">
        <span aria-hidden className="text-3xl">🎙️</span>
        <span className="text-sm font-semibold text-primary">
          {lang === "gu" ? "કૉલ રેકોર્ડિંગ અપલોડ કરો" : "Upload a call recording"}
        </span>
        <span className="text-xs text-gray-500">
          {lang === "gu"
            ? "MP3, M4A, WAV — AI આપોઆપ ટ્રાન્સક્રાઇબ કરશે"
            : "MP3, M4A, WAV — AI will auto-transcribe it"}
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

      {/* Transcribing indicator */}
      {transcribing && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-4">
          <span className="inline-flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
          </span>
          <span className="text-sm font-semibold text-primary">
            {lang === "gu" ? "AI ઑડિયો ટ્રાન્સક્રાઇબ કરી રહ્યું છે..." : "AI is transcribing the audio..."}
          </span>
        </div>
      )}

      {/* Audio player */}
      {audioUrl && !transcribing && (
        <div className="rounded-xl bg-canvas p-3">
          <p className="mb-2 text-xs font-semibold text-gray-500">
            {lang === "gu" ? "🔊 રેકોર્ડિંગ:" : "🔊 Recording:"}
          </p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio ref={audioRef} src={audioUrl} controls className="w-full" />
        </div>
      )}

      {/* Transcript (auto-filled by AI, editable by user) */}
      {(transcript || audioUrl) && !transcribing && (
        <div>
          <label className="mb-1 block font-semibold text-gray-700">
            {lang === "gu"
              ? "📝 AI ટ્રાન્સક્રિપ્ટ (જરૂર પડે તો સુધારો):"
              : "📝 AI Transcript (edit if needed):"}
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={5}
            placeholder={t("check.placeholder.call")}
            className="field resize-y"
          />
        </div>
      )}

      {error && <p className="font-medium text-danger">{error}</p>}

      {/* Check button — only enabled when there's text */}
      {transcript.trim() && (
        <button onClick={run} disabled={loading} className="btn-primary w-full sm:w-auto">
          {loading ? t("check.analyzing") : t("check.analyze")}
        </button>
      )}

      {result && <RiskResult result={result} originalText={transcript} />}
    </div>
  );
}
