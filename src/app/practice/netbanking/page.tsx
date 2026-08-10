"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import SimulationEngine from "@/components/SimulationEngine";
import { NETBANKING_SIMULATION } from "@/lib/simulations/netbankingSteps";

export default function NetbankingPracticePage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/practice"
        className="mb-6 inline-block text-primary hover:underline"
      >
        {t("practice.back")}
      </Link>

      <SimulationEngine
        config={NETBANKING_SIMULATION}
        onComplete={(score, total) => {
          console.log(`Netbanking simulation completed: ${score}/${total}`);
        }}
      />

      {/* Additional Tips */}
      <div className="mt-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
        <h3 className="mb-3 text-xl font-bold text-primary">
          {t("lang") === "en" ? "💡 Internet Banking Safety Tips" : "💡 ઇન્ટરનેટ બેંકિંગ સલામતી ટિપ્સ"}
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex gap-2">
            <span>🔒</span>
            <span>
              {t("lang") === "en"
                ? "Always type your bank's URL directly — never click links from SMS/email"
                : "હંમેશા તમારી બેંકનું URL સીધું ટાઇપ કરો — SMS/ઇમેઇલમાંથી લિંક પર ક્યારેય ક્લિક ન કરો"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              {t("lang") === "en"
                ? "Check for HTTPS and the padlock icon in the address bar"
                : "એડ્રેસ બારમાં HTTPS અને પેડલોક આયકોન તપાસો"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>📞</span>
            <span>
              {t("lang") === "en"
                ? "Verify beneficiary details with a phone call before adding"
                : "ઉમેરતા પહેલા ફોન કૉલ વડે લાભાર્થીની વિગતો ચકાસો"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>⏸️</span>
            <span>
              {t("lang") === "en"
                ? "Take 10 seconds to review every transfer before confirming"
                : "ખાતરી કરતા પહેલા દરેક ટ્રાન્સફર સમીક્ષા કરવા માટે 10 સેકંડ લો"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>🚪</span>
            <span>
              {t("lang") === "en"
                ? "Always logout properly — don't just close the tab"
                : "હંમેશા યોગ્ય રીતે લૉગઆઉટ કરો — માત્ર ટેબ બંધ ન કરો"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>📝</span>
            <span>
              {t("lang") === "en"
                ? "Save transaction reference numbers for all payments"
                : "બધી ચૂકવણીઓ માટે ટ્રાન્ઝેક્શન સંદર્ભ નંબર સાચવો"}
            </span>
          </li>
        </ul>

        <div className="mt-4 rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
          <h4 className="mb-2 font-bold text-orange-900">
            ⚠️ {t("lang") === "en" ? "Official Bank Domains to Remember:" : "યાદ રાખવા યોગ્ય અધિકૃત બેંક ડોમેન:"}
          </h4>
          <ul className="space-y-1 text-sm text-orange-800">
            <li>• SBI: onlinesbi.sbi.co.in</li>
            <li>• HDFC: netbanking.hdfcbank.com</li>
            <li>• ICICI: www.icicibank.com</li>
            <li>• Axis: www.axisbank.com</li>
            <li>• PNB: netpnb.com</li>
          </ul>
          <p className="mt-2 text-xs text-orange-700">
            {t("lang") === "en"
              ? "⚠️ Anything else (especially .xyz, .top, .club) is fake!"
              : "⚠️ અન્ય કંઈપણ (ખાસ કરીને .xyz, .top, .club) નકલી છે!"}
          </p>
        </div>
      </div>
    </div>
  );
}
