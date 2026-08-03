import React from "react";
import { ConfirmDialog } from "@/modules/shared/ui/ConfirmDialog";

interface Props {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const WithdrawDialog: React.FC<Props> = ({ open, loading, onClose, onConfirm }) => (
  <ConfirmDialog
    open={open}
    onCancel={onClose}
    onConfirm={onConfirm}
    loading={loading}
    title="Withdraw application"
    description="Are you sure? The company will see this application as withdrawn."
    confirmLabel={loading ? "Withdrawing…" : "Withdraw"}
  />
);

export default WithdrawDialog;
