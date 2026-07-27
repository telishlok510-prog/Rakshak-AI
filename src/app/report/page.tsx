"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

/**
 * Report a Scam (spec section 4.6).
 *
 * Privacy-first: we do NOT store reports. The form helps the user assemble the
 * details, then directs them to the official Cyber Crime Helpline (1930) and
 * the RBI Sachet portal, which are the correct authorities to file with.
 */
export default function ReportPage() {
  const { t } = useI18n();
  const [prepared, setPrepared] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", desc: "" });

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

      {/* Helper form (assembles details locally, nothing is sent) */}
      <section className="card mt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPrepared(true);
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block font-semibold text-gray-700">
              {t("report.name")}
            </label>
            <input
              className="field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block font-semibold text-gray-700">
              {t("report.phone")}
            </label>
            <input
              className="field"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block font-semibold text-gray-700">
              {t("report.desc")}
            </label>
            <textarea
              className="field"
              rows={4}
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
            />
          </div>

          <p className="text-sm text-gray-500">{t("report.note")}</p>

          <button type="submit" className="btn-primary w-full sm:w-auto">
            {t("report.submit")}
          </button>
        </form>

        {prepared && (
          <div className="mt-5 rounded-xl border-2 border-dashed border-safe/40 bg-safe/5 p-4">
            <p className="font-semibold text-safe">
              ✅ Your details are ready. Copy them and file at 1930 or the RBI
              Sachet portal above.
            </p>
            <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-700">
{`Name: ${form.name || "-"}
Phone: ${form.phone || "-"}
Details: ${form.desc || "-"}`}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
