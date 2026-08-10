"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { SimulationConfig, SimStep, SimChoice, SimulationProgress } from "@/lib/simulations/types";
import { logPracticeComplete } from "@/lib/activity";
import VoiceButton from "./VoiceButton";

interface SimulationEngineProps {
  config: SimulationConfig;
  onComplete?: (score: number, total: number) => void;
}

/**
 * SimulationEngine — the reusable state machine that powers
 * ATM, UPI, and Internet Banking practice simulations.
 * 
 * Takes a config with steps and renders the appropriate UI
 * based on screenType, handles choice navigation, and tracks score.
 */
export default function SimulationEngine({ config, onComplete }: SimulationEngineProps) {
  const { lang } = useI18n();
  
  const [progress, setProgress] = useState<SimulationProgress>({
    currentStepId: config.startStepId,
    score: 0,
    total: 0,
    completed: false,
  });

  const [selectedChoice, setSelectedChoice] = useState<SimChoice | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentStep = config.steps.find(s => s.id === progress.currentStepId);

  if (!currentStep) {
    return <div className="text-center text-red-600">Error: Invalid step configuration</div>;
  }

  const handleChoiceSelect = (choice: SimChoice) => {
    setSelectedChoice(choice);
    setShowFeedback(true);

    // Update score
    const newScore = choice.isSafeChoice ? progress.score + 1 : progress.score;
    const newTotal = progress.total + 1;

    setProgress(prev => ({
      ...prev,
      score: newScore,
      total: newTotal,
    }));

    // If this is the last step, mark as completed
    if (choice.nextStepId === null) {
      setProgress(prev => ({ ...prev, completed: true }));
      
      // Log completion to activity tracker
      const moduleType = config.type === "atm" ? "atm" : config.type === "upi" ? "upi" : "netbanking";
      logPracticeComplete(moduleType, newScore, newTotal);
      onComplete?.(newScore, newTotal);
    }
  };

  const handleContinue = () => {
    if (!selectedChoice) return;

    if (selectedChoice.nextStepId) {
      setProgress(prev => ({
        ...prev,
        currentStepId: selectedChoice.nextStepId!,
      }));
      setSelectedChoice(null);
      setShowFeedback(false);
    }
  };

  const handleRestart = () => {
    setProgress({
      currentStepId: config.startStepId,
      score: 0,
      total: 0,
      completed: false,
    });
    setSelectedChoice(null);
    setShowFeedback(false);
  };

  const accuracyPercent = progress.total > 0 ? Math.round((progress.score / progress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        <h2 className="text-2xl font-bold text-primary">
          {config.title[lang]}
        </h2>
        <p className="mt-2 text-gray-700">
          {config.description[lang]}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="rounded-full bg-white px-3 py-1 font-semibold text-primary">
            🎯 {progress.score}/{progress.total} Safe Choices
          </span>
          {progress.total > 0 && (
            <span className={`rounded-full px-3 py-1 font-semibold ${
              accuracyPercent >= 80 ? "bg-green-100 text-green-800" :
              accuracyPercent >= 60 ? "bg-orange-100 text-orange-800" :
              "bg-red-100 text-red-800"
            }`}>
              {accuracyPercent}% Accuracy
            </span>
          )}
        </div>
      </div>

      {!progress.completed ? (
        <>
          {/* Current Step Display */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {currentStep.title[lang]}
              </h3>
              <VoiceButton text={currentStep.title[lang] + ". " + currentStep.description[lang]} />
            </div>
            
            <p className="mb-6 text-lg text-gray-700">
              {currentStep.description[lang]}
            </p>

            {/* Screen Visualization */}
            <div className="mb-6">
              {renderScreen(currentStep, lang)}
            </div>

            {/* Choices */}
            {!showFeedback ? (
              <div className="space-y-3">
                {currentStep.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoiceSelect(choice)}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white p-4 text-left font-semibold transition hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                  >
                    {choice.label[lang]}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show selected choice feedback */}
                <div className={`rounded-lg border-2 p-4 ${
                  selectedChoice?.isSafeChoice
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="mb-2 flex items-center gap-2 font-bold">
                        {selectedChoice?.isSafeChoice ? (
                          <><span className="text-2xl">✅</span> Safe Choice!</>
                        ) : (
                          <><span className="text-2xl">⚠️</span> Risky Choice</>
                        )}
                      </h4>
                      <p className={selectedChoice?.isSafeChoice ? "text-green-900" : "text-red-900"}>
                        {selectedChoice?.feedback[lang]}
                      </p>
                    </div>
                    {selectedChoice && (
                      <VoiceButton text={selectedChoice.feedback[lang]} />
                    )}
                  </div>
                </div>

                {/* Continue/Complete Button */}
                <button
                  onClick={handleContinue}
                  className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
                >
                  {selectedChoice?.nextStepId ? "Continue →" : "See Results →"}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Completion Summary */
        <div className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border-2 border-green-500 bg-green-50 p-8 text-center">
          <div className="mb-4 text-6xl">
            {accuracyPercent === 100 ? "🏆" : accuracyPercent >= 80 ? "🎯" : accuracyPercent >= 60 ? "👍" : "📚"}
          </div>
          <h3 className="mb-2 text-2xl font-bold text-green-900">
            {lang === "en" ? "Simulation Complete!" : "સિમ્યુલેશન પૂર્ણ!"}
          </h3>
          <p className="mb-4 text-lg text-gray-800">
            {lang === "en" ? "You made" : "તમે"}{" "}
            <span className="font-bold text-primary">{progress.score}</span>{" "}
            {lang === "en" ? "safe choices out of" : "માંથી સલામત પસંદગીઓ કરી"}{" "}
            <span className="font-bold">{progress.total}</span>
          </p>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-2 h-3 w-64 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all ${
                  accuracyPercent >= 80 ? "bg-green-500" :
                  accuracyPercent >= 60 ? "bg-orange-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${accuracyPercent}%` }}
              />
            </div>
            <p className="text-2xl font-bold text-primary">{accuracyPercent}%</p>
          </div>
          <div className="mb-6 text-sm text-gray-600">
            {accuracyPercent === 100 && (lang === "en" 
              ? "🎯 Perfect! You made all the safe choices!" 
              : "🎯 સંપૂર્ણ! તમે બધી સલામત પસંદગીઓ કરી!")}
            {accuracyPercent >= 80 && accuracyPercent < 100 && (lang === "en"
              ? "👍 Excellent! You're making safe choices most of the time."
              : "👍 ઉત્તમ! તમે મોટાભાગે સલામત પસંદગીઓ કરી રહ્યા છો.")}
            {accuracyPercent >= 60 && accuracyPercent < 80 && (lang === "en"
              ? "📖 Good start! Review the feedback to improve."
              : "📖 સારી શરૂઆત! સુધારવા માટે ફીડબેક સમીક્ષા કરો.")}
            {accuracyPercent < 60 && (lang === "en"
              ? "📚 Keep practicing! Read the explanations carefully and try again."
              : "📚 પ્રેક્ટિસ કરતા રહો! સમજૂતીઓ કાળજીપૂર્વક વાંચો અને ફરી પ્રયાસ કરો.")}
          </div>
          <button
            onClick={handleRestart}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
          >
            {lang === "en" ? "Try Again" : "ફરી પ્રયાસ કરો"}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Render the visual representation of each screen type
 */
function renderScreen(step: SimStep, lang: "en" | "gu") {
  const { screenType, screenState } = step;

  if (screenType === "atm") {
    return <ATMScreen state={screenState} lang={lang} />;
  }
  
  if (screenType === "upi") {
    return <UPIScreen state={screenState} lang={lang} />;
  }
  
  if (screenType === "netbanking") {
    return <NetbankingScreen state={screenState} lang={lang} />;
  }

  return null;
}

// ATM Screen Renderer
function ATMScreen({ state, lang }: { state: Record<string, any>; lang: "en" | "gu" }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border-4 border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900 p-6 shadow-2xl">
      <div className="mb-4 rounded-lg bg-green-900 p-4 font-mono text-green-300">
        <div className="mb-2 text-center font-bold text-green-100">
          🏧 {lang === "en" ? "STATE BANK ATM" : "સ્ટેટ બેંક ATM"}
        </div>
        <div className="text-center text-lg">
          {state.message}
        </div>
        {state.pinField && (
          <div className="mt-2 text-center text-2xl tracking-widest">
            {state.pinField}
          </div>
        )}
        {state.cardSlot && (
          <div className="mt-4 text-center">
            ⬇️ {lang === "en" ? "INSERT CARD" : "કાર્ડ દાખલ કરો"}
          </div>
        )}
      </div>
      {state.stranger && (
        <div className="mt-2 text-center text-sm text-orange-300">
          ⚠️ {lang === "en" ? "Someone standing close behind you" : "કોઈ તમારી પાછળ નજીક ઊભું છે"}
        </div>
      )}
    </div>
  );
}

// UPI Screen Renderer
function UPIScreen({ state, lang }: { state: Record<string, any>; lang: "en" | "gu" }) {
  return (
    <div className="mx-auto max-w-sm rounded-3xl border-8 border-gray-900 bg-white p-4 shadow-2xl">
      {/* Phone notch */}
      <div className="mb-2 flex justify-center">
        <div className="h-4 w-32 rounded-full bg-gray-900" />
      </div>
      
      <div className="min-h-96 rounded-2xl bg-gradient-to-b from-purple-50 to-white p-4">
        {state.screen === "send-money" && (
          <>
            <h3 className="mb-4 text-center text-xl font-bold text-purple-900">
              💸 {lang === "en" ? "Send Money" : "પૈસા મોકલો"}
            </h3>
            <div className="space-y-3 rounded-lg bg-white p-4 shadow">
              <div>
                <div className="text-sm text-gray-500">{lang === "en" ? "To" : "ને"}</div>
                <div className="font-bold">{state.recipientName}</div>
                <div className="text-sm text-gray-600">{state.recipientUPI}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{lang === "en" ? "Amount" : "રકમ"}</div>
                <div className="text-2xl font-bold text-purple-900">₹{state.amount}</div>
              </div>
              {state.verified && (
                <div className="text-sm text-green-600">✅ {lang === "en" ? "Verified account" : "ચકાસાયેલ ખાતું"}</div>
              )}
            </div>
          </>
        )}
        
        {state.screen === "collect-request" && (
          <>
            <h3 className="mb-4 text-center text-xl font-bold text-orange-900">
              ⚠️ {lang === "en" ? "Payment Request" : "પેમેન્ટ વિનંતી"}
            </h3>
            <div className="space-y-3 rounded-lg bg-orange-50 p-4 shadow-lg">
              <div className="text-center">
                <div className="text-sm text-gray-600">{lang === "en" ? "Request from" : "વિનંતી તરફથી"}</div>
                <div className="font-bold text-orange-900">{state.requestFrom}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-900">₹{state.amount}</div>
                <div className="mt-1 text-xs font-semibold text-orange-700">
                  {state.requestType} REQUEST
                </div>
              </div>
              {state.message && (
                <div className="text-center text-sm text-gray-700">{state.message}</div>
              )}
            </div>
          </>
        )}
        
        {state.screen === "qr-scan" && (
          <>
            <h3 className="mb-4 text-center text-xl font-bold">
              📷 {lang === "en" ? "Scan QR Code" : "QR કોડ સ્કેન કરો"}
            </h3>
            {state.qrCode && (
              <div className="mx-auto mb-4 w-48 rounded-lg border-4 border-dashed border-purple-400 bg-white p-4">
                <div className="aspect-square bg-gradient-to-br from-purple-900 to-purple-600" />
              </div>
            )}
            {state.scannedAmount && (
              <div className="rounded-lg bg-purple-50 p-4">
                <div className="text-sm text-gray-600">{lang === "en" ? "Pay to" : "ને ચૂકવો"}</div>
                <div className="font-bold">{state.scannedName}</div>
                <div className="mt-2 text-2xl font-bold text-purple-900">₹{state.scannedAmount}</div>
              </div>
            )}
          </>
        )}
        
        {state.screen === "notification" && (
          <div className="rounded-lg bg-green-50 p-6 text-center shadow-lg">
            <div className="mb-2 text-4xl">✅</div>
            <div className="text-lg font-bold text-green-900">{state.message}</div>
            {state.balance && (
              <div className="mt-4 text-3xl font-bold text-green-700">{state.balance}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Internet Banking Screen Renderer
function NetbankingScreen({ state, lang }: { state: Record<string, any>; lang: "en" | "gu" }) {
  return (
    <div className="rounded-lg border-2 border-gray-300 bg-white shadow-lg">
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 rounded-t-lg border-b-2 border-gray-300 bg-gray-100 px-4 py-2">
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 rounded bg-white px-3 py-1 text-xs text-gray-600">
          🔒 {state.domain || "onlinesbi.sbi.co.in"}
        </div>
      </div>
      
      {/* Screen Content */}
      <div className="p-6">
        {state.screen === "sms-notification" && (
          <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
            <div className="mb-2 font-bold">📱 SMS Message</div>
            <div className="text-sm">{state.message}</div>
            {state.linkPresent && (
              <div className="mt-2 text-xs text-red-600">
                ⚠️ {lang === "en" ? "Contains link" : "લિંક ધરાવે છે"}: {state.domain}
              </div>
            )}
          </div>
        )}
        
        {state.screen === "dashboard" && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">
              {lang === "en" ? "Account Dashboard" : "ખાતા ડેશબોર્ડ"}
            </h3>
            <div className="rounded-lg bg-primary/5 p-4">
              <div className="text-sm text-gray-600">{lang === "en" ? "Account" : "ખાતું"}</div>
              <div className="font-mono font-bold">{state.accountNumber}</div>
              <div className="mt-2 text-2xl font-bold text-primary">{state.balance}</div>
              <div className="mt-1 text-xs text-gray-500">
                {lang === "en" ? "Last login" : "છેલ્લું લોગિન"}: {state.lastLogin}
              </div>
            </div>
          </div>
        )}
        
        {state.screen === "add-beneficiary-form" && state.fields && (
          <div className="space-y-3">
            <h3 className="font-bold text-primary">
              {lang === "en" ? "Add Beneficiary" : "લાભાર્થી ઉમેરો"}
            </h3>
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <div>
                <div className="text-xs text-gray-600">{lang === "en" ? "Name" : "નામ"}</div>
                <div className="font-semibold">{state.fields.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">{lang === "en" ? "Account Number" : "ખાતા નંબર"}</div>
                <div className="font-mono">{state.fields.accountNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">IFSC</div>
                <div className="font-mono">{state.fields.ifsc}</div>
              </div>
            </div>
          </div>
        )}
        
        {state.screen === "confirm-transfer" && (
          <div className="space-y-4">
            <h3 className="font-bold text-orange-900">
              ⚠️ {lang === "en" ? "Confirm Transfer" : "ટ્રાન્સફર ખાતરી કરો"}
            </h3>
            <div className="space-y-2 rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{lang === "en" ? "To" : "ને"}</span>
                <span className="font-semibold">{state.beneficiary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{lang === "en" ? "Account" : "ખાતું"}</span>
                <span className="font-mono text-sm">{state.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{lang === "en" ? "Amount" : "રકમ"}</span>
                <span className="text-xl font-bold text-orange-900">₹{state.amount}</span>
              </div>
              {state.purpose && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{lang === "en" ? "Purpose" : "હેતુ"}</span>
                  <span className="text-sm">{state.purpose}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {state.screen === "success" && (
          <div className="space-y-4 text-center">
            <div className="text-5xl">✅</div>
            <h3 className="text-xl font-bold text-green-900">{state.message}</h3>
            <div className="rounded-lg bg-green-50 p-4">
              <div className="text-sm text-gray-600">{lang === "en" ? "Reference Number" : "સંદર્ભ નંબર"}</div>
              <div className="font-mono font-bold">{state.referenceNumber}</div>
              <div className="mt-2 text-2xl font-bold text-green-900">{state.amount}</div>
              <div className="mt-1 text-sm text-gray-600">{state.beneficiary}</div>
              <div className="mt-1 text-xs text-gray-500">{state.date}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
