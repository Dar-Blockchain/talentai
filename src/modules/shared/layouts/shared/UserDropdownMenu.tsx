"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setUserType } from "@/store/slices/userSlice";
import { LayoutDashboard, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/modules/shared/ui/shadcn/avatar";

interface UserDropdownMenuProps {
  onLogout?:    () => void;
  displayName?: string;
  email?:       string;
  avatarUrl?:   string | null;
  initials?:    string;
  isCompany?:   boolean;
  isEmployee?:  boolean;
  isCandidate?: boolean;
  onDashboard?: () => void;
  onClose?:     () => void;
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({
  onLogout,
  displayName = "User",
  email,
  avatarUrl,
  initials   = "U",
  isCompany   = false,
  isEmployee  = false,
  isCandidate = false,
  onDashboard,
  onClose,
}) => {
  const { t }    = useTranslation("common");
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();

  const { user } = useSelector((state: RootState) => state.user.connectedUser);

  const go = (path: string) => { router.push(path); onClose?.(); };

  const handleLogout = () => {
    dispatch(setUserType(isCompany ? "company" : "candidate"));
    onLogout?.();
    onClose?.();
  };

  return (
    <DropdownMenuContent
      align="end"
      sideOffset={8}
      className="min-w-[220px] rounded-[14px] p-0 overflow-hidden border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.08),_0_2px_6px_rgba(0,0,0,0.04)]"
    >
      {/* ── User header ── */}
      <DropdownMenuLabel className="px-3.5 pt-3.5 pb-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 rounded-full flex-shrink-0">
            <AvatarImage src={avatarUrl || undefined} className="rounded-full" />
            <AvatarFallback className="rounded-full bg-primary text-primary-foreground text-[13px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[13.5px] font-bold text-foreground truncate leading-tight">{displayName}</p>
            {email && <p className="text-[11.5px] text-muted-foreground truncate mt-0.5">{email}</p>}
          </div>
        </div>
      </DropdownMenuLabel>

      {/* ── Navigation items ── */}
      <div className="py-1.5 px-1">
        <DropdownMenuItem
          onClick={() => { onDashboard?.(); onClose?.(); }}
          className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-[7px] cursor-pointer focus:bg-gray-100 focus:text-foreground"
        >
          <span className="size-[30px] rounded-[10px] flex-shrink-0 flex items-center justify-center bg-gray-100 border border-gray-200">
            <LayoutDashboard className="size-[15px] text-gray-500" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-700 leading-tight">{t("header.dashboard")}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{t("header.go_to_workspace")}</p>
          </div>
        </DropdownMenuItem>

        {!isCompany && !isEmployee && !isCandidate && (
          <DropdownMenuItem
            onClick={() => go("/candidate/profile/" + user?._id)}
            className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-[7px] cursor-pointer focus:bg-gray-100 focus:text-foreground"
          >
            <span className="size-[30px] rounded-[10px] flex-shrink-0 flex items-center justify-center bg-gray-100 border border-gray-200">
              <User className="size-[15px] text-gray-500" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-gray-700 leading-tight">{t("header.view_profile")}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{t("header.public_profile")}</p>
            </div>
          </DropdownMenuItem>
        )}

        {!isEmployee && (
          <DropdownMenuItem
            onClick={() => go("/settings")}
            className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-[7px] cursor-pointer focus:bg-gray-100 focus:text-foreground"
          >
            <span className="size-[30px] rounded-[10px] flex-shrink-0 flex items-center justify-center bg-gray-100 border border-gray-200">
              <Settings className="size-[15px] text-gray-500" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-gray-700 leading-tight">{t("header.settings")}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{t("header.account_prefs")}</p>
            </div>
          </DropdownMenuItem>
        )}
      </div>

      {/* ── Logout ── */}
      <DropdownMenuSeparator className="my-0 bg-gray-100" />
      <div className="py-1.5 px-1">
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-[7px] cursor-pointer focus:bg-red-50"
        >
          <span className="size-[30px] rounded-[10px] flex-shrink-0 flex items-center justify-center bg-red-50 border border-red-200">
            <LogOut className="size-[15px] text-red-500" />
          </span>
          <p className="text-[13px] font-medium leading-tight">{t("header.logout")}</p>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  );
};

export default UserDropdownMenu;
