import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Avatar, Button, Chip, CircularProgress, IconButton, Tooltip } from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import { TEAL, TEAL_BG, TEAL_BORDER } from "@/modules/settings/shared/constants";

interface Props {
  profile: any;
  loading: boolean;
  uploadingImage: boolean;
  isEditing: boolean;
  showEditActions?: boolean;
  onStartEdit: (value: any) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BannerInfoItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    {icon}
    <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{text}</Typography>
  </Box>
);

const ProfileBanner: React.FC<Props> = ({ profile, loading, uploadingImage, isEditing, showEditActions = true, onStartEdit, onCancelEdit, onSaveEdit, onImageUpload }) => {
  const { t } = useTranslation("dashboard");
  const [dragOver,    setDragOver]    = useState(false);
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, []);

  const displayName = profile.name || profile.companyName || "Company";
  const initials    = displayName.charAt(0).toUpperCase();

  const stageFile = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) stageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) stageFile(file);
  };

  const handleConfirmUpload = () => {
    if (!pendingFile) return;
    const dt = new DataTransfer(); dt.items.add(pendingFile);
    onImageUpload({ target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>);
    setPreviewUrl(null); setPendingFile(null);
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); setPendingFile(null);
  };

  const isPreviewing = !!previewUrl;

  return (
    <Box sx={{ bgcolor: "#FAFAFA", borderBottom: "1px solid #E5E7EB", px: { xs: 3, md: 5 }, py: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>

        <Box
          onDragOver={(e) => { e.preventDefault(); if (!isPreviewing) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => { if (!isPreviewing && !uploadingImage) fileInputRef.current?.click(); }}
          sx={{
            position: "relative", flexShrink: 0, width: 72, height: 72, borderRadius: "16px",
            border: `3px solid ${isPreviewing ? TEAL : "#fff"}`,
            boxShadow: dragOver ? `0 0 0 3px ${TEAL}` : "0 2px 8px rgba(0,0,0,0.1)",
            transition: "box-shadow 0.2s, border-color 0.2s",
            cursor: isPreviewing || uploadingImage ? "default" : "pointer",
            "&:hover .upload-overlay": { opacity: isPreviewing || uploadingImage ? 0 : 1 },
          }}
        >
          {uploadingImage ? (
            <Box sx={{ width: "100%", height: "100%", borderRadius: "13px", bgcolor: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={22} sx={{ color: TEAL }} />
            </Box>
          ) : (
            <Avatar
              src={previewUrl || profile.avatar}
              variant="rounded"
              sx={{ width: "100%", height: "100%", borderRadius: "13px", bgcolor: TEAL, fontSize: "28px", fontWeight: 800, color: "#fff" }}
            >
              {initials}
            </Avatar>
          )}

          {/* hover-to-upload overlay (hidden when previewing or uploading) */}
          {!isPreviewing && !uploadingImage && (
            <Box className="upload-overlay" sx={{ position: "absolute", inset: 0, borderRadius: "13px", bgcolor: "rgba(13,148,136,0.6)", opacity: 0, transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CloudUploadOutlined sx={{ fontSize: 20, color: "#fff" }} />
            </Box>
          )}

          {/* confirm / cancel overlay when a file is staged */}
          {isPreviewing && (
            <Box sx={{ position: "absolute", inset: 0, borderRadius: "13px", bgcolor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
              <Tooltip title={t("pages.settings.banner.confirm_upload") || "Confirm"}>
                <IconButton size="small" onClick={handleConfirmUpload} sx={{ bgcolor: TEAL, color: "#fff", p: 0.5, "&:hover": { bgcolor: "#0F766E" } }}>
                  <CheckOutlined sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("pages.settings.banner.cancel") || "Cancel"}>
                <IconButton size="small" onClick={handleCancelPreview} sx={{ bgcolor: "#fff", color: "#374151", p: 0.5, "&:hover": { bgcolor: "#F3F4F6" } }}>
                  <CloseOutlined sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileInputChange} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{displayName}</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 0.5 }}>
            {profile.email && (
              <BannerInfoItem icon={<LanguageIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />} text={profile.email} />
            )}
            {profile.location && (
              <BannerInfoItem icon={<LocationOnOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />} text={profile.location} />
            )}
            {profile.industry && (
              <Chip label={profile.industry} size="small" sx={{ height: 20, fontSize: "0.67rem", fontWeight: 600, bgcolor: "rgba(13,148,136,0.08)", color: TEAL }} />
            )}
            {(profile.size || profile.companySize) && (
              <BannerInfoItem icon={<GroupsOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />} text={`${profile.size || profile.companySize} ${t("pages.settings.employees_suffix")}`} />
            )}
          </Box>
        </Box>

        {showEditActions && (
          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
            {!isEditing ? (
              <Button size="small" startIcon={<EditOutlined sx={{ fontSize: 14 }} />} onClick={onStartEdit}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: TEAL, border: `1px solid ${TEAL_BORDER}`, borderRadius: "9px", px: 2, bgcolor: TEAL_BG, "&:hover": { bgcolor: "#CCFBF1" } }}>
                {t("pages.settings.banner.edit_profile")}
              </Button>
            ) : (
              <>
                <Button size="small" startIcon={<CloseOutlined sx={{ fontSize: 14 }} />} onClick={onCancelEdit}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "9px", px: 1.5 }}>
                  {t("pages.settings.banner.cancel")}
                </Button>
                <Button size="small" variant="contained" startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: 14 }} />}
                  onClick={onSaveEdit} disabled={loading}
                  sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem", bgcolor: TEAL, color: "#fff", borderRadius: "9px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" } }}>
                  {loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : t("pages.settings.banner.save")}
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfileBanner;
