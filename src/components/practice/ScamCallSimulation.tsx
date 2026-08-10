"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { SCAM_CALL_SCENARIOS, type ScamCallScenario, type ScamCallPausePoint } from "@/lib/scamCall";
import { logPracticeComplete } from "@/lib/activity";
import VoiceButton from "../VoiceButton";

interface ScamCallSimulationProps {
  scenario: ScamCallScenario;
  onComplete?: (score: number, total: number) => void;
}

type PlayState = "idle" | "playing" | "paused" | "question" | "completed";

export default function ScamCallSimulation({ scenario, onComplete }: ScamCallSimulationProps) {
  const { lang } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPausePointIndex, setCurrentPausePointIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredPoints, setAnsweredPoints] = useState<Set<number>>(new Set());

  const currentPausePoint = scenario.pausePoints[currentPausePointIndex];
  const allAnswered = answeredPoints.size === scenario.pausePoints.length;

  // Monitor audio time and auto-pause at pause points
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);

      // Check if we've reached a pause point
      if (playState === "playing") {
        const nextUnansweredPoint = scenario.pausePoints.find(
          (point, index) => 
            !answeredPoints.has(index) && time >= point.atSeconds
        );

        if (nextUnansweredPoint) {
          audio.pause();
          const pointIndex = scenario.pausePoints.indexOf(nextUnansweredPoint);
          setCurrentPausePointIndex(pointIndex);
          setPlayState("question");
        }
      }
    };

    const handleEnded = () => {
      if (allAnswered) {
        setPlayState("completed");
        // Log completion to activity tracker
        logPracticeComplete("scam-call", score, scenario.pausePoints.length);
        onComplete?.(score, scenario.pausePoints.length);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playState, answeredPoints, scenario.pausePoints, allAnswered, score, onComplete]);

  const handlePlay = () => {
    audioRef.current?.play();
    setPlayState("playing");
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setPlayState("paused");
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setPlayState("idle");
      setScore(0);
      setAnsweredPoints(new Set());
      setCurrentPausePointIndex(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    setShowFeedback(true);

    // Update score
    if (optionIndex === currentPausePoint.correctOptionIndex) {
      setScore(prev => prev + 1);
    }

    // Mark this pause point as answered
    setAnsweredPoints(prev => new Set([...prev, currentPausePointIndex]));
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setPlayState("playing");
    audioRef.current?.play();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = (currentTime / scenario.durationSeconds) * 100;

  return (
    <div className="space-y-6">
      {/* Scenario Header */}
      <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        <h2 className="text-2xl font-bold text-primary">
          {scenario.title[lang]}
        </h2>
        <p className="mt-2 text-gray-700">
          {scenario.description[lang]}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
          <span>⏱️ {formatTime(scenario.durationSeconds)}</span>
          <span>❓ {scenario.pausePoints.length} questions</span>
          <span>🎯 Score: {score}/{scenario.pausePoints.length}</span>
        </div>
      </div>

      {/* Audio Player */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
        <audio ref={audioRef} src={scenario.audioUrl} preload="metadata" />
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Pause point markers */}
            {scenario.pausePoints.map((point, index) => (
              <div
                key={index}
                className={`absolute top-0 h-full w-1 ${
                  answeredPoints.has(index) ? "bg-green-500" : "bg-orange-400"
                }`}
                style={{ left: `${(point.atSeconds / scenario.durationSeconds) * 100}%` }}
                title={`Question ${index + 1} at ${formatTime(point.atSeconds)}`}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(scenario.durationSeconds)}</span>
          </div>
        </div>

        {/* Play Controls */}
        <div className="flex items-center justify-center gap-4">
          {playState === "idle" && (
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
            >
              ▶️ Start Call Recording
            </button>
          )}
          
          {playState === "playing" && (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              ⏸️ Pause
            </button>
          )}
          
          {playState === "paused" && (
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
            >
              ▶️ Resume
            </button>
          )}

          <button
            onClick={handleRestart}
            className="rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
          >
            🔄 Restart
          </button>
        </div>

        {/* Transcript */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-primary">
            📄 View Transcript
          </summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
            {scenario.transcript}
          </pre>
        </details>
      </div>

      {/* Question Panel */}
      {playState === "question" && currentPausePoint && (
        <div className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border-2 border-orange-400 bg-orange-50 p-6">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-lg font-bold text-orange-900">
              ⏸️ Question {currentPausePointIndex + 1} of {scenario.pausePoints.length}
            </h3>
            <VoiceButton text={currentPausePoint.question[lang]} />
          </div>
          
          <p className="mb-4 text-lg text-gray-800">
            {currentPausePoint.question[lang]}
          </p>

          {!showFeedback ? (
            <div className="space-y-3">
              {currentPausePoint.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white p-4 text-left font-medium transition hover:border-primary hover:bg-primary/5"
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show selected answer feedback */}
              <div className="space-y-3">
                {currentPausePoint.options.map((option, index) => {
                  const isSelected = index === selectedAnswer;
                  const isCorrect = index === currentPausePoint.correctOptionIndex;
                  
                  let className = "rounded-lg border-2 p-4 ";
                  if (isCorrect) {
                    className += "border-green-500 bg-green-50 text-green-900";
                  } else if (isSelected && !isCorrect) {
                    className += "border-red-500 bg-red-50 text-red-900";
                  } else {
                    className += "border-gray-200 bg-gray-50 text-gray-600";
                  }

                  return (
                    <div key={index} className={className}>
                      <div className="flex items-center gap-2">
                        {isCorrect && <span className="text-xl">✅</span>}
                        {isSelected && !isCorrect && <span className="text-xl">❌</span>}
                        <span className="font-medium">
                          {String.fromCharCode(65 + index)}. {option}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="font-bold text-primary">
                    {selectedAnswer === currentPausePoint.correctOptionIndex ? "✅ Correct!" : "❌ Not quite right"}
                  </h4>
                  <VoiceButton text={currentPausePoint.explanation[lang]} />
                </div>
                <p className="text-gray-800">
                  {currentPausePoint.explanation[lang]}
                </p>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
              >
                Continue Call →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completion Summary */}
      {playState === "completed" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border-2 border-green-500 bg-green-50 p-6 text-center">
          <div className="mb-4 text-6xl">🏆</div>
          <h3 className="mb-2 text-2xl font-bold text-green-900">
            Call Analysis Complete!
          </h3>
          <p className="mb-4 text-lg text-gray-800">
            You scored <span className="font-bold text-primary">{score}</span> out of{" "}
            <span className="font-bold">{scenario.pausePoints.length}</span>
          </p>
          <div className="mb-4 text-sm text-gray-600">
            {score === scenario.pausePoints.length && "🎯 Perfect score! You can spot all the red flags!"}
            {score >= scenario.pausePoints.length * 0.7 && score < scenario.pausePoints.length && "👍 Great job! You caught most of the warning signs."}
            {score < scenario.pausePoints.length * 0.7 && "📚 Keep practicing! Review the explanations and try again."}
          </div>
          <button
            onClick={handleRestart}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// Scenario List Component
export function ScamCallScenarioList() {
  const { lang } = useI18n();
  const [selectedScenario, setSelectedScenario] = useState<ScamCallScenario | null>(null);

  const scenarios = SCAM_CALL_SCENARIOS[lang];

  if (selectedScenario) {
    return (
      <div>
        <button
          onClick={() => setSelectedScenario(null)}
          className="mb-4 text-primary hover:underline"
        >
          ← Back to scenarios
        </button>
        <ScamCallSimulation scenario={selectedScenario} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        {lang === "en" 
          ? "Listen to realistic scam calls and learn to identify red flags in real-time."
          : "વાસ્તવિક સ્કૅમ કૉલ સાંભળો અને વાસ્તવિક સમયમાં લાલ સંકેતો ઓળખતા શીખો."}
      </p>
      
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          onClick={() => setSelectedScenario(scenario)}
          className="w-full rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition hover:border-primary hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-primary">
                {scenario.title[lang]}
              </h3>
              <p className="mt-2 text-gray-600">
                {scenario.description[lang]}
              </p>
              <div className="mt-3 flex gap-4 text-sm text-gray-500">
                <span>⏱️ {Math.floor(scenario.durationSeconds / 60)}:{(scenario.durationSeconds % 60).toString().padStart(2, "0")}</span>
                <span>❓ {scenario.pausePoints.length} questions</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                  {scenario.language === "en" ? "English" : "ગુજરાતી"}
                </span>
              </div>
            </div>
            <span className="text-2xl">📞</span>
          </div>
        </button>
      ))}
    </div>
  );
}
