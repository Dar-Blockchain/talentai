import React from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Divider,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import { useTranslation } from "react-i18next";
import { Participant, getParticipantDisplayName, getParticipantInitial } from "./helpers";

const ease = "cubic-bezier(0.4, 0, 0.2, 1)";

interface ConversationHeaderProps {
  otherUser: Participant | undefined;
  isCompany: boolean;
  onDeleteConversation: () => void;
  enableDeletes?: boolean;
  /** When true, show delete-chat with enableDeletes (Company + Employee team chat). */
  showDeleteConversation?: boolean;
  /** Shorter header row (team chat in module frame). */
  compact?: boolean;
  /** Team chat mint: light SaaS header chrome. */
  mintLightTeamUi?: boolean;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  otherUser,
  isCompany,
  onDeleteConversation,
  enableDeletes = true,
  showDeleteConversation,
  compact = false,
  mintLightTeamUi = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation("shared/chat");
  const showTrash =
    enableDeletes && (showDeleteConversation !== undefined ? showDeleteConversation : isCompany);
  const primary = mintLightTeamUi ? "#34D399" : theme.palette.primary.main;

  const h = compact
    ? {
        py: { xs: 0.5, sm: 0.65 },
        px: { xs: 1.25, sm: 1.75 },
        stackGap: 1.25,
        avatar: 36,
        avatarFont: "0.8125rem",
        titleFs: "0.8125rem",
        titleLh: 1.28,
        dividerMy: 0.25,
        trashIcon: 20,
      }
    : {
        py: 1.25,
        px: { xs: 1.5, sm: 2.5 },
        stackGap: 1.5,
        avatar: 44,
        avatarFont: "0.9375rem",
        titleFs: "0.9375rem",
        titleLh: 1.35,
        dividerMy: 0.5,
        trashIcon: 22,
      };

  return (
    <Box
      component="header"
      sx={{
        px: h.px,
        py: h.py,
        borderBottom: mintLightTeamUi ? "1px solid #E5E7EB" : `1px solid ${theme.palette.divider}`,
        bgcolor: mintLightTeamUi ? "#FFFFFF" : theme.palette.background.paper,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={h.stackGap}>
        <Avatar
          sx={{
            width: h.avatar,
            height: h.avatar,
            bgcolor: mintLightTeamUi ? undefined : primary,
            backgroundImage: mintLightTeamUi ? "linear-gradient(135deg, #34D399 0%, #10B981 100%)" : undefined,
            fontSize: h.avatarFont,
            fontWeight: 700,
            color: "#fff",
            boxShadow: mintLightTeamUi ? "0 4px 14px rgba(52, 211, 153, 0.35)" : `0 2px 8px ${alpha(primary, 0.35)}`,
            transition: `transform 0.24s ${ease}, box-shadow 0.24s ${ease}`,
            "@media (hover: hover)": {
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: mintLightTeamUi ? "0 6px 20px rgba(16, 185, 129, 0.4)" : `0 6px 20px ${alpha(primary, 0.45)}`,
              },
            },
          }}
        >
          {getParticipantInitial(otherUser)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            fontWeight={700}
            sx={{ color: mintLightTeamUi ? "#111827" : "text.primary" }}
            fontSize={h.titleFs}
            lineHeight={h.titleLh}
            noWrap
          >
            {getParticipantDisplayName(otherUser)}
          </Typography>
        </Box>

        {showTrash && (
          <>
            <Divider orientation="vertical" flexItem sx={{ my: h.dividerMy, borderColor: mintLightTeamUi ? "#E5E7EB" : alpha(theme.palette.divider, 0.8) }} />
            <Tooltip title={t("delete_dialog.title")}>
              <IconButton
                onClick={onDeleteConversation}
                size="small"
                aria-label={t("delete_dialog.title")}
                sx={{
                  color: theme.palette.error.main,
                  borderRadius: 2,
                  transition: `transform 0.2s ${ease}, background-color 0.2s ${ease}`,
                  "@media (hover: hover)": {
                    "&:hover": {
                      bgcolor: alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.12 : 0.08),
                      transform: "scale(1.08)",
                    },
                  },
                }}
              >
                <DeleteOutlined sx={{ fontSize: h.trashIcon }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default ConversationHeader;
