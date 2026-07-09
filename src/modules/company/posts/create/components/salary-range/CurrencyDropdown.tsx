import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown as KeyboardArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import CurrencySearchInput from "./CurrencySearchInput";
import CurrencyList from "./CurrencyList";

interface CurrencyOption {
  value: string;
  label: string;
}

interface Props {
  currencies: CurrencyOption[];
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  error?: string;
}

const currencyName = (label: string) => label.split("–")[1]?.trim() ?? label;

const CurrencyDropdown: React.FC<Props> = ({ currencies, value, onChange, placeholder, error }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = currencies.find((c) => c.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return currencies;
    return currencies.filter(
      (c) => c.value.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)
    );
  }, [search, currencies]);

  const openDropdown = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelWidth = Math.max(rect.width, 280);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 300 && rect.top > 300;
    setPanelStyle({
      position: "fixed",
      left: rect.left,
      width: panelWidth,
      zIndex: 9999,
      ...(openUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    });
    setOpen(true);
  };

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        !(document.getElementById("currency-portal")?.contains(target))
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const panel = open && (
    <div
      id="currency-portal"
      style={panelStyle}
      className="overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.14)]"
    >
      <CurrencySearchInput value={search} onChange={setSearch} inputRef={searchRef} />
      <CurrencyList
        options={filtered}
        selected={value}
        onSelect={(code) => { onChange(code); setOpen(false); }}
      />
    </div>
  );

  return (
    <>
      <div ref={triggerRef} className="relative w-full">
        <div
          role="combobox"
          tabIndex={0}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={placeholder}
          onClick={() => (open ? setOpen(false) : openDropdown())}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open ? setOpen(false) : openDropdown(); } else if (e.key === "Escape") { setOpen(false); } }}
          className={cn(
            "flex h-10 cursor-pointer select-none items-center justify-between rounded-lg bg-white px-3 transition-colors",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0891B2] focus-visible:outline-offset-2",
            error ? "border border-[#EF4444]" : open ? "border-[1.5px] border-[#0891B2]" : "border border-[#D1D5DB]",
            open ? "hover:border-[#0891B2]" : "hover:border-[#9CA3AF]"
          )}
        >
          {selected ? (
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <div className="shrink-0 whitespace-nowrap rounded-[5px] bg-[#EFF6FF] px-2 py-px text-[11px] font-bold text-[#1D4ED8]">
                {selected.value}
              </div>
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[#374151]">
                {currencyName(selected.label)}
              </p>
            </div>
          ) : (
            <p className="flex-1 text-xs text-[#9CA3AF]">{placeholder}</p>
          )}
          <KeyboardArrowDownIcon
            size={18}
            color="#9CA3AF"
            className="ml-1 shrink-0 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>
        {error && (
          <p className="ml-1 mt-1 text-[10px] text-[#EF4444]">
            {error}
          </p>
        )}
      </div>
      {typeof window !== "undefined" && createPortal(panel, document.body)}
    </>
  );
};

export default CurrencyDropdown;
