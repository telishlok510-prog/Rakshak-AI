/**
 * VAPID Public Key Configuration
 * 
 * This file exists to ensure the VAPID public key is properly
 * accessible in client components. Next.js replaces process.env
 * references at build time, so we centralize it here.
 */

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

// Helper to check if VAPID is configured
export function isVapidConfigured(): boolean {
  return VAPID_PUBLIC_KEY.length > 0;
}

// Get VAPID key with error context
export function getVapidPublicKey(): string {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error(
      'VAPID public key not configured. ' +
      'Add NEXT_PUBLIC_VAPID_PUBLIC_KEY to .env.local and restart the dev server.'
    );
  }
  return VAPID_PUBLIC_KEY;
}
