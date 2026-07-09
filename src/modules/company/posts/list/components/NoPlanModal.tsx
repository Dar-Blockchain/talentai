import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Rocket, Award, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface Props {
  open: boolean;
  /** true = user hit the per-plan post limit; false = no subscription at all */
  isAtLimit: boolean;
  postsUsed?: number;
  postsLimit?: number | typeof Infinity;
  onClose: () => void;
}

const NoPlanModal: React.FC<Props> = ({
  open,
  isAtLimit,
  postsUsed = 0,
  postsLimit,
  onClose,
}) => {
  const { t } = useTranslation("posts");
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push("/company/plans");
  };

  const limitLabel =
    postsLimit !== undefined && postsLimit !== Infinity
      ? `${postsUsed} / ${postsLimit}`
      : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="w-full max-w-[420px] overflow-hidden rounded-2xl p-0">
        {/* Brand accent bar */}
        <div className="h-0.75 w-full bg-linear-to-r from-[#6AD39C] to-[#52E899]" />

        <div className="flex flex-col items-center gap-5 px-8 pb-8 pt-8 text-center">
          {/* Icon */}
          <div
            className={`flex size-17 items-center justify-center rounded-xl ${
              isAtLimit ? "bg-amber-100" : "bg-primary/15"
            }`}
          >
            {isAtLimit ? (
              <Award
                size={30}
                className="text-amber-600"
                strokeWidth={2}
              />
            ) : (
              <Rocket
                size={30}
                className="text-primary-foreground"
                strokeWidth={2}
              />
            )}
          </div>

          {/* Heading */}
          <div>
            <h2 className="mb-1.5 text-[1.2rem] font-extrabold tracking-tight text-gray-900">
              {isAtLimit
                ? t("no_plan_modal.limit_title", "Post limit reached")
                : t("no_plan_modal.no_plan_title", "No active plan")}
            </h2>
            <p className="mx-auto max-w-75 text-[13.5px] leading-relaxed text-gray-500">
              {isAtLimit
                ? t(
                    "no_plan_modal.limit_body",
                    "You've used all your job posts for this billing period. Upgrade your plan to publish more roles and keep hiring.",
                  )
                : t(
                    "no_plan_modal.no_plan_body",
                    "You need an active subscription to create job posts. Choose a plan that fits your team and start hiring in minutes.",
                  )}
            </p>
          </div>

          {/* Limit badge (only shown when at limit) */}
          {isAtLimit && limitLabel && (
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-[13px] font-semibold text-amber-700">
              <Award size={14} />
              {t("no_plan_modal.posts_used", "Posts used")}: {limitLabel}
            </div>
          )}

          {/* Perks */}
          <ul className="flex w-full flex-col gap-2 rounded-2xl bg-gray-50 p-4 text-left">
            {[
              t("no_plan_modal.perk_1", "Unlimited AI-powered job posts"),
              t("no_plan_modal.perk_2", "Automated candidate screening"),
              t("no_plan_modal.perk_3", "Pay-per-hire — no bloated contracts"),
            ].map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-2.5 text-[13.5px] font-medium text-gray-700"
              >
                <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check size={11} strokeWidth={3} />
                </span>
                {perk}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex w-full flex-col gap-2 pt-1">
            <Button
              size="lg"
              className="w-full rounded-xl"
              onClick={handleUpgrade}
            >
              {t("no_plan_modal.cta", "View plans & upgrade")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-transparent hover:text-gray-600"
              onClick={onClose}
            >
              {t("no_plan_modal.cancel", "Maybe later")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoPlanModal;
