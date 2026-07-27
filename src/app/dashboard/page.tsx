"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import {
  computeSafetyScore,
  getBadges,
  getSummary,
  type ActivitySummary,
  type Badge,
} from "@/lib/activity";
import { LESSONS } from "@/lib/lessons";
import { getSimTotal } from "@/lib/simulator";

const RISK_ICON: Record<string, string> = { safe: "✅", suspicious: "⚠️", scam: "🚫" };
const RISK_COLOR: Record<string, string> = {
  safe: "text-safe",
  suspicious: "text-accent",
  scam: "text-danger",
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#2E7D32" : score >= 40 ? "#FF9933" : "#D32F2F";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg width="144" height="144" className="-rotate-90">
        <circle cx="72" cy="72" r="54" fill="none" stroke="#E5E7EB" strokeWidth="12" />
        <circle
          cx="72"
          cy="72"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="card flex items-center gap-3 py-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-extrabold text-primary">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [score, setScore] = useState(0);

  // Reads from localStorage only on the client, after hydration.
  useEffect(() => {
    const s = getSummary();
    setSummary(s);
    setBadges(getBadges(s));
    setScore(computeSafetyScore(s, LESSONS[lang].length, getSimTotal(lang)));
  }, [lang]);

  if (!summary) return null;

  const quizAccuracy =
    summary.simAnswered > 0 ? Math.round((summary.simCorrect / summary.simAnswered) * 100) : 0;
  const hasActivity = summary.totalChecks > 0 || summary.simAnswered > 0 || summary.lessonsRead > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-primary">{t("dash.title")}</h1>
      <p className="mt-2 text-gray-600">{t("dash.subtitle")}</p>

      {!hasActivity ? (
        <div className="card mt-8 text-center">
          <p className="text-5xl">🌱</p>
          <p className="mt-3 text-lg font-semibold text-gray-700">{t("dash.empty")}</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/check" className="btn-primary">
              {t("dash.cta.check")}
            </Link>
            <Link href="/learn" className="btn-ghost">
              {t("dash.cta.learn")}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Score + key stats */}
          <div className="card mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex flex-col items-center gap-2 text-center">
              <ScoreRing score={score} />
              <p className="font-bold text-primary">{t("dash.score")}</p>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-2">
              <StatCard icon="🔍" label={t("dash.checks")} value={summary.totalChecks} />
              <StatCard icon="🚫" label={t("dash.caught")} value={summary.scamsCaught} />
              <StatCard icon="🧠" label={t("dash.quizAcc")} value={`${quizAccuracy}%`} />
              <StatCard icon="📚" label={t("dash.lessons")} value={summary.lessonsRead} />
            </div>
          </div>

          {/* Badges */}
          <div className="card mt-6">
            <h2 className="mb-4 text-lg font-bold text-primary">
              🎖️ {t("dash.badges")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 px-4 py-3 ${
                    b.earned
                      ? "border-accent bg-accent/10"
                      : "border-gray-100 bg-gray-50 opacity-40"
                  }`}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <span className="text-xs font-semibold text-gray-700">{b.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent checks */}
          {summary.recentChecks.length > 0 && (
            <div className="card mt-6">
              <h2 className="mb-4 text-lg font-bold text-primary">{t("dash.recent")}</h2>
              <ul className="divide-y divide-gray-100">
                {summary.recentChecks.map((c, i) => (
                  <li key={i} className="flex items-center justify-between py-2">
                    <span className="font-medium capitalize text-gray-700">{c.kind}</span>
                    <span className={`flex items-center gap-1 font-bold ${RISK_COLOR[c.risk]}`}>
                      {RISK_ICON[c.risk]} {c.risk}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <p className="mt-6 text-center text-sm text-gray-400">{t("dash.privacy")}</p>
    </div>
  );
}
