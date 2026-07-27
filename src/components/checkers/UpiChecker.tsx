"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import TextChecker from "./TextChecker";
import QrScanner from "./QrScanner";

type Mode = "text" | "qr";

/**
 * UPI Payment Request checker — one entry point, two input methods.
 *
 * Most UPI collect-request scams arrive as text (WhatsApp/SMS), which is why
 * "type it" is the default. Scanning a QR is offered as a one-tap alternative
 * rather than a separate top-level tab, since it's a narrower (but still
 * important) vector. Both modes reuse the existing, already-tested
 * TextChecker and QrScanner components — no detection logic is duplicated.
 */
export default function UpiChecker({ sample }: { sample?: string }) {
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
          ✍️ {lang === "gu" ? "વિગતો લખો" : "Type the details"}
        </button>
        <button
          onClick={() => setMode("qr")}
          className={`flex-1 rounded-xl border-2 px-4 py-2 text-sm font-semibold transition ${
            mode === "qr"
              ? "border-primary bg-primary text-white"
              : "border-gray-200 bg-white text-primary hover:border-primary/40"
          }`}
        >
          📷 {lang === "gu" ? "QR સ્કેન કરો" : "Scan QR instead"}
        </button>
      </div>

      {mode === "text" ? (
        <TextChecker kind="upi" placeholderKey="check.placeholder.upi" sample={sample} />
      ) : (
        <QrScanner />
      )}
    </div>
  );
}
