import React, { memo, useCallback, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { SortOption } from "./EmployeesList";
import { SORT_ORDER, SORT_I18N_KEY } from "./constants";

interface Props {
  value: SortOption;
  onChange: (s: SortOption) => void;
}

const SortSelect: React.FC<Props> = memo(({ value, onChange }) => {
  const { t } = useTranslation("dashboard");

  const labels = useMemo(
    () => Object.fromEntries(
      SORT_ORDER.map((id) => [id, t(`pages.employees.filters.sort.${SORT_I18N_KEY[id]}`)])
    ) as Record<SortOption, string>,
    [t],
  );

  const handleChange = useCallback((v: string) => onChange(v as SortOption), [onChange]);

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="h-full min-h-[36px] rounded-none border-none bg-transparent shadow-none focus:ring-0 px-3 text-[13px] font-semibold text-[#374151] [&>svg]:size-3.5 [&>svg]:text-[#9CA3AF]">
        <span className="flex items-center gap-1.5">
          <ArrowUpDown className="size-[14px] text-[#9CA3AF]" />
          <SelectValue>{labels[value]}</SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent className="rounded-2xl border border-[#E5E7EB] shadow-[0_8px_32px_rgba(0,0,0,0.14)]" sideOffset={4}>
        {SORT_ORDER.map((id) => (
          <SelectItem
            key={id}
            value={id}
            className="text-[13px] font-medium data-[state=checked]:font-bold"
          >
            {labels[id]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

SortSelect.displayName = "SortSelect";
export default SortSelect;
