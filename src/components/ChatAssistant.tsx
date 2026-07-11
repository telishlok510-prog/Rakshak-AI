"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { analyze } from "@/lib/api";
import type { AnalysisResult, RiskLevel } from "@/lib/types";
import { logCheck } from "@/lib/activity";

interface Message {
  role: "user" | "assistant";
  text: string;
  time: string;
  /** Present when this assistant message is a real scam-check result. */
  result?: AnalysisResult;
}

/** Chat can be waiting for the user to paste content to actually analyze. */
type Mode = "idle" | "sms" | "url";

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const RISK_COLOR: Record<RiskLevel, string> = {
  safe: "border-safe bg-safe/5",
  suspicious: "border-accent bg-accent/5",
  scam: "border-danger bg-danger/5",
};

/**
 * Floating AI Chat Assistant.
 *
 * "Analyze SMS" and "Check Website" are real actions: they switch the chat
 * into an input-collecting mode, then run the actual detection engine
 * (/api/analyze — heuristic + Gemini AI, the same one powering the Check page)
 * and render a structured, explainable result inline. Everything else is
 * answered from a small local safety knowledge base so it works instantly,
 * offline, and in Gujarati/English without needing an API key.
 */

const QUICK_ACTIONS_EN: { label: string; mode?: "sms" | "url"; msg?: string }[] = [
  { label: "📩 Analyze SMS", mode: "sms" },
  { label: "🔗 Check Website", mode: "url" },
  { label: "📚 Learn About Scams", msg: "Tell me about common scams in India" },
  { label: "🚨 Report a Scam", msg: "How do I report a scam?" },
];

const QUICK_ACTIONS_GU: { label: string; mode?: "sms" | "url"; msg?: string }[] = [
  { label: "📩 SMS તપાસો", mode: "sms" },
  { label: "🔗 વેબસાઇટ તપાસો", mode: "url" },
  { label: "📚 છેતરપિંડી વિશે જાણો", msg: "ભારતમાં સામાન્ય છેતરપિંડી વિશે જણાવો" },
  { label: "🚨 ફરિયાદ કરો", msg: "છેતરપિંડીની ફરિયાદ કેવી રીતે કરું?" },
];

const PROMPT_TEXT: Record<"sms" | "url", Record<string, string>> = {
  sms: {
    en: "Sure — paste the SMS or WhatsApp message text below and I'll check it.",
    gu: "ચોક્કસ — SMS કે WhatsApp મેસેજ નીચે પેસ્ટ કરો, હું તપાસી આપીશ.",
  },
  url: {
    en: "Sure — paste the website or payment link below and I'll check it.",
    gu: "ચોક્કસ — વેબસાઇટ કે પેમેન્ટ લિંક નીચે પેસ્ટ કરો, હું તપાસી આપીશ.",
  },
};

