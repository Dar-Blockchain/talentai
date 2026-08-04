import { Check as CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrencyOption {
  value: string;
  label: string;
}

interface Props {
  options: CurrencyOption[];
  selected: string;
  onSelect: (code: string) => void;
}

const currencyName = (label: string) => label.split("–")[1]?.trim() ?? label;

const CurrencyList = ({ options, selected, onSelect }: Props) => (
  <div className="max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB]">
    {options.length === 0 ? (
      <div className="px-4 py-6 text-center">
        <p className="text-xs text-[#9CA3AF]">No currencies found</p>
      </div>
    ) : (
      options.map((c) => {
        const isSelected = c.value === selected;
        return (
          <div
            key={c.value}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(c.value);
            }}
            className={cn(
              "flex cursor-pointer items-center gap-3 px-3 py-[7px]",
              isSelected ? "bg-[#F0F9FF] hover:bg-[#E0F2FE]" : "bg-transparent hover:bg-[#F9FAFB]"
            )}
          >
            <div
              className={cn(
                "min-w-[40px] shrink-0 rounded px-1 py-px text-center text-[10px] font-bold tracking-[0.02em]",
                isSelected ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#F3F4F6] text-[#6B7280]"
              )}
            >
              {c.value}
            </div>
            <p
              className={cn(
                "flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs",
                isSelected ? "font-medium text-[#0C4A6E]" : "font-normal text-[#374151]"
              )}
            >
              {currencyName(c.label)}
            </p>
            {isSelected && <CheckIcon size={14} color="#0891B2" className="shrink-0" />}
          </div>
        );
      })
    )}
  </div>
);

export default CurrencyList;
