"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { SCAM_TRENDS } from "@/lib/trends";

/**
 * "New in the Market" scam-trends feed — introduces users to scam patterns
 * currently circulating (digital arrest, fake trading apps, etc.), distinct
 * from the evergreen Lessons content below it on the Learn page.
 */
export default function ScamTrends() {
  const { lang } = useI18n();
  const trends = SCAM_TRENDS[lang];
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {trends.map((tr) => {
        const open = openId === tr.id;
        return (
          <div key={tr.id} className="card border-l-4 border-accent">
            <button
              onClick={() => setOpenId(open ? null : tr.id)}
              className="flex w-full items-start gap-4 text-left"
              aria-expanded={open}
            >
              <span aria-hidden className="text-3xl">{tr.icon}</span>
              <span className="flex-1">
                <span className="mb-1 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">
                  {tr.month}
                </span>
                <span className="block text-lg font-bold text-primary">{tr.title}</span>
                <span className="block text-sm text-gray-600">{tr.summary}</span>
              </span>
              <span aria-hidden className="text-2xl text-gray-400">{open ? "−" : "+"}</span>
            </button>

            {open && (
              <div className="mt-4 space-y-3 border-t border-black/5 pt-4">
                <div>
                  <p className="mb-1 text-sm font-semibold text-primary">
                    {lang === "gu" ? "કેવી રીતે થાય છે:" : "How it works:"}
                  </p>
                  <p className="text-sm text-gray-700">{tr.howItWorks}</p>
                </div>
                <div className="rounded-xl bg-danger/5 p-3">
                  <p className="text-sm font-semibold text-danger">
                    🚩 {lang === "gu" ? "ચેતવણી સંકેત:" : "Red flag:"}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{tr.redFlag}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
