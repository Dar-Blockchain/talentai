import React, { memo, useState, useCallback, useRef } from "react";
import {
  TextField,
  IconButton,
  CircularProgress,
  Stack,
  Paper,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import SendRounded from "@mui/icons-material/SendRounded";
import { useTranslation } from "react-i18next";
import { safeAlpha } from "@/utils/safeMuiAlpha";

interface MessageInputProps {
  /** Called with the trimmed message text when the user sends. Reject the returned Promise to restore the input value on failure. */
  onSend: (text: string) => Promise<void>;
  sending: boolean;
  /** Tighter footer padding (e.g. team chat in dashboard frame). */
  compact?: boolean;
  /** Team chat: light mint composer chrome. */
  mintLightTeamUi?: boolean;
}

const MessageInput = memo(function MessageInput({
  onSend,
  sending,
  compact = false,
  mintLightTeamUi = false,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const theme = useTheme();
  const { t } = useTranslation("shared/chat");
  const isDark = theme.palette.mode === "dark";
  const canSend = !!value.trim() && !sending;
  const ease = "cubic-bezier(0.4, 0, 0.2, 1)";
  const mintPrimary = "#34D399";
  const mintPrimaryHover = "#10B981";

  // Keep a ref in sync so handleSend can read the latest value without
  // including `value` in its dep array (which would recreate it on every keystroke).
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleSend = useCallback(async () => {
    const text = valueRef.current.trim();
    if (!text || sending) return;
    setValue("");
    try {
      await onSend(text);
    } catch {
      setValue(text);
    }
  }, [sending, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const handleSendClick = useCallback(() => { void handleSend(); }, [handleSend]);

  return (
    <Paper
      component="footer"
      elevation={0}
      square={false}
      sx={{
        flexShrink: 0,
        px: compact ? { xs: 1.25, sm: 1.5 } : { xs: 1.5, sm: 2 },
        ...(compact
          ? {
              py: 0,
              pt: { xs: 0.75, sm: 1 },
              pb: { xs: 0.5, sm: 0.75 },
            }
          : { py: 1.5 }),
        borderTop: mintLightTeamUi ? "1px solid #E5E7EB" : `1px solid ${theme.palette.divider}`,
        bgcolor: mintLightTeamUi ? "#FFFFFF" : theme.palette.background.paper,
        backgroundImage: mintLightTeamUi
          ? "none"
          : isDark
            ? `linear-gradient(180deg, ${safeAlpha(theme.palette.background.paper, 0.92)} 0%, ${theme.palette.background.paper} 100%)`
            : `linear-gradient(180deg, ${safeAlpha(theme.palette.common.white, 0.98)} 0%, ${theme.palette.background.paper} 100%)`,
        position: "sticky",
        bottom: 0,
        zIndex: 3,
        transition: `box-shadow 0.28s ${ease}, border-color 0.28s ${ease}`,
        "@media (hover: hover)": {
          "&:hover": {
            boxShadow: mintLightTeamUi ? "0 -6px 24px rgba(15, 23, 42, 0.05)" : `0 -8px 28px ${safeAlpha(theme.palette.common.black, isDark ? 0.35 : 0.06)}`,
            borderTopColor: mintLightTeamUi ? "rgba(52, 211, 153, 0.25)" : alpha(theme.palette.primary.main, isDark ? 0.35 : 0.2),
          },
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-end">
        <TextField
          fullWidth
          multiline
          maxRows={5}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t("input.placeholder")}
          disabled={sending}
          size="small"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: mintLightTeamUi ? "18px" : "22px",
              fontSize: "0.8125rem",
              lineHeight: 1.45,
              bgcolor: mintLightTeamUi ? "#F8FAFC" : (isDark ? safeAlpha(theme.palette.common.white, 0.04) : alpha(theme.palette.grey[100], 0.9)),
              transition: "background-color 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
              "&:hover": {
                bgcolor: mintLightTeamUi ? "#FFFFFF" : (isDark ? safeAlpha(theme.palette.common.white, 0.09) : alpha(theme.palette.grey[100], 1)),
              },
              "&.Mui-focused": {
                boxShadow: mintLightTeamUi
                  ? "0 0 0 3px rgba(52, 211, 153, 0.2)"
                  : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`,
              },
              "& fieldset": {
                borderColor: mintLightTeamUi ? "#E5E7EB" : alpha(theme.palette.divider, isDark ? 0.5 : 0.9),
              },
              "&:hover fieldset": {
                borderColor: mintLightTeamUi ? "rgba(52, 211, 153, 0.35)" : alpha(theme.palette.primary.main, 0.45),
              },
              "&.Mui-focused fieldset": {
                borderColor: mintLightTeamUi ? mintPrimary : theme.palette.primary.main,
                borderWidth: "1px",
              },
            },
          }}
        />
        <Tooltip title={t("input.send")}>
          <span>
            <IconButton
              onClick={handleSendClick}
              disabled={!canSend}
              color="primary"
              sx={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                bgcolor: canSend
                  ? (mintLightTeamUi ? mintPrimary : theme.palette.primary.main)
                  : alpha(theme.palette.action.disabledBackground, 0.5),
                color: "#fff",
                flexShrink: 0,
                transition: `transform 0.2s ${ease}, background-color 0.2s ${ease}, box-shadow 0.2s ${ease}`,
                boxShadow: canSend
                  ? (mintLightTeamUi ? "0 4px 16px rgba(52, 211, 153, 0.35)" : `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`)
                  : "none",
                "@media (hover: hover)": {
                  "&:hover": {
                    bgcolor: canSend
                      ? (mintLightTeamUi ? mintPrimaryHover : theme.palette.primary.dark)
                      : undefined,
                    transform: canSend ? "scale(1.06) translateY(-1px)" : undefined,
                    boxShadow: canSend
                      ? (mintLightTeamUi ? "0 8px 22px rgba(16, 185, 129, 0.38)" : `0 8px 22px ${alpha(theme.palette.primary.main, 0.42)}`)
                      : "none",
                  },
                },
                "&:active": {
                  transform: canSend ? "scale(0.98)" : undefined,
                },
                "&:disabled": {
                  color: theme.palette.action.disabled,
                },
              }}
              aria-label={t("input.send")}
            >
              {sending ? (
                <CircularProgress size={20} sx={{ color: "inherit" }} />
              ) : (
                <SendRounded sx={{ fontSize: 22 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Paper>
  );
});

export default MessageInput;
