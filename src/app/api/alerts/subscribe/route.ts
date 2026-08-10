import { slugifyDistrict, isValidDistrict } from "@/lib/alerts";

export const runtime = "nodejs";

/**
 * POST /api/alerts/subscribe
 * 
 * Subscribe to scam alerts for a specific district.
 * In development mode without KV: logs to console instead.
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
      // Development mode without KV - just log and return success
      console.log("=================================");
      console.log("[Alerts] DEV MODE - No KV configured");
      console.log("[Alerts] Would subscribe to:", districtSlug);
      console.log("[Alerts] Subscription endpoint:", subscription.endpoint?.substring(0, 50) + "...");
      console.log("=================================");
      
      return Response.json({
        success: true,
        district: districtSlug,
        totalSubscribers: 1,
        devMode: true,
        message: "Development mode: subscription logged but not saved (KV not configured)"
      });
    }

    // Production mode with KV
    const { kv } = await import("@vercel/kv");
    const kvKey = `subs:${districtSlug}`;

    // Get existing subscriptions for this district
    const existing = (await kv.get<PushSubscriptionJSON[]>(kvKey)) || [];

    // Check if this subscription already exists (by endpoint)
    const endpoint = subscription.endpoint;
    const isDuplicate = existing.some((sub) => sub.endpoint === endpoint);

    if (!isDuplicate) {
      // Add new subscription
      existing.push(subscription);
      
      // Save back to KV with 90-day expiry (subscriptions should refresh before then)
      await kv.set(kvKey, existing, { ex: 90 * 24 * 60 * 60 });
      
      console.log(
        `[Alerts] New subscription for ${districtSlug}. Total: ${existing.length}`
      );
    } else {
      console.log(
        `[Alerts] Duplicate subscription for ${districtSlug}, skipping.`
      );
    }

    return Response.json({
      success: true,
      district: districtSlug,
      totalSubscribers: existing.length,
    });
    
  } catch (error) {
    console.error("[Alerts] Subscribe failed:", error);
    return Response.json(
      { 
        error: "Subscription failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
