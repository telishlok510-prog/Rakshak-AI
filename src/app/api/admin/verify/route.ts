/**
 * Admin Password Verification API
 * Simple password check for admin access
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Check against environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || "rakshak2024";

    if (password === adminPassword) {
      return Response.json({ success: true });
    } else {
      return Response.json({ success: false, error: "Incorrect password" }, { status: 401 });
    }
  } catch (error) {
    return Response.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
