import { Redis } from "@upstash/redis";
import webpush from "web-push";
import { analyzeReportForAlert } from "@/lib/ai";
import { slugifyDistrict, isValidDistrict, type StoredReport } from "@/lib/alerts";
import type { LanguageCode } from "@/lib/types";

export const runtime = "nodejs";

const redis = Redis.fromEnv();

// Configure VAPID for web-push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * POST /api/report
 * Submit a scam report: AI analyzes → stores → sends notifications
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportText, district, language } = body as {
      reportText: string;
      district: string;
      language: LanguageCode;
    };

    if (!reportText || reportText.trim().length < 10) {
      return Response.json({ error: "Report text required (min 10 chars)" }, { status: 400 });
    }

    if (!district || !isValidDistrict(district)) {
      return Response.json({ error: "Invalid district" }, { status: 400 });
    }

    if (!language || (language !== "en" && language !== "gu")) {
      return Response.json({ error: "Invalid language" }, { status: 400 });
    }

    const districtSlug = slugifyDistrict(district);

    // AI analysis
    console.log(`[Report] Analyzing for ${districtSlug}...`);
    const analysis = await analyzeReportForAlert(reportText, language);
    console.log(`[Report] Complete: ${analysis.category}`);

    // Store report
    const reportsKey = `reports:${districtSlug}`;
    const reports = (await redis.get<StoredReport[]>(reportsKey)) || [];
    
    const newReport: StoredReport = {
      category: analysis.category,
      summary: analysis.summary,
      preventionTip: analysis.preventionTip,
      timestamp: Date.now(),
    };

    reports.unshift(newReport);
    await redis.set(reportsKey, reports.slice(0, 50), { ex: 30 * 24 * 60 * 60 });
    console.log(`[Report] Stored. Total: ${reports.length}`);

    // Send notifications (fire and forget)
    sendNotifications(districtSlug, analysis.category, analysis.preventionTip)
      .catch((e) => console.error("[Report] Notification error:", e));

    return Response.json({
      success: true,
      analysis: {
        category: analysis.category,
        summary: analysis.summary,
        preventionTip: analysis.preventionTip,
      },
      district: districtSlug,
    });
  } catch (error) {
    console.error("[Report] Failed:", error);
    return Response.json({ error: "Report submission failed" }, { status: 500 });
  }
}

async function sendNotifications(district: string, category: string, tip: string) {
  const subscriptions = (await redis.get<PushSubscriptionJSON[]>(`subs:${district}`)) || [];
  
  if (subscriptions.length === 0) return;

  console.log(`[Report] Sending to ${subscriptions.length} in ${district}...`);

  const payload = JSON.stringify({
    title: `⚠️ ${category} reported near you`,
    body: tip,
    url: "/report",
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(sub as any, payload).catch((e) => {
        const error = new Error(`Failed: ${sub.endpoint}`);
        (error as any).status = (e as any).statusCode;
        (error as any).endpoint = sub.endpoint;
        throw error;
      })
    )
  );

  // Cleanup dead subscriptions
  const deadEndpoints: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const status = (r.reason as any)?.status;
      if (status === 410 || status === 404) {
        deadEndpoints.push(subscriptions[i].endpoint || "");
      }
    }
  });

  if (deadEndpoints.length > 0) {
    const filtered = subscriptions.filter((s) => !deadEndpoints.includes(s.endpoint || ""));
    if (filtered.length > 0) {
      await redis.set(`subs:${district}`, filtered, { ex: 90 * 24 * 60 * 60 });
    } else {
      await redis.del(`subs:${district}`);
    }
    console.log(`[Report] Cleaned ${deadEndpoints.length} dead subs`);
  }

  const sent = results.filter((r) => r.status === "fulfilled").length;
  console.log(`[Report] Sent ${sent}/${subscriptions.length}`);
}
