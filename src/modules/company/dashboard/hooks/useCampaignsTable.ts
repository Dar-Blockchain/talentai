import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import type { ModuleType } from "../components/campaigns/moduleTypeMeta";

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "EXPIRED";
export type CampaignsTableSortColumn = "status" | "participants" | "completion" | "score" | "deadline";

export interface CampaignTableRow {
  id:             string;
  title:          string;
  status:         CampaignStatus;
  moduleType:     ModuleType | null;
  participants:   number;
  completed:      number;
  completionRate: number;
  avgScore:       number | null;
  deadline:       number | null;
}

export interface CampaignsTableParams {
  page:     number;
  limit:    number;
  sortBy?:  CampaignsTableSortColumn | "";
  sortDir?: "" | "asc" | "desc";
}

export interface CampaignsTableResult {
  data:       CampaignTableRow[];
  pagination: { currentPage: number; totalPages: number; totalCount: number };
}

const fetchCampaignsTable = async (params: CampaignsTableParams): Promise<CampaignsTableResult> => {
  const res = await axiosInstance.get("internal-campaigns/table", {
    params: {
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy || undefined,
      sortDir: params.sortDir || undefined,
    },
  });
  return {
    data: res.data?.data ?? [],
    pagination: res.data?.pagination ?? { currentPage: 1, totalPages: 1, totalCount: 0 },
  };
};

export const useCampaignsTable = (params: CampaignsTableParams) =>
  useQuery({
    queryKey: ["campaignsDashboard", "table", params],
    queryFn: () => fetchCampaignsTable(params),
    staleTime: 30_000,
  });
