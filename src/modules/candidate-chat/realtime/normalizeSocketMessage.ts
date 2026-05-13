import type { CandidateMessage } from "@/modules/candidate-chat/types";
import { toChatShellMessage } from "@/modules/candidate-chat/utils/mappers";

type CandidateSocketPayload =
  | CandidateMessage
  | {
      message?: CandidateMessage;
      conversationId?: string;
    };

export const normalizeCandidateSocketMessage = (payload: CandidateSocketPayload) => {
  const source = payload && typeof payload === "object" && "message" in payload
    ? payload.message
    : payload;

  const messageSource = source as CandidateMessage | undefined;
  const conversationId =
    (payload && typeof payload === "object" && "conversationId" in payload
      ? payload.conversationId
      : undefined)
    || messageSource?.conversationId
    || messageSource?.conversation;

  return toChatShellMessage({
    ...(messageSource || {}),
    conversationId,
  } as CandidateMessage);
};
