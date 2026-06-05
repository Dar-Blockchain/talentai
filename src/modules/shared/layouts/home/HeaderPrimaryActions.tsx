import React, { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import DemoVideoModal from "@/components/features/home/company/DemoVideoModal";
import { useTranslation } from "react-i18next";

const ACCENT = "#0D9488";

const HeaderPrimaryActions = ({ inverted = false }: { inverted?: boolean }) => {
  const { t }  = useTranslation("common");
  const router   = useRouter();
  const { user } = useSelector((state: RootState) => state.user.connectedUser);
  const [videoOpen, setVideoOpen] = useState(false);

  const userType =
    user?.role?.toLowerCase() ||
    (typeof window !== "undefined" ? localStorage.getItem("userType") : null) ||
    "candidate";

  return (
    <div className="flex items-center gap-[6px]">
      {/* Login */}
      <div
        onClick={() => router.push("/signin")}
        className="px-[18px] py-[6px] rounded-[10px] cursor-pointer text-[13.5px] font-medium whitespace-nowrap transition-colors duration-[0.18s]"
        style={{
          color: inverted ? "#475569" : "#555",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.color = inverted ? ACCENT : "#111";
          el.style.backgroundColor = inverted ? "rgba(13,148,136,0.12)" : "rgba(0,0,0,0.04)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.color = inverted ? "#475569" : "#555";
          el.style.backgroundColor = "transparent";
        }}
      >
        {t("header.login")}
      </div>

      {/* Separator */}
      <div className="w-px h-[18px]" style={{ backgroundColor: inverted ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }} />

      {/* CTA pill */}
      <div
        onClick={() => userType === "candidate" ? router.push("/signin") : setVideoOpen(true)}
        className="px-[20px] py-[6px] rounded-[10px] cursor-pointer text-[13.5px] font-bold whitespace-nowrap text-white tracking-[0.01em] transition-all duration-[0.18s] hover:opacity-90 hover:-translate-y-[1px]"
        style={{
          backgroundColor: ACCENT,
          boxShadow:       `0 2px 10px ${ACCENT}55`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 16px ${ACCENT}66`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 2px 10px ${ACCENT}55`;
        }}
      >
        {userType === "candidate" ? t("header.signup") : t("header.watch_demo")}
      </div>

      <DemoVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
};

export default HeaderPrimaryActions;
