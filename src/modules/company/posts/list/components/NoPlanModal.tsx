import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { RocketLaunchOutlined, WorkspacePremiumOutlined, CloseOutlined } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import AppButton from "@/components/ui/AppButton";
import { TEAL } from "@/modules/company/posts/shared/constants";

interface Props {
  open: boolean;
  /** true = user hit the per-plan post limit; false = no subscription at all */
  isAtLimit: boolean;
  postsUsed?: number;
  postsLimit?: number | typeof Infinity;
  onClose: () => void;
}

const NoPlanModal: React.FC<Props> = ({ open, isAtLimit, postsUsed = 0, postsLimit, onClose }) => {
  const { t } = useTranslation("posts");
  const router = useRouter();

  if (!open) return null;

  const handleUpgrade = () => {
    onClose();
    router.push("/company/plans");
  };

  const limitLabel =
    postsLimit !== undefined && postsLimit !== Infinity
      ? `${postsUsed} / ${postsLimit}`
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        {/* Teal accent bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${TEAL}, #0F766E)` }} />

        {/* Close */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", top: 12, right: 12, color: "#9CA3AF" }}
        >
          <CloseOutlined fontSize="small" />
        </IconButton>

        <div className="px-7 pt-6 pb-7 flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div
            className="size-16 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${TEAL}18, ${TEAL}30)` }}
          >
            {isAtLimit
              ? <WorkspacePremiumOutlined sx={{ fontSize: 32, color: TEAL }} />
              : <RocketLaunchOutlined    sx={{ fontSize: 32, color: TEAL }} />
            }
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-[1.15rem] font-extrabold text-gray-900 mb-1.5">
              {isAtLimit
                ? t("no_plan_modal.limit_title",  "Post limit reached")
                : t("no_plan_modal.no_plan_title", "No active plan")
              }
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[320px] mx-auto">
              {isAtLimit
                ? t("no_plan_modal.limit_body",
                    "You've used all your job posts for this billing period. Upgrade your plan to publish more roles and keep hiring.")
                : t("no_plan_modal.no_plan_body",
                    "You need an active subscription to create job posts. Choose a plan that fits your team and start hiring in minutes.")
              }
            </p>
          </div>

          {/* Limit badge (only shown when at limit) */}
          {isAtLimit && limitLabel && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold"
              style={{ borderColor: `${TEAL}40`, color: TEAL, background: `${TEAL}0D` }}
            >
              <WorkspacePremiumOutlined sx={{ fontSize: 16 }} />
              {t("no_plan_modal.posts_used", "Posts used")}: {limitLabel}
            </div>
          )}

          {/* Perks */}
          <ul className="w-full text-left flex flex-col gap-2">
            {[
              t("no_plan_modal.perk_1", "Unlimited AI-powered job posts"),
              t("no_plan_modal.perk_2", "Automated candidate screening"),
              t("no_plan_modal.perk_3", "Pay-per-hire — no bloated contracts"),
            ].map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span
                  className="mt-0.5 size-4 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
                  style={{ background: TEAL }}
                >
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="w-full flex flex-col gap-2 pt-1">
            <AppButton
              label={t("no_plan_modal.cta", "View plans & upgrade")}
              variant="contained"
              fullWidth
              onClick={handleUpgrade}
              sx={{
                borderRadius: "10px", height: 42,
                background: `linear-gradient(135deg, ${TEAL} 0%, #0F766E 100%)`,
                boxShadow: `0 2px 10px ${TEAL}40`,
                "&:hover": { opacity: 0.9, boxShadow: `0 4px 16px ${TEAL}50` },
              }}
            />
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              {t("no_plan_modal.cancel", "Maybe later")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoPlanModal;
