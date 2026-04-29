import React, { useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AppButton from "@/components/ui/AppButton";
import { resolveDepartmentApiMessage } from "@/utils/departmentI18n";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import CloseOutlined         from "@mui/icons-material/CloseOutlined";
import GroupOutlined         from "@mui/icons-material/GroupOutlined";
import WarningAmberOutlined  from "@mui/icons-material/WarningAmberOutlined";

export interface DeleteDepartmentDialogProps {
  open: boolean;
  departmentName: string;
  memberCount?: number;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
  error: string | null;
}

const DeleteDepartmentDialog: React.FC<DeleteDepartmentDialogProps> = ({
  open,
  departmentName,
  memberCount,
  onClose,
  onConfirm,
  deleting,
  error,
}) => {
  const { t } = useTranslation("dashboard");
  const displayError = useMemo(
    () => resolveDepartmentApiMessage(error, t),
    [error, t],
  );

  return (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    slotProps={{ paper: { sx: { borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" } } }}
  >
    <DialogTitle sx={{ p: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: "11px",
            bgcolor: "#FEF2F2", border: "1px solid #FECACA",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <DeleteOutlineOutlined sx={{ fontSize: 19, color: "#DC2626" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
              {t("pages.departments.modals.delete.title")}
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.1 }}>
              {t("pages.departments.modals.delete.subtitle")}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={deleting} sx={{ color: "#9CA3AF" }}>
          <CloseOutlined sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </DialogTitle>

    <DialogContent sx={{ px: 3, pb: 1, pt: "0 !important" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

        {/* Error */}
        {displayError && (
          <Box sx={{ px: 2, py: 1.5, borderRadius: "10px", bgcolor: "#FEF2F2", border: "1px solid #FECACA" }}>
            <Typography sx={{ fontSize: "13px", color: "#DC2626" }}>{displayError}</Typography>
          </Box>
        )}

        {/* Confirmation text */}
        <Typography sx={{ fontSize: "13.5px", color: "#374151", lineHeight: 1.7 }}>
          {t("pages.departments.modals.delete.confirm_lead")}{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>
            {departmentName}
          </Box>
          {t("pages.departments.modals.delete.confirm_trail")}
        </Typography>

        {/* Impact notice */}
        <Box sx={{ borderRadius: "12px", border: "1px solid #FDE68A", bgcolor: "#FFFBEB", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningAmberOutlined sx={{ fontSize: 15, color: "#D97706", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#92400E" }}>
              {t("pages.departments.modals.delete.impact_title")}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <GroupOutlined sx={{ fontSize: 14, color: "#D97706", mt: "2px", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "12.5px", color: "#78350F", lineHeight: 1.6 }}>
              {memberCount != null && memberCount > 0
                ? t("pages.departments.modals.delete.impact_with_count", { count: memberCount })
                : t("pages.departments.modals.delete.impact_generic")}
            </Typography>
          </Box>
        </Box>

      </Box>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, gap: 1 }}>
      <AppButton
        label={t("pages.departments.modals.delete.cancel")}
        variant="outlined"
        size="medium"
        onClick={onClose}
        disabled={deleting}
      />
      <AppButton
        label={t("pages.departments.modals.delete.confirm")}
        variant="danger"
        size="medium"
        startIcon={<DeleteOutlineOutlined />}
        loading={deleting}
        onClick={onConfirm}
      />
    </DialogActions>
  </Dialog>
  );
};

export default DeleteDepartmentDialog;
