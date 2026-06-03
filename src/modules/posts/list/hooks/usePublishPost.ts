import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updatePostStatus } from "@/store/slices/postSlice";

interface UsePublishPostOptions {
  onSuccess?: () => void;
  onError?: () => void;
}

export const usePublishPost = ({ onSuccess, onError }: UsePublishPostOptions = {}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [publishing, setPublishing] = useState(false);
  const [confirmId,  setConfirmId]  = useState<string | null>(null);

  const handleOpen  = useCallback((id: string) => setConfirmId(id), []);
  const handleClose = useCallback(() => setConfirmId(null), []);

  const handleConfirm = useCallback(async () => {
    if (!confirmId) return;
    setPublishing(true);
    try {
      await dispatch(updatePostStatus({ postId: confirmId, status: "open" })).unwrap();
      setConfirmId(null);
      onSuccess?.();
    } catch {
      onError?.();
    } finally {
      setPublishing(false);
    }
  }, [dispatch, confirmId, onSuccess, onError]);

  return { confirmId, publishing, handleOpen, handleClose, handleConfirm };
};
