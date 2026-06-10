import React, { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import DemoVideoModal from "@/modules/home/company/DemoVideoModal";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const HeaderPrimaryActions = ({ inverted = false }: { inverted?: boolean }) => {
  const { t }    = useTranslation("common");
  const router   = useRouter();
  const { user } = useSelector((state: RootState) => state.user.connectedUser);
  const [videoOpen, setVideoOpen] = useState(false);

  const userType =
    user?.role?.toLowerCase() ||
    (typeof window !== "undefined" ? localStorage.getItem("userType") : null) ||
    "candidate";

  return (
    <div className="flex items-center gap-1.5">
      {/* Log in — ghost */}
      <button
        onClick={() => router.push("/signin")}
        className={cn(
          "px-[18px] py-[7px] rounded-[10px] text-[13.5px] font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer",
          inverted
            ? "text-slate-500 hover:text-primary hover:bg-primary/10"
            : "text-gray-500 hover:text-gray-900 hover:bg-black/[0.04]"
        )}
      >
        {t("header.login")}
      </button>

      {/* Separator */}
      <div className={cn("w-px h-[18px]", inverted ? "bg-white/15" : "bg-black/10")} />

      {/* CTA — primary pill */}
      <button
        onClick={() => userType === "candidate" ? router.push("/signin") : setVideoOpen(true)}
        className="px-5 py-[7px] rounded-[10px] text-[13.5px] font-bold whitespace-nowrap cursor-pointer bg-primary text-white tracking-[0.01em] shadow-[0_2px_10px_rgba(13,148,136,0.35)] hover:opacity-90 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(13,148,136,0.45)] transition-all duration-150"
      >
        {userType === "candidate" ? t("header.signup") : t("header.watch_demo")}
      </button>

      <DemoVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
};

export default HeaderPrimaryActions;
