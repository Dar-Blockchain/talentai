import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Rocket, Award } from "lucide-react";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";

export type NoPlanReason = "no_plan" | "posts_limit" | "generation_limit";

interface Props {
  open: boolean;
  reason: NoPlanReason;
  used?: number;
  limit?: number | typeof Infinity;
  onClose: () => void;
}

const NoPlanModal: React.FC<Props> = ({
  open,
  reason,
  used = 0,
  limit,
  onClose,
}) => {
  const { t } = useTranslation("posts");
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push("/company/plans");
  };

  const isLimitReason = reason !== "no_plan";
  const limitLabel =
    isLimitReason && limit !== undefined && limit !== Infinity
      ? `${used} / ${limit}`
      : null;

  const title =
    reason === "posts_limit"
      ? t("no_plan_modal.limit_title", "Post limit reached")
      : reason === "generation_limit"
        ? t("no_plan_modal.generation_limit_title", "Generation limit reached")
        : t("no_plan_modal.no_plan_title", "No active plan");

  const body =
    reason === "posts_limit"
      ? t(
          "no_plan_modal.limit_body",
          "You've used all your job posts for this billing period. Upgrade your plan to publish more roles and keep hiring.",
        )
      : reason === "generation_limit"
        ? t(
            "no_plan_modal.generation_limit_body",
            "You've used all your AI generations for this billing period. Upgrade your plan to keep generating job post drafts.",
          )
        : t(
            "no_plan_modal.no_plan_body",
            "You need an active subscription to create job posts. Choose a plan that fits your team and start hiring in minutes.",
          );

  const badgeLabel =
    reason === "generation_limit"
      ? t("no_plan_modal.generations_used", "Generations used")
      : t("no_plan_modal.posts_used", "Posts used");

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
              isLimitReason ? "bg-amber-100" : "bg-primary/15"
            }`}
          >
            {isLimitReason ? (
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
              {title}
            </h2>
            <p className="mx-auto max-w-75 text-[13.5px] leading-relaxed text-gray-500">
              {body}
            </p>
          </div>

          {/* Limit badge (only shown when at limit) */}
          {isLimitReason && limitLabel && (
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-[13px] font-semibold text-amber-700">
              <Award size={14} />
              {badgeLabel}: {limitLabel}
            </div>
          )}

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
