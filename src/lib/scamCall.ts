import type { LanguageCode } from "./types";

/**
 * Scam Call Simulation — interactive audio-based training
 * Users listen to realistic scam call recordings/recreations and answer
 * questions at strategic pause points to practice identifying red flags.
 */

export interface ScamCallPausePoint {
  /** Timestamp in seconds when audio should pause */
  atSeconds: number;
  /** Question to ask the user */
  question: {
    en: string;
    gu: string;
  };
  /** Multiple choice options */
  options: string[];
  /** Index of the correct option (0-based) */
  correctOptionIndex: number;
  /** Explanation shown after answer */
  explanation: {
    en: string;
    gu: string;
  };
  /** Related indicator code from detection.ts */
  relatedIndicatorCode?: string;
}

export interface ScamCallScenario {
  id: string;
  /** Display title */
  title: {
    en: string;
    gu: string;
  };
  /** Language of the audio recording */
  language: "en" | "gu";
  /** Path to audio file in /public */
  audioUrl: string;
  /** Duration in seconds */
  durationSeconds: number;
  /** Full transcript of the call */
  transcript: string;
  /** Pause points with questions */
  pausePoints: ScamCallPausePoint[];
  /** Short description of the scam type */
  description: {
    en: string;
    gu: string;
  };
}

/**
 * IMPORTANT: These scenarios use SCRIPTED RECREATIONS based on
 * publicly documented scam patterns. Never use real recordings
 * that contain victim personal details or real phone numbers.
 * 
 * For MVP: These are data structures only. Actual audio files
 * need to be recorded/generated separately and placed in /public/audio/scam-calls/
 */

