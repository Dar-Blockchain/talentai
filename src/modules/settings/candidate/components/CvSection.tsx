import React, { useRef, useState } from "react";
import {
  Box, Typography, Button, CircularProgress, Alert, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNew";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import { candidateApi } from "../api";
import { emitToast } from "@/utils/toastEmitter";

const TEAL = "#0D9488";
const TEAL_BG = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface Props {
  resumeFilename: string | null | undefined;
  onUpdated: (filename: string) => void;
  onDeleted: () => void;
}

const CvSection: React.FC<Props> = ({ resumeFilename, onUpdated, onDeleted }) => {
  const inputRef              = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]     = useState(false);
  const [analysing, setAnalysing]     = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progress, setProgress]       = useState(0);
  const [error, setError]             = useState<string | null>(null);
  const [isDragging, setIsDragging]   = useState(false);

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  const cvUrl   = resumeFilename ? `${baseUrl}/resume/${resumeFilename}` : null;

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    setDeleting(true);
    try {
      await candidateApi.deleteResume();
      onDeleted();
      emitToast({ message: "CV removed.", severity: "success" });
    } catch {
      setError("Failed to remove CV. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("File must be under 5 MB."); return; }
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) { setError("Only PDF, DOC, and DOCX files are allowed."); return; }
    setError(null);
    setUploading(true);
    setProgress(0);
    const tick = setInterval(() => setProgress((p) => Math.min(p + 15, 85)), 300);
    try {
      const result = await candidateApi.uploadResume(file);
      clearInterval(tick);
      setProgress(100);
      const filename = result?.resume ?? result?.data?.resume ?? file.name;
      onUpdated(filename);
      emitToast({ message: "CV uploaded! Analysing your CV in the background…", severity: "success" });
      setTimeout(() => { setProgress(0); setAnalysing(true); }, 800);
      // Show analysing badge for ~30s — the backend runs analysis async
      setTimeout(() => setAnalysing(false), 30_000);
    } catch (err: any) {
      clearInterval(tick);
      setProgress(0);
      setError(err?.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ px: 2, py: 1.5, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2, borderLeft: "3px solid #0D9488" }}>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>Resume / CV</Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF", mt: 0.25 }}>
          Upload your latest CV. This will be used for all new job applications.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ borderRadius: "10px", fontSize: "0.8rem" }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Current CV */}
      {cvUrl ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, borderRadius: "12px" }}>
          <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: `${TEAL}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <DescriptionOutlined sx={{ fontSize: 20, color: TEAL }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {resumeFilename}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
              {analysing
                ? <><CircularProgress size={10} sx={{ color: "#D97706" }} /><Typography sx={{ fontSize: "0.72rem", color: "#D97706", fontWeight: 600 }}>Analysing…</Typography></>
                : <><CheckCircleOutlined sx={{ fontSize: 12, color: TEAL }} /><Typography sx={{ fontSize: "0.72rem", color: TEAL, fontWeight: 600 }}>Active CV</Typography></>}
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Button size="small" startIcon={<OpenInNewOutlined sx={{ fontSize: 13 }} />}
              onClick={() => window.open(cvUrl, "_blank")}
              sx={{ textTransform: "none", fontSize: "0.72rem", fontWeight: 600, color: TEAL, borderRadius: "8px", "&:hover": { bgcolor: `${TEAL}10` } }}>
              View
            </Button>
            <Button size="small"
              startIcon={deleting ? <CircularProgress size={12} sx={{ color: "#DC2626" }} /> : <DeleteOutlined sx={{ fontSize: 13 }} />}
              disabled={deleting}
              onClick={() => setConfirmOpen(true)}
              sx={{ textTransform: "none", fontSize: "0.72rem", fontWeight: 600, color: "#DC2626", borderRadius: "8px", "&:hover": { bgcolor: "#FEF2F2" } }}>
              {deleting ? "Removing…" : "Delete"}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 2, bgcolor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px" }}>
          <Typography sx={{ fontSize: "0.82rem", color: "#92400E" }}>No CV on file. Upload one below so recruiters can review your profile.</Typography>
        </Box>
      )}

      {/* Upload zone */}
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />

      <Box
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
        sx={{
          border: "1.5px dashed", borderColor: isDragging ? TEAL : "#E5E7EB",
          borderRadius: "12px", py: 2.5, px: 2, cursor: uploading ? "default" : "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          bgcolor: isDragging ? TEAL_BG : "#FAFAFA",
          transition: "all 0.2s",
          "&:hover": { borderColor: uploading ? "#E5E7EB" : TEAL, bgcolor: uploading ? "#FAFAFA" : TEAL_BG },
        }}
      >
        {uploading ? (
          <CircularProgress size={24} sx={{ color: TEAL }} />
        ) : (
          <UploadFileOutlined sx={{ fontSize: 28, color: isDragging ? TEAL : "#9CA3AF" }} />
        )}
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: isDragging ? TEAL : "#374151", textAlign: "center" }}>
          {uploading ? "Uploading…" : isDragging ? "Drop your CV here" : cvUrl ? "Upload a new CV" : "Upload your CV"}
        </Typography>
        <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF" }}>PDF, DOC, DOCX · Max 5 MB</Typography>
      </Box>

      {uploading && progress > 0 && (
        <LinearProgress variant="determinate" value={progress}
          sx={{ height: 4, borderRadius: 2, bgcolor: `${TEAL}18`, "& .MuiLinearProgress-bar": { bgcolor: TEAL, borderRadius: 2 } }} />
      )}

      {/* Delete confirmation modal */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 0.5 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <WarningAmberOutlined sx={{ fontSize: 18, color: "#DC2626" }} />
            </Box>
            Delete CV
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: "4px !important" }}>
          <Typography sx={{ fontSize: "0.88rem", color: "#4B5563", lineHeight: 1.7 }}>
            Are you sure you want to remove <strong>{resumeFilename}</strong>? You can upload a new one at any time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: "none", color: "#6B7280", borderRadius: "10px", fontSize: "0.85rem" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleDeleteConfirm}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", fontSize: "0.85rem", bgcolor: "#DC2626", boxShadow: "none", color: "#fff", "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CvSection;
