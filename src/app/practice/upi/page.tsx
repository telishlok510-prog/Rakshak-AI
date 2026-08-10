"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import SimulationEngine from "@/components/SimulationEngine";
import { UPI_SIMULATION } from "@/lib/simulations/upiSteps";

export default function UPIPracticePage() {
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
        config={UPI_SIMULATION}
        onComplete={(score, total) => {
          console.log(`UPI simulation completed: ${score}/${total}`);
        }}
      />

      {/* Additional Tips */}
      <div className="mt-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
        <h3 className="mb-3 text-xl font-bold text-primary">
          {t("lang") === "en" ? "💡 UPI Safety Rules" : "💡 UPI સલામતી નિયમો"}
        </h3>
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
            <h4 className="mb-2 font-bold text-red-900">
              ❌ {t("lang") === "en" ? "NEVER do these to receive money:" : "પૈસા મેળવવા માટે આ ક્યારેય ન કરો:"}
            </h4>
            <ul className="space-y-1 text-sm text-red-800">
              <li>• {t("lang") === "en" ? "Approve a COLLECT request" : "COLLECT વિનંતી મંજૂર કરવી"}</li>
              <li>• {t("lang") === "en" ? "Enter your PIN" : "તમારો PIN દાખલ કરવો"}</li>
              <li>• {t("lang") === "en" ? "Scan any QR code" : "કોઈપણ QR કોડ સ્કેન કરવો"}</li>
              <li>• {t("lang") === "en" ? "Click links in messages" : "મેસેજમાં લિંક પર ક્લિક કરવું"}</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
            <h4 className="mb-2 font-bold text-green-900">
              ✅ {t("lang") === "en" ? "TO RECEIVE MONEY, just:" : "પૈસા મેળવવા માટે, માત્ર:"}
            </h4>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• {t("lang") === "en" ? "Share your UPI ID (name@bank)" : "તમારું UPI ID શેર કરો (name@bank)"}</li>
              <li>• {t("lang") === "en" ? "OR show your QR code for them to scan" : "અથવા તેમને સ્કેન કરવા માટે તમારો QR કોડ બતાવો"}</li>
              <li>• {t("lang") === "en" ? "Money appears automatically — no action needed!" : "પૈસા આપોઆપ આવે છે — કોઈ ક્રિયા જરૂરી નથી!"}</li>
            </ul>
          </div>

          <div className="text-sm text-gray-700">
            <strong>{t("lang") === "en" ? "Remember:" : "યાદ રાખો:"}</strong>{" "}
            {t("lang") === "en"
              ? "If someone asks you to do ANYTHING to 'receive money' — it's a scam. Receiving is automatic."
              : "જો કોઈ તમને 'પૈસા મેળવવા' માટે કંઈપણ કરવા કહે — તે છેતરપિંડી છે. મેળવવું આપોઆપ છે."}
          </div>
        </div>
      </div>
    </div>
  );
}
