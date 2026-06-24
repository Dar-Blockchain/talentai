import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Box, Typography, Button, Dialog, DialogContent, DialogActions, TextField, Chip } from "@mui/material";
import CandidateWorkspaceLayout from "@/modules/shared/layouts/candidate/CandidateWorkspaceLayout";
import CandidateApplications from "@/modules/candidate/applications/components/CandidateApplicationsWidget";

import CandidateProfilePanel from "@/modules/candidate/profile/CandidateProfilePanel";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import RecordVoiceOverOutlined from "@mui/icons-material/RecordVoiceOverOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import { buildInterviewUrl } from "@/lib/interviewSession";

const T    = "#0D9488";
const TL   = "#14B8A6";
const TBG  = "#F0FDFA";
const TBRD = "#99F6E4";
const NAVY = "#0D1B2A";

type ActiveView = "applications" | null;

const POPULAR_SKILLS = ["React", "TypeScript", "Python", "Node.js", "Java", "SQL", "Docker", "AWS", "Vue.js", "Go"];

const HideBar: React.FC<{ onHide: () => void; label: string }> = ({ onHide, label }) => (
  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
    <Button size="small" startIcon={<ChevronLeftOutlined sx={{ fontSize: "14px !important" }} />} onClick={onHide}
      sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", px: 1.5, py: 0.5, "&:hover": { bgcolor: "#F3F4F6" } }}>
      {label}
    </Button>
  </Box>
);

