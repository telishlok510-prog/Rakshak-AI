"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { LanguageCode } from "@/lib/types";

const BCP47: Record<LanguageCode, string> = {
  en: "en-IN",
  gu: "gu-IN",
};

/**
 * Text-to-Speech button ("Listen in <language>") using the browser's built-in
 * Web Speech API. Free, on-device, and works offline once the voice is loaded.
 * Falls back gracefully when the browser has no matching voice.
 *
 * When `autoPlay` is true, the result is spoken automatically once as soon as
 * it appears — used for Gujarati results so low-literacy users hear the
 * verdict immediately without needing to find and tap the Listen button.
 */
export default function VoiceButton({
  text,
  autoPlay = false,
}: {
  text: string;
  autoPlay?: boolean;
}) {
  const { lang, t } = useI18n();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const autoPlayedFor = useRef<string | null>(null);
  // Bumped every time speech starts/stops so callbacks from a cancelled
  // (stale) utterance chain can tell they're stale and stop chaining.
  const sessionRef = useRef(0);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" && "speechSynthesis" in window
    );
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        sessionRef.current += 1;
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = () => {
    sessionRef.current += 1; // invalidate any in-flight chunk chain
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speak = () => {
    if (!supported) return;

    if (speaking) {
      stop();
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    // Chrome's speechSynthesis has a long-standing bug where a single long
    // utterance silently cuts off after a few seconds. Splitting the text
    // into sentence-sized chunks and speaking them one after another (each
    // as its own utterance) avoids the cutoff so the full message — including
    // the safety/prevention advice at the end — is always heard.
    const chunks = text
      .split(/(?<=[.!?।])\s+/)
      .map((c) => c.trim())
      .filter(Boolean);
    if (chunks.length === 0) return;

    const voices = synth.getVoices();
    const match = voices.find((v) => v.lang?.toLowerCase().startsWith(lang));

    const mySession = ++sessionRef.current;
    let i = 0;
    const speakNext = () => {
      // If the user hit Stop (or a new speak() started) while we were
      // mid-chain, this session is stale — do NOT queue the next chunk.
      if (sessionRef.current !== mySession) return;
      if (i >= chunks.length) {
        setSpeaking(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance(chunks[i]);
      utter.lang = BCP47[lang];
      utter.rate = 0.95;
      if (match) utter.voice = match;
      utter.onend = () => {
        i += 1;
        speakNext();
      };
      utter.onerror = () => {
        // A real synthesis error should stop this chain too, not skip ahead
        // silently — but only if this session is still the active one.
        if (sessionRef.current === mySession) setSpeaking(false);
      };
      synth.speak(utter);
    };

    setSpeaking(true);
    speakNext();
  };

  // Auto-play once per distinct result text, only when requested.
  useEffect(() => {
    if (!autoPlay || !supported || !text) return;
    if (autoPlayedFor.current === text) return; // already played this result
    autoPlayedFor.current = text;
    speak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, supported, text]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speak}
      className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/20 bg-white px-4 py-2 font-semibold text-primary transition hover:border-primary/50"
      aria-pressed={speaking}
    >
      <span aria-hidden className="text-xl">🔊</span>
      {speaking ? t("result.stop") : t("result.listen")}
    </button>
  );
}
