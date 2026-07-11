"use client";

import { useI18n } from "@/lib/i18n";
import { LESSONS } from "@/lib/lessons";
import LessonCard from "@/components/LessonCard";
import ScamSimulator from "@/components/ScamSimulator";
import ScamTrends from "@/components/ScamTrends";

export default function LearnPage() {
  const { t, lang } = useI18n();
  const lessons = LESSONS[lang];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-primary">{t("learn.title")}</h1>
      <p className="mt-2 text-gray-600">{t("learn.subtitle")}</p>

      {/* New Scam Trends */}
      <section className="mt-8">
        <h2 className="mb-2 text-2xl font-bold text-primary">
          🆕 {t("learn.trends")}
        </h2>
        <p className="mb-4 text-gray-600">{t("learn.trendsSubtitle")}</p>
        <ScamTrends />
      </section>

      {/* Scam Simulator */}
      <section className="mt-12">
        <h2 className="mb-2 text-2xl font-bold text-primary">
          🎮 {t("learn.sim")}
        </h2>
        <p className="mb-4 text-gray-600">{t("learn.simSubtitle")}</p>
        <ScamSimulator />
      </section>

      {/* Lessons */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-primary">📚 {t("learn.title")}</h2>
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </section>
    </div>
  );
}
