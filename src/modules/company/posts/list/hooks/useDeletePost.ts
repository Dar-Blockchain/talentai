import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { useDeletePostMutation } from "../queries";

interface Options {
  redirectTo?:         string;
  refetchAfterDelete?: boolean;
  onSuccess?:          () => void;
  onError?:            (e: unknown) => void;
}

export const useDeletePost = ({ redirectTo, onSuccess, onError }: Options = {}) => {
  const router    = useRouter();
  const deleteMut = useDeletePostMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleOpen  = useCallback((id: string) => setPendingId(id), []);
  const handleClose = useCallback(() => { if (!deleteMut.isPending) setPendingId(null); }, [deleteMut.isPending]);

  const handleDelete = useCallback(async () => {
    if (!pendingId || deleteMut.isPending) return;
    try {
      await deleteMut.mutateAsync(pendingId);
      setPendingId(null);
      onSuccess?.();
      if (redirectTo) router.push(redirectTo);
    } catch (e) {
      onError?.(e);
    }
  }, [pendingId, deleteMut, onSuccess, redirectTo, router, onError]);

  return { open: !!pendingId, isDeleting: deleteMut.isPending, handleOpen, handleClose, handleDelete };
};
