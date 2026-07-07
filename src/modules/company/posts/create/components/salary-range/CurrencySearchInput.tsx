import { Box } from "@mui/material";
import { Search as SearchIcon } from "lucide-react";
import { RefObject } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  inputRef: RefObject<HTMLInputElement>;
}

const CurrencySearchInput = ({ value, onChange, inputRef }: Props) => (
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
      <SearchIcon size={15} color="#9CA3AF" className="shrink-0" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
      {value && (
        <Box
          onClick={() => onChange("")}
          sx={{ fontSize: "12px", color: "#9CA3AF", cursor: "pointer", "&:hover": { color: "#374151" } }}
        >
          ✕
        </Box>
      )}
    </Box>
  </Box>
);

export default CurrencySearchInput;
