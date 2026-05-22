import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";
import { deletePost, fetchMyPosts, selectDeletePostLoading } from "@/store/slices/postSlice";

interface UseDeletePostOptions {
  redirectTo?: string;
  refetchAfterDelete?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useDeletePost = ({ redirectTo, refetchAfterDelete = false, onSuccess, onError }: UseDeletePostOptions = {}) => {
  const dispatch   = useDispatch<AppDispatch>();
  const router     = useRouter();
  const isDeleting = useSelector(selectDeletePostLoading);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleOpen  = (id: string) => setPendingId(id);
  const handleClose = () => { if (!isDeleting) setPendingId(null); };

  const handleDelete = async () => {
    if (!pendingId || isDeleting) return;
    try {
      await dispatch(deletePost(pendingId)).unwrap();
      setPendingId(null);
      onSuccess?.();
      if (refetchAfterDelete) { dispatch(fetchMyPosts({})); return; }
      if (redirectTo) router.push(redirectTo);
    } catch (error) {
      onError?.(error);
    }
  };

  return { open: !!pendingId, isDeleting, handleOpen, handleClose, handleDelete };
};
