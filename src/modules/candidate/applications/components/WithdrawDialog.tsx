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

const WithdrawDialog: React.FC<Props> = ({ open, loading, onClose, onConfirm }) => (
  <Dialog open={open} onOpenChange={(o) => { if (!loading && !o) onClose(); }}>
    <DialogContent className="max-w-sm rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-[1rem] font-bold">Withdraw application</DialogTitle>
        <DialogDescription className="text-[0.85rem] leading-relaxed">
          Are you sure? The company will see this application as withdrawn.
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
          className="bg-danger text-white hover:bg-danger/90 font-bold"
        >
          {loading ? "Withdrawing…" : "Withdraw"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default WithdrawDialog;
