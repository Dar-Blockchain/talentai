import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { usePostLimitCheck } from "@/hooks/usePostLimitCheck";
import { clearPost } from "../store/createPostSlice";

export function useCreatePostPage() {
  const dispatch = useDispatch<AppDispatch>();
  const access = useCompanyAccess("canCreateJobPosts");
  const limit = usePostLimitCheck();

  useEffect(() => {
    return () => { dispatch(clearPost()); };
  }, [dispatch]);

  return { ...access, ...limit };
}
