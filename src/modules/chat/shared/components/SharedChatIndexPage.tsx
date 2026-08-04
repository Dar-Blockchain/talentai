import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { MessageCircle as ChatOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t }         = useTranslation("shared/chat");
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 min-h-[300px]">
        {loading ? (
          <Spinner style={{ color: T }} />
        ) : conversations.length === 0 ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: TBG, border: `1px solid ${TBORDER}` }}>
              <ChatOutlined size={30} color={T} />
            </div>
            <p className="text-[15px] font-bold text-[#111827]">{t("index.no_conversations")}</p>
            <p className="max-w-[300px] text-center text-[13px] text-[#6B7280]">
              {emptyText}
            </p>
          </>
        ) : (
          <Spinner style={{ color: T }} />
        )}
      </div>
    </Layout>
  );
};

export default SharedChatIndexPage;
