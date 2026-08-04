import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/modules/shared/ui/shadcn/dialog";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { X as CloseIcon, Play as PlayArrowIcon, CheckCircle2 as CheckCircleOutlineIcon, Hourglass as HourglassEmptyIcon, Circle as RadioButtonUncheckedIcon } from "lucide-react";
import { PostAssessment } from "./AssessmentCard";

interface StepInfoModalProps {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  assessment: PostAssessment | null;
  quota?: number;
}

const getStepIcon = (status: string) => {
  switch (status) {
    case "done":
    case "passed":
      return <CheckCircleOutlineIcon size={20} color="#10b981" />;
    case "inProgress":
      return <HourglassEmptyIcon size={20} color="#f59e0b" />;
    default:
      return <RadioButtonUncheckedIcon size={20} color="#9ca3af" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "done":
    case "passed":
      return "Completed";
    case "inProgress":
      return "In Progress";
    default:
      return "Pending";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "done":
    case "passed":
      return { bg: "#d1fae5", color: "#065f46" };
    case "inProgress":
      return { bg: "#fef3c7", color: "#92400e" };
    default:
      return { bg: "#f3f4f6", color: "#6b7280" };
  }
};

const StepInfoModal: React.FC<StepInfoModalProps> = ({
  open,
  onClose,
  onStart,
  assessment,
  quota = 0,
}) => {
  if (!assessment) return null;

  const stepProgress = assessment.candidatePostStepProgress;
  const currentStep = stepProgress?.currentStep;
  const steps = stepProgress?.steps || [];

  // Find the current step details from the steps array
  const currentStepData = steps.find(
    (s: any) => s.stepId?._id === currentStep?._id || s.stepId?.id === currentStep?._id
  );

  const stepLabel =
    currentStepData?.stepId?.data?.label ||
    currentStepData?.stepId?.data?.config?.title ||
    "Next Step";
  const stepConfig = currentStepData?.stepId?.data?.config || {};

  // Calculate overall progress
  const completedSteps = steps.filter(
    (s: any) => s.status === "done" || s.status === "passed"
  ).length;
  const progressPercent = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  // Sort steps by order
  const sortedSteps = [...steps].sort(
    (a: any, b: any) => (a.stepId?.order ?? 999) - (b.stepId?.order ?? 999)
  );

  const jobTitle = assessment.post?.jobDetails?.title || "Job Application";

  // Skills data from post
  const skillAnalysis = assessment.post?.skillAnalysis;
  const requiredSkills = skillAnalysis?.requiredSkills || [];
  const softSkills = skillAnalysis?.softSkills || [];
  const hasSkills = requiredSkills.length > 0 || softSkills.length > 0;

  const quotaFull = quota >= 5;

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[600px] p-0 gap-0 overflow-hidden rounded-2xl border border-[rgba(211,224,245,1)] shadow-[0px_8px_32px_rgba(0,0,0,0.08)]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-[rgba(211,224,245,0.5)]">
            <div>
              <DialogTitle asChild>
                <p className="font-semibold text-[18px] text-[rgba(62,70,82,1)]">
                  {jobTitle}
                </p>
              </DialogTitle>
              <p className="font-normal text-[13px] text-[rgba(100,113,131,1)] mt-0.5">
                Step {completedSteps} of {sortedSteps.length}
              </p>
            </div>
            <button onClick={onClose} className="cursor-pointer p-1.5 rounded-md text-[#6b7280] hover:bg-slate-100">
              <CloseIcon size={20} />
            </button>
          </div>

          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-medium text-[#6b7280]">
                  Overall Progress
                </span>
                <span className="text-[12px] font-semibold" style={{ color: "rgba(189, 133, 255, 1)" }}>
                  {completedSteps}/{steps.length} completed
                </span>
              </div>
              <div className="h-1.5 rounded-[3px] overflow-hidden" style={{ backgroundColor: "rgba(243, 245, 247, 1)" }}>
                <div
                  className="h-full rounded-[3px] transition-all"
                  style={{ width: `${progressPercent}%`, backgroundColor: "rgba(189, 133, 255, 1)" }}
                />
              </div>
            </div>

            {/* Steps list */}
            <div className="flex flex-col gap-2">
              {sortedSteps.map((step: any, index: number) => {
                const isCurrentStep =
                  step.stepId?._id === currentStep?._id ||
                  step.stepId?.id === currentStep?._id;
                const label =
                  step.stepId?.data?.label ||
                  step.stepId?.data?.config?.title ||
                  `Step ${index + 1}`;
                const type = step.stepId?.data?.type || "interview";
                const statusColors = getStatusColor(step.status);
                const isDone = step.status === "done" || step.status === "passed";
                const isCurrentPending = isCurrentStep && !isDone;

                return (
                  <div
                    key={step._id || index}
                    className="flex items-center gap-3 p-3 rounded-[10px]"
                    style={{
                      border: isCurrentStep
                        ? "1.5px solid rgba(189, 133, 255, 0.5)"
                        : "1px solid rgba(211, 224, 245, 0.5)",
                      backgroundColor: isCurrentStep
                        ? "rgba(189, 133, 255, 0.04)"
                        : "transparent",
                    }}
                  >
                    {/* Step number / icon */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isDone
                          ? "rgba(16, 185, 129, 0.1)"
                          : isCurrentStep
                          ? "rgba(189, 133, 255, 0.1)"
                          : "rgba(243, 245, 247, 1)",
                      }}
                    >
                      {isDone ? (
                        getStepIcon(step.status)
                      ) : (
                        <span
                          className="font-bold text-[13px]"
                          style={{ color: isCurrentStep ? "rgba(189, 133, 255, 1)" : "#9ca3af" }}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Step info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[14px]"
                        style={{ fontWeight: isCurrentStep ? 600 : 500, color: isCurrentStep ? "rgba(62, 70, 82, 1)" : "#6b7280" }}
                      >
                        {label}
                      </p>
                      <p className="text-[11px] text-[#9ca3af] capitalize">
                        {type}
                      </p>
                    </div>

                    {/* Status chip */}
                    <Badge
                      variant="outline"
                      className="font-semibold text-[0.7rem] h-[22px] rounded-md border-transparent"
                      style={{
                        backgroundColor: isCurrentPending ? "rgba(189, 133, 255, 0.12)" : statusColors.bg,
                        color: isCurrentPending ? "rgba(189, 133, 255, 1)" : statusColors.color,
                      }}
                    >
                      {isCurrentPending ? "Current" : getStatusLabel(step.status)}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Skills */}
            {hasSkills && (
              <div className="mt-5">
                <p className="text-[13px] font-semibold text-[rgba(62,70,82,1)] mb-2">
                  Skills to be assessed
                </p>

                {requiredSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-medium text-[#6b7280] mb-1">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {requiredSkills.map((skill: any, i: number) => (
                        <Badge
                          key={skill._id || i}
                          variant="outline"
                          className="font-medium text-[0.7rem] h-[22px] rounded-full"
                          style={{ backgroundColor: "rgba(99, 102, 241, 0.08)", color: "#6366f1", borderColor: "rgba(99, 102, 241, 0.2)" }}
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {softSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-medium text-[#6b7280] mb-1">
                      Soft Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {softSkills.map((skill: any, i: number) => (
                        <Badge
                          key={skill._id || i}
                          variant="outline"
                          className="font-medium text-[0.7rem] h-[22px] rounded-full"
                          style={{ backgroundColor: "rgba(16, 185, 129, 0.08)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.2)" }}
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Current step description */}
            {(stepConfig.description || stepConfig.interviewType) && (
              <div
                className="mt-5 p-4 rounded-[10px]"
                style={{ backgroundColor: "rgba(189, 133, 255, 0.04)", border: "1px solid rgba(189, 133, 255, 0.15)" }}
              >
                <p className="text-[13px] font-semibold text-[rgba(62,70,82,1)] mb-1">
                  About this step
                </p>
                {stepConfig.interviewType && (
                  <p className="text-[12px] text-[#6b7280] mb-1">
                    Type: {stepConfig.interviewType.replace(/_/g, " ")}
                  </p>
                )}
                {stepConfig.description && (
                  <p className="text-[12px] text-[#6b7280] leading-relaxed">
                    {stepConfig.description}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-[rgba(211,224,245,0.5)] gap-3 sm:justify-end">
            <Button onClick={onClose} variant="ghost" className="rounded-[38px] px-6 font-medium" style={{ color: "rgba(100, 113, 131, 1)" }}>
              Cancel
            </Button>
            {quotaFull ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      onClick={onStart}
                      variant="secondary"
                      disabled
                      className="h-[42px] rounded-[38px] px-6 font-semibold shadow-none"
                    >
                      <PlayArrowIcon />
                      Start {stepLabel}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>You have reached your monthly limit of 5 tests. Please try again next month.</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                onClick={onStart}
                variant="secondary"
                className="h-[42px] rounded-[38px] px-6 font-semibold shadow-none"
              >
                <PlayArrowIcon />
                Start {stepLabel}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default StepInfoModal;
