import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const redis = Redis.fromEnv();

/**
 * GET /api/scams/feed
 * Returns combined feed of district reports and market alerts
 * Query params: ?type=all|district|market&district=<name>&limit=20
 */
export async function GET(request: Request) {
  // Mark route as dynamic to avoid static rendering issues
  const timestamp = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const district = searchParams.get("district");
    const limit = parseInt(searchParams.get("limit") || "20");

    const feed: any[] = [];

    // Fetch district reports
    if (type === "all" || type === "district") {
      const reportKeys = district
        ? [`reports:${district.toLowerCase().replace(/\s+/g, "-")}`]
        : await redis.keys("reports:*");

      for (const key of reportKeys) {
        const reports = (await redis.get<any[]>(key)) || [];
        const districtName = key.replace("reports:", "").replace(/-/g, " ");

        // Group similar reports (same category in same district)
        const grouped = new Map<string, any>();
        for (const report of reports) {
          const groupKey = `${report.category}-${districtName}`;
          if (grouped.has(groupKey)) {
            const existing = grouped.get(groupKey);
            existing.reportCount = (existing.reportCount || 1) + 1;
            // Keep the latest timestamp
            if (report.timestamp > existing.timestamp) {
              existing.timestamp = report.timestamp;
              existing.summary = report.summary;
              existing.preventionTip = report.preventionTip;
            }
          } else {
            grouped.set(groupKey, {
              type: "district",
              id: `district-${report.timestamp}`,
              district: districtName.split(" ").map((w: string) => 
                w.charAt(0).toUpperCase() + w.slice(1)
              ).join(" "),
              category: report.category,
              summary: report.summary,
              preventionTip: report.preventionTip,
              timestamp: report.timestamp,
              reportCount: 1,
            });
          }
        }

        feed.push(...Array.from(grouped.values()));
      }
    }

    // Fetch market alerts
    if (type === "all" || type === "market") {
      const alertKeys = await redis.keys("market-alert-*");

      for (const key of alertKeys.slice(0, limit)) {
        const alert = await redis.get<any>(key);
        if (alert) {
          feed.push({
            type: "market",
            id: key,
            scamDescription: alert.scamDescription,
            source: alert.source || "External Source",
            category: alert.category,
            preventionTip: alert.preventionTip,
            timestamp: alert.timestamp,
            language: alert.language || "en",
          });
        }
      }
    }

    // Sort by timestamp descending
    feed.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    const limitedFeed = feed.slice(0, limit);

    return NextResponse.json({
      success: true,
      count: limitedFeed.length,
      reports: type === "district" ? limitedFeed : limitedFeed.filter((f) => f.type === "district"),
      alerts: type === "market" ? limitedFeed : limitedFeed.filter((f) => f.type === "market"),
      feed: type === "all" ? limitedFeed : undefined,
    });
  } catch (error) {
    console.error("[Scam Feed] Failed:", error);
    return NextResponse.json(
      {
        error: "Failed to load scam feed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
