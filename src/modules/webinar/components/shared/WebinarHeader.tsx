import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { SUPPORTED_LANGS } from "@/modules/shared/constants/languages";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";

const Flag: React.FC<{ code: string; label: string; size?: number }> = ({
  code,
  label,
  size = 20,
}) => (
  <Image
    src={`https://flagcdn.com/w80/${code}.png`}
    unoptimized
    width={size}
    height={Math.round(size * 0.72)}
    alt={label}
    className="rounded-[3px] block shrink-0 object-cover shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
  />
);

interface WebinarHeaderProps {
  /** Renders a "back to landing" button on the right instead of the CTA — used on the funnel step, which has no registration form of its own. */
  onBack?: () => void;
  backLabel?: string;
  /** Set false when an ancestor already provides fixed/sticky positioning (e.g. the funnel step's own fixed header wrapper). */
  sticky?: boolean;
  /** The webinar's active render language — drives every label in this header, not just the FR/EN toggle. */
  lang: "fr" | "en";
  /** Only set for a "both"-language webinar; renders the FR/EN toggle button. */
  onToggleLang?: () => void;
}

/**
 * Squeeze header for the webinar page: logo + a single optional CTA.
 * No nav menu, no login link, no hamburger drawer — every extra link is an exit
 * door away from registering.
 */
const WebinarHeader: React.FC<WebinarHeaderProps> = ({
  onBack,
  backLabel,
  sticky = true,
  lang,
  onToggleLang,
}) => {
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header
      className={`${sticky ? "sticky top-0 z-50" : ""} bg-white/95 backdrop-blur-sm border-b border-slate-100`}
    >
      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.svg"
            alt="TalentAI"
            width={129}
            height={36}
            className="h-6 sm:h-8 w-21.5 sm:w-28.75 object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onToggleLang && (
            <DropdownMenu
              open={langOpen}
              onOpenChange={setLangOpen}
              modal={false}
            >
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "inline-flex items-center justify-center rounded-lg cursor-pointer focus:outline-none transition-all duration-200 size-8 sm:size-9",
                    "bg-gray-100 border border-gray-200 hover:bg-gray-200 hover:border-gray-300",
                    langOpen && "bg-gray-200 border-gray-300",
                  )}
                >
                  <span className="text-[15px] leading-none select-none text-gray-600">
                    文
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={7}
                className="w-[156px] p-1.5 rounded-xl bg-white border border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.10),_0_2px_6px_rgba(0,0,0,0.05)]"
              >
                {SUPPORTED_LANGS.map((l) => {
                  const active = l.code === lang;
                  return (
                    <DropdownMenuItem
                      key={l.code}
                      onClick={() => {
                        setLangOpen(false);
                        if (!active) onToggleLang();
                      }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none transition-colors duration-100",
                        active
                          ? "bg-gray-100 focus:bg-gray-100"
                          : "hover:bg-gray-50 focus:bg-gray-50",
                      )}
                    >
                      <Flag code={l.flag} label={l.label} size={20} />
                      <span
                        className={cn(
                          "flex-1 text-[13px]",
                          active
                            ? "font-semibold text-gray-900"
                            : "font-normal text-gray-600",
                        )}
                      >
                        {l.label}
                      </span>
                      {active && (
                        <Check
                          className="size-3 text-gray-500 shrink-0"
                          strokeWidth={2.5}
                        />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-sans text-[13px] sm:text-[15px] leading-none font-medium tracking-[-0.01em] text-[#10453F] hover:text-[#6AD39C] transition-colors shrink-0"
            >
              <ArrowLeft size={15} className="shrink-0" />
              <span className="hidden sm:inline">{backLabel}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default WebinarHeader;
