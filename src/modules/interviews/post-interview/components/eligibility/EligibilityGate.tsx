import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import LoadingState from "@/components/ui/LoadingState";
import EligibilityBlockedScreen from "./EligibilityBlockedScreen";
import { type EligibilityStatus, type EligibilityMeta } from "../../types/api";
import { RED, RED_DARK, ELIGIBILITY_SCREEN_CONFIG, type BlockableStatus } from "../../constants";
import { eligibilityGateSx as sx } from "../../styles/eligibilityGate.styles";

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
              <strong style={{ color: RED }}>{meta?.score ?? 0}%</strong>
              {t("under_threshold.desc_mid")}
              <strong style={{ color: "#111827" }}>{meta?.required ?? 0}%</strong>
              {t("under_threshold.desc_post")}
            </>
          }
          actions={[{ ...action, color: RED, hoverColor: RED_DARK }]}
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
            <Box sx={sx.jobTitleBadge}>
              <Box sx={sx.jobTitleDot} />
              <Typography sx={sx.jobTitleText}>{meta.jobTitle}</Typography>
            </Box>
          )}
          <Box sx={sx.divider} />
          <Typography sx={sx.limitDesc}>{t("limit.desc")}</Typography>
          <Typography sx={sx.limitContact}>{t("limit.contact")}</Typography>
        </EligibilityBlockedScreen>
      );

    default:
      return null;
  }
}
