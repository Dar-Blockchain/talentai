import { SortOption } from "./EmployeesList";

export const PURPLE = "#8310FF";
export const AMBER  = "#D97706";

/** Sort keys used with `dashboard:pages.employees.filters.sort.{key}` */
export const SORT_ORDER: SortOption[] = ["newest", "name-asc", "name-desc"];

export const SORT_I18N_KEY: Record<SortOption, string> = {
  newest: "newest",
  "name-asc": "name_asc",
  "name-desc": "name_desc",
};

export const GRID = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)", xl: "repeat(5, 1fr)" },
  gap: 1,
} as const;

export const INLINE_SELECT_SX = {
  borderRadius: 0,
  bgcolor: "transparent",
  boxShadow: "none",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiSelect-select": { py: "7px", pl: 1.5, pr: "28px !important" },
  "& .MuiSelect-icon": { right: 6 },
} as const;
