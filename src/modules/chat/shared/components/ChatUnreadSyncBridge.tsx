import { useChatUnreadQuerySync } from "@/modules/chat/shared/hooks/useChatUnreadQuerySync";

const ChatUnreadSyncBridge = () => {
  useChatUnreadQuerySync();
  return null;
};

export default ChatUnreadSyncBridge;
