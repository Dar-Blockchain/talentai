import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, CircularProgress } from "@mui/material";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import { RootState, AppDispatch } from "@/store/store";
import { fetchConversations, selectConversations, selectConversationsLoading } from "@/store/slices/chatSlice";

const T       = "#0D9488";
const TBG     = "#F0FDFA";
const TBORDER = "#99F6E4";

interface Props {
  basePath: string;
  emptyText: string;
  layout: React.FC<{ children: React.ReactNode }>;
}

const SharedChatIndexPage: React.FC<Props> = ({ basePath, emptyText, layout: Layout }) => {
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
      router.replace(`${basePath}/${conversations[0]._id}`);
  }, [loading, conversations]);

  return (
    <Layout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 2 }}>
        {loading ? (
          <CircularProgress sx={{ color: T }} />
        ) : conversations.length === 0 ? (
          <>
            <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: TBG, border: `1px solid ${TBORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChatOutlined sx={{ fontSize: 30, color: T }} />
            </Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>No conversations yet</Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280", textAlign: "center", maxWidth: 300 }}>
              {emptyText}
            </Typography>
          </>
        ) : (
          <CircularProgress sx={{ color: T }} />
        )}
      </Box>
    </Layout>
  );
};

export default SharedChatIndexPage;
