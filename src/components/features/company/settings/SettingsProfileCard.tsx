import React, { useRef, useState } from "react";
import { Box, Avatar, Typography, Chip, CircularProgress } from "@mui/material";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import { SectionCard } from "@/components/dashboard-workplace/ui";
import { UserProfile } from "@/types/profile";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface SettingsProfileCardProps {
  profile: UserProfile;
  uploadingImage: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingsProfileCard: React.FC<SettingsProfileCardProps> = ({
  profile,
  uploadingImage,
  onImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver]   = useState(false);

  const displayName = profile.name || profile.companyName || "Company";
  const initials    = displayName.charAt(0).toUpperCase();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    onImageUpload({ target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <SectionCard>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", py: 1, gap: 1.5 }}>

        {/* Clickable / draggable avatar */}
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            position: "relative", cursor: "pointer",
            width: 72, height: 72, borderRadius: "50%",
            border: `2px dashed ${dragOver ? TEAL : TEAL_BORDER}`,
            transition: "all 0.2s",
            "&:hover": { borderColor: TEAL },
            "&:hover .upload-overlay": { opacity: 1 },
          }}
        >
          {uploadingImage ? (
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={24} sx={{ color: TEAL }} />
            </Box>
          ) : (
            <Avatar
              src={profile.avatar}
              sx={{ width: "100%", height: "100%", bgcolor: TEAL, fontSize: "26px", fontWeight: 800, boxShadow: `0 0 0 3px ${TEAL_BORDER}` }}
            >
              {initials}
            </Avatar>
          )}

          <Box
            className="upload-overlay"
            sx={{
              position: "absolute", inset: 0, borderRadius: "50%",
              bgcolor: "rgba(13,148,136,0.7)", opacity: 0, transition: "opacity 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <CloudUploadOutlined sx={{ fontSize: 22, color: "#fff" }} />
          </Box>
        </Box>

        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImageUpload} />

        {/* Name + email */}
        <Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{displayName}</Typography>
          <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{profile.email}</Typography>
        </Box>

        {/* Quick-glance chips */}
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", justifyContent: "center" }}>
          {profile.location && (
            <Chip
              icon={<LocationOnOutlined sx={{ fontSize: 11 }} />}
              label={profile.location}
              size="small"
              sx={{ fontSize: "10px", height: 20, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}` }}
            />
          )}
          {(profile.size || profile.companySize) && (
            <Chip
              icon={<GroupsOutlined sx={{ fontSize: 11 }} />}
              label={profile.size || profile.companySize}
              size="small"
              sx={{ fontSize: "10px", height: 20, bgcolor: "#F3F4F6", color: "#6B7280" }}
            />
          )}
        </Box>

      </Box>
    </SectionCard>
  );
};

export default SettingsProfileCard;
