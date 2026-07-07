import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Box, Typography } from "@mui/material";
import { ChevronDown as KeyboardArrowDownIcon } from "lucide-react";
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
    <Box
      id="currency-portal"
      sx={{
        ...panelStyle,
        bgcolor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
        overflow: "hidden",
      }}
    >
      <CurrencySearchInput value={search} onChange={setSearch} inputRef={searchRef} />
      <CurrencyList
        options={filtered}
        selected={value}
        onSelect={(code) => { onChange(code); setOpen(false); }}
      />
    </Box>
  );

  return (
    <>
      <Box ref={triggerRef} sx={{ position: "relative", width: "100%" }}>
        <Box
          role="combobox"
          tabIndex={0}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={placeholder}
          onClick={() => (open ? setOpen(false) : openDropdown())}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open ? setOpen(false) : openDropdown(); } else if (e.key === "Escape") { setOpen(false); } }}
          sx={{
            height: 40,
            px: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: error ? "1px solid #EF4444" : open ? "1.5px solid #0891B2" : "1px solid #D1D5DB",
            borderRadius: "8px",
            cursor: "pointer",
            bgcolor: "#fff",
            userSelect: "none",
            transition: "border 0.15s",
            "&:hover": { borderColor: open ? "#0891B2" : "#9CA3AF" },
            "&:focus-visible": { outline: "2px solid #0891B2", outlineOffset: 2 },
          }}
        >
          {selected ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden", flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  px: 1,
                  py: 0.1,
                  bgcolor: "#EFF6FF",
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#1D4ED8",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {selected.value}
              </Box>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#374151",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currencyName(selected.label)}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", flex: 1 }}>{placeholder}</Typography>
          )}
          <KeyboardArrowDownIcon
            size={18}
            color="#9CA3AF"
            className="ml-1 shrink-0 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </Box>
        {error && (
          <Typography sx={{ fontSize: "10px", color: "#EF4444", mt: 0.4, ml: 0.5 }}>
            {error}
          </Typography>
        )}
      </Box>
      {typeof window !== "undefined" && createPortal(panel, document.body)}
    </>
  );
};

export default CurrencyDropdown;
