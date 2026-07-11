"use client";

import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

  const objectives = [
    { icon: "🔎", title: "Detect", text: "Identify scam calls, UPI requests, phishing SMS and loan-scam patterns using AI." },
    { icon: "💬", title: "Explain", text: "Show WHY something is a scam in simple, jargon-free local language." },
    { icon: "📚", title: "Educate", text: "Build long-term financial literacy so users recognize scams on their own." },
    { icon: "🌍", title: "Include", text: "Remove language and literacy barriers with voice-first, local-language design." },
    { icon: "🛡️", title: "Empower", text: "Give users a simple path to report scams and reach official helplines." },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-primary">{t("about.title")}</h1>

      <section className="card mt-6">
        <h2 className="text-lg font-bold text-primary">The problem</h2>
        <p className="mt-2 leading-relaxed text-gray-700">
          India pushed digital payments into rural areas faster than digital-safety
          awareness could keep up. Millions of first-time users cannot recognize
          scam calls, fake UPI requests, phishing messages or fraudulent loan apps —
          especially when warning signs are only explained in English. Once money
          moves via UPI, recovery is extremely difficult, so prevention matters far
          more than cure.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-primary">Our mission</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {objectives.map((o) => (
            <div key={o.title} className="card">
              <div className="flex items-center gap-3">
                <span aria-hidden className="text-3xl">{o.icon}</span>
                <h3 className="text-lg font-bold text-primary">{o.title}</h3>
              </div>
              <p className="mt-2 text-gray-700">{o.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-6">
        <h2 className="text-lg font-bold text-primary">Responsible AI</h2>
        <p className="mt-2 leading-relaxed text-gray-700">
          Rakshak AI uses AI only for detection and plain-language explanation —
          never for surveillance or data collection. Basic scam-checking needs no
          login, and screenshots are read on your own device.
        </p>
      </section>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-danger/30 bg-danger/5 p-5">
        <p className="font-semibold text-danger">Disclaimer</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          {t("footer.disclaimer")}
        </p>
      </div>
    </div>
  );
}
