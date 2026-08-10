import { getDb, COLLECTIONS } from "@/lib/db";
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
    const endpoint = subscription.endpoint;

    if (!endpoint) {
      return Response.json(
        { error: "Invalid subscription: missing endpoint" },
        { status: 400 }
      );
    }

    // Get MongoDB database
    const db = await getDb();
    const subscriptionsCollection = db.collection(COLLECTIONS.SUBSCRIPTIONS);

    // Remove subscription by district and endpoint
    const result = await subscriptionsCollection.deleteOne({
      district: districtSlug,
      endpoint,
    });

    // Count remaining subscriptions for this district
    const remainingSubscribers = await subscriptionsCollection.countDocuments({
      district: districtSlug,
    });

    console.log(
      `[Alerts] Unsubscribed from ${districtSlug}. Remaining: ${remainingSubscribers}`
    );

    return Response.json({
      success: true,
      district: districtSlug,
      remainingSubscribers,
      deleted: result.deletedCount > 0,
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
