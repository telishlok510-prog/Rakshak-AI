"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const PRACTICE_MODULES = [
  {
    href: "/learn#simulator",
    titleKey: "practice.scamSimulator",
    descKey: "practice.scamSimulator.desc",
    icon: "🎭",
    color: "bg-purple-100 text-purple-800",
  },
  {
    href: "/practice/scam-call",
    titleKey: "practice.scamCall",
    descKey: "practice.scamCall.desc",
    icon: "📞",
    color: "bg-rose-100 text-rose-800",
  },
  {
    href: "/practice/atm",
    titleKey: "practice.atm",
    descKey: "practice.atm.desc",
    icon: "🏧",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    href: "/practice/upi",
    titleKey: "practice.upi",
    descKey: "practice.upi.desc",
    icon: "📱",
    color: "bg-sky-100 text-sky-800",
  },
  {
    href: "/practice/netbanking",
    titleKey: "practice.netbanking",
    descKey: "practice.netbanking.desc",
    icon: "💻",
    color: "bg-amber-100 text-amber-800",
  },
  {
    href: "/practice/quiz",
    titleKey: "practice.quiz",
    descKey: "practice.quiz.desc",
    icon: "❓",
    color: "bg-orange-100 text-orange-800",
  },
];

export default function PracticePage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-primary">
          {t("practice.title") || "Practice Being Safe"}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          {t("practice.subtitle") ||
            "Learn by doing. Try realistic scenarios and build your skills before a real scam reaches you."}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRACTICE_MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
          >
            <div
              className={`mb-4 inline-flex rounded-xl px-3 py-2 text-2xl ${mod.color}`}
            >
              {mod.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary">
              {t(mod.titleKey)}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t(mod.descKey)}
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-primary">
              {t("practice.start") || "Start →"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}