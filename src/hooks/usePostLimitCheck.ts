import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchCombinedSubscriptionDetails, selectCombinedDetails } from "@/store/slices/paymentSlice";

export function usePostLimitCheck() {
  const dispatch = useDispatch<AppDispatch>();
  const combined = useSelector(selectCombinedDetails);

  useEffect(() => {
    dispatch(fetchCombinedSubscriptionDetails());
  }, [dispatch]);

  const postsUsed  = combined?.combined.usage.posts.used ?? 0;
  const postsLimit = combined?.combined.usage.posts.limit ?? Infinity;
  const atLimit    = !!(combined && postsLimit !== Infinity && postsLimit !== -1 && postsUsed >= postsLimit);

  return { postsUsed, postsLimit, atLimit };
}
