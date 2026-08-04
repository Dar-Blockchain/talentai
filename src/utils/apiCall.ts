import axios, { type AxiosError } from "axios";

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const d = (err as AxiosError<{ message?: string; error?: string }>).response?.data;
    return d?.message ?? d?.error ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

export async function apiCall<T>(fn: () => Promise<T>, fallback: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw new Error(extractMessage(err, fallback));
  }
}
