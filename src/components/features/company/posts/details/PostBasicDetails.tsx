import React, { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentJob, updatePost } from "@/store/slices/postSlice";
import { AppDispatch } from "@/store/store";
import { Box, Typography, Chip, Divider, Slider, Button, CircularProgress } from "@mui/material";
import { LANG_META } from "@/constants/languages";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import MicOutlined from "@mui/icons-material/MicOutlined";
import TrackChangesOutlined from "@mui/icons-material/TrackChangesOutlined";
import SectionCard from "@/components/ui/SectionCard";
import { formatSalary, getLevelFromNumber, getPostSkills, getSoftSkillLevelLabel, Skill } from "@/utils/postHelpers";
import { formatDate } from "@/utils/functions";

// ─── Static constants ─────────────────────────────────────────────────────────

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const SEC_ICON_SX    = { width: 28, height: 28, borderRadius: 1.5, bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: TEAL } as const;
const SEC_TITLE_SX   = { fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 } as const;
const THRESH_ICON_SX = { width: 32, height: 32, borderRadius: 2, bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: TEAL } as const;
const THRESH_TITLE_SX = { fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 } as const;
const THRESH_SUB_SX  = { fontSize: "11px", color: "#9CA3AF", mt: 0.1 } as const;
const INFO_BOX_SX    = { bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 2, px: 2, py: 1.25, mb: 2 } as const;
const INFO_TEXT_SX   = { fontSize: "12px", color: "#475569", lineHeight: 1.7 } as const;
const ZONES_ROW_SX   = { display: "flex", justifyContent: "space-between", mb: 0.5, px: 0.5 } as const;
const SLIDER_ROW_SX  = { display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 } as const;
const MINMAX_SX      = { fontSize: "11px", color: "#9CA3AF" } as const;
const LANG_ROW_SX    = { display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" } as const;
const LANG_LABEL_SX  = { display: "flex", alignItems: "center", gap: 0.75 } as const;
const LANG_CHIPS_SX  = { display: "flex", gap: 0.75 } as const;
const LANG_CHIP_SX   = { display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.4, borderRadius: "8px", bgcolor: "#F0FDFA", border: "1px solid #99F6E4" } as const;
const SKILL_SX       = { fontSize: "11px", fontWeight: 600, height: 24, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}` } as const;
const BULLET_TEAL_SX = { width: 6, height: 6, borderRadius: "50%", bgcolor: TEAL, mt: 0.75, flexShrink: 0 } as const;
const BULLET_INDIGO_SX = { width: 6, height: 6, borderRadius: "50%", bgcolor: "#6366F1", mt: 0.75, flexShrink: 0 } as const;

const ZONES: [string, string, string][] = [
  ["Low",    "#DC2626", "0–39%"],
  ["Medium", "#D97706", "40–69%"],
  ["High",   "#16A34A", "70–100%"],
];

// ─── SectionTitle ─────────────────────────────────────────────────────────────

const SectionTitle = memo(({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
    <Box sx={SEC_ICON_SX}>{icon}</Box>
    <Typography sx={SEC_TITLE_SX}>{title}</Typography>
  </Box>
));
SectionTitle.displayName = "SectionTitle";

// ─── ThresholdCard ────────────────────────────────────────────────────────────

const ThresholdCard = memo(({ jobId, initial, canEdit, isDraft }: { jobId: string; initial: number; canEdit: boolean; isDraft: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [value, setValue] = useState<number>(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const dirty    = value !== initial;
  const editable = canEdit && isDraft;

  const color  = useMemo(() => value >= 70 ? "#16A34A" : value >= 40 ? "#D97706" : "#DC2626", [value]);
  const label  = useMemo(() => value >= 70 ? "High"     : value >= 40 ? "Medium"  : "Low",     [value]);
  const bgGrad = useMemo(() =>
    value >= 70
      ? "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
      : value >= 40
      ? "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
      : "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",
  [value]);

  const badgeSx = useMemo(() => ({
    background: bgGrad, border: `1.5px solid ${color}30`,
    borderRadius: 3, px: 2, py: 0.75, textAlign: "center", minWidth: 72,
  }), [bgGrad, color]);

  const sliderSx = useMemo(() => ({
    color,
    height: 6,
    "& .MuiSlider-thumb": { width: 20, height: 20, boxShadow: `0 0 0 4px ${color}20`, "&:hover": { boxShadow: `0 0 0 6px ${color}30` } },
    "& .MuiSlider-track": { transition: "background-color 0.3s" },
    "& .MuiSlider-rail": { bgcolor: "#E5E7EB" },
  }), [color]);

  const saveBtnSx = useMemo(() => ({
    textTransform: "none", fontWeight: 700, fontSize: "0.75rem",
    bgcolor: "white",
    color: saved ? "#16A34A" : "#0D9488",
    border: `1.5px solid ${saved ? "#16A34A" : "#0D9488"}`,
    borderRadius: "20px", px: 2, py: 0.5, boxShadow: "none",
    transition: "all 0.3s",
    "&:hover": { bgcolor: "#F0FDFA", boxShadow: "none" },
    "&.Mui-disabled": { bgcolor: "white", borderColor: "#E5E7EB", color: "#D1D5DB" },
  }), [saved]);

  const handleSliderChange = useCallback((_: Event, v: number | number[]) => {
    setValue(v as number);
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await dispatch(updatePost({ jobId, jobData: { thresholdScore: value } })).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [dispatch, jobId, value]);

  return (
    <SectionCard>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={THRESH_ICON_SX}><TrackChangesOutlined sx={{ fontSize: 17 }} /></Box>
          <Box>
            <Typography sx={THRESH_TITLE_SX}>Threshold Score</Typography>
            <Typography sx={THRESH_SUB_SX}>Minimum interview score required to pass screening</Typography>
          </Box>
        </Box>
        <Box sx={badgeSx}>
          <Typography sx={{ fontSize: "22px", fontWeight: 900, color, lineHeight: 1 }}>{value}%</Typography>
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Typography>
        </Box>
      </Box>

      <Box sx={INFO_BOX_SX}>
        <Typography sx={INFO_TEXT_SX}>
          Candidates who complete an interview and score <strong>below {value}%</strong> will be automatically flagged as{" "}
          <Box component="span" sx={{ color: "#DC2626", fontWeight: 700 }}>Under Threshold</Box> in your applications list.
          This helps you quickly filter out low-scoring candidates without reviewing each result manually.
          {!isDraft && (
            <Box component="span" sx={{ display: "block", mt: 0.75, color: "#D97706", fontWeight: 600 }}>
              ⚠ This post is published — threshold can only be changed while in draft.
            </Box>
          )}
        </Typography>
      </Box>

      <Box sx={ZONES_ROW_SX}>
        {ZONES.map(([z, c, range]) => (
          <Box key={z} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c }} />
            <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#6B7280" }}>
              {z} <span style={{ color: "#9CA3AF", fontWeight: 400 }}>{range}</span>
            </Typography>
          </Box>
        ))}
      </Box>

      <Slider
        value={value}
        onChange={handleSliderChange}
        min={0} max={100} step={5}
        disabled={!editable || saving}
        sx={sliderSx}
      />

      <Box sx={SLIDER_ROW_SX}>
        <Typography sx={MINMAX_SX}>0%</Typography>
        {canEdit && (
          <Button
            size="small" variant="contained"
            disabled={!dirty || saving || !isDraft}
            onClick={handleSave}
            startIcon={saving ? <CircularProgress size={11} color="inherit" /> : null}
            sx={saveBtnSx}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </Button>
        )}
        <Typography sx={MINMAX_SX}>100%</Typography>
      </Box>
    </SectionCard>
  );
});
ThresholdCard.displayName = "ThresholdCard";

// ─── PostBasicDetails ─────────────────────────────────────────────────────────

interface Props {
  canEdit: boolean;
  onEdit: () => void;
}

const PostBasicDetails = memo<Props>(({ canEdit }) => {
  const { t } = useTranslation("posts");
  const job   = useSelector(selectCurrentJob);
  if (!job) return null;

  const jd = job.jobDetails || {};

  const displaySkills = useMemo(() => getPostSkills(job), [job]);
  const interviewLanguages = useMemo<string[]>(() =>
    job.interviewLanguages?.length ? job.interviewLanguages : ["en"],
  [job.interviewLanguages]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <ThresholdCard
        jobId={job._id}
        initial={job.thresholdScore ?? 50}
        canEdit={canEdit}
        isDraft={job.status === "draft"}
      />

      {/* Overview */}
      <SectionCard>
        <SectionTitle icon={<WorkOutlined sx={{ fontSize: 15 }} />} title={t("detail.details.overview")} />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {jd.workMode && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 2, px: 1.5, py: 0.75 }}>
              <LocationOnOutlined sx={{ fontSize: 14, color: "#2563EB" }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#2563EB" }}>{jd.workMode}</Typography>
            </Box>
          )}
          {jd.employmentType && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 2, px: 1.5, py: 0.75 }}>
              <WorkOutlined sx={{ fontSize: 14, color: "#7C3AED" }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#7C3AED" }}>{jd.employmentType}</Typography>
            </Box>
          )}
          {jd.salary && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 2, px: 1.5, py: 0.75 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#16A34A" }}>{formatSalary(jd.salary)}</Typography>
            </Box>
          )}
          {job.createdAt && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2, px: 1.5, py: 0.75 }}>
              <CalendarTodayOutlined sx={{ fontSize: 14, color: "#6B7280" }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>{formatDate(job.createdAt)}</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box sx={LANG_ROW_SX}>
          <Box sx={LANG_LABEL_SX}>
            <MicOutlined sx={{ fontSize: 15, color: "#6B7280" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
              {t("detail.details.interview_languages")}
            </Typography>
          </Box>
          <Box sx={LANG_CHIPS_SX}>
            {interviewLanguages.map((code) => {
              const meta = LANG_META[code];
              if (!meta) return null;
              return (
                <Box key={code} sx={LANG_CHIP_SX}>
                  <img src={`https://flagcdn.com/w40/${meta.flag}.png`} srcSet={`https://flagcdn.com/w80/${meta.flag}.png 2x`} width={20} height={14} alt={meta.label} style={{ borderRadius: 2, display: "block" }} />
                  <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: "#0D9488" }}>{meta.label}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {jd.description && (
          <>
            <Divider sx={{ my: 2.5 }} />
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151", mb: 1 }}>{t("detail.details.description")}</Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.8 }}>{jd.description}</Typography>
          </>
        )}
      </SectionCard>

      {/* Skills */}
      {displaySkills.length > 0 && (
        <SectionCard>
          <SectionTitle icon={<CodeOutlined sx={{ fontSize: 15 }} />} title={t("detail.details.skills")} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {displaySkills.map((skill: Skill, i: number) => {
              const level = skill.type === "soft"
                ? getSoftSkillLevelLabel(Number(skill.level) || 1)
                : getLevelFromNumber(skill.level || 1);
              return <Chip key={i} label={`${skill.name} · ${level}`} size="small" sx={SKILL_SX} />;
            })}
          </Box>
        </SectionCard>
      )}

      {/* Requirements */}
      {jd.requirements?.length > 0 && (
        <SectionCard>
          <SectionTitle icon={<WorkOutlined sx={{ fontSize: 15 }} />} title={t("detail.details.requirements")} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {jd.requirements.map((req: string, i: number) => (
              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box sx={BULLET_TEAL_SX} />
                <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.7 }}>{req}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      )}

      {/* Responsibilities */}
      {jd.responsibilities?.length > 0 && (
        <SectionCard>
          <SectionTitle icon={<WorkOutlined sx={{ fontSize: 15 }} />} title={t("detail.details.responsibilities")} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {jd.responsibilities.map((r: string, i: number) => (
              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box sx={BULLET_INDIGO_SX} />
                <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.7 }}>{r}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      )}
    </Box>
  );
});
PostBasicDetails.displayName = "PostBasicDetails";

export default PostBasicDetails;
