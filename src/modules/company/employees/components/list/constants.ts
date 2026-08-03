import { SortOption } from "./EmployeesList";

export const PURPLE = "#8310FF";
export const AMBER  = "#D97706";

export const SORT_ORDER: SortOption[] = ["newest", "name-asc", "name-desc"];

export const SORT_I18N_KEY: Record<SortOption, string> = {
  newest: "newest",
  "name-asc": "name_asc",
  "name-desc": "name_desc",
};