// Simple local knowledge base for informational questions (no API needed).
function getLocalResponse(msg: string, lang: string): string {
  const lower = msg.toLowerCase();

  if (/\breport\b|ફરિયાદ|complaint|helpline/.test(lower)) {
    return lang === "gu"
      ? "છેતરપિંડીની ફરિયાદ કરવા:\n1. 1930 પર ફોન કરો (National Cyber Crime Helpline)\n2. cybercrime.gov.in પર ઓનલાઇન ફરિયાદ કરો\n3. RBI Sachet: sachet.rbi.org.in\n\nજેટલી વહેલી ફરિયાદ, એટલી વધુ પૈસા પાછા મળવાની શક્યતા."
      : "To report a scam:\n1. Call 1930 (National Cyber Crime Helpline)\n2. File online at cybercrime.gov.in\n3. RBI Sachet: sachet.rbi.org.in\n\nThe sooner you report, the better your chance of recovery.";
  }
  if (/\botp\b|\bpin\b|\bcvv\b|ઓટીપી|પિન/.test(lower)) {
    return lang === "gu"
      ? "🔑 OTP, PIN અને CVV ગુપ્ત છે.\n\n• બેંક ક્યારેય ફોન કે SMS દ્વારા OTP માંગતી નથી\n• કોઈ 'અધિકારી' OTP માંગે તો તે છેતરનાર છે\n• OTP શેર કર્યા પછી પૈસા પાછા મેળવવા ખૂબ મુશ્કેલ છે"
      : "🔑 OTP, PIN and CVV are secret.\n\n• Banks never ask for OTP via call or SMS\n• Anyone asking for OTP is a scammer\n• Once shared, recovering money is very difficult";
  }
  if (/\bupi\b|\bcollect\b|કલેક્ટ|\bqr\b/.test(lower)) {
    return lang === "gu"
      ? "💸 UPI સલામતી:\n\n• પૈસા મેળવવા ક્યારેય PIN દાખલ ન કરો\n• 'Collect request' મંજૂર = પૈસા જાય છે\n• QR સ્કેન + PIN = પૈસા મોકલો, મેળવો નહીં\n• ₹1-₹2 ની ટેસ્ટ વિનંતી = મોટી છેતરપિંડી પહેલાની તપાસ"
      : "💸 UPI Safety:\n\n• Never enter PIN to RECEIVE money\n• Approving a 'collect request' SENDS money out\n• QR scan + PIN = sending money, not receiving\n• ₹1-₹2 test requests are verification before a bigger scam";
  }
  if (/\bloan\b|લોન|ऋण/.test(lower)) {
    return lang === "gu"
      ? "🏦 નકલી લોન એપ ઓળખો:\n\n• લોન આપતા પહેલા ફી માંગે = છેતરપિંડી\n• ફોનની બધી પરવાનગી માંગે = ખતરનાક\n• RBI સાથે નોંધાયેલ છે કે તપાસો\n• WhatsApp/SMS દ્વારા લોન ઓફર = શંકાસ્પદ"
      : "🏦 Spotting fake loan apps:\n\n• Asks for fee before giving loan = scam\n• Demands all phone permissions = dangerous\n• Check if lender is RBI-registered\n• Loan offers via WhatsApp/SMS = suspicious";
  }
  if (/\bscam\b|\bfraud\b|છેતરપિંડી|ધોખ|common scams/.test(lower)) {
    return lang === "gu"
      ? "⚠️ ભારતમાં સામાન્ય છેતરપિંડીઓ:\n\n1. KYC અપડેટ SMS (નકલી લિંક)\n2. UPI collect request (પૈસા મેળવવા PIN માંગે)\n3. લોટરી/ઇનામ (તમે ક્યારેય ભાગ લીધો નથી)\n4. નકલી લોન એપ (અગાઉથી ફી)\n5. WhatsApp નોકરી (રજિસ્ટ્રેશન ફી)\n6. QR કોડ (સ્કેન = પૈસા જાય)\n7. રોકાણ ગ્રુપ (ગેરંટીડ રિટર્ન)\n\nદરેક વિશે વધુ જાણવા 'Learn' પેજ જુઓ!"
      : "⚠️ Common scams in India:\n\n1. KYC update SMS (fake links)\n2. UPI collect request (asks PIN to 'receive')\n3. Lottery/prize (you never entered)\n4. Fake loan apps (advance fee)\n5. WhatsApp jobs (registration fee)\n6. QR code (scan = money goes out)\n7. Investment groups (guaranteed returns)\n\nVisit the Learn page for details on each!";
  }
  if (/\bsafety\b|\btips?\b|સલામતી|banking/.test(lower)) {
    return lang === "gu"
      ? "✅ ડિજિટલ બેંકિંગ સલામતી ટિપ્સ:\n\n• OTP/PIN ક્યારેય શેર ન કરો\n• SMS/WhatsApp ની લિંક પર ક્લિક ન કરો\n• બેંક ફોન કરે તો કાર્ડ પરનો નંબર જાતે ડાયલ કરો\n• અજાણ્યા UPI વિનંતી reject કરો\n• Play Store રેટિંગ તપાસ્યા વગર app install ન કરો"
      : "✅ Digital banking safety tips:\n\n• Never share OTP/PIN with anyone\n• Don't click links in SMS/WhatsApp\n• If 'bank' calls, hang up and dial the number on your card\n• Reject unknown UPI requests\n• Check Play Store ratings before installing apps";
  }

  return lang === "gu"
    ? "હું Rakshak AI ચેટ સહાયક છું. હું ઓનલાઇન બેંકિંગ સલામતી, છેતરપિંડી ઓળખવા, અને ફરિયાદ કરવામાં મદદ કરી શકું.\n\n'SMS તપાસો' કે 'વેબસાઇટ તપાસો' દબાવો, અથવા OTP, UPI, લોન, છેતરપિંડી વિશે પૂછો."
    : "I'm the Rakshak AI chat assistant. I can help with online banking safety, identifying scams, and reporting fraud.\n\nTap 'Analyze SMS' or 'Check Website' above, or ask about OTP, UPI, loans, or common scams.";
}

