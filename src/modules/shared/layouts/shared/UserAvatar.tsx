"use client";
import React, { useState, useMemo, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/modules/shared/ui/shadcn/avatar";
import UserDropdownMenu from "./UserDropdownMenu";
import LogoutProgressModal from "@/components/ui/LogoutProgressModal";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  showDropdown?: boolean;
  hideLabel?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ showDropdown = true, hideLabel = false }) => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [open,       setOpen]       = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { user, profile } = useSelector((state: RootState) => state.user.connectedUser);

  const isAdmin     = useMemo(() => user?.role === "Admin",     [user?.role]);
  const isEmployee  = useMemo(() => user?.role === "Employee",  [user?.role]);
  const isCompany   = useMemo(() => user?.role === "Company",   [user?.role]);
  const isCandidate = useMemo(() => user?.role === "Candidate", [user?.role]);

  const displayName = useMemo(() => {
    if (isCompany) {
      return (
        (profile?.companyDetails?.name as string) ||
        (profile?.name as string) ||
        user?.username ||
        user?.email?.split("@")[0] ||
        "Company"
      );
    }
    const name = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
    return name || user?.username || user?.email?.split("@")[0] || "User";
  }, [isCompany, profile, user]);

  const shortName = useMemo(() => {
    if (isCompany) return displayName;
    const words = displayName.split(" ");
    return words.length >= 2 ? `${words[0]} ${words[1][0]}.` : displayName;
  }, [isCompany, displayName]);

  const avatarUrl = useMemo(() => {
    const img = profile?.user_image || user?.user_image || profile?.userId?.user_image;
    return img ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${img}` : null;
  }, [profile?.user_image, profile?.userId?.user_image, user?.user_image]);

  const initials = useMemo(() => {
    if (isCompany) return displayName[0].toUpperCase();
    const f = profile?.firstName?.[0] || "";
    const l = profile?.lastName?.[0]  || "";
    if (f || l) return (f + l).toUpperCase();
    return (user?.username || user?.email || "?")[0].toUpperCase();
  }, [isCompany, displayName, profile, user]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try { await dispatch(logout()).unwrap(); } catch {}
    router.push("/signin");
  }, [dispatch, router]);

  const goToDashboard = useCallback(() => {
    if (isAdmin)         router.push("/admin/dashboard");
    else if (isEmployee) router.push("/employee/dashboard");
    else if (isCompany)  router.push("/company/dashboard");
    else                 router.push("/candidate/dashboard");
  }, [isAdmin, isEmployee, isCompany, router]);

  return (
    <>
      <DropdownMenu open={open} onOpenChange={showDropdown ? setOpen : undefined} modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={!showDropdown ? goToDashboard : undefined}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-xl cursor-pointer",
              "bg-white/80 border border-gray-200/70 shadow-sm",
              "text-foreground transition-all duration-150",
              "hover:bg-white hover:border-primary/30 hover:shadow",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
          >
            {/* Avatar with online dot */}
            <div className="relative flex-shrink-0">
              <Avatar className="size-[26px] rounded-full">
                <AvatarImage src={avatarUrl || undefined} className="rounded-full" />
                <AvatarFallback className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Display name */}
            {!hideLabel && (
              <span className={cn(
                "text-xs font-medium text-foreground leading-none truncate",
                isCompany ? "max-w-40" : "max-w-24",
              )}>
                {shortName}
              </span>
            )}

            {/* Chevron */}
            {showDropdown && (
              <ChevronDown className={cn(
                "size-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200",
                open && "rotate-180",
              )} />
            )}
          </button>
        </DropdownMenuTrigger>

        {showDropdown && (
          <UserDropdownMenu
            onLogout={handleLogout}
            displayName={displayName}
            email={user?.email}
            avatarUrl={avatarUrl}
            initials={initials}
            isCompany={isCompany}
            isEmployee={isEmployee}
            isCandidate={isCandidate}
            onDashboard={goToDashboard}
            onClose={() => setOpen(false)}
          />
        )}
      </DropdownMenu>

      <LogoutProgressModal open={loggingOut} />
    </>
  );
};

export default UserAvatar;
