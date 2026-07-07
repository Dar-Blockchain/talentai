import React from "react";
import NextLink from "next/link";
import { Box, Paper, Typography } from "@mui/material";
import { Users as GroupsOutlined, Users as GroupsRounded, UserCircle as PeopleAltOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useChatUnreadBadges } from "@/modules/chat/shared/hooks/useChatUnreadBadges";
import {
  COMPANY_CANDIDATE_CHAT_PATH,
  COMPANY_TEAM_CHAT_PATH,
  type CompanyChatChannel,
} from "@/modules/chat/shared/constants/companyChannels";
import { companyChatSx } from "@/modules/chat/shared/styles/companyChat";
import { chatSegmentedControlSx } from "@/modules/chat/shared/styles/segmentedControl";

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
    href: `${COMPANY_TEAM_CHAT_PATH}?ch=candidate`,
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
            gap: 1.25,
            minWidth: 0,
            mt: 0.25,
          }}
        >
          <Box aria-hidden sx={companyChatSx.teamTitleIconWrap}>
            {activeChannel === "team"
              ? <GroupsRounded size={20} />
              : <PeopleAltOutlined size={20} />}
          </Box>
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
                <Icon size={18} color="inherit" />
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
