import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { usePostLimitCheck } from "@/hooks/usePostLimitCheck";
import { useToast } from "@/hooks/useToast";

export function useCreatePostPage() {
  const access = useCompanyAccess("canCreateJobPosts");
  const limit = usePostLimitCheck();
  const { showToast } = useToast();

  // postGeneration is redux-persist'd (see store.ts) so an accidental
  // refresh/tab-close mid-draft doesn't lose the form. PersistGate blocks
  // render until rehydration finishes, so whatever's here on first mount is
  // already the restored value — no separate "loading" state to wait for.
  const promptDescription = useSelector((s: RootState) => s.postGeneration.promptDescription);
  const generatedPost     = useSelector((s: RootState) => s.postGeneration.generatedPost);
  const hasNotified = useRef(false);

  useEffect(() => {
    if (hasNotified.current) return;
    hasNotified.current = true;
    if (promptDescription.trim() || generatedPost) {
      showToast({ message: "Draft restored from your last session.", severity: "info", playSound: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...access, ...limit };
}
