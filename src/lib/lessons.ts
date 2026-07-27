import type { LanguageCode } from "./types";

export interface QuizItem {
  q: string;
  options: string[];
  answer: number; // index of correct option
}

export interface Lesson {
  id: string;
  icon: string;
  title: string;
  summary: string;
  points: string[];
  quiz: QuizItem;
}

/**
 * Financial-literacy lessons (spec section 4.5). Content is authored in each
 * supported language so low-English-proficiency users learn in their own
 * language. Kept short (2-minute read) with a 1-question check per lesson.
 */
export const LESSONS: Record<LanguageCode, Lesson[]> = {
  en: [
    {
      id: "otp",
      icon: "🔑",
      title: "A bank never asks for your OTP",
      summary: "OTP, PIN and CVV are secret. No real bank or official will ever ask for them.",
      points: [
        "OTP is a one-time password that approves a transaction.",
        "Anyone who has your OTP can take money from your account.",
        "If a caller or message asks for OTP, it is a scam — hang up.",
      ],
      quiz: {
        q: "A caller says he is from your bank and asks for your OTP. What do you do?",
        options: ["Share the OTP quickly", "Refuse and hang up", "Send it by SMS"],
        answer: 1,
      },
    },
    {
      id: "collect",
      icon: "💸",
      title: "How UPI 'collect request' scams work",
      summary: "Approving a collect request sends money OUT of your account, it never adds money.",
      points: [
        "To RECEIVE money you never need to enter your UPI PIN.",
        "A 'collect request' asks you to PAY, not receive.",
        "If someone says 'approve to get money', it is a trick.",
      ],
      quiz: {
        q: "To receive money on UPI, do you need to enter your PIN?",
        options: ["Yes, always", "No, never", "Only for big amounts"],
        answer: 1,
      },
    },
    {
      id: "loan",
      icon: "🏦",
      title: "Spotting fake loan apps",
      summary: "Real lenders never ask for a fee before giving you a loan.",
      points: [
        "'Pay a processing fee to release your loan' is a scam.",
        "Fake apps ask for too many phone permissions.",
        "Check the lender is registered with the RBI.",
      ],
      quiz: {
        q: "A loan app asks for a fee before giving the loan. This is…",
        options: ["Normal", "A scam", "A government rule"],
        answer: 1,
      },
    },
    {
      id: "link",
      icon: "🔗",
      title: "Fake links and websites",
      summary: "Look-alike web addresses and short links are used to steal your details.",
      points: [
        "sbi-verify.xyz is NOT the same as onlinesbi.sbi.",
        "Short links (bit.ly) hide the real address.",
        "Never enter bank details on a link from SMS or WhatsApp.",
      ],
      quiz: {
        q: "Which is more likely to be safe?",
        options: ["sbi-kyc-update.top", "onlinesbi.sbi", "sbi.secure-login.xyz"],
        answer: 1,
      },
    },
  ],
  gu: [
    {
      id: "otp",
      icon: "🔑",
      title: "બેંક ક્યારેય તમારો OTP માંગતી નથી",
      summary: "OTP, PIN અને CVV ગુપ્ત છે. કોઈ સાચી બેંક કે અધિકારી તે ક્યારેય માંગતા નથી.",
      points: [
        "OTP એ એક-વખતનો પાસવર્ડ છે જે વ્યવહાર મંજૂર કરે છે.",
        "જેની પાસે તમારો OTP હોય તે તમારા ખાતામાંથી પૈસા લઈ શકે.",
        "કૉલ કે મેસેજ OTP માંગે તો તે છેતરપિંડી છે — ફોન મૂકી દો.",
      ],
      quiz: {
        q: "કૉલ કરનાર બેંકનો હોવાનું કહી OTP માંગે તો શું કરશો?",
        options: ["ઝડપથી OTP આપો", "ના પાડો અને ફોન મૂકો", "SMS થી મોકલો"],
        answer: 1,
      },
    },
    {
      id: "collect",
      icon: "💸",
      title: "UPI 'collect request' છેતરપિંડી કેવી રીતે થાય",
      summary: "collect request મંજૂર કરવાથી પૈસા ખાતામાંથી જાય છે, ઉમેરાતા નથી.",
      points: [
        "પૈસા મેળવવા માટે ક્યારેય UPI PIN દાખલ કરવાની જરૂર નથી.",
        "'collect request' તમને ચૂકવણી કરવા કહે છે, મેળવવા નહીં.",
        "'પૈસા મેળવવા મંજૂર કરો' કહે તો તે યુક્તિ છે.",
      ],
      quiz: {
        q: "UPI પર પૈસા મેળવવા શું PIN દાખલ કરવો પડે?",
        options: ["હા, હંમેશા", "ના, ક્યારેય નહીં", "ફક્ત મોટી રકમ માટે"],
        answer: 1,
      },
    },
    {
      id: "loan",
      icon: "🏦",
      title: "નકલી લોન એપ ઓળખો",
      summary: "સાચા ધિરાણકર્તા લોન આપતા પહેલા ફી માંગતા નથી.",
      points: [
        "'લોન છોડવા પ્રોસેસિંગ ફી ભરો' એ છેતરપિંડી છે.",
        "નકલી એપ ફોનની ઘણી પરવાનગીઓ માંગે છે.",
        "ધિરાણકર્તા RBI સાથે નોંધાયેલ છે કે નહીં તપાસો.",
      ],
      quiz: {
        q: "લોન એપ લોન આપતા પહેલા ફી માંગે તો આ શું છે?",
        options: ["સામાન્ય", "છેતરપિંડી", "સરકારી નિયમ"],
        answer: 1,
      },
    },
    {
      id: "link",
      icon: "🔗",
      title: "નકલી લિંક અને વેબસાઇટ",
      summary: "મળતી-આવતી વેબ સરનામાં અને ટૂંકી લિંક વિગતો ચોરવા વપરાય છે.",
      points: [
        "sbi-verify.xyz એ onlinesbi.sbi જેવું નથી.",
        "ટૂંકી લિંક (bit.ly) સાચું સરનામું છુપાવે છે.",
        "SMS કે WhatsApp ની લિંક પર બેંક વિગતો ક્યારેય ન નાખો.",
      ],
      quiz: {
        q: "કઈ સાઇટ સલામત હોવાની વધુ શક્યતા છે?",
        options: ["sbi-kyc-update.top", "onlinesbi.sbi", "sbi.secure-login.xyz"],
        answer: 1,
      },
    },
  ],
};
