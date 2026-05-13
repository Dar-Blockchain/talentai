import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { selectCandidateConversations, selectCandidateTotalUnread } from "@/modules/candidate-chat/store/candidateChatSlice";
import { selectTeamConversations, selectTeamTotalUnread } from "@/modules/team-chat/store/teamChatSlice";
import { sumConversationUnread } from "@/modules/shared/chat/unread/selectors";
import { useChatUnreadQuerySync } from "@/modules/shared/chat/hooks/useChatUnreadQuerySync";

export const useChatUnreadBadges = () => {
  useChatUnreadQuerySync();

  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const teamConversations = useSelector(selectTeamConversations);
  const candidateConversations = useSelector(selectCandidateConversations);
  const teamTotalUnread = useSelector(selectTeamTotalUnread);
  const candidateTotalUnread = useSelector(selectCandidateTotalUnread);

  const teamConversationUnread = sumConversationUnread(teamConversations);
  const candidateConversationUnread = sumConversationUnread(candidateConversations);
  const teamChatUnread = Math.max(teamTotalUnread, teamConversationUnread);
  const candidateChatUnread = Math.max(candidateTotalUnread, candidateConversationUnread);
  const companyMessagesUnread = teamChatUnread + candidateChatUnread;

  const activeModuleUnread = role === "Employee"
    ? teamChatUnread
    : role === "Candidate"
      ? candidateChatUnread
      : role === "Company"
        ? companyMessagesUnread
        : 0;

  return {
    role,
    teamChatUnread,
    candidateChatUnread,
    companyMessagesUnread,
    activeModuleUnread,
  };
};
