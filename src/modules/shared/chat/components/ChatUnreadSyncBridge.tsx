import { useChatUnreadQuerySync } from "@/modules/shared/chat/hooks/useChatUnreadQuerySync";

const ChatUnreadSyncBridge = () => {
  useChatUnreadQuerySync();
  return null;
};

export default ChatUnreadSyncBridge;
