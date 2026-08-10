"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import SimulationEngine from "@/components/SimulationEngine";
import { ATM_SIMULATION } from "@/lib/simulations/atmSteps";

export default function ATMPracticePage() {
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
        config={ATM_SIMULATION}
        onComplete={(score, total) => {
          console.log(`ATM simulation completed: ${score}/${total}`);
        }}
      />

      {/* Additional Tips */}
      <div className="mt-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
        <h3 className="mb-3 text-xl font-bold text-primary">
          {t("lang") === "en" ? "💡 ATM Safety Tips" : "💡 ATM સલામતી ટિપ્સ"}
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              {t("lang") === "en"
                ? "Always shield your PIN with your hand or body"
                : "હંમેશા તમારા હાથ અથવા શરીર વડે તમારો PIN ઢાંકો"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              {t("lang") === "en"
                ? "Ask strangers to maintain distance — it's okay to be firm"
                : "અજાણ્યાઓને અંતર રાખવા કહો — દૃઢ રહેવું યોગ્ય છે"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              {t("lang") === "en"
                ? "Never accept help from strangers at ATMs"
                : "ATM પર અજાણ્યાઓની મદદ ક્યારેય સ્વીકારો નહીં"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              {t("lang") === "en"
                ? "Always take your card, cash, AND receipt before leaving"
                : "જતા પહેલા હંમેશા તમારું કાર્ડ, રોકડ અને રસીદ લો"}
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              {t("lang") === "en"
                ? "Use ATMs in well-lit, public areas whenever possible"
                : "શક્ય હોય ત્યારે સારી રીતે પ્રકાશિત, સાર્વજનિક વિસ્તારોમાં ATM નો ઉપયોગ કરો"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
