import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { RootState, AppDispatch, store } from "@/store/store";
import { emitToast } from "@/utils/toastEmitter";
import { addTeamMessage } from "@/modules/team-chat/store/teamChatSlice";
import { teamChatKeys } from "@/modules/team-chat/queries/keys";
import { useTeamConversationsQuery } from "@/modules/team-chat/queries/useTeamChatQueries";
import {
  connectTeamChatSocket,
  disconnectTeamChatSocket,
  getTeamChatSocket,
} from "@/modules/team-chat/realtime/teamChatSocket";
import { toChatShellMessage } from "@/modules/team-chat/utils/mappers";

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
};

export const useTeamChatRealtime = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const currentUserId = currentUser?._id;
  const isTeamChatUser = currentUser?.role === "Company" || currentUser?.role === "Employee";

  useTeamConversationsQuery(undefined, { enabled: isTeamChatUser && !!currentUserId });

  useEffect(() => {
    if (!isTeamChatUser || !currentUserId) {
      disconnectTeamChatSocket();
      return;
    }

    const socket = connectTeamChatSocket(currentUserId);
    if (!socket) return;

    const handleIncomingMessage = (payload: { message: any; conversationId: string }) => {
      const normalized = toChatShellMessage({
        ...payload.message,
        conversationId: payload.conversationId || payload.message?.conversationId,
      });
      const senderId = String(normalized.sender._id);
      const isIncoming = senderId !== String(currentUserId);
      const activeConversationId = store.getState().teamChat.currentConversation?._id || null;
      const isActiveConversation = String(payload.conversationId) === String(activeConversationId);
      const alreadyVisible = store.getState().teamChat.messages.some(
        (message) => String(message._id) === String(normalized._id),
      );

      if (!isIncoming && alreadyVisible) return;

      dispatch(addTeamMessage({
        message: normalized,
        viewerUserId: String(currentUserId),
      }));

      if (!isIncoming || isActiveConversation) return;

      playNotificationSound();
      const preview = normalized.text?.trim();
      emitToast({
        severity: "info",
        message: preview
          ? `New team message: ${preview.length > 80 ? `${preview.slice(0, 80)}...` : preview}`
          : "You have a new team message.",
      });

      queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
    };

    socket.on("new_team_message", handleIncomingMessage);

    return () => {
      socket.off("new_team_message", handleIncomingMessage);
    };
  }, [currentUserId, dispatch, isTeamChatUser, queryClient]);

  useEffect(() => () => {
    if (!isTeamChatUser) disconnectTeamChatSocket();
  }, [isTeamChatUser]);
};

export const useTeamChatConversationRoom = (conversationId: string | null) => {
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const isTeamChatUser = currentUser?.role === "Company" || currentUser?.role === "Employee";

  useEffect(() => {
    if (!isTeamChatUser || !currentUser?._id || !conversationId) return;

    connectTeamChatSocket(currentUser._id);
    const socket = getTeamChatSocket();
    if (!socket) return;

    const joinRoom = () => {
      socket.emit("join_team_conversation", { conversationId });
    };

    joinRoom();
    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
      socket.emit("leave_team_conversation", { conversationId });
    };
  }, [conversationId, currentUser?._id, isTeamChatUser]);
};
