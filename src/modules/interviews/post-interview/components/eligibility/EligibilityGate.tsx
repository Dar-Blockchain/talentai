import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import LoadingState from "@/components/ui/LoadingState";
import EligibilityBlockedScreen from "./EligibilityBlockedScreen";
import { type EligibilityStatus, type EligibilityMeta } from "../../types/api";
import { ELIGIBILITY_SCREEN_CONFIG, type BlockableStatus } from "../../constants";

interface EligibilityGateProps {
  status: EligibilityStatus;
  meta: EligibilityMeta | null;
}

export default function EligibilityGate({ status, meta }: EligibilityGateProps) {
  const router = useRouter();
  const { t } = useTranslation("modules/interview/interview");

  if (status === "eligible") return null;

  if (status === "checking") {
    return <LoadingState message={t("loading")} />;
  }

  if (status === "error") {
    return (
      <EligibilityBlockedScreen
        icon="⚠️"
        title="Unable to verify eligibility"
        description="We couldn't confirm your access to this interview. Please refresh the page or try again later."
        actions={[{ label: "Refresh", onClick: () => window.location.reload() }]}
      />
    );
  }

  if (status === "no_link") {
    return (
      <EligibilityBlockedScreen
        icon="🔗"
        title={t("no_link.title")}
        description={t("no_link.desc")}
        actions={[{ label: t("no_link.action"), onClick: () => router.push("/candidate/dashboard") }]}
      />
    );
  }

  const entry = ELIGIBILITY_SCREEN_CONFIG[status as BlockableStatus];
  const action = {
    label: entry.actionLabelKey ? t(entry.actionLabelKey) : t("back_to_dashboard"),
    onClick: () => entry.actionReplace ? router.replace(entry.actionPath) : router.push(entry.actionPath),
  };

  switch (status) {
    case "no_cv":
    case "company_blocked":
    case "employee_blocked":
    case "archived":
    case "expired":
      return (
        <EligibilityBlockedScreen
          icon={entry.icon}
          title={t(entry.titleKey!)}
          description={t(entry.descKey)}
          actions={[action]}
        />
      );

    case "completed":
      return (
        <EligibilityBlockedScreen
          icon={entry.icon}
          title={t(entry.titleKey!)}
          description={<>{t("completed.desc_pre")} <strong style={{ color: "#111827" }}>{meta?.jobTitle || t("completed.fallback_position")}</strong> {t("completed.desc_post")}</>}
          actions={[action]}
        />
      );

    case "under_threshold":
      return (
        <EligibilityBlockedScreen
          icon={entry.icon}
          title={t(entry.titleKey!)}
          description={
            <>
              {t("under_threshold.desc_pre")}
              <strong className="text-danger">{meta?.score ?? 0}%</strong>
              {t("under_threshold.desc_mid")}
              <strong style={{ color: "#111827" }}>{meta?.required ?? 0}%</strong>
              {t("under_threshold.desc_post")}
            </>
          }
          actions={[{ ...action, color: '#DC2626', hoverColor: '#B91C1C' }]}
        />
      );

    case "limit_reached":
      return (
        <EligibilityBlockedScreen
          icon={entry.icon}
          title={t(entry.titleKey!)}
          maxWidth={480}
          actions={[
            { label: t("limit.go_back"), onClick: () => router.back(), variant: "outlined" },
            { label: t("limit.go_home"), onClick: () => router.push("/"), color: "linear-gradient(135deg, #0D9488 0%, #0891B2 100%)", hoverColor: "linear-gradient(135deg, #0F766E 0%, #0E7490 100%)" },
          ]}
        >
          {meta?.jobTitle && (
            <div className="inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] px-4 py-[7px] mt-4 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] shrink-0" />
              <span className="font-[Poppins] text-[0.83rem] font-semibold text-[#475569]">{meta.jobTitle}</span>
            </div>
          )}
          <div className="h-px bg-[#F1F5F9] mb-5" />
          <p className="font-[Poppins] text-[0.9rem] text-[#475569] leading-[1.8] mb-4">{t("limit.desc")}</p>
          <p className="font-[Poppins] text-[0.82rem] text-[#94A3B8] leading-[1.7]">{t("limit.contact")}</p>
        </EligibilityBlockedScreen>
      );

    default:
      return null;
  }
}
