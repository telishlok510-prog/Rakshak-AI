import type { LanguageCode } from "../types";

/**
 * Shared types for SimulationEngine — the reusable state machine
 * that powers ATM, UPI, and Internet Banking practice simulations.
 */

export type ScreenType = "atm" | "upi" | "netbanking";

export interface LocalizedText {
  en: string;
  gu: string;
}

export interface SimChoice {
  /** Button label shown to user */
  label: LocalizedText;
  /** Whether this choice is the safe/correct option */
  isSafeChoice: boolean;
  /** Next step ID to navigate to, or null to end the simulation */
  nextStepId: string | null;
  /** Feedback shown after choice is made */
  feedback: LocalizedText;
}

export interface SimStep {
  id: string;
  /** Type of simulation this step belongs to */
  screenType: ScreenType;
  /** Title shown at top of step */
  title: LocalizedText;
  /** Description/instruction text */
  description: LocalizedText;
  /** Visual representation data (varies by screen type) */
  screenState: Record<string, any>;
  /** Available choices for the user */
  choices: SimChoice[];
  /** Optional: indicator code from detection.ts that relates to this step */
  relatedIndicator?: string;
}

export interface SimulationConfig {
  /** Unique ID for this simulation */
  id: string;
  /** Type of simulation */
  type: ScreenType;
  /** Display title */
  title: LocalizedText;
  /** Short description */
  description: LocalizedText;
  /** ID of the first step */
  startStepId: string;
  /** All steps in this simulation */
  steps: SimStep[];
}

/** Progress tracking for a simulation session */
export interface SimulationProgress {
  currentStepId: string;
  score: number; // Number of safe choices made
  total: number; // Total choices made so far
  completed: boolean;
}
