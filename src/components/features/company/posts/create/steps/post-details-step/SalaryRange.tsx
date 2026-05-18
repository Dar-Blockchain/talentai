import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Stack, TextField, Typography, Box, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { defaultCurrencies } from "@/constants/candidate";

interface SalaryRangeProps {
  salaryRange: { currency: string; min: number; max: number };
  onSalaryChange: (field: "min" | "max" | "currency", value: number | string) => void;
  errors?: { currency?: string; min?: string; max?: string };
  currencies?: { value: string; label: string }[];
}

export const CurrencyDropdown: React.FC<{
  currencies: { value: string; label: string }[];
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  error?: string;
}> = ({ currencies, value, onChange, placeholder, error }) => {
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
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
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

  const currencyName = (label: string) => label.split("–")[1]?.trim() ?? label;

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
      {/* Search */}
      <Box sx={{ p: "8px 10px", borderBottom: "1px solid #F3F4F6", bgcolor: "#FAFAFA" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "7px",
            px: 1,
            height: 34,
          }}
        >
          <SearchIcon sx={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0 }} />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currency…"
            style={{
              border: "none",
              outline: "none",
              fontSize: "12px",
              width: "100%",
              background: "transparent",
              color: "#374151",
            }}
          />
          {search && (
            <Box
              onClick={() => setSearch("")}
              sx={{ fontSize: "12px", color: "#9CA3AF", cursor: "pointer", "&:hover": { color: "#374151" } }}
            >
              ✕
            </Box>
          )}
        </Box>
      </Box>

      {/* List */}
      <Box
        sx={{
          maxHeight: 240,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#D1D5DB", borderRadius: "4px" },
        }}
      >
        {filtered.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>No currencies found</Typography>
          </Box>
        ) : (
          filtered.map((c) => {
            const isSelected = c.value === value;
            return (
              <Box
                key={c.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(c.value);
                  setOpen(false);
                }}
                sx={{
                  px: "12px",
                  py: "7px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                  bgcolor: isSelected ? "#F0F9FF" : "transparent",
                  "&:hover": { bgcolor: isSelected ? "#E0F2FE" : "#F9FAFB" },
                }}
              >
                <Box
                  sx={{
                    minWidth: 40,
                    textAlign: "center",
                    px: 0.5,
                    py: 0.2,
                    bgcolor: isSelected ? "#DBEAFE" : "#F3F4F6",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: isSelected ? "#1D4ED8" : "#6B7280",
                    flexShrink: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  {c.value}
                </Box>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: isSelected ? "#0C4A6E" : "#374151",
                    fontWeight: isSelected ? 500 : 400,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currencyName(c.label)}
                </Typography>
                {isSelected && <CheckIcon sx={{ fontSize: 14, color: "#0891B2", flexShrink: 0 }} />}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Box ref={triggerRef} sx={{ position: "relative", width: "100%" }}>
        {/* Trigger button */}
        <Box
          onClick={() => (open ? setOpen(false) : openDropdown())}
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
            sx={{
              fontSize: 18,
              color: "#9CA3AF",
              flexShrink: 0,
              ml: 0.5,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
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

const SalaryRange: React.FC<SalaryRangeProps> = ({
  salaryRange,
  onSalaryChange,
  errors = {},
  currencies = defaultCurrencies,
}) => {
  const { t } = useTranslation("posts");

  const handleChange =
    (field: "min" | "max") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value: string | number = e.target.value;
      value = value.replace(/\D/g, "");
      value = value.replace(/^0+/, "");
      value = value === "" ? 0 : Number(value);
      onSalaryChange(field, value);
    };

  const inputSx = {
    "& .MuiInputBase-root": {
      height: 40,
      fontSize: "12px",
      fontWeight: 500,
      borderRadius: "8px",
    },
  };

  const currencyCode = salaryRange.currency || null;

  return (
    <Box sx={{ mt: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: "rgba(136, 151, 170, 1)",
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontSize: 13,
        }}
      >
        <Image src="/icons/money.svg" alt="" width={18} height={12} />
        {t("create.post_form.labels.salary_range")}
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
        {/* Currency */}
        <Box sx={{ width: { xs: "100%", sm: "32%" } }}>
          <Typography sx={{ fontSize: 12, mb: 0.5, color: "#475569", fontWeight: 500 }}>
            {t("create.post_form.labels.currency")}
          </Typography>
          <CurrencyDropdown
            currencies={currencies}
            value={salaryRange.currency}
            onChange={(code) => onSalaryChange("currency", code)}
            placeholder={t("create.post_form.placeholders.select_currency")}
            error={errors.currency}
          />
        </Box>

        {/* Min */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 12, mb: 0.5, color: "#475569", fontWeight: 500 }}>
            {t("create.post_form.labels.minimum_salary")}
          </Typography>
          <TextField
            type="text"
            value={salaryRange.min || ""}
            placeholder="0"
            onChange={handleChange("min")}
            error={!!errors.min}
            helperText={errors.min}
            fullWidth
            sx={inputSx}
            InputProps={
              currencyCode
                ? {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>
                          {currencyCode}
                        </Typography>
                      </InputAdornment>
                    ),
                  }
                : undefined
            }
          />
        </Box>

        {/* Max */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 12, mb: 0.5, color: "#475569", fontWeight: 500 }}>
            {t("create.post_form.labels.maximum_salary")}
          </Typography>
          <TextField
            type="text"
            value={salaryRange.max || ""}
            placeholder="0"
            onChange={handleChange("max")}
            error={!!errors.max}
            helperText={errors.max}
            fullWidth
            sx={inputSx}
            InputProps={
              currencyCode
                ? {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>
                          {currencyCode}
                        </Typography>
                      </InputAdornment>
                    ),
                  }
                : undefined
            }
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default SalaryRange;
