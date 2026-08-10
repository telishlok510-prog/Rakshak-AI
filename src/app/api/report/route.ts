import webpush from "web-push";
import { analyzeReportForAlert } from "@/lib/ai";
import { slugifyDistrict, isValidDistrict } from "@/lib/alerts";
import type { LanguageCode, ScamCategory } from "@/lib/types";
import { getDb, COLLECTIONS, type ReportDocument, type SubscriptionDocument } from "@/lib/db";

export const runtime = "nodejs";

// Configure VAPID details for web-push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn("[Report] VAPID keys not configured - push notifications will fail");
}

/**
 * POST /api/report
 * 
 * Submit a scam report:
 * 1. AI analyzes report → category, summary, prevention tip
 * 2. Store report in KV (district-scoped)
 * 3. Send push notifications to all subscribers in that district
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportText, district, language } = body as {
      reportText: string;
      district: string;
      language: LanguageCode;
    };

    // Validate inputs
    if (!reportText || typeof reportText !== "string" || reportText.trim().length < 10) {
      return Response.json(
        { error: "Report text is required (minimum 10 characters)" },
        { status: 400 }
      );
    }

    if (!district || typeof district !== "string") {
      return Response.json(
        { error: "District is required" },
        { status: 400 }
      );
    }

    if (!isValidDistrict(district)) {
      return Response.json(
        { error: "Invalid district" },
        { status: 400 }
      );
    }

    if (!language || (language !== "en" && language !== "gu")) {
      return Response.json(
        { error: "Invalid language" },
        { status: 400 }
      );
    }

    const districtSlug = slugifyDistrict(district);

    // Step 1: AI analyzes the report
    console.log(`[Report] Analyzing report for ${districtSlug}...`);
    const analysis = await analyzeReportForAlert(reportText, language);
    console.log(`[Report] Analysis complete: ${analysis.category}`);

    // Step 2: Store report in MongoDB
    const db = await getDb();
    const reportsCollection = db.collection<ReportDocument>(COLLECTIONS.REPORTS);

    const newReport: ReportDocument = {
      district: districtSlug,
      category: analysis.category,
      summary: analysis.summary,
      preventionTip: analysis.preventionTip,
      timestamp: Date.now(),
      createdAt: new Date(),
    };

    await reportsCollection.insertOne(newReport);
    
    // Count total reports for this district
    const totalReports = await reportsCollection.countDocuments({ district: districtSlug });
    console.log(`[Report] Stored report. Total for ${districtSlug}: ${totalReports}`);

    // Step 3: Send push notifications to subscribers (fire and forget, don't block response)
    sendNotificationsToDistrict(districtSlug, analysis.category, analysis.preventionTip)
      .catch((e) => console.error("[Report] Notification fan-out failed:", e));

    // Return analysis to the reporting user
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
    console.error("[Report] Report submission failed:", error);
    return Response.json(
      { error: "Report submission failed" },
      { status: 500 }
    );
  }
}

/**
 * Send push notifications to all subscribers in a district
 * Uses Promise.allSettled to not let one failure block others
 */
async function sendNotificationsToDistrict(
  districtSlug: string,
  category: string,
  preventionTip: string
): Promise<void> {
  const db = await getDb();
  const subscriptionsCollection = db.collection<SubscriptionDocument>(COLLECTIONS.SUBSCRIPTIONS);

  // Get all subscriptions for this district
  const subscriptions = await subscriptionsCollection
    .find({ district: districtSlug })
    .toArray();

  if (subscriptions.length === 0) {
    console.log(`[Report] No subscribers for ${districtSlug}, skipping notifications.`);
    return;
  }

  console.log(`[Report] Sending notifications to ${subscriptions.length} subscribers in ${districtSlug}...`);
  
  // Check VAPID configuration
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error("[Report] VAPID keys not configured! Cannot send notifications.");
    console.error("[Report] NEXT_PUBLIC_VAPID_PUBLIC_KEY:", !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
    console.error("[Report] VAPID_PRIVATE_KEY:", !!process.env.VAPID_PRIVATE_KEY);
    console.error("[Report] VAPID_SUBJECT:", !!process.env.VAPID_SUBJECT);
    return;
  }

  const payload = JSON.stringify({
    title: `⚠️ ${category} reported near you`,
    body: preventionTip,
    url: "/report",
  });

  // Send to all subscriptions, track failures
  const results = await Promise.allSettled(
    subscriptions.map((doc) =>
      webpush.sendNotification(doc.subscription as any, payload).catch((e) => {
        // Rethrow with subscription endpoint for cleanup
        const error = new Error(`Failed to send to ${doc.endpoint}`);
        (error as any).status = (e as any).statusCode || (e as any).status;
        (error as any).endpoint = doc.endpoint;
        throw error;
      })
    )
  );

  // Clean up dead subscriptions (410 Gone, 404 Not Found)
  const deadEndpoints: string[] = [];
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const error = result.reason as any;
      const status = error?.status;
      const endpoint = error?.endpoint || subscriptions[index].endpoint;
      
      console.warn(`[Report] Notification failed for ${endpoint}: ${error?.message}`);
      
      if (status === 410 || status === 404) {
        deadEndpoints.push(endpoint);
      }
    }
  });

  // Remove dead subscriptions from MongoDB
  if (deadEndpoints.length > 0) {
    await subscriptionsCollection.deleteMany({
      district: districtSlug,
      endpoint: { $in: deadEndpoints },
    });
    
    console.log(`[Report] Cleaned up ${deadEndpoints.length} dead subscriptions from ${districtSlug}`);
  }

  const successCount = results.filter((r) => r.status === "fulfilled").length;
  console.log(`[Report] Sent ${successCount}/${subscriptions.length} notifications for ${districtSlug}`);
}
