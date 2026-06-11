import React from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/modules/shared/ui/shadcn/navigation-menu";
import { Sparkles, ListChecks, Briefcase, Mail, ChevronRight } from "lucide-react";

type NavItem = { label: string; id?: string; href?: string };

const NAV_ICON_MAP: Record<string, React.ElementType> = {
  features:   Sparkles,
  howitworks: ListChecks,
  contact:    Mail,
  "/posts/":  Briefcase,
};

interface HeaderNavMenuProps {
  direction?: "row" | "column";
  inverted?: boolean;
}

const HeaderNavMenu: React.FC<HeaderNavMenuProps> = ({ direction = "row", inverted = false }) => {
  const { t }    = useTranslation("home");
  const router   = useRouter();
  const userType = useSelector((state: RootState) => state.user.userType) ?? "candidate";

  const getNavItems = (): NavItem[] => {
    if (userType === "company") return [
      { label: t("nav.features"),     id: "features"   },
      { label: t("nav.how_it_works"), id: "howitworks" },
    ];
    if (userType === "candidate") return [
      { label: t("nav.find_jobs"),    href: "/posts/"   },
      { label: t("nav.how_it_works"), id: "howitworks" },
    ];
    return [
      { label: t("nav.features"), id: "features" },
      { label: t("nav.contact"),  id: "contact"  },
    ];
  };

  const items = getNavItems();

  const HEADER_OFFSET = 96;

  const handleNavClick = (item: NavItem) => {
    if (item.id) {
      const el = document.getElementById(item.id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top, behavior: "smooth" });
      } else {
        router.push(`/#${item.id}`);
      }
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const isActive = (item: NavItem) => {
    if (item.href) return router.pathname === item.href;
    return false;
  };

  // ── Column layout (mobile drawer) ────────────────────────────────────────────
  if (direction === "column") {
    return (
      <div className="flex flex-col gap-0.5 w-full">
        {items.map((item) => {
          const active = isActive(item);
          const Icon   = NAV_ICON_MAP[item.id ?? item.href ?? ""] ?? Sparkles;
          return (
            <button
              key={item.id || item.href}
              type="button"
              onClick={() => handleNavClick(item)}
              className={cn(
                "group flex items-center gap-2.5 w-full text-left",
                "px-2 py-[9px] rounded-[10px] cursor-pointer",
                "transition-all duration-150",
                active ? "bg-primary/[0.07]" : "hover:bg-primary/[0.07]"
              )}
            >
              <span className={cn(
                "w-8 h-8 rounded-[9px] flex-shrink-0",
                "flex items-center justify-center border transition-colors duration-150",
                "[&>svg]:w-[15px] [&>svg]:h-[15px]",
                active
                  ? "bg-gray-200 border-gray-300 [&>svg]:text-gray-700"
                  : "bg-gray-100 border-gray-200 [&>svg]:text-gray-400 group-hover:bg-gray-200 group-hover:border-gray-300 group-hover:[&>svg]:text-gray-600"
              )}>
                <Icon />
              </span>
              <span className={cn(
                "font-sans text-[13.5px] flex-1",
                active ? "font-semibold text-primary" : "font-medium text-gray-700"
              )}>
                {item.label}
              </span>
              <ChevronRight className={cn(
                "w-3.5 h-3.5 flex-shrink-0 transition-all duration-150",
                active
                  ? "text-primary/50"
                  : "text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
              )} />
            </button>
          );
        })}
      </div>
    );
  }

  // ── Row layout (desktop header) ───────────────────────────────────────────────
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="gap-0.5">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <NavigationMenuItem key={item.id || item.href}>
              <NavigationMenuLink
                onClick={() => handleNavClick(item)}
                data-active={active}
                className={cn(
                  // shape & spacing
                  "relative cursor-pointer rounded-[10px] px-[14px] py-[6px]",
                  // text
                  "text-[13.5px] tracking-[0.01em] flex-col gap-0",
                  // animated underline bar
                  "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2",
                  "after:w-[60%] after:h-0.5 after:rounded-sm after:bg-primary",
                  "after:origin-center",
                  "after:transition-transform after:duration-[220ms] after:ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  // weight via data-active
                  "data-[active=true]:font-[650] data-[active=false]:font-medium",
                  // underline via data-active + hover
                  "data-[active=true]:after:scale-x-100 data-[active=false]:after:scale-x-0 hover:after:scale-x-100",
                  // colour — inactive
                  inverted
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-gray-500 hover:text-foreground",
                  // colour — active (override shadcn accent defaults)
                  inverted
                    ? "data-[active=true]:text-foreground data-[active=true]:hover:text-foreground"
                    : "data-[active=true]:text-foreground data-[active=true]:hover:text-foreground",
                  // background (override shadcn accent defaults)
                  "hover:bg-primary/10",
                  "data-[active=true]:bg-primary/10 data-[active=true]:hover:bg-primary/10",
                )}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default HeaderNavMenu;
