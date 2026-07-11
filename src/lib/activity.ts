import type { RiskLevel } from "./types";

/**
 * On-device activity tracker for the Safety Score Dashboard.
 *
 * ponytail: deliberately no backend/auth/database. Everything the dashboard
 * shows is derived from real interactions on THIS device, kept in
 * localStorage. This matches the product's existing "no login, no data
 * collection" promise (see About page / disclaimer) and sidesteps an entire
 * class of security/privacy risk a backend would introduce. Ceiling: stats
 * don't sync across devices — acceptable for a single-user safety companion,
 * and the natural upgrade path (if ever needed) is an opt-in account synced
 * via the existing /api routes.
 */

const KEY = "srp-activity-v1";

export interface CheckLogEntry {
  kind: string;
  risk: RiskLevel;
  at: number; // epoch ms
}

export interface SimLogEntry {
  scenarioId: string;
  correct: boolean;
  at: number;
}

interface ActivityState {
  checks: CheckLogEntry[];
  simAnswers: Record<string, SimLogEntry>; // keyed by scenarioId, latest wins
  lessonsRead: string[]; // lesson ids
  firstSeenAt: number;
}

function emptyState(): ActivityState {
  return { checks: [], simAnswers: {}, lessonsRead: [], firstSeenAt: Date.now() };
}

function load(): ActivityState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ActivityState>;
    return {
      checks: parsed.checks ?? [],
      simAnswers: parsed.simAnswers ?? {},
      lessonsRead: parsed.lessonsRead ?? [],
      firstSeenAt: parsed.firstSeenAt ?? Date.now(),
    };
  } catch {
    return emptyState();
  }
}

function save(state: ActivityState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ponytail: storage full or blocked (private browsing) — fail silently,
    // the dashboard is a nice-to-have, never a blocker for the core checker.
  }
}

export function logCheck(kind: string, risk: RiskLevel) {
  const s = load();
  s.checks.push({ kind, risk, at: Date.now() });
  // Cap history so localStorage never grows unbounded.
  if (s.checks.length > 500) s.checks = s.checks.slice(-500);
  save(s);
}

export function logSimAnswer(scenarioId: string, correct: boolean) {
  const s = load();
  s.simAnswers[scenarioId] = { scenarioId, correct, at: Date.now() };
  save(s);
}

export function logLessonRead(lessonId: string) {
  const s = load();
  if (!s.lessonsRead.includes(lessonId)) s.lessonsRead.push(lessonId);
  save(s);
}

export interface ActivitySummary {
  totalChecks: number;
  scamsCaught: number; // checks that came back risk = "scam"
  simCorrect: number;
  simAnswered: number;
  lessonsRead: number;
  daysSinceStart: number;
  recentChecks: CheckLogEntry[];
}

export function getSummary(): ActivitySummary {
  const s = load();
  const simEntries = Object.values(s.simAnswers);
  return {
    totalChecks: s.checks.length,
    scamsCaught: s.checks.filter((c) => c.risk === "scam").length,
    simCorrect: simEntries.filter((e) => e.correct).length,
    simAnswered: simEntries.length,
    lessonsRead: s.lessonsRead.length,
    daysSinceStart: Math.max(
      1,
      Math.ceil((Date.now() - s.firstSeenAt) / 86_400_000)
    ),
    recentChecks: s.checks.slice(-5).reverse(),
  };
}

/**
 * Financial Safety Score (0-100): a single, explainable number combining
 * real detection usage, simulator accuracy, and literacy engagement. Judges
 * and low-literacy users alike can grasp "bigger number = safer habits"
 * without needing to understand the underlying weights.
 */
export function computeSafetyScore(summary: ActivitySummary, lessonTotal: number, simTotal: number): number {
  const usageScore = Math.min(40, summary.totalChecks * 4); // up to 40 pts for actually using the checker
  const simAccuracy = summary.simAnswered > 0 ? summary.simCorrect / summary.simAnswered : 0;
  const simScore = Math.round(simAccuracy * 35); // up to 35 pts for spotting scams correctly
  const literacyScore = Math.round((summary.lessonsRead / Math.max(1, lessonTotal)) * 25); // up to 25 pts
  void simTotal; // reserved for future weighting by scenario coverage
  return Math.min(100, usageScore + simScore + literacyScore);
}

export interface Badge {
  id: string;
  icon: string;
  title: string;
  earned: boolean;
}

export function getBadges(summary: ActivitySummary): Badge[] {
  return [
    { id: "first-check", icon: "🔍", title: "First Check", earned: summary.totalChecks >= 1 },
    { id: "scam-spotter", icon: "🕵️", title: "Scam Spotter", earned: summary.scamsCaught >= 1 },
    { id: "vigilant", icon: "🛡️", title: "Vigilant (10 checks)", earned: summary.totalChecks >= 10 },
    { id: "quiz-master", icon: "🧠", title: "Quiz Master", earned: summary.simAnswered >= 5 && summary.simCorrect === summary.simAnswered },
    { id: "lifelong-learner", icon: "📚", title: "Lifelong Learner", earned: summary.lessonsRead >= 3 },
  ];
}
