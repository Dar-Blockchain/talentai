import React, { memo } from "react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { X as CloseOutlined, ArrowRight as ArrowForwardOutlined, ArrowLeft as ArrowBackOutlined, Check as CheckOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STEPS, TOTAL, type Step } from "./tourSteps";
import { W } from "./tourUtils";

const TEAL = "#0D9488";

interface TourCardProps {
  step: number;
  current: Step;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  onJump: (i: number) => void;
}

const TourCard: React.FC<TourCardProps> = memo(({ step, current, onPrev, onNext, onFinish, onJump }) => {
  const { t } = useTranslation("dashboard");
  const isCentered = current.position === "center";
  const isFirst = step === 0;
  const isLast = step === TOTAL - 1;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      style={{
        pointerEvents: "auto",
        width: isCentered ? 440 : W,
        maxWidth: "calc(100vw - 24px)",
        maxHeight: "calc(100vh - 80px)",
      }}
    >

      {/* Progress bar */}
      <div className="relative h-1 shrink-0 bg-[#F3F4F6]">
        <div
          className="absolute left-0 top-0 h-full transition-[width] duration-300 ease-out"
          style={{ width: `${((step + 1) / TOTAL) * 100}%`, background: `linear-gradient(90deg, ${TEAL}, #34D399)` }}
        />
      </div>

      {/* Title — fixed */}
      <div className="shrink-0 px-6 pt-6">
        <div className="mb-[10px] flex items-start justify-between">
          <p className="pr-2 text-[1rem] font-extrabold leading-[1.3] text-[#111827]">
            {t(current.titleKey)}
          </p>
          <button onClick={onFinish} className="mt-0.5 shrink-0 cursor-pointer text-[#9CA3AF] hover:text-[#374151]">
            <CloseOutlined size={16} />
          </button>
        </div>
      </div>

      {/* Description — scrollable */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        <p className="whitespace-pre-line pb-4 text-[0.83rem] leading-[1.7] text-[#6B7280]">
          {t(current.descKey)}
        </p>
      </div>

      {/* Footer — always visible */}
      <div className="shrink-0 border-t border-[#F3F4F6] px-6 pb-6 pt-4">
        <div className="flex items-center justify-between">
          {/* Dots */}
          <div className="flex max-w-[160px] flex-wrap gap-1">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => onJump(i)}
                className="h-[5px] cursor-pointer rounded-[4px] transition-all"
                style={{ width: i === step ? 14 : 5, backgroundColor: i === step ? TEAL : i < step ? `${TEAL}60` : "#E5E7EB" }}
              />
            ))}
          </div>

          {/* Counter + nav buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] font-medium text-[#9CA3AF]">{step + 1} / {TOTAL}</span>
            {!isFirst && (
              <Button size="sm" variant="ghost" onClick={onPrev} className="min-w-0 rounded-lg px-3 text-[0.78rem] font-semibold text-gray-500">
                <ArrowBackOutlined size={13} />
                {t("tour.nav.back")}
              </Button>
            )}
            <Button
              size="sm"
              variant="default"
              onClick={onNext}
              className="rounded-lg px-4 text-[0.78rem] font-bold shadow-none"
              style={{ backgroundColor: TEAL, color: "#fff" }}
            >
              {isLast ? t("tour.nav.done") : t("tour.nav.next")}
              {isLast ? <CheckOutlined size={13} /> : <ArrowForwardOutlined size={13} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

TourCard.displayName = "TourCard";
export default TourCard;
