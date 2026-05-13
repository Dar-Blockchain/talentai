export const resolveMessagePayload = <TMessage>(
  payload:
    | TMessage
    | {
        message: TMessage;
        viewerUserId: string;
        viewerIsViewingConversation?: boolean;
      },
) => {
  if (typeof payload === "object" && payload !== null && "message" in payload) {
    return {
      message: payload.message,
      viewerUserId: payload.viewerUserId,
      viewerIsViewingConversation: payload.viewerIsViewingConversation,
    };
  }

  return {
    message: payload,
    viewerUserId: undefined as string | undefined,
    viewerIsViewingConversation: undefined as boolean | undefined,
  };
};
