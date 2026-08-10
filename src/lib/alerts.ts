import type { LanguageCode, ScamCategory } from "./types";

/**
 * Alert System Types and Utilities
 * 
 * Location-based scam alert system without GPS — district-level only,
 * user-selected, anonymous push subscriptions.
 */

/** AI analysis of a scam report for alert generation */
export interface ReportAnalysis {
  category: ScamCategory;
  summary: string;        // one-line, localized
  preventionTip: string;  // short, actionable, localized
}

/** Stored report (minimal data, district-scoped) */
export interface StoredReport {
  category: ScamCategory;
  summary: string;
  preventionTip: string;
  timestamp: number;
}

/** Push subscription with district */
export interface AlertSubscription {
  subscription: PushSubscriptionJSON;
  district: string;
}

/** Gujarat districts list (extensible to other states) */
export const GUJARAT_DISTRICTS = [
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Rajkot",
  "Bhavnagar",
  "Jamnagar",
  "Junagadh",
  "Gandhinagar",
  "Anand",
  "Mehsana",
  "Patan",
  "Banaskantha",
  "Sabarkantha",
  "Kheda",
  "Panchmahals",
  "Dahod",
  "Mahisagar",
  "Narmada",
  "Bharuch",
  "Navsari",
  "Valsad",
  "Dang",
  "Tapi",
  "Surendranagar",
  "Botad",
  "Amreli",
  "Morbi",
  "Devbhumi Dwarka",
  "Porbandar",
  "Gir Somnath",
  "Kutch",
  "Aravalli",
];

/**
 * Slugify district name for consistent KV key lookups
 * "Ahmedabad" → "ahmedabad"
 * "Gir Somnath" → "gir-somnath"
 */
export function slugifyDistrict(district: string): string {
  return district
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Validate district selection against known list
 */
export function isValidDistrict(district: string): boolean {
  const normalized = district.toLowerCase().trim();
  return GUJARAT_DISTRICTS.some(d => d.toLowerCase() === normalized);
}

/**
 * Get localized district list for UI
 */
export function getDistrictList(lang: LanguageCode): string[] {
  // For now, districts are shown in English
  // Can add Gujarati translations later if needed
  return GUJARAT_DISTRICTS;
}

/**
 * Generate generic prevention tip (fallback when AI fails)
 */
export function getGenericPreventionTip(lang: LanguageCode): string {
  return lang === "gu"
    ? "કોઈને પણ OTP, PIN અથવા કાર્ડ વિગતો શેર કરશો નહીં. શંકા હોય તો 1930 પર કૉલ કરો."
    : "Never share OTP, PIN, or card details with anyone. Call 1930 if suspicious.";
}
