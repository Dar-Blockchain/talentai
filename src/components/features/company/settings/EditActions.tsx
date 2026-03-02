import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface EditActionsProps {
  isEditing: boolean;
  loading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

const EditActions: React.FC<EditActionsProps> = ({ isEditing, loading, onEdit, onCancel, onSave }) =>
  !isEditing ? (
    <Button
      size="small"
      startIcon={<EditOutlined sx={{ fontSize: 14 }} />}
      onClick={onEdit}
      sx={{
        textTransform: "none", borderRadius: 2, fontWeight: 600, fontSize: "12px",
        color: TEAL, border: `1px solid ${TEAL_BORDER}`, "&:hover": { bgcolor: TEAL_BG },
      }}
    >
      Edit
    </Button>
  ) : (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button
        size="small"
        startIcon={<CloseOutlined sx={{ fontSize: 14 }} />}
        onClick={onCancel}
        sx={{
          textTransform: "none", borderRadius: 2, fontWeight: 600, fontSize: "12px",
          color: "#6B7280", border: "1px solid #E5E7EB",
        }}
      >
        Cancel
      </Button>
      <Button
        size="small" variant="contained"
        startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: 14 }} />}
        onClick={onSave}
        disabled={loading}
        sx={{
          textTransform: "none", borderRadius: 2, fontWeight: 600, fontSize: "12px",
          bgcolor: TEAL, "&:hover": { bgcolor: "#0F766E" },
        }}
      >
        {loading ? <CircularProgress size={14} color="inherit" /> : "Save"}
      </Button>
    </Box>
  );

export default EditActions;