export const SCAM_CALL_SCENARIOS: Record<LanguageCode, ScamCallScenario[]> = {
  en: [
    {
      id: "bank-kyc-block",
      title: {
        en: "Fake Bank KYC Call",
        gu: "નકલી બેંક KYC કૉલ",
      },
      language: "en",
      audioUrl: "/audio/scam-calls/bank-kyc-block-en.mp3",
      durationSeconds: 45,
      description: {
        en: "Caller claims to be from your bank, says KYC is expired and account will be blocked",
        gu: "કૉલ કરનાર તમારી બેંકમાંથી હોવાનો દાવો કરે છે, કહે છે KYC સમાપ્ત થઈ છે અને ખાતું બ્લોક થશે",
      },
      transcript: `[Ring...]
Caller: Hello, am I speaking to Mr. Sharma?
You: Yes, speaking.
Caller: Sir, this is Rahul calling from State Bank of India KYC department. Your account ending with 1234 — the KYC documents have expired.
You: Oh, what should I do?
Caller: Sir, if you don't update within 24 hours, your account will be permanently blocked. All your money will be frozen.
You: That's serious! How do I update?
Caller: I will send you a link on SMS. Open it and enter your debit card details and OTP to verify.
You: But should I share OTP?
Caller: Yes sir, it's mandatory for KYC verification. Without OTP we cannot update your documents.`,
      pausePoints: [
        {
          atSeconds: 12,
          question: {
            en: "The caller says the account will be 'permanently blocked in 24 hours'. What does this indicate?",
            gu: "કૉલ કરનાર કહે છે કે ખાતું '24 કલાકમાં કાયમ માટે બ્લોક થશે'. આ શું સૂચવે છે?",
          },
          options: [
            "Normal bank procedure",
            "Urgency pressure tactic (red flag)",
            "Legal requirement",
          ],
          correctOptionIndex: 1,
          explanation: {
            en: "🚩 Red flag! Real banks give weeks of notice for KYC, never 24 hours. This urgency is designed to make you panic and not think clearly.",
            gu: "🚩 લાલ સંકેત! સાચી બેંક KYC માટે અઠવાડિયાની નોટિસ આપે છે, ક્યારેય 24 કલાક નહીં. આ ઉતાવળ તમને ગભરાવવા અને સ્પષ્ટ વિચાર ન કરવા માટે બનાવવામાં આવી છે.",
          },
          relatedIndicatorCode: "URGENCY",
        },
        {
          atSeconds: 28,
          question: {
            en: "The caller asks you to click an SMS link and enter debit card details + OTP. What should you do?",
            gu: "કૉલ કરનાર તમને SMS લિંક ક્લિક કરવા અને ડેબિટ કાર્ડ વિગતો + OTP દાખલ કરવા કહે છે. તમારે શું કરવું જોઈએ?",
          },
          options: [
            "Follow instructions — he's from the bank",
            "Refuse and hang up — this is a scam",
            "Share OTP but not card details",
          ],
          correctOptionIndex: 1,
          explanation: {
            en: "🎯 Correct! This is a scam. Real banks NEVER ask for debit card details or OTP over the phone. They don't send KYC links via SMS. Hang up immediately and call your bank's official number.",
            gu: "🎯 સાચું! આ છેતરપિંડી છે. સાચી બેંક ક્યારેય ફોન પર ડેબિટ કાર્ડ વિગતો અથવા OTP માંગતી નથી. તેઓ SMS દ્વારા KYC લિંક મોકલતી નથી. તરત ફોન કાપો અને તમારી બેંકના અધિકૃત નંબર પર કૉલ કરો.",
          },
          relatedIndicatorCode: "CREDENTIALS",
        },
      ],
    },
    {
      id: "digital-arrest",
      title: {
        en: "Digital Arrest Scam Call",
        gu: "ડિજિટલ અરેસ્ટ સ્કૅમ કૉલ",
      },
      language: "en",
      audioUrl: "/audio/scam-calls/digital-arrest-en.mp3",
      durationSeconds: 50,
      description: {
        en: "Caller impersonates police/CBI, threatens arrest for fake money laundering charge",
        gu: "કૉલ કરનાર પોલીસ/CBI નો ડોળ કરે છે, નકલી મની લોન્ડરિંગ આરોપ માટે ધરપકડની ધમકી આપે છે",
      },
      transcript: `[Ring...]
Caller: Hello, this is Inspector Verma from Mumbai Cyber Crime Cell. Am I speaking to account holder?
You: Yes... what's this about?
Caller: Sir, your bank account has been used in a money laundering case. A parcel with drugs was sent using your details to Cambodia.
You: What? I never sent any parcel!
Caller: That's what all criminals say. Your case is now under digital arrest. You cannot leave your house or you will be physically arrested.
You: This is crazy! I haven't done anything!
Caller: I can help you, but you need to cooperate. Transfer ₹50,000 to this account for investigation clearance. This is to prove you're not fleeing.
You: Should I report this somewhere?
Caller: If you tell anyone or disconnect, we will issue arrest warrant immediately. Stay on the line.`,
      pausePoints: [
        {
          atSeconds: 15,
          question: {
            en: "The caller mentions 'money laundering' and 'drugs sent in your name'. Is this how real police contact suspects?",
            gu: "કૉલ કરનાર 'મની લોન્ડરિંગ' અને 'તમારા નામે ડ્રગ્સ મોકલવામાં' નો ઉલ્લેખ કરે છે. શું સાચી પોલીસ શંકાસ્પદોને આ રીતે સંપર્ક કરે છે?",
          },
          options: [
            "Yes, police call first",
            "No, this is a scam tactic",
            "Only for serious cases",
          ],
          correctOptionIndex: 1,
          explanation: {
            en: "🚩 Scam! Real police never call to inform you of arrest. They arrive in person with proper documentation. They never discuss cases over phone calls.",
            gu: "🚩 છેતરપિંડી! સાચી પોલીસ તમને ધરપકડની જાણ કરવા ક્યારેય ફોન નથી કરતી. તેઓ યોગ્ય દસ્તાવેજો સાથે રૂબરૂમાં આવે છે. તેઓ ફોન કૉલ પર કેસની ચર્ચા ક્યારેય નથી કરતા.",
          },
          relatedIndicatorCode: "CALL_IMPERSONATION",
        },
        {
          atSeconds: 35,
          question: {
            en: "Caller demands ₹50,000 transfer and threatens arrest if you disconnect or tell anyone. What is this?",
            gu: "કૉલ કરનાર ₹50,000 ટ્રાન્સફરની માંગ કરે છે અને જો તમે ડિસ્કનેક્ટ કરો અથવા કોઈને કહો તો ધરપકડની ધમકી આપે છે. આ શું છે?",
          },
          options: [
            "Legal procedure for investigation",
            "Classic extortion scam — hang up immediately",
            "Need to pay to avoid jail",
          ],
          correctOptionIndex: 1,
          explanation: {
            en: "🎯 Correct! This is the 'digital arrest' scam. Real police NEVER demand money over phone. They never threaten you for disconnecting. Hang up, block the number, and report to cybercrime.gov.in or call 1930.",
            gu: "🎯 સાચું! આ 'ડિજિટલ અરેસ્ટ' છેતરપિંડી છે. સાચી પોલીસ ક્યારેય ફોન પર પૈસાની માંગ નથી કરતી. તેઓ તમને ડિસ્કનેક્ટ કરવા બદલ ક્યારેય ધમકી નથી આપતા. ફોન કાપો, નંબર બ્લોક કરો, અને cybercrime.gov.in પર જાણ કરો અથવા 1930 પર કૉલ કરો.",
          },
          relatedIndicatorCode: "CALL_IMPERSONATION",
        },
      ],
    },
  ],
  gu: [
    {
      id: "bank-kyc-block-gu",
      title: {
        en: "Fake Bank KYC Call (Gujarati)",
        gu: "નકલી બેંક KYC કૉલ (ગુજરાતી)",
      },
      language: "gu",
      audioUrl: "/audio/scam-calls/bank-kyc-block-gu.mp3",
      durationSeconds: 45,
      description: {
        en: "Gujarati language scam: caller impersonates bank officer",
        gu: "ગુજરાતી ભાષાની છેતરપિંડી: કૉલ કરનાર બેંક અધિકારીનો ડોળ કરે છે",
      },
      transcript: `[રિંગ...]
કૉલ કરનાર: હેલો, શું હું શર્મા સાહેબ સાથે વાત કરું છું?
તમે: હા, બોલો.
કૉલ કરનાર: સાહેબ, હું સ્ટેટ બેંક ઓફ ઇન્ડિયા KYC વિભાગમાંથી રાહુલ બોલું છું. તમારું ખાતું 1234 સાથે અંત થાય છે — KYC દસ્તાવેજો સમાપ્ત થઈ ગયા છે.
તમે: ઓહ, મારે શું કરવું જોઈએ?
કૉલ કરનાર: સાહેબ, જો તમે 24 કલાકમાં અપડેટ નહીં કરો, તો તમારું ખાતું કાયમ માટે બ્લોક થઈ જશે. તમારા બધા પૈસા ફ્રીઝ થઈ જશે.
તમે: આ તો ગંભીર છે! હું કેવી રીતે અપડેટ કરું?
કૉલ કરનાર: હું તમને SMS પર લિંક મોકલીશ. તેને ખોલો અને ચકાસવા માટે તમારી ડેબિટ કાર્ડ વિગતો અને OTP દાખલ કરો.`,
      pausePoints: [
        {
          atSeconds: 12,
          question: {
            en: "Caller creates urgency with '24 hours or permanent block'. Is this real?",
            gu: "કૉલ કરનાર '24 કલાક અથવા કાયમી બ્લોક' સાથે ઉતાવળ બનાવે છે. શું આ સાચું છે?",
          },
          options: [
            "સામાન્ય બેંક પ્રક્રિયા",
            "ઉતાવળનું દબાણ યુક્તિ (લાલ સંકેત)",
            "કાનૂની જરૂરિયાત",
          ],
          correctOptionIndex: 1,
          explanation: {
            en: "Red flag! Real banks give proper notice, never 24-hour ultimatums.",
            gu: "લાલ સંકેત! સાચી બેંક યોગ્ય નોટિસ આપે છે, ક્યારેય 24-કલાકની અલ્ટિમેટમ નહીં.",
          },
          relatedIndicatorCode: "URGENCY",
        },
        {
          atSeconds: 28,
          question: {
            en: "Should you share OTP over phone to a bank caller?",
            gu: "શું તમારે બેંક કૉલ કરનારને ફોન પર OTP શેર કરવો જોઈએ?",
          },
          options: [
            "હા, તે બેંકમાંથી છે",
            "ના, ક્યારેય નહીં — આ છેતરપિંડી છે",
            "ફક્ત KYC માટે",
          ],
          correctOptionIndex: 1,
          explanation: {
            en: "Never share OTP with anyone, including bank callers!",
            gu: "બેંક કૉલ કરનારો સહિત કોઈને ક્યારેય OTP શેર ન કરો!",
          },
          relatedIndicatorCode: "CREDENTIALS",
        },
      ],
    },
    {
      id: "digital-arrest-gu",
      title: {
        en: "Digital Arrest Scam (Gujarati)",
        gu: "ડિજિટલ અરેસ્ટ સ્કૅમ (ગુજરાતી)",
      },
      language: "gu",
      audioUrl: "/audio/scam-calls/digital-arrest-gu.mp3",
      durationSeconds: 60,
      description: {
        en: "Fake CBI officer threatens arrest for money laundering",
        gu: "નકલી CBI અધિકારી મની લોન્ડરિંગ માટે ધરપકડની ધમકી આપે છે",
      },
      transcript: `[રિંગ...]
કૉલ કરનાર: હેલો, આ મુંબઈ સાયબર ક્રાઈમ સેલમાંથી ઇન્સ્પેક્ટર વર્મા બોલું છું. શું હું ખાતાધારક સાથે વાત કરું છું?
તમે: હા... આ શું વાત છે?
કૉલ કરનાર: સાહેબ, તમારા બેંક ખાતાનો ઉપયોગ મની લોન્ડરિંગ કેસમાં થયો છે. તમારી વિગતોનો ઉપયોગ કરીને કંબોડિયામાં ડ્રગ્સ સાથે પાર્સલ મોકલવામાં આવ્યું છે.
તમે: શું? મેં ક્યારેય કોઈ પાર્સલ મોકલ્યું નથી!
કૉલ કરનાર: બધા ગુનેગારો આવું જ કહે છે. તમારો કેસ હવે ડિજિટલ અરેસ્ટ હેઠળ છે. તમે તમારું ઘર છોડી શકતા નથી નહીંતર તમને શારીરિક રીતે ધરપકડ કરવામાં આવશે.
તમે: આ તો પાગલપણું છે! મેં કંઈ ખોટું કર્યું નથી!
કૉલ કરનાર: હું તમને મદદ કરી શકું છું, પણ તમારે સહકાર આપવો પડશે. તપાસ સાફ કરવા માટે આ ખાતામાં ₹50,000 ટ્રાન્સફર કરો. આ સાબિત કરવા માટે કે તમે ભાગી રહ્યા નથી.
તમે: શું મારે આની જાણ ક્યાંક કરવી જોઈએ?
કૉલ કરનાર: જો તમે કોઈને કહેશો અથવા ડિસ્કનેક્ટ કરશો, તો અમે તરત જ ધરપકડ વોરંટ બહાર પાડીશું. લાઈન પર રહો.`,
      pausePoints: [
        {
          atSeconds: 18,
          question: {
            en: "Caller claims 'digital arrest' and threatens you cannot leave home. Is this real?",
            gu: "કૉલ કરનાર 'ડિજિટલ અરેસ્ટ' નો દાવો કરે છે અને ધમકી આપે છે કે તમે ઘર છોડી શકતા નથી. શું આ સાચું છે?",
          },
          options: [
            "હા, નવો કાયદો છે",
            "ના, આ છેતરપિંડી છે - ડિજિટલ અરેસ્ટ જેવી કોઈ વસ્તુ નથી",
            "ફક્ત ગંભીર કેસમાં",
          ],
          correctOptionIndex: 1,
          explanation: {
            en: "🚩 Complete scam! 'Digital arrest' does not exist in Indian law. Real police never call to inform of arrest. They come in person with proper documentation.",
            gu: "🚩 સંપૂર્ણ છેતરપિંડી! ભારતીય કાયદામાં 'ડિજિટલ અરેસ્ટ' જેવું કંઈ નથી. સાચી પોલીસ ધરપકડની જાણ કરવા ક્યારેય ફોન નથી કરતી. તેઓ યોગ્ય દસ્તાવેજો સાથે રૂબરૂમાં આવે છે.",
          },
          relatedIndicatorCode: "CALL_IMPERSONATION",
        },
        {
          atSeconds: 42,
          question: {
            en: "Caller demands ₹50,000 and threatens arrest if you hang up. What should you do?",
            gu: "કૉલ કરનાર ₹50,000 ની માંગ કરે છે અને જો તમે ફોન કાપો તો ધરપકડની ધમકી આપે છે. તમારે શું કરવું જોઈએ?",
          },
          options: [
            "પૈસા ટ્રાન્સફર કરો - પોલીસ છે",
            "તરત ફોન કાપો, નંબર બ્લોક કરો, 1930 પર રિપોર્ટ કરો",
            "પહેલા ફેમિલી સાથે ચર્ચા કરો",
          ],
          correctOptionIndex: 1,
          explanation: {
            en: "🎯 Correct! Hang up immediately. Real police NEVER demand money over phone. Report to cybercrime.gov.in or call 1930 helpline. Block the number.",
            gu: "🎯 સાચું! તરત જ ફોન કાપો. સાચી પોલીસ ક્યારેય ફોન પર પૈસાની માંગ નથી કરતી. cybercrime.gov.in પર રિપોર્ટ કરો અથવા 1930 હેલ્પલાઇન પર કૉલ કરો. નંબર બ્લોક કરો.",
          },
          relatedIndicatorCode: "CALL_IMPERSONATION",
        },
      ],
    },
    {
      id: "electricity-bill-gu",
      title: {
        en: "Fake Electricity Bill Scam (Gujarati)",
        gu: "નકલી વીજળી બિલ સ્કૅમ (ગુજરાતી)",
      },
      language: "gu",
      audioUrl: "/audio/scam-calls/electricity-bill-gu.mp3",
      durationSeconds: 50,
      description: {
        en: "Scammer pretends to be electricity company, threatens connection cut",
        gu: "છેતરનાર વીજળી કંપનીનો ડોળ કરે છે, કનેક્શન કાપવાની ધમકી આપે છે",
      },
      transcript: `[રિંગ...]
કૉલ કરનાર: હેલો, આ અમદાવાદ વીજળી બોર્ડમાંથી છે. શું હું પટેલ સાહેબ સાથે વાત કરું છું?
તમે: હા, કહો.
કૉલ કરનાર: સાહેબ, તમારો છેલ્લો બિલ ₹8,450 બાકી છે. તમે 3 મહિનાથી ચૂકવણી કરી નથી.
તમે: પણ મેં તો ગયા મહિને ચૂકવણી કરી હતી!
કૉલ કરનાર: સાહેબ, અમારી સિસ્ટમમાં કોઈ રેકોર્ડ નથી. આજે સાંજે 6 વાગ્યા સુધી જો ચૂકવણી નહીં થાય તો તમારું કનેક્શન કાપી નાખવામાં આવશે.
તમે: આટલી જલદી? આ તો ખોટું છે!
કૉલ કરનાર: સાહેબ, હું તમને મદદ કરવા માંગું છું. તમે હવે જ PhonePe અથવા Google Pay થી આ નંબર પર ચૂકવણી કરો: 98765-43210. તરત જ તમારું કનેક્શન ચાલુ રહેશે.
તમે: પણ વીજળી બોર્ડ ફોન પર પૈસા માંગે છે?
કૉલ કરનાર: હા સાહેબ, આ નવી સિસ્ટમ છે. તમે ઓનલાઇન પેમેન્ટ કરી શકો છો. ઝડપ કરો, ટીમ તમારા ઘરે પહોંચી રહી છે કનેક્શન કાપવા.`,
      pausePoints: [
        {
          atSeconds: 20,
          question: {
            en: "Caller creates panic with 'connection cut by 6 PM today'. Is this normal?",
            gu: "કૉલ કરનાર 'આજે સાંજે 6 વાગ્યા સુધી કનેક્શન કાપી નાખશે' કહીને ગભરાટ બનાવે છે. શું આ સામાન્ય છે?",
          },
          options: [
            "હા, બિલ બાકી હોય તો આમ થાય",
            "ના, આ ઉતાવળની યુક્તિ છે - સાચી વીજળી કંપની પહેલા નોટિસ આપે છે",
            "કેટલીકવાર આમ થાય છે",
          ],
          correctOptionIndex: 1,
          explanation: {
            en: "🚩 Red flag! Real electricity companies send multiple written notices before disconnection, never same-day threats. This urgency is a scam tactic.",
            gu: "🚩 લાલ સંકેત! સાચી વીજળી કંપની ડિસ્કનેક્શન પહેલા બહુવિધ લેખિત નોટિસ મોકલે છે, ક્યારેય તે જ દિવસે ધમકી નહીં. આ ઉતાવળ છેતરપિંડીની યુક્તિ છે.",
          },
          relatedIndicatorCode: "URGENCY",
        },
        {
          atSeconds: 38,
          question: {
            en: "Caller asks for PhonePe payment to a personal mobile number. Should you pay?",
            gu: "કૉલ કરનાર વ્યક્તિગત મોબાઇલ નંબર પર PhonePe પેમેન્ટ માંગે છે. શું તમારે ચૂકવણી કરવી જોઈએ?",
          },
          options: [
            "હા, તે વીજળી બોર્ડમાંથી છે",
            "ના, ક્યારેય નહીં - સાચી વીજળી કંપની વ્યક્તિગત નંબર પર પૈસા નથી માંગતી",
            "પહેલા બિલ ચેક કરો",
          ],
          correctOptionIndex: 1,
          explanation: {
            en: "🎯 Correct! Real electricity companies never ask for payment to personal mobile numbers. They use official portals, bank accounts, or authorized collection centers. Hang up and check your bill on the official website or app.",
            gu: "🎯 સાચું! સાચી વીજળી કંપની ક્યારેય વ્યક્તિગત મોબાઇલ નંબર પર ચૂકવણી માંગતી નથી. તેઓ અધિકૃત પોર્ટલ, બેંક ખાતા, અથવા અધિકૃત કલેક્શન સેન્ટર વાપરે છે. ફોન કાપો અને તમારા બિલને અધિકૃત વેબસાઇટ અથવા એપ પર ચેક કરો.",
          },
          relatedIndicatorCode: "SUSPICIOUS_PAYMENT",
        },
      ],
    },
  ],
};

/**
 * Get total number of pause points across all scenarios for scoring
 */
export function getTotalPausePoints(lang: LanguageCode): number {
  return SCAM_CALL_SCENARIOS[lang].reduce(
    (sum, scenario) => sum + scenario.pausePoints.length,
    0
  );
}
