"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import SafetyQuiz from "@/components/SafetyQuiz";

export default function QuizPracticePage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/practice"
        className="mb-6 inline-block text-primary hover:underline"
      >
        {t("practice.back")}
      </Link>

      <SafetyQuiz 
        questionCount={10}
        onComplete={(score, total) => {
          console.log(`Quiz completed: ${score}/${total}`);
        }}
      />
    </div>
  );
}
