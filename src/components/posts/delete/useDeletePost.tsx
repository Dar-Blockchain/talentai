import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { deletePost, fetchMyPosts, selectDeletePostLoading } from "@/store/slices/postSlice";
import { AppDispatch, RootState } from "@/store/store";

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
  const [waitingForRoute, setWaitingForRoute] = useState(false);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    if (!isDeleting && !waitingForRoute) setOpen(false);
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      await dispatch(deletePost(postId)).unwrap();

      // 🔁 Same page case
      if (refetchAfterDelete) {
        dispatch(fetchMyPosts({}));
        setOpen(false);
        onSuccess?.();
        return;
      }

      // ➡️ Redirect case: WAIT for route to complete
      if (redirectTo) {
        setWaitingForRoute(true);
        router.push(redirectTo);
      }
    } catch (error) {
      console.error("Delete post failed", error);
      onError?.(error);
    }
  };

  // 🧠 Listen for route completion
  useEffect(() => {
    if (!waitingForRoute) return;

    const handleRouteDone = () => {
      setWaitingForRoute(false);
      setOpen(false);
      onSuccess?.();
    };

    router.events.on("routeChangeComplete", handleRouteDone);
    router.events.on("routeChangeError", handleRouteDone);

    return () => {
      router.events.off("routeChangeComplete", handleRouteDone);
      router.events.off("routeChangeError", handleRouteDone);
    };
  }, [waitingForRoute, router.events, onSuccess]);

  return {
    open,
    isDeleting: isDeleting || waitingForRoute,
    handleOpen,
    handleClose,
    handleDelete,
  };
};
