"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import AlertOptIn from "@/components/AlertOptIn";
import type { ScamCategory } from "@/lib/types";

/**
 * Report a Scam (spec section 4.6) + NEW: AI-powered alert system
 *
 * Privacy-first: we do NOT store personal details. The AI analyzes the report
 * text to categorize it and send location-based alerts to other users in the
 * same district, helping them avoid the same scam.
 */
export default function ReportPage() {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ desc: "", district: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    category: ScamCategory;
    summary: string;
    preventionTip: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.desc.trim().length < 10) {
      setError(lang === "gu" 
        ? "કૃપા કરીને વધુ વિગતો પ્રદાન કરો (ઓછામાં ઓછા 10 અક્ષરો)"
        : "Please provide more details (minimum 10 characters)");
      return;
    }

    // Get district from localStorage (if user opted into alerts)
    const savedDistrict = typeof window !== "undefined" 
      ? localStorage.getItem("rakshak_alert_district") || ""
      : "";

    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportText: form.desc,
          district: savedDistrict || "Unknown",
          language: lang,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setSubmitted(true);
      
    } catch (e) {
      console.error("[Report] Submission failed:", e);
      setError(
        lang === "gu"
          ? "સબમિશન નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો."
          : "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-primary">{t("report.title")}</h1>
      <p className="mt-2 text-gray-600">{t("report.subtitle")}</p>

      {/* Helplines first — the most important action */}
      <section className="card mt-6">
        <h2 className="text-lg font-bold text-primary">{t("report.helplines")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href="tel:1930"
            className="flex items-center gap-3 rounded-xl bg-danger px-5 py-4 font-bold text-white"
          >
            <span aria-hidden className="text-2xl">📞</span>
            <span>
              {t("report.helpline.cyber")}
              <span className="block text-sm font-normal">1930</span>
            </span>
          </a>
          <a
            href="https://sachet.rbi.org.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border-2 border-primary px-5 py-4 font-bold text-primary"
          >
            <span aria-hidden className="text-2xl">🏛️</span>
            <span>
              {t("report.helpline.sachet")}
              <span className="block text-sm font-normal">sachet.rbi.org.in</span>
            </span>
          </a>
        </div>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-primary underline underline-offset-2"
        >
          cybercrime.gov.in →
        </a>
      </section>

      {/* NEW: Alert System Opt-In */}
      <section className="mt-6">
        <AlertOptIn />
      </section>

      {/* Report Submission Form */}
      <section className="card mt-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {lang === "gu" ? "સ્કૅમ જાણ કરો અને અન્યોને ચેતવણી આપો" : "Report a Scam & Warn Others"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-semibold text-gray-700">
              {t("report.desc")}
            </label>
            <textarea
              className="field"
              rows={5}
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder={
                lang === "gu"
                  ? "શું થયું તેનું વર્ણન કરો... (કોણે ફોન કર્યો? શું કહ્યું? તેઓએ શું માંગ્યું?)"
                  : "Describe what happened... (Who called? What did they say? What did they ask for?)"
              }
              disabled={submitting || submitted}
            />
          </div>

          <p className="text-sm text-gray-500">
            {lang === "gu"
              ? "🔒 તમારી જાણ તમારા જિલ્લામાં અન્ય યુઝર્સને ચેતવવા માટે વપરાય છે. કોઈ વ્યક્તિગત વિગતો સાચવવામાં આવતી નથી."
              : "🔒 Your report is used to warn other users in your district. No personal details are stored."}
          </p>

          {error && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {!submitted && (
            <button
              type="submit"
              disabled={submitting || form.desc.trim().length < 10}
              className="btn-primary w-full disabled:opacity-50 sm:w-auto"
            >
              {submitting
                ? (lang === "gu" ? "વિશ્લેષણ કરી રહ્યા છીએ..." : "Analyzing...")
                : (lang === "gu" ? "જાણ કરો અને અલર્ટ મોકલો" : "Report & Send Alert")}
            </button>
          )}
        </form>

        {/* AI Analysis Result */}
        {submitted && analysis && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border-2 border-green-500 bg-green-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <h3 className="text-lg font-bold text-green-900">
                  {lang === "gu" ? "જાણ મોકલાઈ ગઈ છે" : "Report Submitted"}
                </h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-green-800">
                    {lang === "gu" ? "સ્કૅમ પ્રકાર:" : "Scam Type:"}
                  </p>
                  <p className="text-green-900">{analysis.category}</p>
                </div>
                
                <div>
                  <p className="font-semibold text-green-800">
                    {lang === "gu" ? "સારાંશ:" : "Summary:"}
                  </p>
                  <p className="text-green-900">{analysis.summary}</p>
                </div>
                
                <div className="rounded-lg bg-white/60 p-3">
                  <p className="font-semibold text-primary">
                    💡 {lang === "gu" ? "અટકાવ માટેની ટિપ:" : "Prevention Tip:"}
                  </p>
                  <p className="mt-1 text-gray-800">{analysis.preventionTip}</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-green-700">
                {lang === "gu"
                  ? "તમારા જિલ્લાના અન્ય યુઝર્સને આ સ્કૅમ વિશે સૂચના મળશે."
                  : "Other users in your district will be notified about this scam."}
              </p>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setAnalysis(null);
                setForm({ ...form, desc: "" });
              }}
              className="text-sm font-semibold text-primary underline"
            >
              {lang === "gu" ? "બીજો સ્કૅમ જાણ કરો" : "Report Another Scam"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
