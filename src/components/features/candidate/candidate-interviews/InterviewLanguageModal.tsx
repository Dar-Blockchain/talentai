import React, { useState } from "react";
import { Box, Button, Dialog, Typography } from "@mui/material";
import MicOutlined from "@mui/icons-material/MicOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

const TEAL    = "#0D9488";
const TEAL_BG = "#F0FDFA";

const LANG_META: Record<string, { flag: string; label: string; nativeLabel: string }> = {
  en: { flag: "us", label: "English",  nativeLabel: "English"  },
  fr: { flag: "fr", label: "French",   nativeLabel: "Français" },
};

interface Props {
  open: boolean;
  languages: string[];           // available languages from the post
  onConfirm: (lang: string) => void;
  onClose: () => void;
}

const InterviewLanguageModal: React.FC<Props> = ({ open, languages, onConfirm, onClose }) => {
  const [selected, setSelected] = useState<string>(languages[0] ?? "en");

  React.useEffect(() => {
    if (open) setSelected(languages[0] ?? "en");
  }, [open, languages]);

  const isMulti = languages.length > 1;
  const singleLang = LANG_META[languages[0]];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "18px",
          width: 400,
          maxWidth: "95vw",
          p: 3,
          boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Icon + title */}
      <Box sx={{ textAlign: "center", mb: 2.5 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: "12px",
          bgcolor: TEAL_BG, mx: "auto", mb: 1.5,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <MicOutlined sx={{ fontSize: 22, color: TEAL }} />
        </Box>
        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
          {isMulti ? "Choose interview language" : "Interview language"}
        </Typography>
        <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mt: 0.5 }}>
          {isMulti
            ? "Select the language in which you want to conduct your interview"
            : "Your interview will be conducted in the following language"}
        </Typography>
      </Box>

      {/* Multi-language selector */}
      {isMulti && (
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${languages.length}, 1fr)`, gap: 1.5, mb: 3 }}>
          {languages.map((code) => {
            const meta = LANG_META[code];
            if (!meta) return null;
            const active = selected === code;
            return (
              <Box
                key={code}
                onClick={() => setSelected(code)}
                sx={{
                  cursor: "pointer",
                  border: `1.5px solid ${active ? TEAL : "#E5E7EB"}`,
                  borderRadius: "12px",
                  bgcolor: active ? TEAL_BG : "#FAFAFA",
                  p: 1.75,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5,
                  position: "relative",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: TEAL, bgcolor: TEAL_BG },
                }}
              >
                {active && (
                  <Box sx={{
                    position: "absolute", top: 6, right: 6,
                    width: 16, height: 16, borderRadius: "50%",
                    bgcolor: TEAL,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CheckOutlined sx={{ fontSize: 10, color: "#fff" }} />
                  </Box>
                )}
                <img src={`https://flagcdn.com/w40/${meta.flag}.png`} srcSet={`https://flagcdn.com/w80/${meta.flag}.png 2x`} width={32} height={22} alt={meta.flag} style={{ borderRadius: 3, display: 'block' }} />
                <Typography sx={{
                  fontSize: "12px", fontWeight: active ? 700 : 500,
                  color: active ? TEAL : "#374151",
                  textAlign: "center",
                }}>
                  {meta.nativeLabel}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Single-language info card */}
      {!isMulti && singleLang && (
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1.5,
          p: 1.75, mb: 3,
          borderRadius: "12px",
          bgcolor: "#F0FDFA", border: "1px solid #99F6E4",
        }}>
          <img src={`https://flagcdn.com/w40/${singleLang.flag}.png`} srcSet={`https://flagcdn.com/w80/${singleLang.flag}.png 2x`} width={36} height={26} alt={singleLang.flag} style={{ borderRadius: 3, display: 'block', flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0D9488" }}>
              {singleLang.nativeLabel}
            </Typography>
            <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
              The interview will be fully conducted in this language
            </Typography>
          </Box>
          <InfoOutlined sx={{ fontSize: 16, color: "#99F6E4", ml: "auto", flexShrink: 0 }} />
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1.25 }}>
        <Button
          fullWidth
          onClick={onClose}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "13px",
            borderRadius: "10px", height: 42,
            color: "#6B7280", border: "1px solid #E5E7EB",
            "&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" },
          }}
        >
          Cancel
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={() => onConfirm(selected)}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "13px",
            borderRadius: "10px", height: 42,
            bgcolor: TEAL, color: "#fff", boxShadow: "none",
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#0F766E", boxShadow: "0 4px 12px rgba(13,148,136,0.25)" },
          }}
        >
          Start Interview
        </Button>
      </Box>
    </Dialog>
  );
};

export default InterviewLanguageModal;
