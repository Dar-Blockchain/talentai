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

type NavItem = { label: string; id?: string; href?: string };

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

  const handleNavClick = (item: NavItem) => {
    if (item.id) {
      const el = document.getElementById(item.id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else if (router.pathname.includes("/home")) router.push(`#${item.id}`);
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const isActive = (item: NavItem) => {
    if (item.href) return router.pathname === item.href;
    if (item.id && typeof window !== "undefined") return window.location.hash === `#${item.id}`;
    return false;
  };

  // ── Column layout (mobile drawer) ────────────────────────────────────────────
  if (direction === "column") {
    return (
      <NavigationMenu viewport={false} orientation="vertical" className="max-w-full w-full items-start">
        <NavigationMenuList className="flex-col items-start gap-0.5 w-full">
          {items.map((item) => (
            <NavigationMenuItem key={item.id || item.href} className="w-full">
              <NavigationMenuLink
                onClick={() => handleNavClick(item)}
                data-active={isActive(item)}
                className={cn(
                  "w-full cursor-pointer rounded-lg px-4 py-[10px]",
                  "text-sm flex-col gap-0",
                  "transition-colors duration-150",
                  isActive(item)
                    ? "font-bold text-foreground bg-primary/10 hover:bg-primary/10"
                    : "font-medium text-gray-700 hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
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
