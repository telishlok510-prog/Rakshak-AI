"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { SCENARIOS, type SimScenario } from "@/lib/simulator";
import { logSimAnswer } from "@/lib/activity";

/**
 * Scam Simulator — interactive quiz-like experience.
 *
 * Users see realistic scam/safe examples and decide. After each answer they
 * get an explanation and see which indicators they should have spotted.
 * Points + progress tracking encourage completion.
 */
export default function ScamSimulator() {
  const { lang } = useI18n();
  const scenarios = SCENARIOS[lang];
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState<"scam" | "safe" | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const scenario: SimScenario | undefined = scenarios[current];
  const total = scenarios.length;
  const done = completed.size;
  const progress = Math.round((done / total) * 100);

  const safetyScore = total > 0 ? Math.round((score / total) * 100) : 0;

  const handleAnswer = (choice: "scam" | "safe") => {
    if (answer) return; // already answered
    setAnswer(choice);
    const correct =
      (choice === "scam" && scenario.isScam) ||
      (choice === "safe" && !scenario.isScam);
    if (correct) setScore((s) => s + 1);
    setCompleted((s) => new Set(s).add(scenario.id));
    logSimAnswer(scenario.id, correct);
  };

  const next = () => {
    setAnswer(null);
    setCurrent((c) => (c + 1) % total);
  };

  if (!scenario) return null;

  const isCorrect =
    answer &&
    ((answer === "scam" && scenario.isScam) ||
      (answer === "safe" && !scenario.isScam));

  return (
    <div className="space-y-6">
      {/* Progress bar and score */}
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="text-gray-600">
          {done}/{total} completed
        </span>
        <span className="text-primary">
          🏆 Financial Safety Score: {safetyScore}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Badge */}
      {done >= total && (
        <div className="rounded-xl bg-safe/10 p-4 text-center">
          <p className="text-2xl">🎖️</p>
          <p className="font-bold text-safe">
            {lang === "gu" ? "અભિનંદન! તમે બધા ઉદાહરણ પૂર્ણ કર્યા!" : "Congratulations! You completed all examples!"}
          </p>
        </div>
      )}

      {/* Scenario card */}
      <div className="card">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{scenario.categoryIcon}</span>
          <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {scenario.category}
          </span>
          <span className="ml-auto text-sm text-gray-400">
            {current + 1}/{total}
          </span>
        </div>

        <div className="whitespace-pre-wrap rounded-xl border border-gray-100 bg-canvas p-4 text-gray-800">
          {scenario.content}
        </div>

        {/* Answer buttons */}
        {!answer && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAnswer("safe")}
              className="rounded-xl border-2 border-safe bg-safe/5 px-5 py-4 text-lg font-bold text-safe transition hover:bg-safe/10"
            >
              ✅ {lang === "gu" ? "સલામત" : "Safe"}
            </button>
            <button
              onClick={() => handleAnswer("scam")}
              className="rounded-xl border-2 border-danger bg-danger/5 px-5 py-4 text-lg font-bold text-danger transition hover:bg-danger/10"
            >
              🚫 {lang === "gu" ? "છેતરપિંડી" : "Scam"}
            </button>
          </div>
        )}

        {/* Feedback */}
        {answer && (
          <div className="mt-4 space-y-3">
            <div
              className={`rounded-xl p-4 ${
                isCorrect ? "bg-safe/10 border-2 border-safe/30" : "bg-danger/10 border-2 border-danger/30"
              }`}
            >
              <p className="font-bold">
                {isCorrect
                  ? (lang === "gu" ? "✅ સાચો જવાબ!" : "✅ Correct!")
                  : (lang === "gu" ? "❌ ખોટો જવાબ" : "❌ Incorrect")}
              </p>
              <p className="mt-2 text-sm text-gray-700">{scenario.explanation}</p>
            </div>

            {/* Indicators */}
            <div className="rounded-xl bg-canvas p-4">
              <p className="mb-2 text-sm font-semibold text-primary">
                🔍 {lang === "gu" ? "મુખ્ય સંકેતો:" : "Key indicators:"}
              </p>
              <div className="flex flex-wrap gap-2">
                {scenario.indicators.map((ind, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={next} className="btn-primary w-full">
              {lang === "gu" ? "આગલું ⟶" : "Next ⟶"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
