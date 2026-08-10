import type { RiskLevel } from "./types";

/**
 * On-device activity tracker for the Safety Score Dashboard.
 *
 * Everything stays in localStorage — no backend, no login, no data collection.
 */

const KEY = "srp-activity-v2"; // Bumped version for new practice schema

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

/** NEW: Tracks completion of Practice modules (scam call, ATM, UPI, netbanking, quiz) */
export interface PracticeLogEntry {
  moduleType: "scam-call" | "atm" | "upi" | "netbanking" | "quiz";
  score: number; // correct answers / safe choices made
  total: number; // total questions or decision points
  at: number;
}

interface ActivityState {
  checks: CheckLogEntry[];
  simAnswers: Record<string, SimLogEntry>;
  lessonsRead: string[];
  practiceCompletions: PracticeLogEntry[]; // NEW
  firstSeenAt: number;
}

function emptyState(): ActivityState {
  return {
    checks: [],
    simAnswers: {},
    lessonsRead: [],
    practiceCompletions: [],
    firstSeenAt: Date.now(),
  };
}

function load(): ActivityState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      // Try migrating from v1
      const oldRaw = window.localStorage.getItem("srp-activity-v1");
      if (oldRaw) {
        const old = JSON.parse(oldRaw) as Partial<ActivityState>;
        const migrated: ActivityState = {
          checks: old.checks ?? [],
          simAnswers: old.simAnswers ?? {},
          lessonsRead: old.lessonsRead ?? [],
          practiceCompletions: [],
          firstSeenAt: old.firstSeenAt ?? Date.now(),
        };
        return migrated;
      }
      return emptyState();
    }
    const parsed = JSON.parse(raw) as Partial<ActivityState>;
    return {
      checks: parsed.checks ?? [],
      simAnswers: parsed.simAnswers ?? {},
      lessonsRead: parsed.lessonsRead ?? [],
      practiceCompletions: parsed.practiceCompletions ?? [],
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
    // Fail silently if storage is full or blocked
  }
}

export function logCheck(kind: string, risk: RiskLevel) {
  const s = load();
  s.checks.push({ kind, risk, at: Date.now() });
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

/** NEW: Log when a user completes any Practice module */
export function logPracticeComplete(
  moduleType: PracticeLogEntry["moduleType"],
  score: number,
  total: number
) {
  const s = load();
  s.practiceCompletions.push({ moduleType, score, total, at: Date.now() });
  // Cap practice history
  if (s.practiceCompletions.length > 200) {
    s.practiceCompletions = s.practiceCompletions.slice(-200);
  }
  save(s);
}

export interface ActivitySummary {
  totalChecks: number;
  scamsCaught: number;
  simCorrect: number;
  simAnswered: number;
  lessonsRead: number;
  daysSinceStart: number;
  recentChecks: CheckLogEntry[];
  // NEW practice stats
  practiceCompletions: number;
  practiceScore: number; // total correct across all practice modules
  practiceTotal: number; // total questions across all practice modules
  practiceAccuracy: number; // 0-1
}

export function getSummary(): ActivitySummary {
  const s = load();
  const simEntries = Object.values(s.simAnswers);
  const practiceScore = s.practiceCompletions.reduce((sum, p) => sum + p.score, 0);
  const practiceTotal = s.practiceCompletions.reduce((sum, p) => sum + p.total, 0);
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
    practiceCompletions: s.practiceCompletions.length,
    practiceScore,
    practiceTotal,
    practiceAccuracy: practiceTotal > 0 ? practiceScore / practiceTotal : 0,
  };
}

/**
 * Financial Safety Score (0-100)
 * - Usage: up to 30 pts (actually using the checker)
 * - Simulator accuracy: up to 25 pts (scam simulator)
 * - Practice modules: up to 25 pts (new: scam call, ATM, UPI, netbanking, quiz)
 * - Literacy: up to 20 pts (lessons read)
 */
export function computeSafetyScore(
  summary: ActivitySummary,
  lessonTotal: number,
  simTotal: number
): number {
  const usageScore = Math.min(30, summary.totalChecks * 3);
  const simAccuracy = summary.simAnswered > 0 ? summary.simCorrect / summary.simAnswered : 0;
  const simScore = Math.round(simAccuracy * 25);
  const practiceScore = Math.round(summary.practiceAccuracy * 25);
  const literacyScore = Math.round(
    (summary.lessonsRead / Math.max(1, lessonTotal)) * 20
  );
  void simTotal; // reserved
  return Math.min(100, usageScore + simScore + practiceScore + literacyScore);
}

export interface Badge {
  id: string;
  icon: string;
  title: string;
  earned: boolean;
}

export function getBadges(summary: ActivitySummary): Badge[] {
  const practiceTypes = new Set(
    summary.practiceCompletions > 0
      ? load().practiceCompletions.map((p) => p.moduleType)
      : []
  );

  return [
    { id: "first-check", icon: "🔍", title: "First Check", earned: summary.totalChecks >= 1 },
    { id: "scam-spotter", icon: "🕵️", title: "Scam Spotter", earned: summary.scamsCaught >= 1 },
    { id: "vigilant", icon: "🛡️", title: "Vigilant (10 checks)", earned: summary.totalChecks >= 10 },
    { id: "quiz-master", icon: "🧠", title: "Quiz Master", earned: summary.simAnswered >= 5 && summary.simCorrect === summary.simAnswered },
    { id: "lifelong-learner", icon: "📚", title: "Lifelong Learner", earned: summary.lessonsRead >= 3 },
    // NEW practice badges
    { id: "call-detective", icon: "📞", title: "Call Detective", earned: practiceTypes.has("scam-call") },
    { id: "atm-smart", icon: "🏧", title: "ATM Smart", earned: practiceTypes.has("atm") },
    { id: "upi-pro", icon: "📱", title: "UPI Pro", earned: practiceTypes.has("upi") },
    { id: "net-safe", icon: "💻", title: "Net Safe", earned: practiceTypes.has("netbanking") },
    { id: "practice-champion", icon: "🏆", title: "Practice Champion", earned: practiceTypes.size >= 3 },
  ];
}