import React from "react";
import NextLink from "next/link";
import { Box, Paper, Typography } from "@mui/material";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import { useTranslation } from "react-i18next";
import { useChatUnreadBadges } from "@/modules/shared/chat/hooks/useChatUnreadBadges";
import {
  COMPANY_CANDIDATE_CHAT_PATH,
  COMPANY_TEAM_CHAT_PATH,
  type CompanyChatChannel,
} from "@/modules/shared/chat/constants/companyChannels";
import { companyChatSx } from "@/modules/shared/chat/styles/companyChat";
import { chatSegmentedControlSx } from "@/modules/shared/chat/styles/segmentedControl";

interface CompanyChatTopNavProps {
  activeChannel: CompanyChatChannel;
}

const navItems: Array<{
  channel: CompanyChatChannel;
  href: string;
  icon: React.ElementType;
  labelKey: "team" | "candidate";
}> = [
  {
    channel: "team",
    href: COMPANY_TEAM_CHAT_PATH,
    icon: GroupsOutlined,
    labelKey: "team",
  },
  {
    channel: "candidate",
    href: COMPANY_CANDIDATE_CHAT_PATH,
    icon: PeopleAltOutlined,
    labelKey: "candidate",
  },
];

const CompanyChatTopNav: React.FC<CompanyChatTopNavProps> = ({ activeChannel }) => {
  const { t } = useTranslation("modules/company/companyChat");
  const { teamChatUnread, candidateChatUnread } = useChatUnreadBadges();
  const unreadByChannel: Record<CompanyChatChannel, number> = {
    team: teamChatUnread,
    candidate: candidateChatUnread,
  };
  const teamDense = activeChannel === "team";

  return (
    <Paper
      elevation={0}
      sx={{
        ...companyChatSx.hubHeader,
        ...(teamDense ? companyChatSx.hubHeaderTeamDense : {}),
      }}
    >
      <Box sx={companyChatSx.hubIntro}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: teamDense ? 1.25 : 1.5,
            minWidth: 0,
            mt: 0.25,
          }}
        >
          {teamDense && (
            <Box aria-hidden sx={companyChatSx.teamTitleIconWrap}>
              <GroupsRounded sx={{ fontSize: 20 }} />
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                ...companyChatSx.hubTitle,
                ...(teamDense ? companyChatSx.hubTitleTeamDense : {}),
              }}
            >
              {t(`channels.${activeChannel}.title`)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={companyChatSx.hubNavWrap}>
        <Box sx={chatSegmentedControlSx.root}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeChannel === item.channel;
            const unread = unreadByChannel[item.channel];

            return (
              <Box
                key={item.channel}
                component={NextLink}
                href={item.href}
                sx={{
                  ...chatSegmentedControlSx.item,
                  ...(isActive ? chatSegmentedControlSx.itemActive : {}),
                }}
              >
                <Icon sx={chatSegmentedControlSx.icon} />
                <Typography component="span" sx={chatSegmentedControlSx.label}>
                  {t(`top_nav.${item.labelKey}`)}
                </Typography>
                {unread > 0 && (
                  <Box component="span" sx={chatSegmentedControlSx.badge}>
                    {unread > 9 ? "9+" : unread}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
};

export default CompanyChatTopNav;
