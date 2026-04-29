import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, CircularProgress } from "@mui/material";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import Header from "@/components/layout/Header";
import { RootState, AppDispatch } from "@/store/store";
import { fetchConversations, selectConversations, selectConversationsLoading } from "@/store/slices/chatSlice";

const PURPLE        = "#8310FF";
const PURPLE_BG     = "rgba(131,16,255,0.06)";
const PURPLE_BORDER = "rgba(131,16,255,0.2)";

const ChatIndexPage: React.FC = () => {
  const router        = useRouter();
  const dispatch      = useDispatch<AppDispatch>();
  const currentUserId = useSelector((state: RootState) => state.user?.connectedUser?.user?._id);
  const conversations = useSelector(selectConversations);
  const loading       = useSelector(selectConversationsLoading);

  useEffect(() => {
    if (currentUserId) dispatch(fetchConversations(undefined));
  }, [currentUserId, dispatch]);

  useEffect(() => {
    if (!loading && conversations.length > 0)
      router.replace(`/chat/${conversations[0]._id}`);
  }, [loading, conversations]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "rgba(251,254,255,1)" }}>
      <Header />
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100vh - 64px)", gap: 2 }}>
        {loading ? (
          <CircularProgress sx={{ color: PURPLE }} />
        ) : conversations.length === 0 ? (
          <>
            <Box sx={{
              width: 72, height: 72, borderRadius: "50%",
              bgcolor: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ChatOutlined sx={{ fontSize: 36, color: PURPLE }} />
            </Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>No conversations yet</Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280", textAlign: "center", maxWidth: 300 }}>
              Start chatting by contacting a company or candidate.
            </Typography>
          </>
        ) : (
          <CircularProgress sx={{ color: PURPLE }} />
        )}
      </Box>
    </Box>
  );
};

export default ChatIndexPage;