function ResultCard({ result, lang }: { result: AnalysisResult; lang: string }) {
  const label =
    result.risk === "scam"
      ? lang === "gu" ? "🚫 છેતરપિંડી" : "🚫 Scam"
      : result.risk === "suspicious"
      ? lang === "gu" ? "⚠️ સાવધાન" : "⚠️ Be careful"
      : lang === "gu" ? "✅ સલામત" : "✅ Looks safe";

  return (
    <div className={`rounded-xl border-2 p-3 ${RISK_COLOR[result.risk]}`}>
      <div className="flex items-center justify-between font-bold">
        <span>{label}</span>
        <span className="text-sm">{result.confidence}%</span>
      </div>
      <p className="mt-1 text-sm text-gray-700">{result.reason}</p>
      {result.indicators.slice(0, 2).map((ind, i) => (
        <p key={i} className="mt-1 text-xs text-gray-600">
          • {ind.label}
        </p>
      ))}
    </div>
  );
}

export default function ChatAssistant() {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const endRef = useRef<HTMLDivElement>(null);

  const quickActions = lang === "gu" ? QUICK_ACTIONS_GU : QUICK_ACTIONS_EN;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const pushAssistant = (text: string, result?: AnalysisResult) =>
    setMessages((m) => [...m, { role: "assistant", text, time: now(), result }]);

  const startMode = (m: "sms" | "url") => {
    setMode(m);
    pushAssistant(PROMPT_TEXT[m][lang]);
  };

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text: text.trim(), time: now() }]);
    setInput("");

    // Real analysis mode: run the actual detection engine, not a canned reply.
    if (mode === "sms" || mode === "url") {
      const kind = mode;
      setMode("idle");
      setTyping(true);
      try {
        const result = await analyze(kind, text, lang as "en" | "gu");
        pushAssistant(result.reason, result);
        logCheck(kind, result.risk);
      } catch {
        pushAssistant(
          lang === "gu"
            ? "તપાસ કરવામાં ભૂલ થઈ. ફરી પ્રયાસ કરો."
            : "Something went wrong checking that. Please try again."
        );
      } finally {
        setTyping(false);
      }
      return;
    }

    // Informational Q&A: local knowledge base, instant.
    setTyping(true);
    setTimeout(() => {
      pushAssistant(getLocalResponse(text, lang));
      setTyping(false);
    }, 500);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-white shadow-lg transition hover:scale-105"
        aria-label={lang === "gu" ? "ચેટ સહાયક ખોલો" : "Open chat assistant"}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl sm:h-[32rem] sm:w-96">
          <div className="flex items-center gap-2 bg-primary px-4 py-3 text-white">
            <span className="text-xl">🛡️</span>
            <div className="flex-1">
              <p className="font-bold">Rakshak AI</p>
              <p className="text-xs text-white/70">
                {lang === "gu" ? "નાણાકીય સલામતી સહાયક" : "Financial Safety Assistant"}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-center text-sm text-gray-500">
                  {lang === "gu"
                    ? "નમસ્તે! હું Rakshak AI છું. તમે મને ગુજરાતી કે English માં પૂછી શકો."
                    : "Hello! I'm Rakshak AI. Ask me anything about online safety."}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {quickActions.map((qa) => (
                    <button
                      key={qa.label}
                      onClick={() => (qa.mode ? startMode(qa.mode) : send(qa.msg!))}
                      className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "rounded-br-md bg-primary text-white"
                      : "rounded-bl-md bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.result ? (
                    <ResultCard result={m.result} lang={lang} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  )}
                  <p className={`mt-1 text-right text-[10px] ${m.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {mode !== "idle" && (
            <p className="border-t border-black/5 bg-primary/5 px-3 py-1 text-center text-xs font-semibold text-primary">
              {mode === "sms"
                ? (lang === "gu" ? "SMS પેસ્ટ કરવાની રાહ જોઈ રહ્યા છીએ…" : "Waiting for the SMS text…")
                : (lang === "gu" ? "લિંક પેસ્ટ કરવાની રાહ જોઈ રહ્યા છીએ…" : "Waiting for the link…")}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-black/5 bg-white px-3 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === "gu" ? "અહીં ટાઇપ કરો..." : "Type here..."}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
