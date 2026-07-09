import React from "react";
import { RotateCcw } from "lucide-react";
import { ConfirmDialog } from "@/modules/shared/ui/ConfirmDialog";

interface Props {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ReactivateDialog: React.FC<Props> = ({ open, loading, onClose, onConfirm }) => (
  <ConfirmDialog
    open={open}
    onCancel={onClose}
    onConfirm={onConfirm}
    loading={loading}
    tone="primary"
    icon={RotateCcw}
    title="Reactivate application"
    description="Your application will be reactivated and the company will be able to invite you to an interview again. If you uploaded a new CV, your match score will be recalculated."
    confirmLabel={loading ? "Reactivating…" : "Reactivate"}
  />
);

export default ReactivateDialog;
