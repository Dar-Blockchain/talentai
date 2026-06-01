import React from "react";
import { Box, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useTranslation } from "react-i18next";
import { ACCENT } from "@/modules/auth/shared/types";

interface Props {
  fileInputRef: React.RefObject<HTMLInputElement>;
  cvFile: File | null;
  cvError: boolean;
  isDragging: boolean;
  onFileChange: (file: File | null) => void;
  onDragChange: (dragging: boolean) => void;
}

const CvUpload: React.FC<Props> = ({ fileInputRef, cvFile, cvError, isDragging, onFileChange, onDragChange }) => {
  const { t } = useTranslation("auth");

  return (
    <Box>
      <Typography sx={{ fontFamily: "Poppins", fontSize: { xs: "0.8125rem", sm: "0.875rem", md: "0.95rem" }, fontWeight: 500, color: "#6B7280", mb: 0.75 }}>
        {t("candidate_form.cv_label")}
        <Box component="span" sx={{ color: "#EF4444", ml: 0.25 }}>*</Box>
      </Typography>

      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />

      <Box
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); onDragChange(true); }}
        onDragLeave={(e) => { e.preventDefault(); onDragChange(false); }}
        onDrop={(e) => {
          e.preventDefault(); onDragChange(false);
          const f = e.dataTransfer.files?.[0] ?? null;
          if (f && /\.(pdf|doc|docx)$/i.test(f.name)) onFileChange(f);
        }}
        sx={{
          border: "1.5px dashed",
          borderColor: cvError ? "#EF4444" : isDragging ? ACCENT : cvFile ? ACCENT : "#E5E7EB",
          borderRadius: "12px", py: { xs: 1.25, md: 1.5 }, px: { xs: 1.5, md: 2 }, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 1.5,
          transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          background: isDragging ? `${ACCENT}0C` : cvFile ? `${ACCENT}06` : "#FAFAFA",
          transform: isDragging ? "scale(1.015)" : "scale(1)",
          boxShadow: isDragging ? `0 8px 32px ${ACCENT}22` : "none",
          "&:hover": { borderColor: cvFile ? ACCENT : "#9CA3AF", background: cvFile ? `${ACCENT}08` : "#F5F5F5" },
        }}
      >
        {/* Icon */}
        <Box sx={{ width: 34, height: 34, borderRadius: "9px", flexShrink: 0, bgcolor: cvFile ? `${ACCENT}12` : isDragging ? `${ACCENT}18` : "#F0F0F0", border: cvFile ? `1px solid ${ACCENT}30` : "none", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
          {cvFile
            ? <CheckCircleOutlineIcon sx={{ fontSize: { xs: 16, md: 18 }, color: ACCENT }} />
            : <UploadFileIcon sx={{ fontSize: { xs: 16, md: 18 }, color: isDragging ? ACCENT : "#9CA3AF" }} />}
        </Box>

        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: { xs: "0.75rem", sm: "0.78rem", md: "0.82rem" }, color: cvFile ? "#0F172A" : isDragging ? ACCENT : "#374151", fontFamily: "Poppins", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {cvFile ? cvFile.name : isDragging ? t("candidate_form.cv_drop") : t("candidate_form.cv_browse")}
          </Typography>
          <Typography sx={{ fontSize: { xs: "0.6625rem", sm: "0.695rem", md: "0.72rem" }, color: "#9CA3AF", fontFamily: "Poppins", lineHeight: 1.45 }}>
            {cvFile
              ? <>{(cvFile.size / 1024).toFixed(0)} KB · <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>{t("candidate_form.cv_replace")}</Box></>
              : cvError
              ? <Box component="span" sx={{ color: "#EF4444" }}>{t("candidate_form.cv_required")}</Box>
              : t("candidate_form.cv_formats")}
          </Typography>
        </Box>

        {/* Format badges */}
        {!cvFile && !isDragging && (
          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
            {["PDF", "DOC"].map((fmt) => (
              <Box key={fmt} component="span" sx={{ px: { xs: 0.55, md: 0.75 }, py: 0.2, borderRadius: "5px", bgcolor: "#F3F4F6", border: "1px solid #E5E7EB", fontSize: { xs: "0.55rem", md: "0.6rem" }, fontWeight: 700, color: "#6B7280", letterSpacing: "0.04em" }}>
                {fmt}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CvUpload;
