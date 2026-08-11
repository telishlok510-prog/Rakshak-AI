"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { GUJARAT_DISTRICTS } from "@/lib/alerts";

/**
 * Admin page to broadcast new scam alerts discovered from external sources
 * Use this when you find a new scam trend from news/social media
 */
export default function MarketAlertsAdmin() {
  const { t, lang } = useI18n();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  
  const [scamDescription, setScamDescription] = useState("");
  const [source, setSource] = useState("News");
  const [targetAudience, setTargetAudience] = useState<"all" | "specific">("all");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dbCount, setDbCount] = useState<any>(null);
  const [clearingDb, setClearingDb] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem("admin_authenticated");
    const storedPassword = sessionStorage.getItem("admin_password");
    if (auth === "true" && storedPassword) {
      setIsAuthenticated(true);
      setPassword(storedPassword);
      loadDbCount();
    }
  }, []);

  const loadDbCount = async () => {
    try {
      const response = await fetch("/api/admin/clear-database");
      const data = await response.json();
      setDbCount(data.count);
    } catch (error) {
      console.error("Failed to load DB count:", error);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm("⚠️ WARNING: This will delete ALL data from the database!\n\n- All district reports\n- All market alerts\n- All push notification subscriptions\n\nThis action cannot be undone. Are you sure?")) {
      return;
    }

    setClearingDb(true);
    try {
      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Database cleared successfully!\n\nDeleted:\n- ${data.deleted.reports} district reports\n- ${data.deleted.alerts} market alerts\n- ${data.deleted.subscriptions} subscriptions\n\nTotal: ${data.deleted.total} items`);
        setDbCount(null);
        loadDbCount();
      } else {
        alert("❌ Failed to clear database: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("❌ Error clearing database");
    } finally {
      setClearingDb(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        sessionStorage.setItem("admin_authenticated", "true");
        sessionStorage.setItem("admin_password", password);
        setIsAuthenticated(true);
        // Don't clear password - we need it for clear database
      } else {
        setAuthError("Incorrect password");
      }
    } catch (error) {
      setAuthError("Authentication failed");
    }
  };

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

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 px-4">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🔐</div>
              <h1 className="text-2xl font-bold text-primary mb-2">Admin Access</h1>
              <p className="text-sm text-gray-600">Market Scam Alert Broadcaster</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  {authError}
                </div>
              )}

              <button type="submit" className="btn-primary w-full">
                Login
              </button>

              <div className="text-xs text-gray-500 text-center">
                Contact system admin for password
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard (original content)
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            🚨 Market Scam Alert Broadcaster
          </h1>
          <p className="text-gray-600">
            Broadcast alerts about NEW scams discovered from external sources (news, social media, etc.)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_authenticated");
              sessionStorage.removeItem("admin_password");
              setIsAuthenticated(false);
              setPassword("");
            }}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Database Stats & Clear Button */}
      <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-red-900 mb-1">🗑️ Database Management</h3>
            {dbCount && (
              <p className="text-sm text-red-800">
                Current data: <strong>{dbCount.reports || 0}</strong> district reports, 
                <strong> {dbCount.alerts || 0}</strong> market alerts, 
                <strong> {dbCount.subscriptions || 0}</strong> subscriptions 
                (<strong>{dbCount.total || 0}</strong> total items)
              </p>
            )}
            {!dbCount && (
              <p className="text-sm text-red-800">Loading database stats...</p>
            )}
          </div>
          <button
            onClick={handleClearDatabase}
            disabled={clearingDb}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50 transition"
          >
            {clearingDb ? "Clearing..." : "Clear All Data"}
          </button>
        </div>
        <p className="text-xs text-red-700 mt-2">
          ⚠️ Warning: This will permanently delete all reports, alerts, and subscriptions from the database
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
