import { slugifyDistrict, isValidDistrict } from "@/lib/alerts";

export const runtime = "nodejs";

/**
 * POST /api/alerts/unsubscribe
 * 
 * Remove push subscription from district's alert list.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, district } = body;

    // Validate inputs
    if (!subscription || typeof subscription !== "object") {
      return Response.json(
        { error: "Invalid subscription object" },
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

    const districtSlug = slugifyDistrict(district);
    
    // Check if KV is configured
    const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
    
    if (!hasKV) {
      // Development mode without KV
      console.log("=================================");
      console.log("[Alerts] DEV MODE - No KV configured");
      console.log("[Alerts] Would unsubscribe from:", districtSlug);
      console.log("=================================");
      
      return Response.json({
        success: true,
        district: districtSlug,
        remainingSubscribers: 0,
        devMode: true,
        message: "Development mode: unsubscribe logged but not processed (KV not configured)"
      });
    }

    // Production mode with KV
    const { kv } = await import("@vercel/kv");
    const kvKey = `subs:${districtSlug}`;

    // Get existing subscriptions
    const existing = (await kv.get<PushSubscriptionJSON[]>(kvKey)) || [];

    // Remove this subscription by endpoint
    const endpoint = subscription.endpoint;
    const filtered = existing.filter((sub) => sub.endpoint !== endpoint);

    // Save updated list (or delete key if empty)
    if (filtered.length > 0) {
      await kv.set(kvKey, filtered, { ex: 90 * 24 * 60 * 60 });
    } else {
      await kv.del(kvKey);
    }

    console.log(
      `[Alerts] Unsubscribed from ${districtSlug}. Remaining: ${filtered.length}`
    );

    return Response.json({
      success: true,
      district: districtSlug,
      remainingSubscribers: filtered.length,
    });
    
  } catch (error) {
    console.error("[Alerts] Unsubscribe failed:", error);
    return Response.json(
      { 
        error: "Unsubscribe failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
