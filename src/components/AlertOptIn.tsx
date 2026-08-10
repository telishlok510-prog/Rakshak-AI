"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { GUJARAT_DISTRICTS, slugifyDistrict, isValidDistrict } from "@/lib/alerts";

/**
 * Alert Opt-In Component
 * 
 * Allows users to:
 * 1. Select their district (no GPS, user choice)
 * 2. Enable push notifications for scam alerts
 * 3. Manage subscription (unsubscribe)
 */

type SubscriptionState = "idle" | "requesting" | "subscribed" | "denied" | "unsupported";

export default function AlertOptIn() {
  const { t, lang } = useI18n();
  const [state, setState] = useState<SubscriptionState>("idle");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved district and check existing subscription
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if push notifications are supported
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }

    // Load saved district
    const saved = localStorage.getItem("rakshak_alert_district");
    if (saved) {
      setSelectedDistrict(saved);
    }

    // Check if already subscribed
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        setState("subscribed");
      } else {
        setState("idle");
      }
    } catch (e) {
      console.error("[AlertOptIn] Failed to check subscription:", e);
      setState("idle");
    }
  };

  const handleSubscribe = async () => {
    console.log("[AlertOptIn] Subscribe clicked, district:", selectedDistrict);
    
    if (!selectedDistrict) {
      setError(lang === "gu" ? "કૃપા કરીને જિલ્લો પસંદ કરો" : "Please select a district");
      return;
    }

    if (!isValidDistrict(selectedDistrict)) {
      setError(lang === "gu" ? "અમાન્ય જિલ્લો" : "Invalid district");
      return;
    }

    setLoading(true);
    setError(null);
    setState("requesting");

    try {
      console.log("[AlertOptIn] Requesting notification permission...");
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      console.log("[AlertOptIn] Permission result:", permission);
      
      if (permission !== "granted") {
        setState("denied");
        setError(
          lang === "gu"
            ? "નોટિફિકેશન પરવાનગી નકારી દીધી. તમારા બ્રાઉઝર સેટિંગ્સમાં સક્ષમ કરો."
            : "Notification permission denied. Please enable in your browser settings."
        );
        setLoading(false);
        return;
      }

      console.log("[AlertOptIn] Getting service worker registration...");
      
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      console.log("[AlertOptIn] Service worker ready");
      
      // Subscribe to push notifications
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log("[AlertOptIn] VAPID public key available:", !!publicKey);
      
      if (!publicKey) {
        throw new Error("VAPID public key not configured. Check NEXT_PUBLIC_VAPID_PUBLIC_KEY environment variable.");
      }

      console.log("[AlertOptIn] Subscribing to push manager...");
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      
      console.log("[AlertOptIn] Push subscription created");

      // Save subscription to server
      console.log("[AlertOptIn] Saving to server...");
      const response = await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          district: selectedDistrict,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error("[AlertOptIn] Server error:", data);
        throw new Error(data.error || `Subscription failed (${response.status})`);
      }

      const result = await response.json();
      console.log("[AlertOptIn] Server response:", result);

      // Save district to localStorage
      localStorage.setItem("rakshak_alert_district", selectedDistrict);
      
      setState("subscribed");
      setError(null);
      console.log("[AlertOptIn] Successfully subscribed!");
      
    } catch (e) {
      console.error("[AlertOptIn] Subscription failed:", e);
      setState("idle");
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(
        lang === "gu"
          ? `સબ્સ્ક્રિપ્શન નિષ્ફળ: ${errorMessage}`
          : `Subscription failed: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        setState("idle");
        setLoading(false);
        return;
      }

      // Unsubscribe from server
      await fetch("/api/alerts/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          district: selectedDistrict,
        }),
      });

      // Unsubscribe locally
      await subscription.unsubscribe();
      
      setState("idle");
      
    } catch (e) {
      console.error("[AlertOptIn] Unsubscribe failed:", e);
      setError(
        lang === "gu"
          ? "અનસબ્સ્ક્રાઇબ નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો."
          : "Unsubscribe failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (state === "unsupported") {
    return (
      <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          {lang === "gu"
            ? "⚠️ તમારું બ્રાઉઝર પુશ નોટિફિકેશન્સને સપોર્ટ કરતું નથી."
            : "⚠️ Your browser does not support push notifications."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {state === "subscribed" ? (
        /* Already subscribed */
        <div className="rounded-xl border-2 border-green-500 bg-green-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <h3 className="text-lg font-bold text-green-900">
              {lang === "gu" ? "અલર્ટ સક્રિય છે" : "Alerts Active"}
            </h3>
          </div>
          <p className="mb-4 text-sm text-green-800">
            {lang === "gu"
              ? `તમે ${selectedDistrict} માટે સ્કૅમ અલર્ટ પ્રાપ્ત કરશો જ્યારે નવો સ્કૅમ જાણ કરવામાં આવશે.`
              : `You'll receive scam alerts for ${selectedDistrict} when new scams are reported.`}
          </p>
          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            className="text-sm font-semibold text-green-700 underline hover:text-green-900"
          >
            {loading
              ? (lang === "gu" ? "અનસબ્સ્ક્રાઇબ કરી રહ્યા છે..." : "Unsubscribing...")
              : (lang === "gu" ? "અલર્ટ બંધ કરો" : "Turn off alerts")}
          </button>
        </div>
      ) : (
        /* Not subscribed - show opt-in form */
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="text-3xl">🔔</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-primary">
                {lang === "gu"
                  ? "તમારા વિસ્તાર માટે સ્કૅમ અલર્ટ મેળવો"
                  : "Get Scam Alerts for Your Area"}
              </h3>
              <p className="mt-1 text-sm text-gray-700">
                {lang === "gu"
                  ? "જ્યારે તમારા જિલ્લામાં નવો સ્કૅમ જાણ કરવામાં આવે ત્યારે તરત જાણ કરો."
                  : "Be notified instantly when a new scam is reported in your district."}
              </p>
            </div>
          </div>

          {/* District Selection */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              {lang === "gu" ? "તમારો જિલ્લો પસંદ કરો" : "Select Your District"}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="field"
              disabled={loading}
            >
              <option value="">
                {lang === "gu" ? "-- જિલ્લો પસંદ કરો --" : "-- Select District --"}
              </option>
              {GUJARAT_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Privacy Note */}
          <div className="mb-4 rounded-lg bg-white/60 p-3">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">🔒 {lang === "gu" ? "ખાનગી:" : "Privacy:"}</span>{" "}
              {lang === "gu"
                ? "કોઈ GPS નહીં. તમારું નામ, ફોન નંબર અથવા સ્થાન સાચવવામાં આવ્યું નથી. ફક્ત તમારો જિલ્લો."
                : "No GPS. Your name, phone number, or location is not stored. Only your district."}
            </p>
          </div>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 rounded-lg bg-blue-50 p-3 text-xs">
              <p className="font-semibold text-blue-900">Debug Info:</p>
              <p className="text-blue-700">
                Service Worker: {typeof window !== "undefined" && "serviceWorker" in navigator ? "✅ Supported" : "❌ Not supported"}
              </p>
              <p className="text-blue-700">
                Push Manager: {typeof window !== "undefined" && "PushManager" in window ? "✅ Supported" : "❌ Not supported"}
              </p>
              <p className="text-blue-700">
                VAPID Key: {process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? "✅ Configured" : "❌ Missing"}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {state === "denied" && (
            <div className="mb-4 rounded-lg bg-orange-50 p-3">
              <p className="text-xs text-orange-800">
                {lang === "gu"
                  ? "💡 બ્રાઉઝર સેટિંગ્સમાં નોટિફિકેશન સક્ષમ કરવા માટે, સરનામું બારમાં લૉક આયકન ક્લિક કરો."
                  : "💡 To enable notifications in browser settings, click the lock icon in the address bar."}
              </p>
            </div>
          )}

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={loading || !selectedDistrict}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading
              ? (lang === "gu" ? "સક્રિય કરી રહ્યા છે..." : "Enabling...")
              : (lang === "gu" ? "અલર્ટ સક્રિય કરો" : "Enable Alerts")}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Convert URL-safe base64 VAPID public key to Uint8Array
 * (required by pushManager.subscribe)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
