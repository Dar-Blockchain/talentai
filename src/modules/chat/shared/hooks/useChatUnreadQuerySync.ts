import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useCandidateUnreadCountQuery } from "@/modules/chat/candidate-chat/queries/useCandidateChatQueries";
import { useTeamUnreadCountQuery } from "@/modules/chat/team-chat/queries/useTeamChatQueries";

export const useChatUnreadQuerySync = () => {
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const role = currentUser?.role;
  const userId = currentUser?._id;

  const usesTeamChat = role === "Company" || role === "Employee";
  const usesCandidateChat = role === "Company" || role === "Candidate";

  useTeamUnreadCountQuery({ enabled: usesTeamChat && !!userId });
  useCandidateUnreadCountQuery({ enabled: usesCandidateChat && !!userId });
};
