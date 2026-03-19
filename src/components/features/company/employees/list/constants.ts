import { SortOption } from "./EmployeesList";

export const PURPLE = "#8310FF";
export const AMBER  = "#D97706";

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "newest",    label: "Newest first" },
  { id: "name-asc",  label: "Name A → Z"   },
  { id: "name-desc", label: "Name Z → A"   },
];

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
