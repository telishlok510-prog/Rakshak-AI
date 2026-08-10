import type { LanguageCode } from "./types";

/**
 * Safety Quiz — MCQ knowledge test covering Learn section content
 * Categories match lessons: Banking Basics, Digital Payments, Banking Security, etc.
 */

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Related lesson ID from lessons.ts (optional) */
  relatedLesson?: string;
}

export const QUIZ_QUESTIONS: Record<LanguageCode, QuizQuestion[]> = {
  en: [
    {
      id: "q1-otp",
      category: "Banking Security",
      question: "Your bank calls asking for your OTP to 'verify your account'. What should you do?",
      options: [
        "Share the OTP — they're from the bank",
        "Never share OTP with anyone, even if they claim to be from the bank",
        "Share only if they know my account number",
        "Share after verifying their employee ID",
      ],
      correctIndex: 1,
      explanation: "Banks NEVER ask for your OTP over phone, SMS, or email. OTP is only for YOU to use when YOU initiate a transaction. Anyone asking for it is a scammer.",
    },
    {
      id: "q2-upi-collect",
      category: "Digital Payments",
      question: "What happens when you approve a UPI 'Collect Request'?",
      options: [
        "You receive money into your account",
        "Money is deducted from your account",
        "Nothing happens until you enter PIN",
        "The request is forwarded to your bank",
      ],
      correctIndex: 1,
      explanation: "A COLLECT request always takes money OUT of your account. To receive money on UPI, you never approve anything or enter PIN — money just appears automatically.",
    },
    {
      id: "q3-kyc-sms",
      category: "Banking Security",
      question: "You receive an SMS: 'Your KYC expired. Update now: http://sbi-kyc.xyz or account blocked.' What's wrong?",
      options: [
        "Nothing, I should click the link immediately",
        "The domain .xyz is not SBI's real domain (fake link)",
        "KYC updates always come via SMS",
        "I should call the number in the SMS",
      ],
      correctIndex: 1,
      explanation: "This is a phishing SMS. Real SBI domain is sbi.co.in, not .xyz. Banks never send KYC links via SMS. Urgency ('account blocked') is a pressure tactic. Always visit the bank or call their official number.",
    },
    {
      id: "q4-qr-receive",
      category: "Digital Payments",
      question: "To RECEIVE ₹500 on UPI, should you scan a QR code?",
      options: [
        "Yes, scan the sender's QR code",
        "No, the sender should scan YOUR QR code or send to your UPI ID",
        "Only if the amount is correct",
        "Yes, but don't enter PIN",
      ],
      correctIndex: 1,
      explanation: "To RECEIVE money: you never scan anything. The SENDER scans your QR or sends to your UPI ID. Scanning a QR code always means you're PAYING/SENDING money.",
    },
    {
      id: "q5-atm-help",
      category: "Banking Basics",
      question: "A friendly stranger at the ATM offers to help you withdraw cash. What should you do?",
      options: [
        "Accept the help — it's kind of them",
        "Politely decline and do it yourself",
        "Let them press the buttons but shield the PIN",
        "Ask them to verify the cash amount",
      ],
      correctIndex: 1,
      explanation: "Never let anyone operate the ATM for you. 'Helpful' strangers might memorize your PIN, swap your card, or divert the cash. Always do everything yourself.",
    },
    {
      id: "q6-digital-arrest",
      category: "Banking Security",
      question: "A caller says you're under 'digital arrest' for money laundering and demands ₹50,000 to avoid jail. What is this?",
      options: [
        "Real police procedure",
        "A scam — police never call to demand money",
        "Legal investigation process",
        "I should pay to clear my name",
      ],
      correctIndex: 1,
      explanation: "'Digital arrest' is a scam. Real police never call to inform you of arrest or demand money over phone. They arrive in person with proper documentation. Hang up and report to 1930.",
    },
    {
      id: "q7-loan-fee",
      category: "Banking Basics",
      question: "An SMS offers a ₹2 lakh instant loan. It asks for ₹3,000 processing fee upfront. Is this genuine?",
      options: [
        "Yes, all loans need processing fees",
        "No, real banks deduct fees from the loan amount, never ask upfront",
        "Yes, if it's from a known lender",
        "I should pay half first to verify",
      ],
      correctIndex: 1,
      explanation: "Genuine banks deduct processing fees from the loan amount itself. They never ask for upfront payment before releasing the loan. This is an advance-fee scam.",
    },
    {
      id: "q8-netbanking-link",
      category: "Banking Security",
      question: "How should you access your bank's internet banking?",
      options: [
        "Click the link from bank's SMS/email",
        "Search on Google and click first result",
        "Type the official URL directly in browser",
        "Use any link that says 'secure login'",
      ],
      correctIndex: 2,
      explanation: "Always type your bank's URL directly. Never click links from SMS/email (could be phishing). Google results can also be fake ads. Typing the URL yourself is safest.",
    },
    {
      id: "q9-prize-collect",
      category: "Digital Payments",
      question: "You receive: 'Congratulations! You won ₹10,000. Approve this collect request to receive your prize.' What should you do?",
      options: [
        "Approve it to get my prize money",
        "Reject — collect requests take money OUT, not give money",
        "Approve after verifying the sender",
        "Share with friends first",
      ],
      correctIndex: 1,
      explanation: "This is the #1 UPI scam. A collect request always takes money FROM you. Real prizes never need collect requests. You'd just receive the money automatically to your UPI ID.",
    },
    {
      id: "q10-ifsc",
      category: "Banking Basics",
      question: "What is IFSC code used for?",
      options: [
        "Login password for internet banking",
        "Identifying the specific bank branch for transfers",
        "Secret code for debit card",
        "OTP verification code",
      ],
      correctIndex: 1,
      explanation: "IFSC (Indian Financial System Code) identifies the specific bank branch for electronic transfers like NEFT, RTGS, and IMPS. It's safe to share — it's public information, not a password.",
    },
    {
      id: "q11-whatsapp-job",
      category: "Banking Security",
      question: "You get a WhatsApp message: 'Amazon hiring! Earn ₹5000 daily from home. Pay ₹500 registration fee.' What is this?",
      options: [
        "Genuine job opportunity",
        "Job scam — real companies never ask for fees",
        "Legitimate work-from-home offer",
        "I should verify by paying ₹100 first",
      ],
      correctIndex: 1,
      explanation: "No genuine company asks for a fee to give you a job. Amazon doesn't hire via WhatsApp. Earning ₹5000 daily for simple tasks is unrealistic. This is a job scam.",
    },
    {
      id: "q12-beneficiary",
      category: "Banking Basics",
      question: "Before adding a new beneficiary for bank transfer, you should:",
      options: [
        "Trust the account details from WhatsApp",
        "Verify details with a direct phone call to the person",
        "Add immediately to save time",
        "Check if the account number looks correct",
      ],
      correctIndex: 1,
      explanation: "Always verify beneficiary details via a phone call. WhatsApp accounts can be hacked. One wrong digit means your money goes to a stranger forever. Take 30 seconds to verify!",
    },
  ],
  gu: [
    {
      id: "q1-otp",
      category: "બેંકિંગ સુરક્ષા",
      question: "તમારી બેંક તમારો OTP 'ખાતા ચકાસવા' માટે માંગે છે. તમારે શું કરવું જોઈએ?",
      options: [
        "OTP શેર કરો — તેઓ બેંકમાંથી છે",
        "ક્યારેય કોઈને OTP શેર ન કરો, ભલે તેઓ બેંકમાંથી હોવાનો દાવો કરે",
        "ફક્ત જો તેઓ મારો ખાતા નંબર જાણતા હોય તો શેર કરો",
        "તેમના કર્મચારી ID ચકાસ્યા પછી શેર કરો",
      ],
      correctIndex: 1,
      explanation: "બેંક ક્યારેય ફોન, SMS અથવા ઇમેઇલ પર તમારો OTP માંગતી નથી. OTP ફક્ત તમારા માટે છે જ્યારે તમે ટ્રાન્ઝેક્શન શરૂ કરો. તેને માંગનાર કોઈપણ છેતરનાર છે.",
    },
    {
      id: "q2-upi-collect",
      category: "ડિજિટલ પેમેન્ટ",
      question: "જ્યારે તમે UPI 'Collect વિનંતી' મંજૂર કરો ત્યારે શું થાય છે?",
      options: [
        "તમારા ખાતામાં પૈસા આવે છે",
        "તમારા ખાતામાંથી પૈસા કપાય છે",
        "PIN દાખલ ન કરો ત્યાં સુધી કંઈ થતું નથી",
        "વિનંતી તમારી બેંકને ફોરવર્ડ થાય છે",
      ],
      correctIndex: 1,
      explanation: "COLLECT વિનંતી હંમેશા તમારા ખાતામાંથી પૈસા લે છે. UPI પર પૈસા મેળવવા માટે, તમે કંઈ મંજૂર નથી કરતા અથવા PIN દાખલ નથી કરતા — પૈસા આપોઆપ આવે છે.",
    },
    {
      id: "q3-kyc-sms",
      category: "બેંકિંગ સુરક્ષા",
      question: "તમને SMS મળે છે: 'તમારી KYC સમાપ્ત થઈ. હમણાં અપડેટ કરો: http://sbi-kyc.xyz નહીંતર ખાતું બ્લોક.' શું ખોટું છે?",
      options: [
        "કંઈ નહીં, મારે તરત લિંક ક્લિક કરવી જોઈએ",
        "ડોમેન .xyz SBI નું સાચું ડોમેન નથી (નકલી લિંક)",
        "KYC અપડેટ હંમેશા SMS દ્વારા આવે છે",
        "મારે SMS માંના નંબર પર કૉલ કરવો જોઈએ",
      ],
      correctIndex: 1,
      explanation: "આ ફિશિંગ SMS છે. સાચું SBI ડોમેન sbi.co.in છે, .xyz નહીં. બેંક ક્યારેય SMS દ્વારા KYC લિંક મોકલતી નથી. ઉતાવળ ('ખાતું બ્લોક') દબાણની યુક્તિ છે. હંમેશા બેંકની મુલાકાત લો અથવા તેમના અધિકૃત નંબર પર કૉલ કરો.",
    },
    {
      id: "q4-qr-receive",
      category: "ડિજિટલ પેમેન્ટ",
      question: "UPI પર ₹500 મેળવવા માટે, શું તમારે QR કોડ સ્કેન કરવો જોઈએ?",
      options: [
        "હા, મોકલનારનો QR કોડ સ્કેન કરો",
        "ના, મોકલનારે તમારો QR કોડ સ્કેન કરવો જોઈએ અથવા તમારા UPI ID પર મોકલવું જોઈએ",
        "ફક્ત જો રકમ સાચી હોય",
        "હા, પણ PIN દાખલ ન કરો",
      ],
      correctIndex: 1,
      explanation: "પૈસા મેળવવા માટે: તમે કંઈ સ્કેન નથી કરતા. મોકલનાર તમારો QR સ્કેન કરે અથવા તમારા UPI ID પર મોકલે. QR કોડ સ્કેન કરવાનો હંમેશા અર્થ છે કે તમે ચૂકવણી/પૈસા મોકલી રહ્યા છો.",
    },
    {
      id: "q5-atm-help",
      category: "બેંકિંગ મૂળભૂત",
      question: "ATM પર એક મિત્રતાપૂર્ણ અજાણ્યો વ્યક્તિ તમને રોકડ કાઢવામાં મદદ કરવાની ઓફર કરે છે. તમારે શું કરવું જોઈએ?",
      options: [
        "મદદ સ્વીકારો — તે તેમની દયાળુતા છે",
        "નમ્રતાથી નકારો અને તમે જાતે કરો",
        "તેમને બટન દબાવવા દો પણ PIN ઢાંકો",
        "તેમને રોકડની રકમ ચકાસવા કહો",
      ],
      correctIndex: 1,
      explanation: "કોઈને ક્યારેય તમારા માટે ATM ચલાવવા ન દો. 'મદદગાર' અજાણ્યા લોકો તમારો PIN યાદ કરી શકે, તમારું કાર્ડ બદલી શકે, અથવા રોકડ વાળી શકે. હંમેશા બધું તમે જાતે કરો.",
    },
    {
      id: "q6-digital-arrest",
      category: "બેંકિંગ સુરક્ષા",
      question: "કૉલ કરનાર કહે છે કે તમે મની લોન્ડરિંગ માટે 'ડિજિટલ અરેસ્ટ' હેઠળ છો અને જેલ ટાળવા ₹50,000 ની માંગ કરે છે. આ શું છે?",
      options: [
        "સાચી પોલીસ પ્રક્રિયા",
        "છેતરપિંડી — પોલીસ ક્યારેય પૈસાની માંગ કરવા કૉલ નથી કરતી",
        "કાનૂની તપાસ પ્રક્રિયા",
        "મારે મારું નામ સાફ કરવા માટે ચૂકવણી કરવી જોઈએ",
      ],
      correctIndex: 1,
      explanation: "'ડિજિટલ અરેસ્ટ' છેતરપિંડી છે. સાચી પોલીસ તમને ધરપકડની જાણ કરવા અથવા ફોન પર પૈસાની માંગ કરવા ક્યારેય કૉલ નથી કરતી. તેઓ યોગ્ય દસ્તાવેજો સાથે રૂબરૂમાં આવે છે. ફોન કાપો અને 1930 પર જાણ કરો.",
    },
    {
      id: "q7-loan-fee",
      category: "બેંકિંગ મૂળભૂત",
      question: "એક SMS ₹2 લાખની તરત લોન ઓફર કરે છે. તે અગાઉથી ₹3,000 પ્રોસેસિંગ ફી માંગે છે. શું આ સાચું છે?",
      options: [
        "હા, બધી લોન માટે પ્રોસેસિંગ ફી જરૂરી છે",
        "ના, સાચી બેંક લોનની રકમમાંથી ફી કાપે છે, ક્યારેય અગાઉથી માંગતી નથી",
        "હા, જો તે જાણીતા ધીરનારા તરફથી હોય",
        "મારે પ્રથમ અડધું ચૂકવવું જોઈએ ચકાસવા માટે",
      ],
      correctIndex: 1,
      explanation: "સાચી બેંક પ્રોસેસિંગ ફી લોનની રકમમાંથી જ કાપે છે. તેઓ લોન આપતા પહેલા ક્યારેય અગાઉથી ચૂકવણી માંગતી નથી. આ એડવાન્સ-ફી છેતરપિંડી છે.",
    },
    {
      id: "q8-netbanking-link",
      category: "બેંકિંગ સુરક્ષા",
      question: "તમારે તમારી બેંકની ઇન્ટરનેટ બેંકિંગ કેવી રીતે એક્સેસ કરવી જોઈએ?",
      options: [
        "બેંકના SMS/ઇમેઇલમાંથી લિંક ક્લિક કરો",
        "Google પર શોધો અને પ્રથમ પરિણામ ક્લિક કરો",
        "બ્રાઉઝરમાં સીધું અધિકૃત URL ટાઇપ કરો",
        "કોઈપણ લિંક વાપરો જે 'સુરક્ષિત લોગિન' કહે છે",
      ],
      correctIndex: 2,
      explanation: "હંમેશા તમારી બેંકનું URL સીધું ટાઇપ કરો. SMS/ઇમેઇલમાંથી લિંક પર ક્યારેય ક્લિક ન કરો (ફિશિંગ હોઈ શકે). Google પરિણામો પણ નકલી જાહેરાતો હોઈ શકે. URL જાતે ટાઇપ કરવું સૌથી સલામત છે.",
    },
    {
      id: "q9-prize-collect",
      category: "ડિજિટલ પેમેન્ટ",
      question: "તમને મળે છે: 'અભિનંદન! તમે ₹10,000 જીત્યા છે. તમારું ઇનામ મેળવવા આ collect વિનંતી મંજૂર કરો.' તમારે શું કરવું જોઈએ?",
      options: [
        "મારા ઇનામના પૈસા મેળવવા માટે મંજૂર કરો",
        "નકારો — collect વિનંતી પૈસા લે છે, આપતી નથી",
        "મોકલનારને ચકાસ્યા પછી મંજૂર કરો",
        "પહેલા મિત્રો સાથે શેર કરો",
      ],
      correctIndex: 1,
      explanation: "આ નંબર 1 UPI છેતરપિંડી છે. collect વિનંતી હંમેશા તમારી પાસેથી પૈસા લે છે. સાચા ઇનામો માટે collect વિનંતીની જરૂર નથી. તમને ફક્ત તમારા UPI ID પર આપોઆપ પૈસા મળે.",
    },
    {
      id: "q10-ifsc",
      category: "બેંકિંગ મૂળભૂત",
      question: "IFSC કોડનો ઉપયોગ શેના માટે થાય છે?",
      options: [
        "ઇન્ટરનેટ બેંકિંગ માટે લોગિન પાસવર્ડ",
        "ટ્રાન્સફર માટે ચોક્કસ બેંક શાખા ઓળખવા માટે",
        "ડેબિટ કાર્ડ માટે ગુપ્ત કોડ",
        "OTP ચકાસણી કોડ",
      ],
      correctIndex: 1,
      explanation: "IFSC (ઇન્ડિયન ફાઇનાન્શિયલ સિસ્ટમ કોડ) NEFT, RTGS અને IMPS જેવા ઇલેક્ટ્રોનિક ટ્રાન્સફર માટે ચોક્કસ બેંક શાખા ઓળખે છે. તે શેર કરવું સલામત છે — તે જાહેર માહિતી છે, પાસવર્ડ નથી.",
    },
    {
      id: "q11-whatsapp-job",
      category: "બેંકિંગ સુરક્ષા",
      question: "તમને WhatsApp મેસેજ મળે છે: 'Amazon ભરતી! ઘરેથી દરરોજ ₹5000 કમાવો. ₹500 રજિસ્ટ્રેશન ફી ચૂકવો.' આ શું છે?",
      options: [
        "સાચી નોકરીની તક",
        "નોકરી છેતરપિંડી — સાચી કંપનીઓ ક્યારેય ફી માંગતી નથી",
        "કાયદેસર ઘરે બેસીને કામ કરવાની ઓફર",
        "મારે પહેલા ₹100 ચૂકવીને ચકાસવું જોઈએ",
      ],
      correctIndex: 1,
      explanation: "કોઈ સાચી કંપની તમને નોકરી આપવા ફી માંગતી નથી. Amazon WhatsApp દ્વારા ભરતી કરતું નથી. સરળ કામ માટે દરરોજ ₹5000 કમાવવું અવાસ્તવિક છે. આ નોકરી છેતરપિંડી છે.",
    },
    {
      id: "q12-beneficiary",
      category: "બેંકિંગ મૂળભૂત",
      question: "બેંક ટ્રાન્સફર માટે નવો લાભાર્થી ઉમેરતા પહેલા, તમારે:",
      options: [
        "WhatsApp ની ખાતાની વિગતો પર વિશ્વાસ કરવો",
        "સીધા વ્યક્તિને ફોન કૉલ વડે વિગતો ચકાસવી",
        "સમય બચાવવા માટે તરત ઉમેરવું",
        "તપાસો કે ખાતા નંબર સાચો લાગે છે",
      ],
      correctIndex: 1,
      explanation: "હંમેશા ફોન કૉલ વડે લાભાર્થીની વિગતો ચકાસો. WhatsApp ખાતાઓ હેક થઈ શકે છે. એક ખોટો અંકનો અર્થ છે કે તમારા પૈસા કાયમ માટે અજાણ્યાને જાય છે. ચકાસવા માટે 30 સેકંડ લો!",
    },
  ],
};

/**
 * Get questions by category
 */
export function getQuestionsByCategory(lang: LanguageCode, category: string): QuizQuestion[] {
  return QUIZ_QUESTIONS[lang].filter(q => q.category === category);
}

/**
 * Get all unique categories
 */
export function getCategories(lang: LanguageCode): string[] {
  const categories = new Set(QUIZ_QUESTIONS[lang].map(q => q.category));
  return Array.from(categories);
}

/**
 * Get a random selection of questions
 */
export function getRandomQuestions(lang: LanguageCode, count: number): QuizQuestion[] {
  const all = [...QUIZ_QUESTIONS[lang]];
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
