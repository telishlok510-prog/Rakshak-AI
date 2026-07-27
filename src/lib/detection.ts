import type {
  AnalysisResult,
  CheckKind,
  DetectedIndicator,
  IndicatorCode,
  LanguageCode,
  RiskLevel,
} from "./types";

/**
 * Offline heuristic scam-detection engine (Explainable by design).
 *
 * Runs when the AI API is unavailable (demo mode) and also seeds the AI
 * prompt with structured signals. Mirrors the detection logic in sections
 * 4.1 - 4.7 of the project documentation. Every match maps to a stable
 * IndicatorCode so the UI can explain WHY something was flagged.
 */

interface RawSignal {
  code: IndicatorCode;
  weight: number; // contribution to the scam score (0-100)
  matches: string[];
}

const URGENCY_WORDS = [
  "urgent", "immediately", "right now", "act now", "expire", "expires",
  "expiring", "blocked", "block", "suspend", "suspended", "deactivate",
  "last chance", "final notice", "within 24 hours", "today only", "hurry",
  "તરત", "તરત જ", "અત્યારે", "અત્યારે જ", "બ્લોક", "બંધ", "તાત્કાલિક",
];

const CREDENTIAL_WORDS = [
  "otp", "o.t.p", "one time password", "pin", "cvv", "atm pin", "upi pin",
  "password", "card number", "cvc", "verification code", "expiry date",
  "ઓટીપી", "પિન",
];

const LOAN_WORDS = [
  "instant loan", "quick loan", "loan approved", "processing fee",
  "pre-approved loan", "no documents", "guaranteed loan", "advance fee",
  "લોન",
];

const PRIZE_WORDS = [
  "you have won", "congratulations", "lottery", "prize", "lucky winner",
  "cash reward", "gift", "kbc", "claim your", "free recharge",
  "ઇનામ", "લોટરી",
];

const SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "rb.gy", "cutt.ly",
  "shorturl", "ow.ly", "buff.ly",
];

const OFFICIAL_DOMAINS = [
  "sbi.co.in", "onlinesbi.sbi", "hdfcbank.com", "icicibank.com",
  "axisbank.com", "pnbindia.in", "bankofbaroda.in", "kotak.com",
  "rbi.org.in", "npci.org.in", "sachet.rbi.org.in", "cybercrime.gov.in",
  "uidai.gov.in", "india.gov.in", "gov.in",
];

const RISKY_TLDS = [
  ".xyz", ".top", ".club", ".online", ".site", ".click", ".link", ".buzz",
  ".work", ".loan", ".rest", ".cam", ".gq", ".tk", ".ml",
];

function findMatches(haystack: string, needles: string[]): string[] {
  const lower = haystack.toLowerCase();
  return needles.filter((n) => lower.includes(n.toLowerCase()));
}

