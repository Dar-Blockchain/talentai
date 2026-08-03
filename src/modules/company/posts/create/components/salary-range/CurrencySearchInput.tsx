import { Search as SearchIcon } from "lucide-react";
import { RefObject } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  inputRef: RefObject<HTMLInputElement>;
}

const CurrencySearchInput = ({ value, onChange, inputRef }: Props) => (
  <div className="border-b border-[#F3F4F6] bg-[#FAFAFA] px-2.5 py-2">
    <div className="flex h-[34px] items-center gap-2 rounded-[7px] border border-[#E5E7EB] bg-white px-2">
      <SearchIcon size={15} color="#9CA3AF" className="shrink-0" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search currency…"
        className="w-full border-none bg-transparent text-xs text-[#374151] outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs text-[#9CA3AF] hover:text-[#374151]"
        >
          ✕
        </button>
      )}
    </div>
  </div>
);

export default CurrencySearchInput;
