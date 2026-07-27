"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Lesson } from "@/lib/lessons";
import VoiceButton from "./VoiceButton";
import { logLessonRead } from "@/lib/activity";

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  const spoken = [lesson.title, lesson.summary, ...lesson.points].join(". ");

  return (
    <div className="card">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) logLessonRead(lesson.id);
        }}
        className="flex w-full items-center gap-4 text-left"
        aria-expanded={open}
      >
        <span aria-hidden className="text-3xl">{lesson.icon}</span>
        <span className="flex-1">
          <span className="block text-lg font-bold text-primary">
            {lesson.title}
          </span>
          <span className="block text-sm text-gray-600">{lesson.summary}</span>
        </span>
        <span aria-hidden className="text-2xl text-gray-400">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="mt-4 border-t border-black/5 pt-4">
          <ul className="space-y-2">
            {lesson.points.map((p, i) => (
              <li key={i} className="flex gap-2 text-gray-800">
                <span aria-hidden className="text-accent">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <VoiceButton text={spoken} />
          </div>

          {/* Mini quiz */}
          <div className="mt-5 rounded-xl bg-canvas p-4">
            <p className="font-semibold text-primary">🧠 {t("learn.quiz")}</p>
            <p className="mt-2">{lesson.quiz.q}</p>
            <div className="mt-3 flex flex-col gap-2">
              {lesson.quiz.options.map((opt, i) => {
                const isPicked = picked === i;
                const isCorrect = i === lesson.quiz.answer;
                let cls = "border-gray-200 bg-white";
                if (picked !== null && isCorrect) cls = "border-safe bg-safe/10";
                else if (isPicked && !isCorrect) cls = "border-danger bg-danger/10";
                return (
                  <button
                    key={i}
                    onClick={() => setPicked(i)}
                    className={`rounded-lg border-2 px-4 py-2 text-left font-medium transition ${cls}`}
                  >
                    {opt}
                    {picked !== null && isCorrect && " ✓"}
                    {isPicked && !isCorrect && " ✗"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
