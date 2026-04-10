import React, { useRef, useState } from "react";
import { Box, Typography, Avatar, Button, Chip, CircularProgress } from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import { TEAL, TEAL_BG, TEAL_BORDER } from "./settingsConstants";

interface Props {
  profile: any;
  loading: boolean;
  uploadingImage: boolean;
  isEditing: boolean;
  onStartEdit: (value: any) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileBanner: React.FC<Props> = ({ profile, loading, uploadingImage, isEditing, onStartEdit, onCancelEdit, onSaveEdit, onImageUpload }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = profile.name || profile.companyName || "Company";
  const initials    = displayName.charAt(0).toUpperCase();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const dt = new DataTransfer(); dt.items.add(file);
    onImageUpload({ target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Box sx={{ bgcolor: "#FAFAFA", borderBottom: "1px solid #E5E7EB", px: { xs: 3, md: 5 }, py: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>

        {/* Avatar upload */}
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{ position: "relative", cursor: "pointer", flexShrink: 0, width: 72, height: 72, borderRadius: "16px", border: "3px solid #fff", boxShadow: dragOver ? `0 0 0 3px ${TEAL}` : "0 2px 8px rgba(0,0,0,0.1)", transition: "box-shadow 0.2s", "&:hover .upload-overlay": { opacity: 1 } }}
        >
          {uploadingImage ? (
            <Box sx={{ width: "100%", height: "100%", borderRadius: "13px", bgcolor: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={22} sx={{ color: TEAL }} />
            </Box>
          ) : (
            <Avatar src={profile.avatar} variant="rounded" sx={{ width: "100%", height: "100%", borderRadius: "13px", bgcolor: TEAL, fontSize: "28px", fontWeight: 800, color: "#fff" }}>
              {initials}
            </Avatar>
          )}
          <Box className="upload-overlay" sx={{ position: "absolute", inset: 0, borderRadius: "13px", bgcolor: "rgba(13,148,136,0.6)", opacity: 0, transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CloudUploadOutlined sx={{ fontSize: 20, color: "#fff" }} />
          </Box>
        </Box>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImageUpload} />

        {/* Name + meta */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{displayName}</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 0.5 }}>
            {profile.email && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LanguageIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{profile.email}</Typography>
              </Box>
            )}
            {profile.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocationOnOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{profile.location}</Typography>
              </Box>
            )}
            {profile.industry && (
              <Chip label={profile.industry} size="small" sx={{ height: 20, fontSize: "0.67rem", fontWeight: 600, bgcolor: "rgba(13,148,136,0.08)", color: TEAL }} />
            )}
            {(profile.size || profile.companySize) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <GroupsOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{profile.size || profile.companySize} employees</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Edit / Save / Cancel */}
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          {!isEditing ? (
            <Button size="small" startIcon={<EditOutlined sx={{ fontSize: 14 }} />} onClick={onStartEdit}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: TEAL, border: `1px solid ${TEAL_BORDER}`, borderRadius: "9px", px: 2, bgcolor: TEAL_BG, "&:hover": { bgcolor: "#CCFBF1" } }}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button size="small" startIcon={<CloseOutlined sx={{ fontSize: 14 }} />} onClick={onCancelEdit}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "9px", px: 1.5 }}>
                Cancel
              </Button>
              <Button size="small" variant="contained" startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: 14 }} />}
                onClick={onSaveEdit} disabled={loading}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem", bgcolor: TEAL, color: "#fff", borderRadius: "9px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" } }}>
                {loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : "Save"}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileBanner;
