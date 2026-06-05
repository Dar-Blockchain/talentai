"use client";
import React, { useState, useMemo, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import UserDropdownMenu from "./UserDropdownMenu";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/router";
import LogoutProgressModal from "@/components/ui/LogoutProgressModal";

interface UserAvatarProps {
  showDropdown?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ showDropdown = true }) => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loggingOut, setLoggingOut] = useState(false);
  const [open, setOpen] = useState(false);

  const { user, profile } = useSelector((s: RootState) => s.user.connectedUser);

  const isCompany   = useMemo(() => user?.role === "Company",   [user?.role]);
  const isEmployee  = useMemo(() => user?.role === "Employee",  [user?.role]);
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
    const img = profile?.user_image || user?.user_image || (profile as any)?.userId?.user_image;
    return img ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${img}` : null;
  }, [profile?.user_image, (profile as any)?.userId?.user_image, user?.user_image]);

  const initials = useMemo(() => {
    if (isCompany) return (displayName)[0].toUpperCase();
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
    if (user?.role === "Admin")         router.push("/admin/dashboard");
    else if (user?.role === "Employee") router.push("/employee/dashboard");
    else if (isCompany)                 router.push("/company/dashboard");
    else                                router.push("/candidate/dashboard");
  }, [user?.role, isCompany, router]);

  const triggerBtn = (
    <div className="flex items-center gap-0.5 cursor-pointer border border-gray-200 rounded-[9px] px-1.5 py-[3px] bg-transparent hover:bg-gray-50 hover:border-gray-300 transition-colors select-none">
      <div className="relative shrink-0">
        <Avatar className="size-[26px] rounded-[8px] border-[1.5px] border-white/90">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="text-[10px] font-bold bg-teal-600 text-white rounded-[8px]">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-green-500 border-[1.5px] border-white" />
      </div>
      <span
        className="text-[12.5px] font-semibold text-gray-900 leading-none tracking-tight truncate"
        style={{ maxWidth: isCompany ? 160 : 96 }}
      >
        {shortName}
      </span>
      {showDropdown && (
        <ChevronDown className={cn("size-3.5 text-gray-400 transition-transform shrink-0", open && "rotate-180")} />
      )}
    </div>
  );

  return (
    <>
      {showDropdown ? (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            {triggerBtn}
          </DropdownMenuTrigger>
          <UserDropdownMenu
            displayName={displayName} email={user?.email}
            avatarUrl={avatarUrl} initials={initials}
            isCompany={isCompany} isEmployee={isEmployee} isCandidate={isCandidate}
            onDashboard={() => { goToDashboard(); setOpen(false); }}
            onLogout={handleLogout}
          />
        </DropdownMenu>
      ) : (
        <div onClick={goToDashboard}>{triggerBtn}</div>
      )}
      <LogoutProgressModal open={loggingOut} />
    </>
  );
};

export default UserAvatar;
