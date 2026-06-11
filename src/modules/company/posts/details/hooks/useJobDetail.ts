import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchJobById, selectCurrentJob, selectCurrentJobLoading, selectCurrentJobError } from "@/store/slices/postSlice";

export const useJobDetail = (jobId: string | undefined) => {
  const dispatch = useDispatch<AppDispatch>();
  const job      = useSelector(selectCurrentJob);
  const loading  = useSelector(selectCurrentJobLoading);
  const error    = useSelector(selectCurrentJobError);

  useEffect(() => {
    if (jobId) dispatch(fetchJobById(jobId));
  }, [dispatch, jobId]);

  return { job, loading, error };
};
