import React from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { LayoutDashboard, User, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setUserType } from "@/store/slices/userSlice";

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
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({
  onLogout, displayName = "User", email, avatarUrl, initials = "U",
  isCompany = false, isEmployee = false, isCandidate = false, onDashboard,
}) => {
  const { t }    = useTranslation("common");
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();
  const { user } = useSelector((s: RootState) => s.user.connectedUser);

  const handleLogout = () => {
    dispatch(setUserType(isCompany ? "company" : "candidate"));
    onLogout?.();
  };

  return (
    <DropdownMenuContent
      align="end"
      sideOffset={8}
      className="w-[220px] rounded-[14px] border border-gray-200 p-0 overflow-hidden"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04)" }}
    >
      {/* Profile header */}
      <div className="flex items-center gap-3 px-3.5 py-3 border-b border-gray-100 bg-gray-50/80">
        <Avatar className="size-9 rounded-[10px] shrink-0">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="text-[13px] font-bold bg-teal-600 text-white rounded-[10px]">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-gray-900 truncate leading-snug">{displayName}</p>
          {email && <p className="text-[11.5px] text-gray-400 truncate mt-0.5">{email}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="py-1.5">
        <DropdownMenuItem
          onSelect={() => onDashboard?.()}
          className="flex items-center gap-3 px-2.5 py-[7px] mx-1 rounded-[10px] cursor-pointer focus:bg-gray-100"
        >
          <div className="size-[30px] rounded-[10px] flex items-center justify-center bg-gray-100 border border-gray-200 shrink-0">
            <LayoutDashboard size={15} style={{ color: "#6B7280" }} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-700 leading-tight">{t("header.dashboard")}</p>
            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{t("header.go_to_workspace")}</p>
          </div>
        </DropdownMenuItem>

        {!isCompany && !isEmployee && !isCandidate && (
          <DropdownMenuItem
            onSelect={() => router.push("/candidate/profile/" + user?._id)}
            className="flex items-center gap-3 px-2.5 py-[7px] mx-1 rounded-[10px] cursor-pointer focus:bg-gray-100"
          >
            <div className="size-[30px] rounded-[10px] flex items-center justify-center bg-gray-100 border border-gray-200 shrink-0">
              <User size={15} style={{ color: "#6B7280" }} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-gray-700 leading-tight">{t("header.view_profile")}</p>
              <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{t("header.public_profile")}</p>
            </div>
          </DropdownMenuItem>
        )}

        {!isEmployee && (
          <DropdownMenuItem
            onSelect={() => router.push("/settings")}
            className="flex items-center gap-3 px-2.5 py-[7px] mx-1 rounded-[10px] cursor-pointer focus:bg-gray-100"
          >
            <div className="size-[30px] rounded-[10px] flex items-center justify-center bg-gray-100 border border-gray-200 shrink-0">
              <Settings size={15} style={{ color: "#6B7280" }} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-gray-700 leading-tight">{t("header.settings")}</p>
              <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{t("header.account_prefs")}</p>
            </div>
          </DropdownMenuItem>
        )}
      </div>

      <DropdownMenuSeparator className="bg-gray-100 my-0" />

      <div className="py-1.5">
        <DropdownMenuItem
          onSelect={handleLogout}
          className="flex items-center gap-3 px-2.5 py-[7px] mx-1 rounded-[10px] cursor-pointer focus:bg-red-50"
        >
          <div className="size-[30px] rounded-[10px] flex items-center justify-center bg-red-50 border border-red-100 shrink-0">
            <LogOut size={15} style={{ color: "#EF4444" }} />
          </div>
          <p className="text-[13px] font-medium text-red-500 leading-tight">{t("header.logout")}</p>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  );
};

export default UserDropdownMenu;
