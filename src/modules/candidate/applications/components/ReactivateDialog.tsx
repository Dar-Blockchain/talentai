import React from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface Props {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ReactivateDialog: React.FC<Props> = ({ open, loading, onClose, onConfirm }) => (
  <Dialog open={open} onOpenChange={(o) => { if (!loading && !o) onClose(); }}>
    <DialogContent className="max-w-sm rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-[1rem] font-bold">Reactivate application</DialogTitle>
        <DialogDescription className="text-[0.85rem] leading-relaxed">
          Your application will be reactivated and the company will be able to invite you to an interview again.
          If you uploaded a new CV, your match score will be recalculated.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={onClose}
          className="text-gray-600 font-semibold"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={loading}
          onClick={onConfirm}
          className="bg-primary-dark text-white hover:bg-primary-dark/90 font-bold"
        >
          {loading ? "Reactivating…" : "Reactivate"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ReactivateDialog;
