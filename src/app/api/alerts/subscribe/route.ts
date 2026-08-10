import { getDb, COLLECTIONS, type SubscriptionDocument } from "@/lib/db";
import { slugifyDistrict, isValidDistrict } from "@/lib/alerts";

export const runtime = "nodejs";

/**
 * POST /api/alerts/subscribe
 * 
 * Subscribe to scam alerts for a specific district.
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
    const subscriptionsCollection = db.collection<SubscriptionDocument>(COLLECTIONS.SUBSCRIPTIONS);

    // Upsert subscription (update if exists, insert if new)
    const now = new Date();
    const result = await subscriptionsCollection.updateOne(
      { district: districtSlug, endpoint },
      {
        $set: {
          subscription,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    // Count total subscriptions for this district
    const totalSubscribers = await subscriptionsCollection.countDocuments({ district: districtSlug });

    const isNew = result.upsertedCount > 0;
    console.log(
      `[Alerts] ${isNew ? "New" : "Updated"} subscription for ${districtSlug}. Total: ${totalSubscribers}`
    );

    return Response.json({
      success: true,
      district: districtSlug,
      totalSubscribers,
      isNew,
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
