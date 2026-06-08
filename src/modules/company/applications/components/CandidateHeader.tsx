import React from "react";
import { Box, Typography, Avatar, Chip, Tabs, Tab, Divider } from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import VideoCallOutlined from "@mui/icons-material/VideoCallOutlined";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutline";
import HighlightOffOutlined from "@mui/icons-material/HighlightOff";
import AppButton from "@/components/ui/AppButton";
import type { ApplicationDetail, CandidateDerived } from "../types";
import AppCard from "./AppCard";
import {
  TEAL, PURPLE,
  AVATAR_COLORS, STATUS_STYLE,
  getInitials, fmtDate,
} from "./constants";

interface TabDef { label: string }

interface Props {
  app: ApplicationDetail;
  derived: CandidateDerived;
  tab: number;
  tabs: TabDef[];
  deciding: boolean;
  invitedThisSession: boolean;
  onTabChange: (v: number) => void;
  onDownloadCv: () => void;
  onInviteClick: () => void;
  onDecision: (d: "shortlisted" | "rejected") => void;
}

const CandidateHeader: React.FC<Props> = ({
  app, derived, tab, tabs,
  deciding, invitedThisSession, onTabChange, onDownloadCv, onInviteClick, onDecision,
}) => {
  const { name, email, phone, location, title, status, cvUrl } = derived;
  const sc       = STATUS_STYLE[status] ?? STATUS_STYLE.visited;
  const decision = app.recruiterDecision as "shortlisted" | "rejected" | null | undefined;
  const isInvited = !!(app.invitedAt || app.status === "interview_completed" || invitedThisSession);

  return (
    <AppCard sx={{ mb: 2, overflow: "hidden" }}>
      <Box sx={{ height: 5, background: `linear-gradient(90deg, ${TEAL}, ${PURPLE})` }} />

      <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 2.5 }}>
        {/* Avatar */}
        <Avatar sx={{ width: 56, height: 56, bgcolor: AVATAR_COLORS[0], fontSize: "17px", fontWeight: 700, flexShrink: 0 }}>
          {getInitials(name)}
        </Avatar>

        {/* Info — takes all remaining space */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Name + status chips */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.3 }}>
            <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#111827" }}>{name}</Typography>
            <Chip
              label={status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              size="small"
              sx={{ height: 19, fontSize: "0.67rem", fontWeight: 700, bgcolor: sc.bg, color: sc.color, borderRadius: "4px" }}
            />
            {decision && (
              <Chip
                label={decision === "shortlisted" ? "Shortlisted" : "Rejected"}
                size="small"
                sx={{
                  height: 19, fontSize: "0.67rem", fontWeight: 700, borderRadius: "4px",
                  bgcolor: decision === "shortlisted" ? "#F0FDF4" : "#FEF2F2",
                  color:   decision === "shortlisted" ? "#16A34A" : "#DC2626",
                }}
              />
            )}
            {isInvited && (
              <Chip
                label="Invited"
                size="small"
                sx={{ height: 19, fontSize: "0.67rem", fontWeight: 700, borderRadius: "4px", bgcolor: "#EFF6FF", color: "#2563EB" }}
              />
            )}
          </Box>

          {title && (
            <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", mb: 0.5 }}>{title}</Typography>
          )}

          {/* Contact info row */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
            {email && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <EmailOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.76rem", color: "#6B7280" }}>{email}</Typography>
              </Box>
            )}
            {phone && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <PhoneOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.76rem", color: "#6B7280" }}>{phone}</Typography>
              </Box>
            )}
            {location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <LocationOnOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.76rem", color: "#6B7280" }}>{location}</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <CalendarTodayOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
              <Typography sx={{ fontSize: "0.73rem", color: "#9CA3AF" }}>
                Applied {fmtDate(app.appliedAt || app.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right action column */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          {/* Download CV */}
          {cvUrl && (
            <AppButton
              label="CV"
              variant="outlined"
              startIcon={<DownloadOutlined sx={{ fontSize: 14 }} />}
              onClick={onDownloadCv}
              size="small"
              sx={{
                borderRadius: "8px", color: "#374151", borderColor: "#E5E7EB",
                bgcolor: "#fff", "&:hover": { bgcolor: "#F3F4F6", borderColor: "#D1D5DB" },
                boxShadow: "none", px: 1.5,
              }}
            />
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "#F3F4F6" }} />

          {/* Invite */}
          {isInvited ? (
            <Box sx={{
              display: "flex", alignItems: "center", gap: 0.5,
              borderRadius: "8px", bgcolor: "#EFF6FF", border: "1px solid #BFDBFE",
              px: 1.5, py: 0.6,
            }}>
              <VideoCallOutlined sx={{ fontSize: 14, color: "#2563EB" }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563EB", whiteSpace: "nowrap" }}>
                Invitation Sent
              </Typography>
            </Box>
          ) : (
            <AppButton
              label="Invite to Interview"
              variant="contained"
              startIcon={<VideoCallOutlined sx={{ fontSize: 14 }} />}
              onClick={onInviteClick}
              size="small"
              sx={{
                borderRadius: "8px", bgcolor: PURPLE, boxShadow: "none",
                color: "#fff", "&:hover": { bgcolor: "#6d0ddb", boxShadow: "none" },
                whiteSpace: "nowrap",
              }}
            />
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "#F3F4F6" }} />

          {/* Shortlist */}
          <AppButton
            label={decision === "shortlisted" ? "Shortlisted" : "Shortlist"}
            variant={decision === "shortlisted" ? "contained" : "outlined"}
            size="small"
            loading={deciding}
            startIcon={<CheckCircleOutlineOutlined sx={{ fontSize: 15 }} />}
            onClick={() => onDecision("shortlisted")}
            sx={{
              borderRadius: "8px", boxShadow: "none", whiteSpace: "nowrap",
              ...(decision === "shortlisted"
                ? { bgcolor: "#16A34A", color: "#fff", borderColor: "#16A34A", "&:hover": { bgcolor: "#15803d" } }
                : { color: "#16A34A", borderColor: "#BBF7D0", bgcolor: "#F0FDF4", "&:hover": { bgcolor: "#dcfce7", borderColor: "#86efac" } }),
            }}
          />

          {/* Reject */}
          <AppButton
            label={decision === "rejected" ? "Rejected" : "Reject"}
            variant={decision === "rejected" ? "contained" : "outlined"}
            size="small"
            loading={deciding}
            startIcon={<HighlightOffOutlined sx={{ fontSize: 15 }} />}
            onClick={() => onDecision("rejected")}
            sx={{
              borderRadius: "8px", boxShadow: "none", whiteSpace: "nowrap",
              ...(decision === "rejected"
                ? { bgcolor: "#DC2626", color: "#fff", borderColor: "#DC2626", "&:hover": { bgcolor: "#b91c1c" } }
                : { color: "#DC2626", borderColor: "#FECACA", bgcolor: "#FEF2F2", "&:hover": { bgcolor: "#fee2e2", borderColor: "#fca5a5" } }),
            }}
          />
        </Box>
      </Box>

      <Box sx={{ borderTop: "1px solid #F3F4F6", px: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => onTabChange(v)}
          sx={{
            minHeight: 44,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.8rem", minHeight: 44, color: "#9CA3AF", px: 0, mr: 3 },
            "& .Mui-selected": { color: TEAL },
            "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2 },
          }}
        >
          {tabs.map((t) => <Tab key={t.label} label={t.label} />)}
        </Tabs>
      </Box>
    </AppCard>
  );
};

export default CandidateHeader;