function extractUrls(text: string): string[] {
  const regex =
    /(https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
  return text.match(regex) ?? [];
}

function getDomain(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

/** Collect raw, language-independent signals from the input. */
export function collectSignals(kind: CheckKind, text: string): RawSignal[] {
  const signals: RawSignal[] = [];

  const push = (code: IndicatorCode, weight: number, matches: string[]) => {
    if (matches.length) signals.push({ code, weight, matches });
  };

  push("URGENCY", 25, findMatches(text, URGENCY_WORDS));
  push("CREDENTIALS", 45, findMatches(text, CREDENTIAL_WORDS));
  push("LOAN", 20, findMatches(text, LOAN_WORDS));
  push("PRIZE", 25, findMatches(text, PRIZE_WORDS));
  push("SHORTENER", 30, findMatches(text, SHORTENERS));

  for (const url of extractUrls(text)) {
    const domain = getDomain(url);
    const isOfficial = OFFICIAL_DOMAINS.some(
      (d) => domain === d || domain.endsWith("." + d)
    );
    const mentionsBank =
      /sbi|hdfc|icici|axis|pnb|kotak|rbi|npci|bank|upi|paytm|kyc/i.test(domain);
    if (!isOfficial && mentionsBank) push("FAKE_DOMAIN", 40, [domain]);
    const riskyTld = RISKY_TLDS.find((t) => domain.endsWith(t));
    if (riskyTld && !isOfficial) push("RISKY_TLD", 20, [domain]);
  }

  if (kind === "upi") {
    if (/collect|request money|requesting|will debit|debited|pull/i.test(text)) {
      push("UPI_COLLECT", 45, ["collect"]);
    }
    const smallAmount = text.match(/(?:rs\.?|inr|₹)\s?([12](?:\.0+)?)\b/i);
    if (smallAmount) push("UPI_SMALL_AMOUNT", 15, [smallAmount[0]]);
  }

  if (kind === "call") {
    if (
      /bank official|rbi|customer care|kyc|account.*block|verify.*account|otp|બેંક.*અધિકારી|બેંક.*કર્મચારી|ખાતું.*બ્લોક|ખાતું.*બંધ|કેવાયસી|પોલીસ|સીબીઆઈ|કસ્ટમ્સ|ડિજિટલ.*અરેસ્ટ/i.test(
        text
      )
    ) {
      push("CALL_IMPERSONATION", 30, ["official"]);
    }
  }

  return signals;
}

function scoreToRisk(score: number): RiskLevel {
  if (score >= 60) return "scam";
  if (score >= 25) return "suspicious";
  return "safe";
}

/* ------------------------------------------------------------------ */
/* Localized copy                                                      */
/* ------------------------------------------------------------------ */

type IndicatorCopy = { label: string; detail: string };

const INDICATOR_COPY: Record<
  LanguageCode,
  Record<IndicatorCode, IndicatorCopy>
> = {
  en: {
    URGENCY: {
      label: "Urgency / pressure language",
      detail: "Scammers create panic so you act before thinking. Real banks give you time.",
    },
    CREDENTIALS: {
      label: "Asks for OTP / PIN / CVV",
      detail: "No genuine bank or official ever asks for your OTP, PIN or CVV.",
    },
    LOAN: {
      label: "Instant-loan / upfront-fee bait",
      detail: "Real lenders do not ask for a fee before giving a loan. This is a classic loan scam.",
    },
    PRIZE: {
      label: "Prize / lottery / reward bait",
      detail: "You cannot win a lottery you never entered. This is used to steal money or details.",
    },
    SHORTENER: {
      label: "Shortened link",
      detail: "Short links hide the real website address, so you cannot see where it truly goes.",
    },
    FAKE_DOMAIN: {
      label: "Fake bank-like web address",
      detail: "This address imitates a bank but is not its official domain. It is likely phishing.",
    },
    RISKY_TLD: {
      label: "Unusual website ending",
      detail: "Banks and government sites do not use endings like .xyz or .top.",
    },
    UPI_COLLECT: {
      label: "Disguised UPI 'collect' request",
      detail: "Approving a COLLECT request sends money OUT of your account — it does not add money.",
    },
    UPI_SMALL_AMOUNT: {
      label: "Tiny test amount (₹1/₹2)",
      detail: "Scammers send small amounts first to confirm your UPI ID before a bigger fraud.",
    },
    CALL_IMPERSONATION: {
      label: "Caller impersonates a bank / RBI official",
      detail: "Officials do not call asking for OTP or threatening to block your account.",
    },
    GENERIC: {
      label: "General warning",
      detail: "Stay alert and verify before acting.",
    },
  },
  gu: {
    URGENCY: {
      label: "ઉતાવળ / દબાણવાળી ભાષા",
      detail: "છેતરનારા ગભરાટ ઊભો કરે છે જેથી તમે વિચાર્યા વગર પગલું ભરો. સાચી બેંક સમય આપે છે.",
    },
    CREDENTIALS: {
      label: "OTP / PIN / CVV માંગે છે",
      detail: "કોઈ સાચી બેંક કે અધિકારી ક્યારેય તમારો OTP, PIN કે CVV માંગતા નથી.",
    },
    LOAN: {
      label: "તાત્કાલિક લોન / અગાઉથી ફી નું બાઈટ",
      detail: "સાચા ધિરાણકર્તા લોન આપતા પહેલા ફી માંગતા નથી. આ લોન છેતરપિંડી છે.",
    },
    PRIZE: {
      label: "ઇનામ / લોટરી નું બાઈટ",
      detail: "જે લોટરીમાં તમે ભાગ લીધો નથી તે તમે જીતી ન શકો. આ પૈસા પડાવવાની યુક્તિ છે.",
    },
    SHORTENER: {
      label: "ટૂંકી કરેલી લિંક",
      detail: "ટૂંકી લિંક સાચું સરનામું છુપાવે છે, તેથી તે ક્યાં લઈ જાય છે તે દેખાતું નથી.",
    },
    FAKE_DOMAIN: {
      label: "નકલી બેંક જેવું સરનામું",
      detail: "આ સરનામું બેંકની નકલ કરે છે પણ તેનું અધિકૃત ડોમેન નથી. આ ફિશિંગ હોઈ શકે.",
    },
    RISKY_TLD: {
      label: "અસામાન્ય વેબસાઇટ અંત",
      detail: "બેંક અને સરકારી સાઇટ .xyz કે .top જેવા અંતનો ઉપયોગ કરતી નથી.",
    },
    UPI_COLLECT: {
      label: "છૂપી UPI 'collect' વિનંતી",
      detail: "COLLECT વિનંતી મંજૂર કરવાથી તમારા ખાતામાંથી પૈસા જાય છે — ઉમેરાતા નથી.",
    },
    UPI_SMALL_AMOUNT: {
      label: "નાની ટેસ્ટ રકમ (₹1/₹2)",
      detail: "છેતરનારા મોટી છેતરપિંડી પહેલા તમારું UPI ID ચકાસવા નાની રકમ મોકલે છે.",
    },
    CALL_IMPERSONATION: {
      label: "કૉલ કરનાર બેંક / RBI અધિકારી હોવાનો ડોળ કરે છે",
      detail: "અધિકારીઓ OTP માંગવા કે ખાતું બ્લોક કરવાની ધમકી આપવા ફોન કરતા નથી.",
    },
    GENERIC: { label: "સામાન્ય ચેતવણી", detail: "સાવધ રહો અને પગલું ભરતા પહેલા ખાતરી કરો." },
  },
};

const SUMMARY_COPY: Record<LanguageCode, Record<RiskLevel, string>> = {
  en: {
    scam: "This shows strong signs of a scam. Do not respond, click links, or share any details.",
    suspicious: "This looks suspicious. Some warning signs were found, so be careful.",
    safe: "No obvious scam signs were found, but always stay alert.",
  },
  gu: {
    scam: "ચેતવણી! આ મેસેજમાં છેતરપિંડીના મજબૂત સંકેતો છે. જવાબ ન આપો કે લિંક પર ક્લિક ન કરો.",
    suspicious: "આ મેસેજ શંકાસ્પદ લાગે છે. કેટલાક ચેતવણી સંકેતો મળ્યા છે, સાવધ રહો.",
    safe: "કોઈ સ્પષ્ટ છેતરપિંડીના સંકેત મળ્યા નથી, પણ હંમેશા સાવધ રહો.",
  },
};

const TIP_COPY: Record<LanguageCode, Record<RiskLevel, string>> = {
  en: {
    scam: "Never share your OTP, PIN or CVV. If in doubt, call your bank using the number on your card.",
    suspicious: "Do not act in a hurry. Verify with your bank through official channels first.",
    safe: "Even safe-looking messages can be fake. Never share OTP or PIN with anyone.",
  },
  gu: {
    scam: "OTP, PIN કે CVV કોઈને ન આપો. શંકા હોય તો કાર્ડ પરના નંબર પર બેંકને ફોન કરો.",
    suspicious: "ઉતાવળમાં કંઈ ન કરો. પહેલા બેંકની અધિકૃત ચેનલથી ખાતરી કરો.",
    safe: "સલામત દેખાતા મેસેજ પણ નકલી હોઈ શકે. OTP કે PIN કોઈને ન આપો.",
  },
};

const ACTIONS_COPY: Record<LanguageCode, Record<RiskLevel, string[]>> = {
  en: {
    scam: [
      "Do NOT share any OTP, PIN, CVV or password.",
      "Do NOT click links or approve any payment request.",
      "Block the sender and delete the message.",
      "If you already paid or shared details, call 1930 immediately.",
    ],
    suspicious: [
      "Pause — do not act in a hurry.",
      "Contact your bank using the official number on your card or passbook.",
      "Do not click any links until you have verified.",
    ],
    safe: [
      "Stay alert even with normal-looking messages.",
      "Never share OTP or PIN, even if the request seems official.",
    ],
  },
  gu: {
    scam: [
      "કોઈ OTP, PIN, CVV કે પાસવર્ડ શેર ન કરો.",
      "લિંક પર ક્લિક ન કરો કે કોઈ પેમેન્ટ વિનંતી મંજૂર ન કરો.",
      "મોકલનારને બ્લોક કરો અને મેસેજ ડિલીટ કરો.",
      "જો પૈસા આપી દીધા હોય કે વિગતો શેર કરી હોય તો તરત 1930 પર ફોન કરો.",
    ],
    suspicious: [
      "થોભો — ઉતાવળમાં કંઈ ન કરો.",
      "કાર્ડ કે પાસબુક પરના અધિકૃત નંબર પર બેંકને સંપર્ક કરો.",
      "ખાતરી ન થાય ત્યાં સુધી કોઈ લિંક પર ક્લિક ન કરો.",
    ],
    safe: [
      "સામાન્ય દેખાતા મેસેજ સાથે પણ સાવધ રહો.",
      "વિનંતી અધિકૃત લાગે તો પણ OTP કે PIN ક્યારેય શેર ન કરો.",
    ],
  },
};

/**
 * Run the offline heuristic engine and return an explainable result.
 */
export function heuristicAnalyze(
  kind: CheckKind,
  text: string,
  language: LanguageCode
): AnalysisResult {
  const signals = collectSignals(kind, text);
  const score = Math.min(100, signals.reduce((sum, s) => sum + s.weight, 0));
  const risk = scoreToRisk(score);

  const indicators: DetectedIndicator[] = signals
    .sort((a, b) => b.weight - a.weight)
    .map((s) => ({
      code: s.code,
      label: INDICATOR_COPY[language][s.code].label,
      detail: INDICATOR_COPY[language][s.code].detail,
      matches: s.matches,
    }));

  const highlights = Array.from(new Set(signals.flatMap((s) => s.matches)));

  let confidence: number;
  if (risk === "scam") confidence = Math.min(97, 60 + score / 3);
  else if (risk === "suspicious") confidence = 55 + Math.min(20, score / 3);
  else confidence = signals.length === 0 ? 85 : 60;

  return {
    risk,
    confidence: Math.round(confidence),
    reason: SUMMARY_COPY[language][risk],
    indicators,
    recommendedActions: ACTIONS_COPY[language][risk],
    safetyTip: TIP_COPY[language][risk],
    highlights,
    source: "heuristic",
  };
}
