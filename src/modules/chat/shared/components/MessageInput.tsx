import React, { memo, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { Send as SendRounded } from "lucide-react";
import { useTranslation } from "react-i18next";

const PRIMARY = "#0D9488";
const PRIMARY_DARK = "#0F766E";

interface MessageInputProps {
  /** Called with the trimmed message text when the user sends. Reject the returned Promise to restore the input value on failure. */
  onSend: (text: string) => Promise<void>;
  sending: boolean;
  /** Tighter footer padding (e.g. team chat in dashboard frame). */
  compact?: boolean;
  /** Team chat: light mint composer chrome. */
  mintLightTeamUi?: boolean;
}

const MAX_ROWS = 5;
const LINE_HEIGHT_PX = 20;

const MessageInput = memo(function MessageInput({
  onSend,
  sending,
  compact = false,
  mintLightTeamUi = false,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const { t } = useTranslation("shared/chat");
  const canSend = !!value.trim() && !sending;
  const mintPrimary = "#34D399";
  const mintPrimaryHover = "#10B981";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep a ref in sync so handleSend can read the latest value without
  // including `value` in its dep array (which would recreate it on every keystroke).
  const valueRef = useRef(value);
  valueRef.current = value;

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const maxHeight = LINE_HEIGHT_PX * MAX_ROWS;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  const handleSend = useCallback(async () => {
    const text = valueRef.current.trim();
    if (!text || sending) return;
    setValue("");
    requestAnimationFrame(resizeTextarea);
    try {
      await onSend(text);
    } catch {
      setValue(text);
    }
  }, [sending, onSend, resizeTextarea]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    resizeTextarea();
  }, [resizeTextarea]);

  const handleSendClick = useCallback(() => { void handleSend(); }, [handleSend]);

  return (
    <footer
      className={cn(
        "shrink-0 sticky bottom-0 z-[3] border-t transition-[box-shadow,border-color] duration-[280ms]",
        "hover:[box-shadow:var(--footer-hover-shadow)] hover:[border-top-color:var(--footer-hover-border)]",
        compact ? "px-3 sm:px-3.5 pt-2 sm:pt-2.5 pb-1.5 sm:pb-2" : "px-3.5 sm:px-4 py-3",
      )}
      style={{
        borderColor: mintLightTeamUi ? "#E5E7EB" : "#E5E7EB",
        backgroundColor: mintLightTeamUi ? "#FFFFFF" : "#fff",
        backgroundImage: mintLightTeamUi ? "none" : "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #fff 100%)",
        ["--footer-hover-shadow" as string]: mintLightTeamUi ? "0 -6px 24px rgba(15, 23, 42, 0.05)" : "0 -8px 28px rgba(0,0,0,0.06)",
        ["--footer-hover-border" as string]: mintLightTeamUi ? "rgba(52, 211, 153, 0.25)" : `${PRIMARY}33`,
      }}
    >
      <div className="flex flex-row items-end gap-2.5">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t("input.placeholder")}
          disabled={sending}
          rows={1}
          className={cn(
            "flex-1 resize-none overflow-hidden border px-3.5 py-2 text-[0.8125rem] leading-[1.45] outline-none transition-colors",
            "placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60",
            "focus:[box-shadow:var(--ta-focus-shadow)] focus:[border-color:var(--ta-focus-border)]",
            mintLightTeamUi ? "rounded-[18px]" : "rounded-[22px]",
          )}
          style={{
            backgroundColor: mintLightTeamUi ? "#F8FAFC" : "#F3F4F6E6",
            borderColor: mintLightTeamUi ? "#E5E7EB" : "#E5E7EBE6",
            ["--ta-focus-shadow" as string]: mintLightTeamUi ? "0 0 0 3px rgba(52, 211, 153, 0.2)" : `0 0 0 3px ${PRIMARY}2E`,
            ["--ta-focus-border" as string]: mintLightTeamUi ? mintPrimary : PRIMARY,
          }}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <button
                  onClick={handleSendClick}
                  disabled={!canSend}
                  aria-label={t("input.send")}
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white transition-[transform,background-color,box-shadow] duration-200",
                    "active:scale-[0.98] disabled:cursor-not-allowed",
                    canSend && "hover:-translate-y-px hover:scale-[1.06] hover:[background-color:var(--send-hover-bg)] hover:[box-shadow:var(--send-hover-shadow)]",
                  )}
                  style={{
                    backgroundColor: canSend ? (mintLightTeamUi ? mintPrimary : PRIMARY) : "#E5E7EB80",
                    boxShadow: canSend
                      ? (mintLightTeamUi ? "0 4px 16px rgba(52, 211, 153, 0.35)" : `0 4px 14px ${PRIMARY}59`)
                      : "none",
                    color: canSend ? "#fff" : "#9CA3AF",
                    ["--send-hover-bg" as string]: mintLightTeamUi ? mintPrimaryHover : PRIMARY_DARK,
                    ["--send-hover-shadow" as string]: mintLightTeamUi ? "0 8px 22px rgba(16, 185, 129, 0.38)" : `0 8px 22px ${PRIMARY}6B`,
                  }}
                >
                  {sending ? (
                    <Spinner className="size-5" style={{ color: "inherit" }} />
                  ) : (
                    <SendRounded size={22} />
                  )}
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{t("input.send")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
});

export default MessageInput;
