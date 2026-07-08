import React from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";
import { Users as GroupsOutlined, Users as GroupsRounded, UserCircle as PeopleAltOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useChatUnreadBadges } from "@/modules/chat/shared/hooks/useChatUnreadBadges";
import {
  COMPANY_CANDIDATE_CHAT_PATH,
  COMPANY_TEAM_CHAT_PATH,
  type CompanyChatChannel,
} from "@/modules/chat/shared/constants/companyChannels";
import { companyChatCn } from "@/modules/chat/shared/styles/companyChat";
import { chatSegmentedControlCn } from "@/modules/chat/shared/styles/segmentedControl";

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
    <div className={cn(companyChatCn.hubHeader, teamDense && companyChatCn.hubHeaderTeamDense)}>
      <div className={companyChatCn.hubIntro}>
        <div className="flex min-w-0 items-center gap-3 mt-0.5">
          <div aria-hidden className={companyChatCn.teamTitleIconWrap}>
            {activeChannel === "team"
              ? <GroupsRounded size={20} />
              : <PeopleAltOutlined size={20} />}
          </div>
          <div className="min-w-0">
            <p className={cn(companyChatCn.hubTitle, teamDense && companyChatCn.hubTitleTeamDense)}>
              {t(`channels.${activeChannel}.title`)}
            </p>
          </div>
        </div>
      </div>

      <div className={companyChatCn.hubNavWrap}>
        <div className={chatSegmentedControlCn.root}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeChannel === item.channel;
            const unread = unreadByChannel[item.channel];

            return (
              <NextLink
                key={item.channel}
                href={item.href}
                className={cn(chatSegmentedControlCn.item, isActive && chatSegmentedControlCn.itemActive)}
              >
                <Icon size={18} color="inherit" />
                <span className={chatSegmentedControlCn.label}>
                  {t(`top_nav.${item.labelKey}`)}
                </span>
                {unread > 0 && (
                  <span className={chatSegmentedControlCn.badge}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </NextLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompanyChatTopNav;
