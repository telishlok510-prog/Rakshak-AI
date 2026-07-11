"use client";

import { Suspense, useState } from "react";
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

function CheckInner() {
  const { t } = useI18n();
  const params = useSearchParams();
  const initial = (params.get("tab") as Tab) || "sms";
  const [tab, setTab] = useState<Tab>(
    TABS.some((x) => x.id === initial) ? initial : "sms"
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-primary">{t("check.title")}</h1>
      <p className="mt-2 text-gray-600">{t("check.subtitle")}</p>

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
          <ScreenshotChecker />
        ) : tab === "upi" ? (
          <UpiChecker sample={SAMPLES.upi} />
        ) : tab === "call" ? (
          <CallChecker sample={SAMPLES.call} />
        ) : (
          <TextChecker
            key={tab}
            kind={tab}
            placeholderKey={`check.placeholder.${tab}`}
            sample={SAMPLES[tab]}
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
