import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { selectCandidateConversations, selectCandidateTotalUnread } from "@/modules/chat/candidate-chat/store/candidateChatSlice";
import { selectTeamConversations, selectTeamTotalUnread } from "@/modules/chat/team-chat/store/teamChatSlice";
import { sumConversationUnread } from "@/modules/chat/shared/unread/selectors";
import { useChatUnreadQuerySync } from "@/modules/chat/shared/hooks/useChatUnreadQuerySync";

export const useChatUnreadBadges = () => {
  useChatUnreadQuerySync();

  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const viewerId = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const vid = viewerId != null ? String(viewerId) : undefined;
  const teamConversations = useSelector(selectTeamConversations);
  const candidateConversations = useSelector(selectCandidateConversations);
  const teamTotalUnread = useSelector(selectTeamTotalUnread);
  const candidateTotalUnread = useSelector(selectCandidateTotalUnread);

  const teamConversationUnread = sumConversationUnread(teamConversations, vid);
  const candidateConversationUnread = sumConversationUnread(candidateConversations, vid);
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
