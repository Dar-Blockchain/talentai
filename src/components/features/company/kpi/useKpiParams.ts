import { useSelector } from "react-redux";
import { selectKpiPostId, selectKpiDateFrom } from "@/store/slices/kpiSlice";

export const useKpiParams = () => {
  const postId   = useSelector(selectKpiPostId);
  const dateFrom = useSelector(selectKpiDateFrom);

  const params: Record<string, string> = {};
  if (postId)   params.postId   = postId;
  if (dateFrom) params.dateFrom = dateFrom;

  return { postId, dateFrom, params };
};
