// ─── Types ────────────────────────────────────────────────────────────────────
export * from "./types/interview";
export * from "./types/api";
export type { RootState } from "@/store/store";

// ─── Redux ────────────────────────────────────────────────────────────────────
export { useSelector, useDispatch } from "react-redux";

// ─── Store ────────────────────────────────────────────────────────────────────
export * from "./store/interviewSlice";
export { default as interviewReducer } from "./store/interviewSlice";

// ─── Hooks ────────────────────────────────────────────────────────────────────
export * from "./hooks/useInterviewConfig";
export * from "./hooks/useInterviewSocket";
export * from "./hooks/useInterviewTimer";
export * from "./hooks/useCamera";
export * from "./hooks/useAudioTranscription";
export * from "./hooks/useSecurityMonitoring";
export * from "./hooks/useEligibilityCheck";
export * from "./hooks/useInterviewSession";

// ─── Components ───────────────────────────────────────────────────────────────
export { default as AssessmentCard } from "./components/dashboard/AssessmentCard";
export { default as InterviewLanguageModal } from "./components/intro/InterviewLanguageModal";
export { default as InterviewsBlock } from "./components/dashboard/InterviewsBlock";
export { default as StepInfoModal } from "./components/modals/StepInfoModal";
export { default as OnboardingModal } from "./components/modals/OnboardingModal";
export { default as EligibilityGate } from "./components/eligibility/EligibilityGate";
export { default as InterviewScreen } from "./components/session/InterviewScreen";
export { default as InterviewFlow } from "./components/InterviewFlow";

// ─── Interview UI (start / results / assessment) ──────────────────────────────
export * from "@/components/features/interview/start";
export { default as InterviewIntro } from "@/components/features/interview/start/InterviewIntro";
export { default as GDPRConsentModal } from "@/components/features/interview/start/GDPRConsentModal";
export { default as JobPreviewPanel } from "@/components/features/interview/start/JobPreviewPanel";
export { GlobalStyles } from "@/components/features/interview/start/styles";
export * from "@/components/features/interview/results";
export * from "@/components/features/interview/assessment";
