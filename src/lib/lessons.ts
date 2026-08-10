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
    // ── Core Safety (existing) ──
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
    // ── NEW: Government Schemes ──
    {
      id: "jan-dhan",
      icon: "🏛️",
      title: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
      summary: "A zero-balance bank account for every Indian with free insurance and overdraft facility.",
      points: [
        "You can open a Jan Dhan account with zero balance at any bank.",
        "It includes free accidental insurance up to ₹2 lakh.",
        "You get a RuPay debit card and can avail a small overdraft (₹10,000).",
        "Never pay anyone to 'open' or 'activate' your Jan Dhan account — it is free.",
      ],
      quiz: {
        q: "How much does it cost to open a PMJDY account?",
        options: ["₹500 processing fee", "Zero — it is free", "₹100 for the RuPay card"],
        answer: 1,
      },
    },
    {
      id: "pm-kisan",
      icon: "🌾",
      title: "PM-KISAN: Farmer Income Support",
      summary: "Farmers get ₹6,000 per year in three installments directly into their bank account.",
      points: [
        "PM-KISAN gives ₹6,000/year in three equal installments of ₹2,000.",
        "Money is sent directly to the registered bank account — no middleman.",
        "Beware of fake SMS saying 'your PM-KISAN is blocked, click here to update' — these are scams.",
        "Always check your balance at the bank or ATM, not via unknown links.",
      ],
      quiz: {
        q: "How much does a farmer receive per year under PM-KISAN?",
        options: ["₹2,000", "₹6,000", "₹12,000"],
        answer: 1,
      },
    },
    // ── NEW: Loans ──
    {
      id: "loan-types",
      icon: "📋",
      title: "Types of Bank Loans",
      summary: "Personal, home, education, and gold loans — know the basics before you borrow.",
      points: [
        "Personal loan: unsecured, higher interest, for any personal need.",
        "Home loan: secured against property, lower interest, long repayment period (15-30 years).",
        "Education loan: for higher studies, often has a moratorium (no EMI while studying).",
        "Gold loan: quick money against gold jewelry, but you risk losing the gold if you default.",
      ],
      quiz: {
        q: "Which loan usually has the lowest interest rate?",
        options: ["Personal loan", "Home loan", "Gold loan"],
        answer: 1,
      },
    },
    {
      id: "loan-redflags",
      icon: "🚩",
      title: "Loan Red Flags",
      summary: "Signs that a loan offer is fake or dangerous.",
      points: [
        "Guaranteed approval without any document check = fake.",
        "Advance fee or 'insurance charge' before loan disbursement = scam.",
        "Loan offered only via WhatsApp or SMS with no physical office = suspicious.",
        "Pressure to sign blank documents or share OTP during 'verification' = danger.",
      ],
      quiz: {
        q: "A lender asks for ₹2,000 upfront to 'process' your loan. What is this?",
        options: ["Standard procedure", "A red flag — likely a scam", "Required by RBI"],
        answer: 1,
      },
    },
    // ── NEW: Savings & Investments ──
    {
      id: "fd-rd",
      icon: "💰",
      title: "Fixed Deposit (FD) and Recurring Deposit (RD)",
      summary: "Safe ways to grow your money in a bank.",
      points: [
        "FD: You deposit a lump sum for a fixed period (e.g. 1-5 years) at a fixed interest rate.",
        "RD: You deposit a small fixed amount every month — good for regular savers.",
        "Both are insured up to ₹5 lakh per bank under DICGC (deposit insurance).",
        "Beware of agents promising 'double your money in 6 months' — these are NOT bank FDs.",
      ],
      quiz: {
        q: "Which deposit lets you save a small amount every month?",
        options: ["Fixed Deposit (FD)", "Recurring Deposit (RD)", "Current Account"],
        answer: 1,
      },
    },
    {
      id: "investment-scams",
      icon: "📉",
      title: "Investment Scams to Avoid",
      summary: "If it sounds too good to be true, it is.",
      points: [
        "'Double your money in 30 days' = impossible and illegal.",
        "Real investments (shares, mutual funds) go up AND down — no guaranteed returns.",
        "Never invest through WhatsApp groups or unknown apps without checking SEBI/RBI registration.",
        "Ponzi schemes pay early investors with new investors' money — they always collapse.",
      ],
      quiz: {
        q: "An investment promises 'guaranteed 50% return in 3 months'. Should you invest?",
        options: ["Yes, high returns are good", "No, guaranteed high returns are a scam sign", "Only if a friend recommended it"],
        answer: 1,
      },
    },
    // ── NEW: Banking Terms Glossary ──
    {
      id: "banking-terms",
      icon: "📖",
      title: "Banking Terms You Should Know",
      summary: "Simple explanations for common banking words.",
      points: [
        "IFSC: Indian Financial System Code — an 11-character code that identifies your bank branch (needed for online transfers).",
        "NEFT: National Electronic Funds Transfer — a safe way to send money to any Indian bank account, usually takes a few hours.",
        "IMPS: Immediate Payment Service — send money instantly, 24/7, including holidays.",
        "CIBIL Score: A number (300-900) that shows your credit history. Above 700 is good and helps you get loans easily.",
        "MICR: Magnetic Ink Character Recognition — the numbers at the bottom of your cheque that help machines read it.",
      ],
      quiz: {
        q: "What is IFSC used for?",
        options: ["To check your bank balance", "To identify your bank branch for online transfers", "To apply for a loan"],
        answer: 1,
      },
    },
  ],
  gu: [
    // ── Core Safety (existing) ──
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
    // ── NEW: Government Schemes ──
    {
      id: "jan-dhan",
      icon: "🏛️",
      title: "પ્રધાનમંત્રી જન ધન યોજના (PMJDY)",
      summary: "દરેક ભારતીય માટે શૂન્ય બેલેન્સ બેંક ખાતું, મફત વીમો અને ઓવરડ્રાફ્ટ સુવિધા.",
      points: [
        "તમે કોઈપણ બેંકમાં શૂન્ય બેલેન્સે જન ધન ખાતું ખોલી શકો.",
        "આમાં ₹2 લાખ સુધીનો મફત અકસ્માત વીમો છે.",
        "તમને RuPay ડેબિટ કાર્ડ મળે છે અને ₹10,000 સુધીનું ઓવરડ્રાફ્ટ મળી શકે.",
        "જન ધન ખાતું 'ખોલવા' કે 'એક્ટિવેટ' કરવા ક્યારેય પૈસા ન આપો — તે મફત છે.",
      ],
      quiz: {
        q: "PMJDY ખાતું ખોલવા કેટલો ખર્ચ થાય?",
        options: ["₹500 પ્રોસેસિંગ ફી", "શૂન્ય — તે મફત છે", "₹100 RuPay કાર્ડ માટે"],
        answer: 1,
      },
    },
    {
      id: "pm-kisan",
      icon: "🌾",
      title: "PM-KISAN: ખેડૂત આવક સહાય",
      summary: "ખેડૂતોને વર્ષે ₹6,000 ત્રણ હપ્તામાં સીધા બેંક ખાતામાં મળે છે.",
      points: [
        "PM-KISAN વર્ષે ₹6,000 આપે છે, ત્રણ સમાન હપ્તામાં ₹2,000-₹2,000.",
        "પૈસા નોંધાયેલા બેંક ખાતામાં સીધા મોકલાય છે — કોઈ દલાલ નથી.",
        "'તમારું PM-KISAN બ્લોક થયું, અપડેટ કરવા અહીં ક્લિક કરો' — આ નકલી SMS છે.",
        "અજાણ્યા લિંકથી નહીં, બેંક કે ATM થી જ બેલેન્સ તપાસો.",
      ],
      quiz: {
        q: "PM-KISAN હેઠળ ખેડૂતને વર્ષે કેટલા રૂપિયા મળે છે?",
        options: ["₹2,000", "₹6,000", "₹12,000"],
        answer: 1,
      },
    },
    // ── NEW: Loans ──
    {
      id: "loan-types",
      icon: "📋",
      title: "બેંક લોનના પ્રકારો",
      summary: "પર્સનલ, હોમ, શિક્ષણ અને સોનાની લોન — ઉધાર લેતા પહેલા મૂળભૂત જાણો.",
      points: [
        "પર્સનલ લોન: અસુરક્ષિત, વધુ વ્યાજ, કોઈપણ અંગત જરૂર માટે.",
        "હોમ લોન: મિલ્કત સામે સુરક્ષિત, ઓછું વ્યાજ, લાંબો સમય (15-30 વર્ષ).",
        "શિક્ષણ લોન: ઉચ્ચ અભ્યાસ માટે, ઘણી વાર મોરેટોરિયમ (અભ્યાસ દરમિયાન EMI નહીં).",
        "સોનાની લોન: દાગીના સામે ઝડપી રોકડ, પણ ડિફોલ્ટ કરો તો સોનું ગુમાવવાનું જોખમ.",
      ],
      quiz: {
        q: "કઈ લોન સામાન્ય રીતે સૌથી ઓછું વ્યાજ લે છે?",
        options: ["પર્સનલ લોન", "હોમ લોન", "સોનાની લોન"],
        answer: 1,
      },
    },
    {
      id: "loan-redflags",
      icon: "🚩",
      title: "લોનના લાલ ઝંડા",
      summary: "લોન ઓફર નકલી કે જોખમી હોય તેના સંકેતો.",
      points: [
        "કોઈ દસ્તાવેજ તપાસ્યા વગર ગેરંટીડ મંજૂરી = નકલી.",
        "લોન આપતા પહેલા અગાઉની ફી કે 'વીમા ચાર્જ' = છેતરપિંડી.",
        "WhatsApp કે SMS થી ફક્ત ઓફર, કોઈ ઓફિસ નહીં = શંકાસ્પદ.",
        "'ચકાસણી' દરમિયાન ખાલી કાગળ પર સહી કે OTP શેર કરવા દબાણ = જોખમ.",
      ],
      quiz: {
        q: "ધિરાણકર્તા લોન 'પ્રોસેસ' કરવા ₹2,000 અગાઉ માંગે. આ શું છે?",
        options: ["સામાન્ય પ્રક્રિયા", "લાલ ઝંડો — કદાચ છેતરપિંડી", "RBI દ્વારા જરૂરી"],
        answer: 1,
      },
    },
    // ── NEW: Savings & Investments ──
    {
      id: "fd-rd",
      icon: "💰",
      title: "ફિક્સ્ડ ડિપોઝિટ (FD) અને રિકરિંગ ડિપોઝિટ (RD)",
      summary: "બેંકમાં તમારા પૈસા સલામત રીતે વધારવાના માર્ગો.",
      points: [
        "FD: તમે એકમુસ્ત રકમ ચોક્કસ સમય માટે (દા.ત. 1-5 વર્ષ) ફિક્સ્ડ વ્યાજે જમા કરો.",
        "RD: દર મહિને નાની ચોક્કસ રકમ જમા કરો — નિયમિત બચત કરનારા માટે સારું.",
        "બંને DICGC (ડિપોઝિટ વીમા) હેઠળ દરેક બેંકમાં ₹5 લાખ સુધી વીમાયુક્ત છે.",
        "એજન્ટો '6 મહિનામાં પૈસા દોઢા' નું વચન આપે છે — આ બેંક FD નથી, છેતરપિંડી છે.",
      ],
      quiz: {
        q: "કયું ડિપોઝિટ દર મહિને નાની રકમ જમા કરવા દે છે?",
        options: ["ફિક્સ્ડ ડિપોઝિટ (FD)", "રિકરિંગ ડિપોઝિટ (RD)", "કરન્ટ એકાઉન્ટ"],
        answer: 1,
      },
    },
    {
      id: "investment-scams",
      icon: "📉",
      title: "રોકાણ છેતરપિંડીઓથી બચો",
      summary: "જો તે સાચું લાગે તેવું સારું હોય, તો તે સાચું નથી.",
      points: [
        "'30 દિવસમાં પૈસા દોઢા' = અશક્ય અને ગેરકાયદેસર.",
        "સાચા રોકાણ (શેર, મ્યુચ્યુઅલ ફંડ) ઉપર નીચે જાય — કોઈ ગેરંટીડ રિટર્ન નથી.",
        "SEBI/RBI નોંધણી તપાસ્યા વગર WhatsApp ગ્રુપ કે અજાણ્યા એપમાં ક્યારેય રોકાણ ન કરો.",
        "પોન્ઝી સ્કીમો નવા રોકાણકારના પૈસાથી જૂના રોકાણકારને ચૂકવે — છેલ્લે બધા ગુમાવે.",
      ],
      quiz: {
        q: "રોકાણ '3 મહિનામાં 50% ગેરંટીડ રિટર્ન' આપવાનું વચન આપે. શું રોકાણ કરવું જોઈએ?",
        options: ["હા, વધુ રિટર્ન સારું છે", "ના, ગેરંટીડ ઊંચું રિટર્ન છેતરપિંડીનો સંકેત છે", "ફક્ત મિત્રે ભલામણ કરી હોય તો"],
        answer: 1,
      },
    },
    // ── NEW: Banking Terms Glossary ──
    {
      id: "banking-terms",
      icon: "📖",
      title: "બેંકિંગ શબ્દો જે તમારે જાણવા જોઈએ",
      summary: "સામાન્ય બેંકિંગ શબ્દોની સાદી સમજૂતી.",
      points: [
        "IFSC: Indian Financial System Code — 11 અક્ષરનો કોડ જે તમારી બેંક શાખા ઓળખે છે (ઓનલાઇન ટ્રાન્સફર માટે જરૂરી).",
        "NEFT: National Electronic Funds Transfer — કોઈપણ ભારતીય બેંક ખાતામાં પૈસા મોકલવાનો સલામત માર્ગ, સામાન્ય રીતે કલાકો લાગે.",
        "IMPS: Immediate Payment Service — 24/7 તરત પૈસા મોકલો, રજાઓ સહિત.",
        "CIBIL Score: 300-900 નો નંબર જે તમારું ક્રેડિટ ઇતિહાસ બતાવે. 700 થી વધુ સારું અને લોન સરળતાથી મળે.",
        "MICR: Magnetic Ink Character Recognition — તમારા ચેક નીચેના નંબર જે મશીનો વાંચે છે.",
      ],
      quiz: {
        q: "IFSC શા માટે વપરાય છે?",
        options: ["બેંક બેલેન્સ તપાસવા", "ઓનલાઇન ટ્રાન્સફર માટે બેંક શાખા ઓળખવા", "લોન માટે અરજી કરવા"],
        answer: 1,
      },
    },
  ],
};