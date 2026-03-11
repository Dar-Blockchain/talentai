import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchConversations, selectConversations, selectConversationsLoading } from "@/store/slices/chatSlice";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { Box, Typography, CircularProgress } from "@mui/material";
import ChatOutlined from "@mui/icons-material/ChatOutlined";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const CompanyMessagesIndexPage: React.FC = () => {
  const router      = useRouter();
  const dispatch    = useDispatch<AppDispatch>();
  const connectedUser = useSelector((state: RootState) => state.user?.connectedUser?.user);
  const currentUserId = connectedUser?._id;
  const conversations = useSelector(selectConversations);
  const loading       = useSelector(selectConversationsLoading);

  useEffect(() => {
    if (currentUserId) dispatch(fetchConversations(undefined));
  }, [currentUserId, dispatch]);

  // Auto-redirect to the first conversation if available
  useEffect(() => {
    if (!loading && conversations.length > 0) {
      router.replace(`/company/messages/${conversations[0]._id}`);
    }
  }, [loading, conversations]);

  return (
      <DashboardLayout>
        <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ChatOutlined sx={{ fontSize: 20, color: TEAL }} />
            </Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Messages</Typography>
          </Box>

          {loading ? (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress sx={{ color: TEAL }} />
            </Box>
          ) : conversations.length === 0 ? (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: "50%",
                bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ChatOutlined sx={{ fontSize: 36, color: TEAL }} />
              </Box>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>No conversations yet</Typography>
              <Typography sx={{ fontSize: "13px", color: "#6B7280", textAlign: "center", maxWidth: 300 }}>
                Contact a candidate from a job post to start a conversation.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress sx={{ color: TEAL }} />
            </Box>
          )}
        </Box>
      </DashboardLayout>
  );
};

export default CompanyMessagesIndexPage;
