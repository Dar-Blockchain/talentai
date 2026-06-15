import { useMutation } from "@tanstack/react-query";
import { homeApi, type ContactPayload } from "../api";

export const useContactMutation = () =>
  useMutation({
    mutationFn: ({ payload, signal }: { payload: ContactPayload; signal?: AbortSignal }) =>
      homeApi.sendContact(payload, signal),
  });
