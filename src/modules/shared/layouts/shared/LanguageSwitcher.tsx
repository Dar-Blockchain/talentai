import React, { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { useLanguage, type LanguageOption } from "@/hooks/useLanguage";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";

interface Props {
  variant?:    "icon" | "full";
  size?:       "small" | "medium";
  standalone?: boolean;
}


const Flag: React.FC<{ code: string; label: string; size?: number }> = ({ code, label, size = 18 }) => (
  <Image
    src={`https://flagcdn.com/w80/${code}.png`}
    unoptimized
    width={size}
    height={Math.round(size * 0.72)}
    alt={label}
    className="rounded-[3px] block flex-shrink-0 object-cover shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
  />
);

const LanguageSwitcher: React.FC<Props> = ({ size = "small", standalone = false }) => {
  const { currentLang, changeLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);

  const select = async (lang: LanguageOption) => {
    setOpen(false);
    if (lang.code !== currentLang) await changeLanguage(lang.code);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "group inline-flex items-center justify-center rounded-lg cursor-pointer focus:outline-none transition-all duration-200",
            size === "small" ? "size-8" : "size-9",
            standalone
              ? cn(
                  "bg-gray-100 border border-gray-200",
                  "hover:bg-gray-200 hover:border-gray-300",
                  open && "bg-gray-200 border-gray-300",
                )
              : "bg-transparent hover:bg-black/[0.06]"
          )}
        >
          <span className="text-[15px] leading-none select-none text-gray-600 transition-transform duration-300 inline-block group-hover:rotate-[20deg]">
            文
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={7}
        className="w-[156px] p-1.5 rounded-xl bg-white border border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.10),_0_2px_6px_rgba(0,0,0,0.05)]"
      >
        {languages.map(lang => {
          const active = lang.code === currentLang;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => select(lang)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none transition-colors duration-100",
                active ? "bg-gray-100 focus:bg-gray-100" : "hover:bg-gray-50 focus:bg-gray-50"
              )}
            >
              <Flag code={lang.flag} label={lang.label} size={20} />
              <span className={cn(
                "flex-1 text-[13px]",
                active ? "font-semibold text-gray-900" : "font-normal text-gray-600"
              )}>
                {lang.label}
              </span>
              {active && <Check className="size-3 text-gray-500 flex-shrink-0" strokeWidth={2.5} />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
