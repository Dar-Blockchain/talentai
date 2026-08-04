import React, { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import DemoVideoModal from "@/modules/home/company/components/DemoVideoModal";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const HeaderPrimaryActions = ({ inverted = false, forceSignup = false }: { inverted?: boolean; forceSignup?: boolean }) => {
  const { t }    = useTranslation("common");
  const router   = useRouter();
  const { user } = useSelector((state: RootState) => state.user.connectedUser);
  const [videoOpen, setVideoOpen] = useState(false);

  const userType =
    user?.role?.toLowerCase() ||
    (typeof window !== "undefined" ? localStorage.getItem("userType") : null) ||
    "candidate";

  const showSignup = forceSignup || userType === "candidate";

  return (
    <div className="flex items-center gap-1">
      {/* Log in — ghost */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/signin")}
        className={cn(
          "rounded-lg font-medium",
          inverted
            ? "text-gray-500 hover:text-foreground hover:bg-black/[0.06]"
            : "text-gray-500 hover:text-foreground hover:bg-black/[0.04]"
        )}
      >
        {t("header.login")}
      </Button>

      {/* Separator */}
      <div className={cn("w-px h-[18px] mx-0.5", inverted ? "bg-black/10" : "bg-black/10")} />

      {/* CTA — primary */}
      <Button
        variant="default"
        size="sm"
        onClick={() => showSignup ? router.push("/register") : setVideoOpen(true)}
        className="rounded-lg px-4 shadow-[0_2px_10px_rgba(13,148,136,0.30)] hover:shadow-[0_4px_16px_rgba(13,148,136,0.42)]"
      >
        {showSignup ? t("header.signup") : t("header.watch_demo")}
      </Button>

      <DemoVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
};

export default HeaderPrimaryActions;
