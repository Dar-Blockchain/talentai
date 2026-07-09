import { Input } from "@/modules/shared/ui/shadcn/input";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string;
  currencyCode: string | null;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SalaryInput = ({ label, value, currencyCode, error, onChange }: Props) => (
  <>
    <p className="mb-1 text-xs font-medium text-[#475569]">{label}</p>
    <div
      className={cn(
        "flex h-10 items-stretch overflow-hidden rounded-md border border-input bg-transparent transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        error && "border-destructive focus-within:ring-destructive/30"
      )}
    >
      {currencyCode && (
        <span className="flex shrink-0 items-center border-r border-input bg-muted/40 px-2.5 text-[11px] font-semibold text-[#6B7280]">
          {currencyCode}
        </span>
      )}
      <Input
        type="text"
        value={value || ""}
        placeholder="0"
        onChange={onChange}
        className="h-full flex-1 rounded-none border-0 text-xs font-medium shadow-none focus-visible:ring-0"
      />
    </div>
    {error && <p className="mt-1 text-[10px] text-destructive">{error}</p>}
  </>
);

export default SalaryInput;
