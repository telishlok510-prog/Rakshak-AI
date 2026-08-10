"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import type { CheckKind } from "@/lib/types";
import TextChecker from "@/components/checkers/TextChecker";
import ScreenshotChecker from "@/components/checkers/ScreenshotChecker";
import UpiChecker from "@/components/checkers/UpiChecker";
import CallChecker from "@/components/checkers/CallChecker";

type Tab = CheckKind;

const TABS: { id: Tab; labelKey: string; icon: string }[] = [
  { id: "sms", labelKey: "check.tab.sms", icon: "✉️" },
  { id: "upi", labelKey: "check.tab.upi", icon: "💸" },
  { id: "url", labelKey: "check.tab.url", icon: "🔗" },
  { id: "call", labelKey: "check.tab.call", icon: "📞" },
  { id: "screenshot", labelKey: "check.tab.screenshot", icon: "🖼️" },
];

// Relatable demo examples for quick live demonstration.
const SAMPLES: Partial<Record<Tab, string>> = {
  sms: "Dear customer, your SBI account will be BLOCKED today. Update KYC immediately: http://sbi-verify.xyz. Share OTP to confirm.",
  upi: "You are receiving Rs.5000 gift. Approve this collect request from rahul-prize@okaxis to receive money.",
  url: "http://icici-bank-kyc.top/login",
  call: "Caller said he is from RBI, my account will be blocked in 1 hour, and asked me to share the OTP to keep it active.",
};

/** Convert a base64 data URL (from sessionStorage) back into a real File. */
async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

function CheckInner() {
  const { t } = useI18n();
  const params = useSearchParams();

  // Message shared in from another app (WhatsApp/SMS/etc) via /share-target.
  // useSearchParams() already URL-decodes this for us.
  const sharedMessage = params.get("message");
  const isAutofill = params.get("autofill") === "1" && !!sharedMessage;

  // Photo shared in from Gallery, and (pending CallChecker wiring) a call
  // recording shared in from Files — both were stashed into sessionStorage
  // by the /share-target POST route because files are too large for a URL.
  const [sharedPhotoFile, setSharedPhotoFile] = useState<File | null>(null);
  const [sharedRecordingFile, setSharedRecordingFile] = useState<File | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedPhoto = sessionStorage.getItem("rakshak_shared_photo");
    if (storedPhoto) {
      sessionStorage.removeItem("rakshak_shared_photo");
      dataUrlToFile(storedPhoto, "shared-screenshot.jpg")
        .then(setSharedPhotoFile)
        .catch((e) => console.error("[RakshakAI] Failed to load shared photo:", e));
    }

    const storedRecording = sessionStorage.getItem("rakshak_shared_recording");
    if (storedRecording) {
      sessionStorage.removeItem("rakshak_shared_recording");
      dataUrlToFile(storedRecording, "shared-recording.m4a")
        .then(setSharedRecordingFile)
        .catch((e) => console.error("[RakshakAI] Failed to load shared recording:", e));
    }
  }, []);

  // If something was shared in, always land on the SMS tab (that's the
  // most common real-world source of a forwarded scam message) unless a
  // specific tab was explicitly requested in the URL.
  const requestedTab = params.get("tab") as Tab | null;
  const initial: Tab =
    requestedTab && TABS.some((x) => x.id === requestedTab) ? requestedTab : "sms";
  const [tab, setTab] = useState<Tab>(initial);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-primary">{t("check.title")}</h1>
      <p className="mt-2 text-gray-600">{t("check.subtitle")}</p>

      {isAutofill && (
        <p className="mt-3 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          {t("check.sharedMessageNotice") || "Message loaded from share — review and analyze below."}
        </p>
      )}
      {sharedPhotoFile && (
        <p className="mt-3 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          {t("check.sharedPhotoNotice") || "Photo loaded from share — analyzing below."}
        </p>
      )}
      {sharedRecordingFile && (
        <p className="mt-3 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          {t("check.sharedRecordingNotice") || "Recording loaded from share — transcribing below."}
        </p>
      )}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label={t("check.title")}
        className="mt-6 flex flex-wrap gap-2"
      >
        {TABS.map((x) => {
          const active = tab === x.id;
          return (
            <button
              key={x.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(x.id)}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-semibold transition ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-primary hover:border-primary/40"
              }`}
            >
              <span aria-hidden>{x.icon}</span>
              {t(x.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="card mt-6">
        {tab === "screenshot" ? (
          <ScreenshotChecker initialFile={sharedPhotoFile} />
        ) : tab === "upi" ? (
          <UpiChecker sample={SAMPLES.upi} />
        ) : tab === "call" ? (
          <CallChecker sample={SAMPLES.call} initialRecordingFile={sharedRecordingFile} />
        ) : (
          <TextChecker
            key={tab}
            kind={tab}
            placeholderKey={`check.placeholder.${tab}`}
            sample={SAMPLES[tab]}
            // If a message was shared in AND we're on the sms tab, prefill
            // the textarea with it — TextChecker will auto-run analysis
            // on mount when initialValue is set, so the user sees the
            // result immediately without tapping "Analyze" again.
            initialValue={tab === "sms" ? sharedMessage ?? undefined : undefined}
          />
        )}
      </div>
    </div>
  );
}

export default function CheckPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">…</div>}>
      <CheckInner />
    </Suspense>
  );
}