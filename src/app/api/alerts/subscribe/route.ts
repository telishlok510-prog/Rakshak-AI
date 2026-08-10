import { Redis } from "@upstash/redis";
import { slugifyDistrict, isValidDistrict } from "@/lib/alerts";

export const runtime = "nodejs";

const redis = Redis.fromEnv();

/**
 * POST /api/alerts/subscribe
 * Subscribe to scam alerts for a specific district.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, district } = body;

    if (!subscription || typeof subscription !== "object") {
      return Response.json({ error: "Invalid subscription object" }, { status: 400 });
    }

    if (!district || typeof district !== "string") {
      return Response.json({ error: "District is required" }, { status: 400 });
    }

    if (!isValidDistrict(district)) {
      return Response.json({ error: "Invalid district" }, { status: 400 });
    }

    const districtSlug = slugifyDistrict(district);
    const kvKey = `subs:${districtSlug}`;

    // Get existing subscriptions
    const existing = (await redis.get<PushSubscriptionJSON[]>(kvKey)) || [];

    // Check if already exists by endpoint
    const endpoint = subscription.endpoint;
    const isDuplicate = existing.some((sub) => sub.endpoint === endpoint);

    if (!isDuplicate) {
      existing.push(subscription);
      await redis.set(kvKey, existing, { ex: 90 * 24 * 60 * 60 }); // 90 days
      console.log(`[Alerts] New subscription for ${districtSlug}. Total: ${existing.length}`);
    } else {
      console.log(`[Alerts] Duplicate subscription for ${districtSlug}, skipping.`);
    }

    return Response.json({
      success: true,
      district: districtSlug,
      totalSubscribers: existing.length,
    });
  } catch (error) {
    console.error("[Alerts] Subscribe failed:", error);
    return Response.json(
      { error: "Subscription failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
