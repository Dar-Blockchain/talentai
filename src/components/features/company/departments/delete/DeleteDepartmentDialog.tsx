import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from "@mui/material";
import AppButton from "@/components/ui/AppButton";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";

export interface DeleteDepartmentDialogProps {
  open: boolean;
  departmentName: string;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
  error: string | null;
}

const DeleteDepartmentDialog: React.FC<DeleteDepartmentDialogProps> = ({
  open,
  departmentName,
  onClose,
  onConfirm,
  deleting,
  error,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pb: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WarningAmberOutlined sx={{ fontSize: 17, color: "#DC2626" }} />
        </Box>
        <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
          Delete Department
        </Typography>
      </Box>
      <IconButton size="small" onClick={onClose} disabled={deleting}>
        <CloseOutlined sx={{ fontSize: 18, color: "#6B7280" }} />
      </IconButton>
    </DialogTitle>

    <DialogContent sx={{ pt: "16px !important" }}>
      <Stack spacing={2}>
        {error && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 2,
              bgcolor: "#FEF2F2",
              border: "1px solid #FECACA",
            }}
          >
            <Typography sx={{ fontSize: "13px", color: "#DC2626" }}>{error}</Typography>
          </Box>
        )}
        <Typography sx={{ fontSize: "14px", color: "#374151", lineHeight: 1.7 }}>
          Are you sure you want to delete{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>
            {departmentName}
          </Box>
          ? This action cannot be undone.
        </Typography>
      </Stack>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <AppButton
        label="Cancel"
        variant="outlined"
        size="medium"
        onClick={onClose}
        disabled={deleting}
      />
      <AppButton
        label="Delete"
        variant="danger"
        size="medium"
        startIcon={<DeleteOutlined />}
        loading={deleting}
        onClick={onConfirm}
      />
    </DialogActions>
  </Dialog>
);

export default DeleteDepartmentDialog;
