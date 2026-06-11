import { useCallback, useState } from "react";
import { useUpdatePostStatusMutation } from "../queries";

interface Options { onSuccess?: () => void; onError?: () => void; }

export const usePublishPost = ({ onSuccess, onError }: Options = {}) => {
  const statusMut = useUpdatePostStatusMutation();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleOpen  = useCallback((id: string) => setConfirmId(id), []);
  const handleClose = useCallback(() => setConfirmId(null), []);

  const handleConfirm = useCallback(async () => {
    if (!confirmId) return;
    try {
      await statusMut.mutateAsync({ postId: confirmId, status: "open" });
      setConfirmId(null);
      onSuccess?.();
    } catch {
      onError?.();
    }
  }, [confirmId, statusMut, onSuccess, onError]);

  return { confirmId, publishing: statusMut.isPending, handleOpen, handleClose, handleConfirm };
};
