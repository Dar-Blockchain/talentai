import React, { useEffect, useState, useMemo } from "react";
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
import DeptFormFields from "../shared/DeptFormFields";
import CorporateFareOutlined from "@mui/icons-material/CorporateFareOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import { resolveDepartmentApiMessage } from "@/utils/departmentI18n";

const TEAL = "#0D9488";
const TEAL_LIGHT = "#F0FDFA";

export interface CreateDepartmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  saving: boolean;
  error: string | null;
}

const CreateDepartmentModal: React.FC<CreateDepartmentModalProps> = ({
  open,
  onClose,
  onSave,
  saving,
  error,
}) => {
  const { t } = useTranslation("dashboard");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");

  const displayApiError = useMemo(
    () => resolveDepartmentApiMessage(error, t),
    [error, t],
  );

  // Reset form whenever the modal opens
  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setNameError("");
    }
  }, [open]);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(t("pages.departments.form.name_required"));
      return;
    }
    onSave(name.trim(), description.trim());
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
              bgcolor: TEAL_LIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CorporateFareOutlined sx={{ fontSize: 17, color: TEAL }} />
          </Box>
          <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
            {t("pages.departments.modals.create.title")}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={saving}>
          <CloseOutlined sx={{ fontSize: 18, color: "#6B7280" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: "16px !important" }}>
        <DeptFormFields
          name={name}
          description={description}
          nameError={nameError}
          onNameChange={(v) => {
            setName(v);
            if (nameError) setNameError("");
          }}
          onDescChange={setDescription}
          apiError={displayApiError}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <AppButton
          label={t("pages.departments.modals.create.cancel")}
          variant="outlined"
          size="medium"
          onClick={onClose}
          disabled={saving}
        />
        <AppButton
          label={t("pages.departments.modals.create.submit")}
          variant="contained"
          size="medium"
          startIcon={<AddOutlined />}
          loading={saving}
          disabled={!name.trim()}
          onClick={handleSave}
        />
      </DialogActions>
    </Dialog>
  );
};

export default CreateDepartmentModal;
