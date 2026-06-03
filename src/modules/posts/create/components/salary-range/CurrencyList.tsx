import { Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

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
  <Box
    sx={{
      maxHeight: 240,
      overflowY: "auto",
      "&::-webkit-scrollbar": { width: "4px" },
      "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
      "&::-webkit-scrollbar-thumb": { bgcolor: "#D1D5DB", borderRadius: "4px" },
    }}
  >
    {options.length === 0 ? (
      <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
        <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>No currencies found</Typography>
      </Box>
    ) : (
      options.map((c) => {
        const isSelected = c.value === selected;
        return (
          <Box
            key={c.value}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(c.value);
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
);

export default CurrencyList;
