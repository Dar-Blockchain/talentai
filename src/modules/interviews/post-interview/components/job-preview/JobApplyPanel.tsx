import React, { useState } from "react";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { type RootState } from "@/store/store";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Separator } from "@/modules/shared/ui/shadcn/separator";
import { SectionCard } from "./JobPanelShared";
import OnboardingModal from "../../../shared/components/modals/OnboardingModal";

interface JobApplyPanelProps {
  jobTitle: string;
  onStartInterview?: () => void;
  isConfigLoading?: boolean;
}

export default function JobApplyPanel({ jobTitle, onStartInterview, isConfigLoading }: JobApplyPanelProps) {
  const { t } = useTranslation("modules/interview/apply");
  const [modalOpen, setModalOpen] = useState(false);
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);

  const steps = [
    { num: 1, label: t("apply_panel.step1_label"), sub: t("apply_panel.step1_sub") },
    { num: 2, label: t("apply_panel.step2_label"), sub: t("apply_panel.step2_sub") },
    { num: 3, label: t("apply_panel.step3_label"), sub: t("apply_panel.step3_sub") },
  ];

  const isAuthenticated = !!authUser && !!onStartInterview;

  return (
    <div className="w-full md:w-[320px] shrink-0 md:sticky md:top-6">
      <SectionCard>
        {isAuthenticated ? (
          <>
            <Badge
              variant="outline"
              className="mb-4 font-[Poppins] text-[0.72rem] rounded-[6px]"
              style={{ background: 'rgba(106,211,156,0.1)', color: '#10453F', borderColor: 'rgba(106,211,156,0.3)' }}
            >
              Ready to interview
            </Badge>
            <p className="font-[Poppins] font-bold text-[1.05rem] text-[#111827] mb-1">
              Start your interview
            </p>
            <p className="font-[Poppins] text-[0.82rem] text-[#6B7280] mb-5 leading-[1.6]">
              Your account is ready. Click below to begin the AI-powered interview for this position.
            </p>

            {[
              "AI interviewer asks tailored questions",
              "Camera & voice recording",
              "Instant feedback after completion",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 mb-2">
                <CheckCircle size={15} className="shrink-0 text-primary" />
                <p className="font-[Poppins] text-[0.78rem] text-[#374151]">{item}</p>
              </div>
            ))}

            <Separator className="my-4" />

            <Button
              variant="default"
              size="lg"
              className="w-full font-[Poppins] font-bold text-[0.95rem] rounded-[12px]"
              onClick={onStartInterview}
              disabled={isConfigLoading}
              loading={isConfigLoading}
            >
              {!isConfigLoading && <Play size={16} fill="currentColor" />}
              {isConfigLoading ? "Preparing interview…" : "Start Interview"}
            </Button>
          </>
        ) : (
          <>
            <p className="font-[Poppins] font-bold text-[1.05rem] text-[#111827] mb-1">
              {t("apply_panel.title")}
            </p>
            <p className="font-[Poppins] text-[0.82rem] text-[#6B7280] mb-5 leading-[1.6]">
              {t("apply_panel.subtitle")}
            </p>

            {steps.map(({ num, label, sub }) => (
              <div key={num} className="flex items-start gap-3 mb-4">
                <div
                  className="w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center border border-primary/20 bg-primary/8"
                >
                  <span className="font-[Poppins] font-bold text-[0.75rem] text-primary">{num}</span>
                </div>
                <div>
                  <p className="font-[Poppins] font-semibold text-[0.85rem] text-[#111827]">{label}</p>
                  <p className="font-[Poppins] text-[0.75rem] text-[#9CA3AF]">{sub}</p>
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            <Button
              variant="default"
              size="lg"
              className="w-full font-[Poppins] font-bold text-[0.95rem] rounded-[12px]"
              onClick={() => setModalOpen(true)}
            >
              {t("apply_panel.btn")}
              <ArrowRight size={16} />
            </Button>
          </>
        )}
      </SectionCard>

      <OnboardingModal
        open={modalOpen}
        jobTitle={jobTitle}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
