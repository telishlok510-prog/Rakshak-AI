import type { LanguageCode } from "./types";

export interface SimScenario {
  id: string;
  category: string;
  categoryIcon: string;
  /** The message/scenario the user sees */
  content: string;
  /** true = scam, false = safe */
  isScam: boolean;
  /** Why this is a scam (or safe) — shown after answering */
  explanation: string;
  /** Specific indicators highlighted */
  indicators: string[];
}

/**
 * Scam Simulator scenarios — realistic examples covering all major scam types
 * from the project documentation (section 1.2). Users practice identifying
 * each one, get instant feedback, and earn points.
 */
/** Number of scenarios for a given language (used by score/badge logic). */
export function getSimTotal(lang: LanguageCode): number {
  return SCENARIOS[lang].length;
}

export const SCENARIOS: Record<LanguageCode, SimScenario[]> = {
  en: [
    {
      id: "sms-kyc",
      category: "Phishing SMS",
      categoryIcon: "✉️",
      content: "Dear customer, your SBI KYC has expired. Update immediately or account will be blocked within 24 hours: http://sbi-kyc-update.top/verify",
      isScam: true,
      explanation: "This is a phishing SMS. Real SBI never sends KYC links via SMS. The domain 'sbi-kyc-update.top' is fake — SBI's real domain is sbi.co.in. The urgent '24 hours' deadline is a pressure tactic.",
      indicators: ["Fake domain (.top)", "Urgency (24 hours)", "KYC update via SMS link"],
    },
    {
      id: "upi-collect",
      category: "Fake UPI Request",
      categoryIcon: "💸",
      content: "You have received ₹5,000 from lottery. Approve this collect request from 'prize-winner@okaxis' to receive the money in your account.",
      isScam: true,
      explanation: "A COLLECT request takes money OUT of your account — it can never put money IN. To receive money on UPI, you never need to approve anything or enter your PIN. This is the classic collect-request scam.",
      indicators: ["Collect request disguised as receiving", "Lottery/prize bait", "Unknown sender"],
    },
    {
      id: "sms-legit",
      category: "Bank SMS",
      categoryIcon: "🏦",
      content: "Your a/c XX1234 is debited with Rs.500.00 on 08-Jul. Available balance: Rs.12,450.00 -SBI",
      isScam: false,
      explanation: "This is a genuine transaction alert. It doesn't ask for any action, doesn't contain links, doesn't request OTP/PIN, and comes from an official sender ID format. It simply informs you about a completed transaction.",
      indicators: ["No link", "No action requested", "Standard format"],
    },
    {
      id: "whatsapp-job",
      category: "WhatsApp Scam",
      categoryIcon: "💬",
      content: "Hi! I'm from Amazon HR. We have a part-time job for you — earn ₹5000-10000 daily from home. Just like and rate products. Send ₹500 registration fee to start. Reply YES to join.",
      isScam: true,
      explanation: "No real company asks for a fee to give you a job. Amazon does not hire via WhatsApp. The promise of ₹5000-10000 daily for simple tasks is unrealistic bait. The ₹500 'fee' is the scam.",
      indicators: ["Job offer via WhatsApp", "Upfront fee", "Unrealistic earnings", "Unknown sender"],
    },
    {
      id: "loan-scam",
      category: "Loan Scam",
      categoryIcon: "🏦",
      content: "CONGRATULATIONS! Your pre-approved personal loan of ₹3,00,000 is ready. Pay ₹2,999 processing fee to release funds immediately. Limited time offer!",
      isScam: true,
      explanation: "Real banks never ask for processing fees via SMS before releasing a loan. A genuine pre-approved loan gets its fee deducted from the loan amount itself. The urgency ('limited time') is a pressure tactic.",
      indicators: ["Advance fee before loan", "Urgency language", "Unsolicited offer"],
    },
    {
      id: "qr-scam",
      category: "QR Code Scam",
      categoryIcon: "📱",
      content: "I'm the buyer for your OLX item. I'll send payment. Scan this QR code to RECEIVE ₹8,000 in your account.",
      isScam: true,
      explanation: "Scanning a QR code and entering your PIN SENDS money — it never receives it. To receive money you never scan any QR code or enter PIN. This is a common scam on OLX, Quikr, and similar platforms.",
      indicators: ["QR code to 'receive' money", "Requires PIN entry", "OLX/marketplace context"],
    },
    {
      id: "investment-scam",
      category: "Investment Scam",
      categoryIcon: "📈",
      content: "Join our WhatsApp group for FREE stock tips. Guaranteed 500% returns in 30 days. Already 10,000+ members earning daily. Join now: bit.ly/ez-profit",
      isScam: true,
      explanation: "No investment can guarantee returns, let alone 500%. SEBI-registered advisors never promise guaranteed profits. The shortened link hides the real destination. This is a pump-and-dump or fee-collection scam.",
      indicators: ["Guaranteed returns", "Shortened link", "WhatsApp group invite", "Unrealistic promises"],
    },
    {
      id: "otp-legit",
      category: "Bank OTP",
      categoryIcon: "🔑",
      content: "123456 is your OTP for transaction of Rs.1200 at Flipkart. Valid for 5 min. Do NOT share with anyone. -HDFCBK",
      isScam: false,
      explanation: "This is a legitimate OTP from your bank for a transaction YOU initiated. Notice it doesn't ask you to call anyone, click a link, or share the OTP. The key rule: never share this OTP with any person or on any website.",
      indicators: ["No link", "No sharing request", "Standard bank OTP format"],
    },
  ],
  gu: [
    {
      id: "sms-kyc",
      category: "ફિશિંગ SMS",
      categoryIcon: "✉️",
      content: "પ્રિય ગ્રાહક, તમારી SBI KYC સમાપ્ત થઈ ગઈ છે. 24 કલાકમાં અપડેટ કરો નહીંતર ખાતું બ્લોક થશે: http://sbi-kyc-update.top/verify",
      isScam: true,
      explanation: "આ ફિશિંગ SMS છે. સાચી SBI ક્યારેય SMS દ્વારા KYC લિંક મોકલતી નથી. 'sbi-kyc-update.top' નકલી ડોમેન છે — SBI નું સાચું ડોમેન sbi.co.in છે. '24 કલાક' ની ઉતાવળ દબાણ ની યુક્તિ છે.",
      indicators: ["નકલી ડોમેન (.top)", "ઉતાવળ (24 કલાક)", "SMS લિંક દ્વારા KYC અપડેટ"],
    },
    {
      id: "upi-collect",
      category: "નકલી UPI વિનંતી",
      categoryIcon: "💸",
      content: "તમને લોટરીમાંથી ₹5,000 મળ્યા છે. પૈસા મેળવવા 'prize-winner@okaxis' ની collect વિનંતી મંજૂર કરો.",
      isScam: true,
      explanation: "COLLECT વિનંતી તમારા ખાતામાંથી પૈસા લે છે — ક્યારેય ઉમેરતી નથી. UPI પર પૈસા મેળવવા તમારે કંઈ મંજૂર કરવાની કે PIN દાખલ કરવાની જરૂર નથી. આ collect-request છેતરપિંડી છે.",
      indicators: ["Collect વિનંતી 'મેળવવા' તરીકે છૂપાવેલી", "લોટરી/ઇનામ બાઈટ", "અજાણ્યો મોકલનાર"],
    },
    {
      id: "sms-legit",
      category: "બેંક SMS",
      categoryIcon: "🏦",
      content: "તમારા ખાતા XX1234 માંથી Rs.500.00 ડેબિટ થયા. ઉપલબ્ધ બેલેન્સ: Rs.12,450.00 -SBI",
      isScam: false,
      explanation: "આ સાચી ટ્રાન્ઝેક્શન ચેતવણી છે. તેમાં કોઈ લિંક નથી, કોઈ કાર્યવાહી માંગતી નથી, OTP/PIN માંગતી નથી. ફક્ત પૂર્ણ થયેલા ટ્રાન્ઝેક્શન વિશે માહિતી આપે છે.",
      indicators: ["કોઈ લિંક નથી", "કોઈ કાર્યવાહી માંગી નથી", "સ્ટાન્ડર્ડ ફોર્મેટ"],
    },
    {
      id: "whatsapp-job",
      category: "WhatsApp છેતરપિંડી",
      categoryIcon: "💬",
      content: "નમસ્તે! હું Amazon HR માંથી છું. ઘરે બેસીને દરરોજ ₹5000-10000 કમાવો. પ્રોડક્ટ લાઇક અને રેટ કરો. શરૂ કરવા ₹500 રજિસ્ટ્રેશન ફી મોકલો. YES મોકલો.",
      isScam: true,
      explanation: "કોઈ સાચી કંપની નોકરી આપવા ફી માંગતી નથી. Amazon WhatsApp દ્વારા ભરતી કરતું નથી. ₹5000-10000 દૈનિક સરળ કામ માટે અવાસ્તવિક છે. ₹500 'ફી' એ જ છેતરપિંડી છે.",
      indicators: ["WhatsApp દ્વારા નોકરી", "અગાઉથી ફી", "અવાસ્તવિક કમાણી", "અજાણ્યો મોકલનાર"],
    },
    {
      id: "loan-scam",
      category: "લોન છેતરપિંડી",
      categoryIcon: "🏦",
      content: "અભિનંદન! તમારી ₹3,00,000 ની પ્રી-એપ્રૂવ્ડ લોન તૈયાર છે. ₹2,999 પ્રોસેસિંગ ફી ભરો અને તરત ફંડ મેળવો. મર્યાદિત સમય!",
      isScam: true,
      explanation: "સાચી બેંક ક્યારેય લોન આપતા પહેલા SMS દ્વારા ફી માંગતી નથી. સાચી લોનમાં ફી લોનની રકમમાંથી કપાય છે. 'મર્યાદિત સમય' દબાણ ની યુક્તિ છે.",
      indicators: ["લોન પહેલા ફી", "ઉતાવળ ભાષા", "અનામંત્રિત ઓફર"],
    },
    {
      id: "qr-scam",
      category: "QR કોડ છેતરપિંડી",
      categoryIcon: "📱",
      content: "હું તમારી OLX વસ્તુનો ખરીદદાર છું. પેમેન્ટ મોકલું છું. ₹8,000 મેળવવા આ QR કોડ સ્કેન કરો.",
      isScam: true,
      explanation: "QR કોડ સ્કેન કરી PIN દાખલ કરવાથી પૈસા જાય છે — ક્યારેય આવતા નથી. પૈસા મેળવવા QR સ્કેન કે PIN ની જરૂર નથી. OLX/Quikr પર આ સામાન્ય છેતરપિંડી છે.",
      indicators: ["પૈસા 'મેળવવા' QR કોડ", "PIN દાખલ કરવો પડે", "OLX/માર્કેટપ્લેસ"],
    },
    {
      id: "investment-scam",
      category: "રોકાણ છેતરપિંડી",
      categoryIcon: "📈",
      content: "અમારા WhatsApp ગ્રુપમાં જોડાઓ FREE સ્ટોક ટિપ્સ માટે. 30 દિવસમાં 500% ગેરંટીડ રિટર્ન. 10,000+ લોકો રોજ કમાય છે. bit.ly/ez-profit",
      isScam: true,
      explanation: "કોઈ રોકાણ રિટર્ન ગેરંટી ન આપી શકે, 500% તો બિલકુલ નહીં. SEBI-રજિસ્ટર્ડ એડવાઇઝર ક્યારેય ગેરંટીડ નફો વચન નથી આપતા. ટૂંકી લિંક સાચું સરનામું છુપાવે છે.",
      indicators: ["ગેરંટીડ રિટર્ન", "ટૂંકી લિંક", "WhatsApp ગ્રુપ", "અવાસ્તવિક વચન"],
    },
    {
      id: "otp-legit",
      category: "બેંક OTP",
      categoryIcon: "🔑",
      content: "123456 એ Flipkart પર Rs.1200 ટ્રાન્ઝેક્શન માટે તમારો OTP છે. 5 મિનિટ માટે માન્ય. કોઈને શેર ન કરો. -HDFCBK",
      isScam: false,
      explanation: "આ તમારી બેંકનો સાચો OTP છે જે તમે શરૂ કરેલા ટ્રાન્ઝેક્શન માટે છે. તે કોઈ લિંક, ફોન નંબર કે શેર કરવાની વિનંતી નથી કરતો. નિયમ: OTP ક્યારેય કોઈને ન આપો.",
      indicators: ["કોઈ લિંક નથી", "શેર કરવાની વિનંતી નથી", "સ્ટાન્ડર્ડ OTP ફોર્મેટ"],
    },
  ],
};
