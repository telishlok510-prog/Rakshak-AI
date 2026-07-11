import type { LanguageCode } from "./types";

export interface ScamTrend {
  id: string;
  icon: string;
  month: string; // e.g. "July 2026" — human-readable recency signal
  title: string;
  summary: string;
  howItWorks: string;
  redFlag: string;
}

/**
 * Curated "what's new in scams" feed.
 *
 * ponytail: no backend/CMS — this is a static, hand-curated list, same
 * pattern as lessons.ts. Real-time scam-trend ingestion would need a data
 * source (news API, RBI/cybercrime bulletin feed) which isn't wired up; the
 * honest and correct scope here is a maintained editorial list, refreshed by
 * whoever maintains the app content. Upgrade path if ever needed: replace
 * this static array with a fetch from a CMS/API using the same ScamTrend shape.
 */
export const SCAM_TRENDS: Record<LanguageCode, ScamTrend[]> = {
  en: [
    {
      id: "digital-arrest",
      icon: "👮",
      month: "Trending now",
      title: "\"Digital Arrest\" video call scam",
      summary: "Scammers pose as police/CBI/customs on a video call, claim you're under investigation, and demand money to avoid 'arrest'.",
      howItWorks: "A call or video call shows a fake uniform, police badge, or courtroom background. They claim your Aadhaar/parcel is linked to a crime and pressure you to stay on camera while transferring money 'to prove innocence'.",
      redFlag: "Real police NEVER investigate or arrest over a phone/video call, and never ask for money to avoid arrest. Hang up immediately.",
    },
    {
      id: "fake-trading-app",
      icon: "📈",
      month: "Trending now",
      title: "Fake stock-trading apps via WhatsApp groups",
      summary: "Investment groups on WhatsApp/Telegram promise guaranteed daily returns, then push users to install a fake trading app.",
      howItWorks: "The app shows fake 'profits' growing in your dashboard, encouraging bigger deposits. When you try to withdraw, it either fails or asks for more 'tax/fees' before allowing withdrawal — which never happens.",
      redFlag: "No investment can guarantee daily returns. If you can only see profits in an app but can never withdraw, it's a scam.",
    },
    {
      id: "electricity-bill",
      icon: "💡",
      month: "Trending now",
      title: "\"Electricity bill unpaid, power will be cut tonight\" SMS",
      summary: "An SMS claims your electricity connection will be disconnected within hours unless you call a number or click a link to pay immediately.",
      howItWorks: "The number connects to a scammer posing as an electricity board agent, who asks you to install a remote-access app (like AnyDesk) 'to process the refund/payment' — which gives them full control of your phone.",
      redFlag: "Never install remote-access apps because someone on a call asked you to. Check your bill directly on your electricity board's official app or website.",
    },
    {
      id: "courier-parcel",
      icon: "📦",
      month: "Trending now",
      title: "Fake courier/customs parcel scam",
      summary: "A call or SMS claims a parcel in your name contains illegal items (drugs, passports) and is 'held by customs', linking to the digital-arrest scam above.",
      howItWorks: "They claim your Aadhaar or phone number is linked to the parcel and threaten legal action unless you cooperate — usually leading to a fake police video call and a demand for money.",
      redFlag: "Customs and courier companies do not call individuals about seized parcels. Never share personal ID details or pay to 'clear' a parcel you didn't order.",
    },
  ],
  gu: [
    {
      id: "digital-arrest",
      icon: "👮",
      month: "હાલમાં ટ્રેન્ડિંગ",
      title: "\"ડિજિટલ અરેસ્ટ\" વિડિયો કૉલ છેતરપિંડી",
      summary: "છેતરનારા પોલીસ/CBI/કસ્ટમ્સ તરીકે વિડિયો કૉલ પર દેખાય છે, કહે છે તમે તપાસ હેઠળ છો, અને 'ધરપકડ' ટાળવા પૈસા માંગે છે.",
      howItWorks: "કૉલ કે વિડિયો કૉલમાં નકલી યુનિફોર્મ, પોલીસ બેજ કે કોર્ટરૂમ બેકગ્રાઉન્ડ દેખાય છે. તેઓ કહે છે તમારું આધાર/પાર્સલ ગુનામાં જોડાયેલું છે અને કેમેરા પર રહીને પૈસા મોકલવા દબાણ કરે છે.",
      redFlag: "સાચી પોલીસ ક્યારેય ફોન/વિડિયો કૉલ પર તપાસ કે ધરપકડ કરતી નથી, અને ધરપકડ ટાળવા પૈસા માંગતી નથી. તરત ફોન કાપી નાખો.",
    },
    {
      id: "fake-trading-app",
      icon: "📈",
      month: "હાલમાં ટ્રેન્ડિંગ",
      title: "WhatsApp ગ્રુપ દ્વારા નકલી ટ્રેડિંગ એપ",
      summary: "WhatsApp/Telegram પરના રોકાણ ગ્રુપ ગેરંટીડ દૈનિક નફાનું વચન આપે છે, પછી નકલી ટ્રેડિંગ એપ ઇન્સ્ટોલ કરવા દબાણ કરે છે.",
      howItWorks: "એપ તમારા ડેશબોર્ડમાં નકલી 'નફો' વધતો બતાવે છે, વધુ પૈસા મૂકવા પ્રેરે છે. પૈસા ઉપાડવાનો પ્રયાસ કરો ત્યારે તે નિષ્ફળ થાય છે અથવા વધુ 'ટેક્સ/ફી' માંગે છે — જે ક્યારેય ઉપાડ થવા દેતું નથી.",
      redFlag: "કોઈ રોકાણ દૈનિક ગેરંટીડ નફો ન આપી શકે. જો એપમાં ફક્ત નફો દેખાય પણ ઉપાડ ક્યારેય ન થાય, તો તે છેતરપિંડી છે.",
    },
    {
      id: "electricity-bill",
      icon: "💡",
      month: "હાલમાં ટ્રેન્ડિંગ",
      title: "\"વીજળી બિલ ભરાયું નથી, આજ રાત્રે કનેક્શન કપાશે\" SMS",
      summary: "SMS કહે છે કલાકોમાં તમારું વીજળી કનેક્શન કપાશે જો તરત નંબર પર કૉલ ન કરો કે લિંક પર ચૂકવણી ન કરો.",
      howItWorks: "નંબર છેતરનાર સાથે જોડાય છે જે વીજળી બોર્ડ એજન્ટ હોવાનો ડોળ કરે છે અને 'રિફંડ/ચુકવણી' માટે રિમોટ-એક્સેસ એપ (જેમ AnyDesk) ઇન્સ્ટોલ કરવા કહે છે — જે તેમને તમારા ફોનનો સંપૂર્ણ કંટ્રોલ આપે છે.",
      redFlag: "કૉલ પર કોઈએ કહ્યું એટલે રિમોટ-એક્સેસ એપ ક્યારેય ઇન્સ્ટોલ ન કરો. તમારું બિલ સીધું વીજળી બોર્ડની અધિકૃત એપ કે વેબસાઇટ પર તપાસો.",
    },
    {
      id: "courier-parcel",
      icon: "📦",
      month: "હાલમાં ટ્રેન્ડિંગ",
      title: "નકલી કુરિયર/કસ્ટમ્સ પાર્સલ છેતરપિંડી",
      summary: "કૉલ કે SMS કહે છે તમારા નામનું પાર્સલ ગેરકાયદેસર વસ્તુઓ (ડ્રગ્સ, પાસપોર્ટ) ધરાવે છે અને 'કસ્ટમ્સ પાસે રોકાયેલું છે', જે ઉપરની ડિજિટલ અરેસ્ટ છેતરપિંડી તરફ લઈ જાય છે.",
      howItWorks: "તેઓ કહે છે તમારું આધાર કે ફોન નંબર પાર્સલ સાથે જોડાયેલું છે અને સહકાર ન આપો તો કાનૂની કાર્યવાહીની ધમકી આપે છે — સામાન્ય રીતે નકલી પોલીસ વિડિયો કૉલ અને પૈસાની માંગ તરફ દોરી જાય છે.",
      redFlag: "કસ્ટમ્સ અને કુરિયર કંપનીઓ પકડાયેલા પાર્સલ વિશે વ્યક્તિઓને ફોન કરતી નથી. વ્યક્તિગત ID વિગતો શેર ન કરો કે ન ઓર્ડર કરેલ પાર્સલ 'ક્લિયર' કરવા પૈસા ન આપો.",
    },
  ],
};
