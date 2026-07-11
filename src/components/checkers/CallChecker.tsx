"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import TextChecker from "./TextChecker";
import CallRecordingChecker from "./CallRecordingChecker";

type Mode = "text" | "recording";

/**
 * Phone Call checker — one entry point, two input methods, mirroring the
 * UpiChecker pattern (see UpiChecker.tsx). "Describe what was said" stays the
 * default since it's the most reliable path; uploading a recording is offered
 * as an alternative for calls the user wants to double-check after the fact.
 */
export default function CallChecker({ sample }: { sample?: string }) {
  const { lang } = useI18n();
  const [mode, setMode] = useState<Mode>("text");

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode("text")}
          className={`flex-1 rounded-xl border-2 px-4 py-2 text-sm font-semibold transition ${
            mode === "text"
              ? "border-primary bg-primary text-white"
              : "border-gray-200 bg-white text-primary hover:border-primary/40"
          }`}
        >
          ✍️ {lang === "gu" ? "શું કહ્યું તે લખો" : "Describe the call"}
        </button>
        <button
          onClick={() => setMode("recording")}
          className={`flex-1 rounded-xl border-2 px-4 py-2 text-sm font-semibold transition ${
            mode === "recording"
              ? "border-primary bg-primary text-white"
              : "border-gray-200 bg-white text-primary hover:border-primary/40"
          }`}
        >
          🎙️ {lang === "gu" ? "રેકોર્ડિંગ અપલોડ કરો" : "Upload recording"}
        </button>
      </div>

      {mode === "text" ? (
        <TextChecker kind="call" placeholderKey="check.placeholder.call" sample={sample} />
      ) : (
        <CallRecordingChecker />
      )}
    </div>
  );
}
