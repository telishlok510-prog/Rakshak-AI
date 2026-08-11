"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ScamCategory } from "@/lib/types";

interface DistrictReport {
  type: "district";
  id: string;
  district: string;
  category: ScamCategory;
  summary: string;
  preventionTip: string;
  timestamp: number;
  reportCount?: number;
}

interface MarketAlert {
  type: "market";
  id: string;
  scamDescription: string;
  source: string;
  category: ScamCategory;
  preventionTip: string;
  timestamp: number;
  language: string;
}

type ScamFeedItem = DistrictReport | MarketAlert;

const CATEGORY_COLORS: Record<ScamCategory, string> = {
  "UPI Collect Request Scam": "bg-red-100 text-red-800 border-red-200",
  "Digital Arrest / Fake Police Call": "bg-orange-100 text-orange-800 border-orange-200",
  "KYC Phishing SMS": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Loan App Harassment": "bg-purple-100 text-purple-800 border-purple-200",
  "Investment / Trading Scam": "bg-blue-100 text-blue-800 border-blue-200",
  "Lottery / Prize Scam": "bg-pink-100 text-pink-800 border-pink-200",
  "Job Scam": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "OTP Sharing Scam": "bg-red-100 text-red-800 border-red-200",
  "Other": "bg-gray-100 text-gray-800 border-gray-200",
};

const CATEGORY_EMOJI: Record<ScamCategory, string> = {
  "UPI Collect Request Scam": "💸",
  "Digital Arrest / Fake Police Call": "🚨",
  "KYC Phishing SMS": "📱",
  "Loan App Harassment": "🏦",
  "Investment / Trading Scam": "📈",
  "Lottery / Prize Scam": "🎰",
  "Job Scam": "💼",
  "OTP Sharing Scam": "🔐",
  "Other": "⚠️",
};

export default function ScamFeedPage() {
  const { lang, t } = useI18n();
  const [feed, setFeed] = useState<ScamFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "district" | "market">("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    try {
      // Fetch both district reports and market alerts
      const [reportsRes, alertsRes] = await Promise.all([
        fetch("/api/scams/feed?type=district"),
        fetch("/api/scams/feed?type=market"),
      ]);

      const reportsData = await reportsRes.json();
      const alertsData = await alertsRes.json();

      const combined: ScamFeedItem[] = [
        ...(reportsData.reports || []).map((r: any) => ({ ...r, type: "district" as const })),
        ...(alertsData.alerts || []).map((a: any) => ({ ...a, type: "market" as const })),
      ];

      // Sort by timestamp descending (newest first)
      combined.sort((a, b) => b.timestamp - a.timestamp);

      setFeed(combined);
    } catch (error) {
      console.error("Failed to load scam feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeed = feed.filter((item) => {
    if (filter !== "all" && item.type !== filter) return false;
    if (selectedDistrict !== "all" && item.type === "district" && item.district !== selectedDistrict) return false;
    return true;
  });

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return lang === "gu" ? `${days} દિવસ પહેલાં` : `${days}d ago`;
    if (hours > 0) return lang === "gu" ? `${hours} કલાક પહેલાં` : `${hours}h ago`;
    if (minutes > 0) return lang === "gu" ? `${minutes} મિનિટ પહેલાં` : `${minutes}m ago`;
    return lang === "gu" ? "હમણાં જ" : "Just now";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            {lang === "gu" ? "બજારમાં નવી છેતરપિંડી" : "New Scams in Market"}
          </h1>
          <p className="mt-2 text-gray-600">
            {lang === "gu"
              ? "તમારા વિસ્તાર અને બજારમાં તાજેતરની છેતરપિંડીઓ વિશે સજાગ રહો"
              : "Stay alert about recent scams in your area and market"}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {lang === "gu" ? "બધી" : "All"} ({feed.length})
          </button>
          <button
            onClick={() => setFilter("district")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filter === "district"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {lang === "gu" ? "જિલ્લા રિપોર્ટ્સ" : "District Reports"} (
            {feed.filter((f) => f.type === "district").length})
          </button>
          <button
            onClick={() => setFilter("market")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filter === "market"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {lang === "gu" ? "બજાર ચેતવણીઓ" : "Market Alerts"} (
            {feed.filter((f) => f.type === "market").length})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 h-6 w-32 rounded bg-gray-200" />
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {/* Feed */}
        {!loading && filteredFeed.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-xl text-gray-500">
              {lang === "gu" ? "કોઈ છેતરપિંડી મળી નથી" : "No scams found"}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              {lang === "gu" ? "નવી છેતરપિંડી નોંધાતાં જ અહીં દેખાશે" : "New scams will appear here as they are reported"}
            </p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {filteredFeed.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Card Header */}
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Type Badge */}
                      {item.type === "market" ? (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          🌐 {lang === "gu" ? "બજાર ચેતવણી" : "MARKET ALERT"}
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          📍 {lang === "gu" ? "જિલ્લા રિપોર્ટ" : "DISTRICT REPORT"}
                        </span>
                      )}

                      {/* District Name (if district report) */}
                      {item.type === "district" && (
                        <span className="text-sm font-medium text-gray-600">
                          {item.district}
                        </span>
                      )}

                      {/* Source (if market alert) */}
                      {item.type === "market" && (
                        <span className="text-sm font-medium text-gray-600">
                          {lang === "gu" ? "સ્ત્રોત" : "Source"}: {item.source}
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="text-xs text-gray-400">{formatTime(item.timestamp)}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-4 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold ${CATEGORY_COLORS[item.category]}`}>
                      <span>{CATEGORY_EMOJI[item.category]}</span>
                      {item.category}
                    </span>
                  </div>

                  {/* Description/Summary */}
                  <div className="mb-4">
                    {item.type === "market" ? (
                      <p className="text-gray-800 leading-relaxed">
                        {item.scamDescription}
                      </p>
                    ) : (
                      <p className="text-gray-800 leading-relaxed">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  {/* Prevention Tip */}
                  <div className="rounded-xl border-2 border-safe/20 bg-safe/5 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      <span className="text-sm font-bold text-safe">
                        {lang === "gu" ? "રક્ષણ ટિપ" : "Prevention Tip"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {item.preventionTip}
                    </p>
                  </div>

                  {/* Report Count (if district report) */}
                  {item.type === "district" && item.reportCount && item.reportCount > 1 && (
                    <div className="mt-4 text-sm text-gray-500">
                      <span className="font-semibold text-danger">⚠️ {item.reportCount}</span>{" "}
                      {lang === "gu" ? "લોકોએ આ નોંધાવ્યું છે" : "people reported this"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More (optional - future enhancement) */}
        {!loading && filteredFeed.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={loadFeed}
              className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
            >
              {lang === "gu" ? "તાજું કરો" : "Refresh"}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
