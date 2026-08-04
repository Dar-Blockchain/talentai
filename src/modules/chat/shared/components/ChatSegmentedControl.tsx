import React from "react";
import { cn } from "@/lib/utils";
import { chatSegmentedControlCn } from "@/modules/chat/shared/styles/segmentedControl";
import { TEAM_MINT_UI } from "@/modules/chat/shared/constants/teamMintUi";

export interface ChatSegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface ChatSegmentedControlProps<T extends string> {
  value: T;
  options: ChatSegmentedOption<T>[];
  onChange: (value: T) => void;
  /** Stretch control to fill row (e.g. team tabs above chat). */
  fullWidth?: boolean;
  /** Team chat: align with light mint shell (#F8FAFC / soft green active). */
  mintLightTeamUi?: boolean;
}

function ChatSegmentedControl<T extends string>({
  value,
  options,
  onChange,
  fullWidth = false,
  mintLightTeamUi = false,
}: ChatSegmentedControlProps<T>) {
  const rootClass = cn(
    chatSegmentedControlCn.root,
    mintLightTeamUi && "rounded-[14px] gap-1 p-[3.6px]",
    fullWidth && "w-full flex-nowrap",
  );
  const rootStyle: React.CSSProperties = mintLightTeamUi
    ? { backgroundColor: TEAM_MINT_UI.bgMain, border: `1px solid ${TEAM_MINT_UI.border}`, boxShadow: TEAM_MINT_UI.shadowSoft }
    : {};

  return (
    <div className={rootClass} style={rootStyle}>
      {options.map((option) => {
        const isActive = value === option.value;
        const itemClass = mintLightTeamUi
          ? cn(
              "inline-flex items-center justify-center gap-2 rounded-xl px-3 sm:px-3.5 py-3 no-underline border border-transparent transition-all cursor-pointer bg-transparent",
              "hover:bg-[var(--mint-hover-bg)] hover:text-[var(--mint-hover-color)] hover:shadow-[var(--mint-hover-shadow)]",
              fullWidth && "flex-1 min-w-0",
              isActive && "border-[rgba(52,211,153,0.35)] shadow-none",
            )
          : cn(
              chatSegmentedControlCn.item,
              fullWidth && "flex-1 min-w-0",
              isActive && chatSegmentedControlCn.itemActive,
            );
        const itemStyle: React.CSSProperties = mintLightTeamUi
          ? {
              color: isActive ? TEAM_MINT_UI.textPrimary : TEAM_MINT_UI.textSecondary,
              transition: TEAM_MINT_UI.transition,
              backgroundColor: isActive ? TEAM_MINT_UI.primarySoft : undefined,
              ["--mint-hover-bg" as string]: TEAM_MINT_UI.bgCard,
              ["--mint-hover-color" as string]: TEAM_MINT_UI.textPrimary,
              ["--mint-hover-shadow" as string]: TEAM_MINT_UI.shadowSoft,
            }
          : {};

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={itemClass}
            style={itemStyle}
          >
            <span className={chatSegmentedControlCn.label}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ChatSegmentedControl;
