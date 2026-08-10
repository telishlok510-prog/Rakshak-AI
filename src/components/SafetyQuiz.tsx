"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { QUIZ_QUESTIONS, getCategories, type QuizQuestion } from "@/lib/quiz";
import { logPracticeComplete } from "@/lib/activity";
import VoiceButton from "./VoiceButton";

interface SafetyQuizProps {
  /** Number of questions to include in quiz */
  questionCount?: number;
  /** Specific category to filter (optional) */
  category?: string;
  onComplete?: (score: number, total: number) => void;
}

type QuizState = "intro" | "quiz" | "complete";

export default function SafetyQuiz({ 
  questionCount = 10, 
  category,
  onComplete 
}: SafetyQuizProps) {
  const { lang } = useI18n();
  
  const [quizState, setQuizState] = useState<QuizState>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const startQuiz = () => {
    // Get questions - filtered by category or all
    let allQuestions = QUIZ_QUESTIONS[lang];
    if (category) {
      allQuestions = allQuestions.filter(q => q.category === category);
    }
    
    // Shuffle and take requested count
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    setQuestions(selected);
    setQuizState("quiz");
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return; // Already answered
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    // Update score
    if (answerIndex === questions[currentQuestionIndex].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    
    if (isLastQuestion) {
      // Quiz complete
      setQuizState("complete");
      const finalScore = selectedAnswer === questions[currentQuestionIndex].correctIndex 
        ? score + 1 
        : score;
      
      // Log completion
      logPracticeComplete("quiz", finalScore, questions.length);
      onComplete?.(finalScore, questions.length);
    } else {
      // Next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handleRestart = () => {
    startQuiz();
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Intro Screen
  if (quizState === "intro") {
    const categories = getCategories(lang);
    
    return (
      <div className="space-y-6">
        <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
          <div className="mb-4 text-6xl">🧠</div>
          <h2 className="mb-3 text-3xl font-bold text-primary">
            {lang === "en" ? "Safety Quiz" : "સલામતી ક્વિઝ"}
          </h2>
          <p className="mb-6 text-lg text-gray-700">
            {lang === "en"
              ? "Test your financial safety knowledge with real-world scenarios"
              : "વાસ્તવિક દુનિયાની પરિસ્થિતિઓ સાથે તમારા નાણાકીય સલામતી જ્ઞાનની પરીક્ષા કરો"}
          </p>
          
          <div className="mb-6 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-lg border-2 border-primary/20 bg-white p-4">
              <div className="text-2xl font-bold text-primary">{QUIZ_QUESTIONS[lang].length}</div>
              <div className="text-sm text-gray-600">
                {lang === "en" ? "Total Questions" : "કુલ પ્રશ્નો"}
              </div>
            </div>
            <div className="rounded-lg border-2 border-primary/20 bg-white p-4">
              <div className="text-2xl font-bold text-primary">{categories.length}</div>
              <div className="text-sm text-gray-600">
                {lang === "en" ? "Categories" : "વર્ગો"}
              </div>
            </div>
            <div className="rounded-lg border-2 border-primary/20 bg-white p-4">
              <div className="text-2xl font-bold text-primary">
                {Math.ceil(questionCount * 0.5)}
              </div>
              <div className="text-sm text-gray-600">
                {lang === "en" ? "Min to Pass" : "પાસ થવા ન્યૂનતમ"}
              </div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white transition hover:bg-primary/90"
          >
            {lang === "en" ? "Start Quiz →" : "ક્વિઝ શરૂ કરો →"}
          </button>
        </div>

        {/* Categories Preview */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-bold text-gray-900">
            {lang === "en" ? "📚 Topics Covered:" : "📚 આવરી લેવાયેલા વિષયો:"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <span
                key={cat}
                className="rounded-full border-2 border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (quizState === "quiz" && currentQuestion) {
    return (
      <div className="space-y-6">
        {/* Progress Header */}
        <div className="rounded-xl border-2 border-primary/20 bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-600">
            <span>
              {lang === "en" ? "Question" : "પ્રશ્ન"} {currentQuestionIndex + 1}/{questions.length}
            </span>
            <span>
              {lang === "en" ? "Score:" : "સ્કોર:"} {score}/{currentQuestionIndex + (showFeedback ? 1 : 0)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
          <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {currentQuestion.category}
          </div>
          
          <div className="mb-6 flex items-start justify-between">
            <h3 className="flex-1 text-xl font-bold text-gray-900">
              {currentQuestion.question}
            </h3>
            <VoiceButton text={currentQuestion.question} />
          </div>

          {!showFeedback ? (
            /* Options */
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white p-4 text-left transition hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 font-bold text-gray-600">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 font-medium text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Feedback */
            <div className="space-y-4">
              {/* Show all options with feedback */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = index === selectedAnswer;
                  const isCorrect = index === currentQuestion.correctIndex;
                  
                  let className = "rounded-lg border-2 p-4 ";
                  if (isCorrect) {
                    className += "border-green-500 bg-green-50";
                  } else if (isSelected && !isCorrect) {
                    className += "border-red-500 bg-red-50";
                  } else {
                    className += "border-gray-200 bg-gray-50";
                  }

                  return (
                    <div key={index} className={className}>
                      <div className="flex items-start gap-3">
                        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 font-bold ${
                          isCorrect ? "border-green-600 bg-green-600 text-white" :
                          isSelected ? "border-red-600 bg-red-600 text-white" :
                          "border-gray-300 text-gray-500"
                        }`}>
                          {isCorrect ? "✓" : isSelected ? "✗" : String.fromCharCode(65 + index)}
                        </span>
                        <span className={`flex-1 font-medium ${
                          isCorrect ? "text-green-900" :
                          isSelected ? "text-red-900" :
                          "text-gray-600"
                        }`}>
                          {option}
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
                    {selectedAnswer === currentQuestion.correctIndex
                      ? (lang === "en" ? "✅ Correct!" : "✅ સાચું!")
                      : (lang === "en" ? "❌ Incorrect" : "❌ ખોટું")}
                  </h4>
                  <VoiceButton text={currentQuestion.explanation} />
                </div>
                <p className="text-gray-800">{currentQuestion.explanation}</p>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
              >
                {currentQuestionIndex === questions.length - 1
                  ? (lang === "en" ? "See Results →" : "પરિણામ જુઓ →")
                  : (lang === "en" ? "Next Question →" : "આગળનો પ્રશ્ન →")}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Completion Screen
  if (quizState === "complete") {
    const accuracyPercent = Math.round((score / questions.length) * 100);
    const passed = score >= Math.ceil(questions.length * 0.5);

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
        <div className={`rounded-xl border-2 p-8 text-center ${
          passed ? "border-green-500 bg-green-50" : "border-orange-500 bg-orange-50"
        }`}>
          <div className="mb-4 text-6xl">
            {accuracyPercent === 100 ? "🏆" : passed ? "🎯" : "📚"}
          </div>
          <h3 className={`mb-2 text-3xl font-bold ${
            passed ? "text-green-900" : "text-orange-900"
          }`}>
            {passed
              ? (lang === "en" ? "Quiz Complete!" : "ક્વિઝ પૂર્ણ!")
              : (lang === "en" ? "Good Try!" : "સારો પ્રયાસ!")}
          </h3>
          <p className="mb-4 text-lg text-gray-800">
            {lang === "en" ? "You scored" : "તમે સ્કોર કર્યો"}{" "}
            <span className="font-bold text-primary">{score}</span>{" "}
            {lang === "en" ? "out of" : "માંથી"}{" "}
            <span className="font-bold">{questions.length}</span>
          </p>

          <div className="mb-6">
            <div className="mx-auto mb-2 h-4 w-64 overflow-hidden rounded-full bg-white">
              <div
                className={`h-full transition-all ${
                  accuracyPercent >= 80 ? "bg-green-500" :
                  accuracyPercent >= 50 ? "bg-orange-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${accuracyPercent}%` }}
              />
            </div>
            <p className="text-3xl font-bold text-primary">{accuracyPercent}%</p>
          </div>

          <div className="mb-6 text-sm text-gray-700">
            {accuracyPercent === 100 && (lang === "en"
              ? "🎯 Perfect score! You're a financial safety expert!"
              : "🎯 સંપૂર્ણ સ્કોર! તમે નાણાકીય સલામતી નિષ્ણાત છો!")}
            {accuracyPercent >= 80 && accuracyPercent < 100 && (lang === "en"
              ? "👍 Excellent! You have strong financial safety knowledge."
              : "👍 ઉત્તમ! તમારી પાસે મજબૂત નાણાકીય સલામતી જ્ઞાન છે.")}
            {accuracyPercent >= 50 && accuracyPercent < 80 && (lang === "en"
              ? "📖 Good start! Review the Learn section to strengthen your knowledge."
              : "📖 સારી શરૂઆત! તમારું જ્ઞાન મજબૂત કરવા માટે લર્ન સેક્શન સમીક્ષા કરો.")}
            {accuracyPercent < 50 && (lang === "en"
              ? "📚 Keep learning! Spend more time in the Learn section and try again."
              : "📚 શીખતા રહો! લર્ન સેક્શનમાં વધુ સમય પસાર કરો અને ફરી પ્રયાસ કરો.")}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRestart}
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
            >
              {lang === "en" ? "Try Again" : "ફરી પ્રયાસ કરો"}
            </button>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-bold text-gray-900">
            {lang === "en" ? "📊 Performance by Category" : "📊 વર્ગ દ્વારા પ્રદર્શન"}
          </h3>
          <div className="space-y-3">
            {Array.from(new Set(questions.map(q => q.category))).map(cat => {
              const catQuestions = questions.filter(q => q.category === cat);
              const catScore = catQuestions.filter((q, idx) => {
                const userAnswer = idx === currentQuestionIndex ? selectedAnswer : null;
                return userAnswer === q.correctIndex;
              }).length;
              
              return (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{cat}</span>
                  <span className="text-sm font-bold text-primary">
                    {catScore}/{catQuestions.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
