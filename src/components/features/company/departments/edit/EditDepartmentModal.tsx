import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AppButton from "@/components/ui/AppButton";
import DeptFormFields from "../shared/DeptFormFields";
import { Department } from "@/store/slices/departmentSlice";
import EditOutlined from "@mui/icons-material/EditOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";

const TEAL = "#0D9488";
const TEAL_LIGHT = "#F0FDFA";

export interface EditDepartmentModalProps {
  open: boolean;
  department: Department | null;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  saving: boolean;
  error: string | null;
}

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({
  open,
  department,
  onClose,
  onSave,
  saving,
  error,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");

  // Populate fields when a department is passed in
  useEffect(() => {
    if (department) {
      setName(department.name);
      setDescription(department.description);
      setNameError("");
    }
  }, [department]);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError("Department name is required.");
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
            <EditOutlined sx={{ fontSize: 16, color: TEAL }} />
          </Box>
          <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
            Edit Department
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
          apiError={error}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <AppButton
          label="Cancel"
          variant="outlined"
          size="medium"
          onClick={onClose}
          disabled={saving}
        />
        <AppButton
          label="Save Changes"
          variant="contained"
          size="medium"
          loading={saving}
          disabled={!name.trim()}
          onClick={handleSave}
        />
      </DialogActions>
    </Dialog>
  );
};

export default EditDepartmentModal;
