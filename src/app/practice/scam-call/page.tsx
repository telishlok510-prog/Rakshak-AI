"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { ScamCallScenarioList } from "@/components/practice/ScamCallSimulation";

export default function ScamCallPracticePage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/practice"
        className="mb-6 inline-block text-primary hover:underline"
      >
        {t("practice.back")}
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-primary">
          {t("practice.scamCall")}
        </h1>
        <p className="mt-2 text-gray-600">
          {t("practice.scamCall.desc")}
        </p>
      </div>

      <ScamCallScenarioList />

      {/* Important Note */}
      <div className="mt-8 rounded-xl border-2 border-orange-300 bg-orange-50 p-6">
        <h3 className="mb-3 text-lg font-bold text-orange-900">
          ⚠️ {t("lang") === "en" ? "Important: Audio Files Required" : "મહત્વપૂર્ણ: ઑડિઓ ફાઇલો જરૂરી"}
        </h3>
        <p className="text-sm text-gray-700">
          {t("lang") === "en"
            ? "These scenarios require audio recordings to be placed in /public/audio/scam-calls/. For the MVP, you'll need to create or record these audio files based on the transcripts provided in the scenario data. Use text-to-speech tools or voice actors to recreate realistic scam call scenarios."
            : "આ પરિસ્થિતિઓ માટે /public/audio/scam-calls/ માં ઑડિઓ રેકોર્ડિંગ્સ મૂકવાની જરૂર છે. MVP માટે, તમારે પરિસ્થિતિ ડેટામાં આપેલી ટ્રાન્સક્રિપ્ટ્સના આધારે આ ઑડિઓ ફાઇલો બનાવવી અથવા રેકોર્ડ કરવી જરૂરી છે."}
        </p>
      </div>

      {/* Safety Tips */}
      <div className="mt-6 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
        <h3 className="mb-3 text-xl font-bold text-primary">
          💡 {t("lang") === "en" ? "How to Handle Suspicious Calls" : "શંકાસ્પદ કૉલ કેવી રીતે સંભાળવી"}
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex gap-2">
            <span>1️⃣</span>
            <span>
              <strong>
                {t("lang") === "en" ? "Stay calm" : "શાંત રહો"}
              </strong>
              {" — "}
              {t("lang") === "en"
                ? "Scammers use urgency to make you panic"
                : "છેતરનારાઓ તમને ગભરાવવા માટે ઉતાવળનો ઉપયોગ કરે છે"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>2️⃣</span>
            <span>
              <strong>
                {t("lang") === "en" ? "Never share" : "ક્યારેય શેર ન કરો"}
              </strong>
              {" — "}
              {t("lang") === "en"
                ? "OTP, PIN, card details, or bank passwords over phone"
                : "ફોન પર OTP, PIN, કાર્ડ વિગતો, અથવા બેંક પાસવર્ડ"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>3️⃣</span>
            <span>
              <strong>
                {t("lang") === "en" ? "Verify independently" : "સ્વતંત્ર રીતે ચકાસો"}
              </strong>
              {" — "}
              {t("lang") === "en"
                ? "Hang up and call your bank's official number from their website"
                : "ફોન કાપો અને તમારી બેંકના અધિકૃત નંબર પર કૉલ કરો"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>4️⃣</span>
            <span>
              <strong>
                {t("lang") === "en" ? "Real banks never" : "સાચી બેંક ક્યારેય નહીં"}
              </strong>
              {" — "}
              {t("lang") === "en"
                ? "Call asking for OTP/PIN, threaten account blocking, or demand immediate payment"
                : "OTP/PIN માંગવા માટે કૉલ કરતી નથી, ખાતું બ્લોક કરવાની ધમકી આપતી નથી, અથવા તરત ચૂકવણીની માંગ કરતી નથી"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>5️⃣</span>
            <span>
              <strong>
                {t("lang") === "en" ? "Report it" : "જાણ કરો"}
              </strong>
              {" — "}
              {t("lang") === "en"
                ? "Call 1930 or report at cybercrime.gov.in"
                : "1930 પર કૉલ કરો અથવા cybercrime.gov.in પર જાણ કરો"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
