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
    <div className="relative">
      {currencyCode && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#6B7280]">
          {currencyCode}
        </span>
      )}
      <Input
        type="text"
        value={value || ""}
        placeholder="0"
        onChange={onChange}
        className={cn(
          "h-10 text-xs font-medium",
          currencyCode && "pl-7",
          error && "border-destructive focus-visible:ring-destructive/30"
        )}
      />
    </div>
    {error && <p className="mt-1 text-[10px] text-destructive">{error}</p>}
  </>
);

export default SalaryInput;
