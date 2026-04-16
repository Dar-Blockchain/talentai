import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { deletePost, fetchMyPosts, selectDeletePostLoading } from "@/store/slices/postSlice";
import { AppDispatch } from "@/store/store";

type UseDeletePostOptions = {
  postId: string;
  redirectTo?: string;
  refetchAfterDelete?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export const useDeletePost = ({
  postId,
  redirectTo,
  refetchAfterDelete = false,
  onSuccess,
  onError,
}: UseDeletePostOptions) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const isDeleting = useSelector(selectDeletePostLoading);

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    if (!isDeleting) setOpen(false);
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      await dispatch(deletePost(postId)).unwrap();

      setOpen(false);
      onSuccess?.();

      if (refetchAfterDelete) {
        dispatch(fetchMyPosts({}));
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (error) {
      console.error("Delete post failed", error);
      onError?.(error);
    }
  };

  return {
    open,
    isDeleting,
    handleOpen,
    handleClose,
    handleDelete,
  };
};
