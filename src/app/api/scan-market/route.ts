/**
 * Market Scam Scanner API
 * Manually triggered to scan for new scams from external sources
 * Admin can trigger this to broadcast alerts about new scams in the market
 */

import { Redis } from "@upstash/redis";
import webpush from "web-push";
import { GoogleGenAI } from "@google/genai";
import type { ScamCategory } from "@/lib/types";

export const runtime = "nodejs";

const redis = Redis.fromEnv();

// Configure VAPID
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface MarketScamAlert {
  scamDescription: string;
  source: string; // e.g., "News", "Social Media", "Cybercrime Portal"
  targetAudience: "all" | "specific"; // all users or specific districts
  districts?: string[]; // if targetAudience is "specific"
  language: "en" | "gu";
}

/**
 * POST /api/scan-market
 * Manually broadcast a new scam alert to users
 * Body: { scamDescription, source, targetAudience, districts?, language }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MarketScamAlert;
    const { scamDescription, source, targetAudience, districts, language } = body;

    // Validate
    if (!scamDescription || scamDescription.length < 20) {
      return Response.json({ error: "Scam description required (min 20 chars)" }, { status: 400 });
    }

    console.log(`[Market Scan] New scam alert from ${source}`);
    console.log(`[Market Scan] Description: ${scamDescription.substring(0, 100)}...`);

    // Use AI to categorize and create prevention tip
    const systemPrompt = `You are analyzing a newly discovered scam pattern. Categorize it and provide a SHORT prevention tip in ${language === "gu" ? "Gujarati" : "English"}.

Categories (choose one):
- UPI Collect Request Scam
- Digital Arrest / Fake Police Call
- KYC Phishing SMS
- Loan App Harassment
- Investment / Trading Scam
- Lottery / Prize Scam
- Job Scam
- OTP Sharing Scam
- Other

Respond with ONLY JSON: {"category": "...", "preventionTip": "..."}`;

    const userPrompt = `New scam discovered:\n${scamDescription}\n\nSource: ${source}`;

    let category: ScamCategory = "Other";
    let preventionTip = "Be cautious and verify before taking action.";

    // Try AI analysis with Gemini
    try {
      const apiKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;
      if (apiKey) {
        const genai = new GoogleGenAI({ apiKey });
        const response = await genai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            maxOutputTokens: 512,
          },
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          category = parsed.category || "Other";
          preventionTip = parsed.preventionTip || preventionTip;
        }
      }
    } catch (e) {
      console.error("[Market Scan] AI analysis failed, using defaults:", e);
    }

    // Store this alert in Redis for history
    const alertId = `market-alert-${Date.now()}`;
    await redis.set(
      alertId,
      {
        scamDescription,
        source,
        category,
        preventionTip,
        timestamp: Date.now(),
        language,
      },
      { ex: 30 * 24 * 60 * 60 } // 30 days
    );

    // Broadcast to users
    if (targetAudience === "all") {
      // Send to ALL subscribers across all districts
      await broadcastToAllUsers(category, preventionTip, source);
    } else if (districts && districts.length > 0) {
      // Send to specific districts only
      await broadcastToDistricts(districts, category, preventionTip, source);
    }

    return Response.json({
      success: true,
      alertId,
      category,
      preventionTip,
      message: `Alert broadcasted to ${targetAudience === "all" ? "all users" : districts?.length + " districts"}`,
    });
  } catch (error) {
    console.error("[Market Scan] Failed:", error);
    return Response.json(
      { error: "Market scan failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Broadcast to ALL users across all districts
 */
async function broadcastToAllUsers(
  category: string,
  tip: string,
  source: string
): Promise<void> {
  console.log("[Market Scan] Broadcasting to ALL users...");

  // Get all subscription keys
  const allKeys = await redis.keys("subs:*");
  console.log(`[Market Scan] Found ${allKeys.length} districts with subscribers`);

  const payload = JSON.stringify({
    title: `🚨 New ${category} in Market`,
    body: `${tip}\n\nSource: ${source}`,
    url: "/learn", // Take users to learn page
    tag: "market-alert", // Group notifications
  });

  let totalSent = 0;

  for (const key of allKeys) {
    const subscriptions = (await redis.get<PushSubscriptionJSON[]>(key)) || [];

    if (subscriptions.length > 0) {
      const results = await Promise.allSettled(
        subscriptions.map((sub) => webpush.sendNotification(sub as any, payload))
      );

      const sent = results.filter((r) => r.status === "fulfilled").length;
      totalSent += sent;
      console.log(`[Market Scan] ${key}: sent ${sent}/${subscriptions.length}`);
    }
  }

  console.log(`[Market Scan] Total notifications sent: ${totalSent}`);
}

/**
 * Broadcast to specific districts
 */
async function broadcastToDistricts(
  districts: string[],
  category: string,
  tip: string,
  source: string
): Promise<void> {
  console.log(`[Market Scan] Broadcasting to ${districts.length} districts...`);

  const payload = JSON.stringify({
    title: `🚨 New ${category} in Your Area`,
    body: `${tip}\n\nSource: ${source}`,
    url: "/learn",
    tag: "market-alert",
  });

  let totalSent = 0;

  for (const district of districts) {
    const key = `subs:${district.toLowerCase().replace(/\s+/g, "-")}`;
    const subscriptions = (await redis.get<PushSubscriptionJSON[]>(key)) || [];

    if (subscriptions.length > 0) {
      const results = await Promise.allSettled(
        subscriptions.map((sub) => webpush.sendNotification(sub as any, payload))
      );

      const sent = results.filter((r) => r.status === "fulfilled").length;
      totalSent += sent;
      console.log(`[Market Scan] ${district}: sent ${sent}/${subscriptions.length}`);
    }
  }

  console.log(`[Market Scan] Total sent: ${totalSent}`);
}

/**
 * GET /api/scan-market
 * Get recent market alerts (for admin dashboard)
 */
export async function GET() {
  try {
    const alertKeys = await redis.keys("market-alert-*");
    const alerts = [];

    for (const key of alertKeys.slice(0, 20)) {
      // Last 20 alerts
      const alert = await redis.get(key);
      if (alert) {
        alerts.push({ id: key, ...alert });
      }
    }

    // Sort by timestamp descending
    alerts.sort((a: any, b: any) => b.timestamp - a.timestamp);

    return Response.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("[Market Scan] GET failed:", error);
    return Response.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
