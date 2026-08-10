"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { GUJARAT_DISTRICTS } from "@/lib/alerts";

/**
 * Admin page to broadcast new scam alerts discovered from external sources
 * Use this when you find a new scam trend from news/social media
 */
export default function MarketAlertsAdmin() {
  const { t, lang } = useI18n();
  const [scamDescription, setScamDescription] = useState("");
  const [source, setSource] = useState("News");
  const [targetAudience, setTargetAudience] = useState<"all" | "specific">("all");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!scamDescription || scamDescription.length < 20) {
      alert("Please provide scam description (minimum 20 characters)");
      return;
    }

    if (targetAudience === "specific" && selectedDistricts.length === 0) {
      alert("Please select at least one district");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/scan-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scamDescription,
          source,
          targetAudience,
          districts: targetAudience === "specific" ? selectedDistricts : undefined,
          language: lang,
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setScamDescription("");
        setSource("News");
      }
    } catch (error) {
      setResult({ error: "Failed to send alert" });
    } finally {
      setLoading(false);
    }
  };

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          🚨 Market Scam Alert Broadcaster
        </h1>
        <p className="text-gray-600">
          Broadcast alerts about NEW scams discovered from external sources (news, social media, etc.)
        </p>
      </div>

      <div className="card space-y-6">
        {/* Scam Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Scam Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={scamDescription}
            onChange={(e) => setScamDescription(e.target.value)}
            className="field min-h-[120px]"
            placeholder="Example: New scam where fraudsters pose as electricity company employees via video call, showing fake documents and demanding immediate payment to avoid connection cut..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {scamDescription.length}/500 characters (minimum 20)
          </p>
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Source <span className="text-red-500">*</span>
          </label>
          <select value={source} onChange={(e) => setSource(e.target.value)} className="field">
            <option value="News">News Article</option>
            <option value="Social Media">Social Media Report</option>
            <option value="Cybercrime Portal">Cybercrime Portal Alert</option>
            <option value="Police Advisory">Police Advisory</option>
            <option value="RBI Alert">RBI Alert</option>
            <option value="User Reports">Multiple User Reports</option>
            <option value="Other">Other Source</option>
          </select>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Target Audience <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={targetAudience === "all"}
                onChange={() => setTargetAudience("all")}
              />
              <span>All Users (Broadcast to everyone)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={targetAudience === "specific"}
                onChange={() => setTargetAudience("specific")}
              />
              <span>Specific Districts Only</span>
            </label>
          </div>
        </div>

        {/* District Selection */}
        {targetAudience === "specific" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Districts <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
              {GUJARAT_DISTRICTS.map((district) => (
                <label key={district} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedDistricts.includes(district)}
                    onChange={() => toggleDistrict(district)}
                  />
                  <span>{district}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selected: {selectedDistricts.length} districts
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? "Broadcasting..." : "🚨 Broadcast Alert to Users"}
        </button>

        {/* Result */}
        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}
          >
            {result.success ? (
              <>
                <h3 className="font-bold text-green-900 mb-2">✅ Alert Broadcasted Successfully!</h3>
                <p className="text-sm text-green-800">Category: {result.category}</p>
                <p className="text-sm text-green-800">Prevention Tip: {result.preventionTip}</p>
                <p className="text-sm text-green-800">{result.message}</p>
              </>
            ) : (
              <>
                <h3 className="font-bold text-red-900 mb-2">❌ Failed to Broadcast</h3>
                <p className="text-sm text-red-800">{result.error || result.details}</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-3">📖 How to Use</h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>
            <strong>Monitor external sources:</strong> News, social media, cybercrime portals for NEW
            scam reports
          </li>
          <li>
            <strong>Describe the scam:</strong> Write a clear description of the new scam pattern
          </li>
          <li>
            <strong>Select source:</strong> Choose where you discovered this scam
          </li>
          <li>
            <strong>Choose audience:</strong> Broadcast to all users OR specific districts only
          </li>
          <li>
            <strong>Broadcast:</strong> AI will categorize and send notifications to users
          </li>
        </ol>

        <div className="mt-4 p-3 bg-white rounded border border-blue-300">
          <p className="text-xs text-blue-900 font-semibold mb-1">Example Use Cases:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• News reports new "electricity bill" SMS scam → Broadcast to all</li>
            <li>• Police advisory about fake loan apps in Ahmedabad → Broadcast to Ahmedabad only</li>
            <li>• RBI alert about new UPI fraud technique → Broadcast to all</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
