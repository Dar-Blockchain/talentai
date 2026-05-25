import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchPostMetrics, selectPostMetrics, selectPostMetricsLoading } from "@/store/slices/postSlice";

export const usePostMetrics = () => {
  const dispatch = useDispatch<AppDispatch>();
  const metrics  = useSelector(selectPostMetrics);
  const loading  = useSelector(selectPostMetricsLoading);

  useEffect(() => {
    if (!metrics) dispatch(fetchPostMetrics());
  }, [dispatch, metrics]);

  return { metrics, loading };
};
