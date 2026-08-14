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
  const postsAtLimit = !!(combined && postsLimit !== Infinity && postsLimit !== -1 && postsUsed >= postsLimit);

  const generationsUsed  = combined?.combined.usage.postGenerations.used ?? 0;
  const generationsLimit = combined?.combined.usage.postGenerations.limit ?? Infinity;
  const generationsAtLimit = !!(combined && generationsLimit !== Infinity && generationsLimit !== -1 && generationsUsed >= generationsLimit);

  // Generating (and previewing) a draft only spends the separate, more
  // generous postGenerations quota — postsLimit is only enforced at save
  // time — so entry is only blocked when there's nothing usable left at all.
  const atLimit = postsAtLimit && generationsAtLimit;

  return { postsUsed, postsLimit, postsAtLimit, generationsUsed, generationsLimit, generationsAtLimit, atLimit };
}
