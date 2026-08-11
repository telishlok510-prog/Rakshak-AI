import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const redis = Redis.fromEnv();

/**
 * POST /api/admin/clear-database
 * Deletes all data from Redis database
 * Requires admin password for security
 */
export async function POST(request: Request) {
  try {
    // Get password from request
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    // Verify admin password
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid admin password." },
        { status: 401 }
      );
    }

    console.log("[Clear Database] Starting database cleanup...");

    let totalDeleted = 0;

    // Delete all district reports
    const reportKeys = await redis.keys("reports:*");
    console.log(`[Clear Database] Found ${reportKeys.length} report keys`);
    for (const key of reportKeys) {
      await redis.del(key);
      totalDeleted++;
    }

    // Delete all market alerts
    const alertKeys = await redis.keys("market-alert-*");
    console.log(`[Clear Database] Found ${alertKeys.length} alert keys`);
    for (const key of alertKeys) {
      await redis.del(key);
      totalDeleted++;
    }

    // Delete all alert subscriptions
    const subKeys = await redis.keys("subs:*");
    console.log(`[Clear Database] Found ${subKeys.length} subscription keys`);
    for (const key of subKeys) {
      await redis.del(key);
      totalDeleted++;
    }

    console.log(`[Clear Database] Deleted ${totalDeleted} total keys`);

    return NextResponse.json({
      success: true,
      message: "Database cleared successfully",
      deleted: {
        reports: reportKeys.length,
        alerts: alertKeys.length,
        subscriptions: subKeys.length,
        total: totalDeleted,
      },
    });
  } catch (error) {
    console.error("[Clear Database] Failed:", error);
    return NextResponse.json(
      {
        error: "Failed to clear database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/clear-database
 * Returns count of items in database (without deleting)
 */
export async function GET() {
  try {
    const reportKeys = await redis.keys("reports:*");
    const alertKeys = await redis.keys("market-alert-*");
    const subKeys = await redis.keys("subs:*");

    return NextResponse.json({
      success: true,
      count: {
        reports: reportKeys.length,
        alerts: alertKeys.length,
        subscriptions: subKeys.length,
        total: reportKeys.length + alertKeys.length + subKeys.length,
      },
    });
  } catch (error) {
    console.error("[Clear Database] Count failed:", error);
    return NextResponse.json(
      {
        error: "Failed to count database items",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