const CollapsedRow: React.FC<{
  icon: React.ReactNode; iconBg: string; iconBorder: string;
  title: string; subtitle: string; color: string; viewAllLabel: string; onExpand: () => void;
}> = ({ icon, iconBg, iconBorder, title, subtitle, color, viewAllLabel, onExpand }) => (
  <Box onClick={onExpand} sx={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB",
    px: 2.5, py: 1.5, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    transition: "all 0.18s",
    "&:hover": { borderColor: color, boxShadow: `0 2px 12px ${color}18`, bgcolor: "#FAFAFA" },
  }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: iconBg, border: `1px solid ${iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: NAVY, lineHeight: 1.2 }}>{title}</Typography>
        <Typography sx={{ fontSize: "0.66rem", color: "#9CA3AF" }}>{subtitle}</Typography>
      </Box>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.5, borderRadius: "8px", bgcolor: `${color}10`, border: `1px solid ${color}30` }}>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color }}>{viewAllLabel}</Typography>
      <ExpandMoreOutlined sx={{ fontSize: 14, color }} />
    </Box>
  </Box>
);

const DisabledAction: React.FC<{ icon: React.ElementType; label: string; sublabel: string }> = ({ icon: Icon, label, sublabel }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, borderRadius: "10px", border: "1px solid #E5E7EB", bgcolor: "#F9FAFB", px: 1.5, py: 1, cursor: "not-allowed", opacity: 0.55 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon sx={{ fontSize: 15, color: "#9CA3AF" }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#9CA3AF", lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.62rem", color: "#9CA3AF" }}>{sublabel}</Typography>
    </Box>
    <LockOutlined sx={{ fontSize: 13, color: "#9CA3AF", flexShrink: 0 }} />
  </Box>
);

const ActiveAction: React.FC<{ icon: React.ElementType; label: string; sublabel: string; color: string; onClick: () => void }> = ({ icon: Icon, label, sublabel, color, onClick }) => (
  <Box onClick={onClick} sx={{
    display: "flex", alignItems: "center", gap: 1.25,
    borderRadius: "10px", border: `1px solid ${color}30`, bgcolor: `${color}08`,
    px: 1.5, py: 1, cursor: "pointer", transition: "all 0.18s",
    "&:hover": { borderColor: color, bgcolor: `${color}12`, boxShadow: `0 2px 8px ${color}20` },
    "&:active": { transform: "scale(0.99)" },
  }}>
    <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon sx={{ fontSize: 15, color }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#111827", lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.62rem", color: "#6B7280" }}>{sublabel}</Typography>
    </Box>
    <ArrowForwardOutlined sx={{ fontSize: 13, color, flexShrink: 0 }} />
  </Box>
);

const DashboardCandidate: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();

  const [activeView, setActiveView] = useState<ActiveView>(null);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [skillInput,      setSkillInput]      = useState("");

  useEffect(() => {
    const view = router.query.view;
    if (view === "applications") {
      setActiveView(view);
      return;
    }
    setActiveView(null);
  }, [router.query.view]);

  const expand = (view: ActiveView) => {
    if (!view) {
      setActiveView(null);
      router.replace("/candidate/dashboard", undefined, { shallow: true });
      return;
    }
    setActiveView(view);
    router.replace(`/candidate/dashboard?view=${view}`, undefined, { shallow: true });
  };
  const hide = () => expand(null);

  const handleStartSkillInterview = () => {
    const skill = skillInput.trim();
    if (!skill) return;
    router.push(buildInterviewUrl({ type: "skill", skill }));
    setSkillDialogOpen(false);
    setSkillInput("");
  };

  return (
    <CandidateWorkspaceLayout breadcrumb={t("candidate.nav.dashboard")} leftPanel={<CandidateProfilePanel />}>
          {/* ── MAIN ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Action bar */}
            <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", px: 2, py: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.25 }}>
                <ActiveAction  icon={CodeOutlined}            label={t("candidate.actions.skill_interview")} sublabel={t("candidate.actions.skill_interview_sub")} color={T} onClick={() => setSkillDialogOpen(true)} />
                <DisabledAction icon={RecordVoiceOverOutlined} label={t("candidate.actions.hr_interview")}    sublabel={t("candidate.actions.coming_soon")} />
              </Box>
            </Box>

            {/* Applications */}
            {activeView === "applications" ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <HideBar onHide={hide} label={t("candidate.actions.hide")} />
                <CandidateApplications />
              </Box>
            ) : (
              <CandidateApplications previewCount={2} onViewAll={() => expand("applications")} />
            )}

            {/* Skills */}
            {activeView === null && (
              <CollapsedRow
                icon={<PsychologyOutlined sx={{ fontSize: 16, color: "#2563EB" }} />}
                iconBg="#EFF6FF" iconBorder="#BFDBFE"
                title={t("candidate.sections.skills_title")} subtitle={t("candidate.sections.skills_subtitle")}
                color="#2563EB" onExpand={() => router.push("/candidate/skills")}
                viewAllLabel={t("candidate.actions.view_all")}
              />
            )}

            {/* Interviews */}
            {activeView === null && (
              <CollapsedRow
                icon={<SchoolOutlined sx={{ fontSize: 16, color: "#D97706" }} />}
                iconBg="#FFFBEB" iconBorder="#FDE68A"
                title={t("candidate.sections.interviews_title")} subtitle={t("candidate.sections.interviews_subtitle")}
                color="#D97706" onExpand={() => router.push("/candidate/interviews")}
                viewAllLabel={t("candidate.actions.view_all")}
              />
            )}
          </Box>
      {/* Skill Interview Dialog */}
      <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "20px", p: 0, overflow: "hidden" } }}>

        {/* Header */}
        <Box sx={{ px: 3, pt: 3, pb: 2, background: `linear-gradient(135deg, ${NAVY} 0%, ${T} 100%)`, position: "relative" }}>
          <Button onClick={() => setSkillDialogOpen(false)} size="small" sx={{ position: "absolute", top: 10, right: 10, minWidth: 0, p: 0.5, color: "#fff", opacity: 0.7, "&:hover": { opacity: 1, bgcolor: "transparent" } }}>
            <CloseOutlined sx={{ fontSize: 18 }} />
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: `${TL}30`, border: `1px solid ${TL}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CodeOutlined sx={{ fontSize: 18, color: "#fff" }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>{t("candidate.skill_dialog.title")}</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: `${TL}cc` }}>{t("candidate.skill_dialog.subtitle")}</Typography>
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", mb: 1 }}>{t("candidate.skill_dialog.input_label")}</Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder={t("candidate.skill_dialog.placeholder")}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStartSkillInterview()}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px", fontSize: "0.88rem",
                "&.Mui-focused fieldset": { borderColor: T, borderWidth: 1.5 },
              },
            }}
          />

          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#9CA3AF", mt: 2, mb: 1 }}>{t("candidate.skill_dialog.popular_label")}</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {POPULAR_SKILLS.map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                onClick={() => setSkillInput(s)}
                sx={{
                  fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                  bgcolor: skillInput === s ? TBG : "#F9FAFB",
                  border: `1px solid ${skillInput === s ? TBRD : "#E5E7EB"}`,
                  color: skillInput === s ? T : "#374151",
                  "&:hover": { bgcolor: TBG, borderColor: TBRD, color: T },
                  transition: "all 0.15s",
                }}
              />
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button onClick={() => setSkillDialogOpen(false)}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.82rem", color: "#6B7280", borderRadius: "10px", px: 2, "&:hover": { bgcolor: "#F3F4F6" } }}>
            {t("candidate.skill_dialog.cancel")}
          </Button>
          <Button onClick={handleStartSkillInterview} disabled={!skillInput.trim()}
            endIcon={<ArrowForwardOutlined sx={{ fontSize: "15px !important" }} />}
            sx={{
              textTransform: "none", fontWeight: 700, fontSize: "0.82rem", borderRadius: "10px", px: 2.5,
              bgcolor: T, color: "#fff",
              "&:hover": { bgcolor: "#0F766E" },
              "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
            }}>
            {t("candidate.skill_dialog.start")}
          </Button>
        </DialogActions>
      </Dialog>

    </CandidateWorkspaceLayout>
  );
};

export default dynamic(() => Promise.resolve(DashboardCandidate), { ssr: false });
