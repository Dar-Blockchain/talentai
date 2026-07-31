import { useTranslation } from "react-i18next";
import Image from "next/image";

export default function LogoutOverlay({ open }: { open: boolean }) {
  const { t } = useTranslation("auth");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center gap-4 bg-background">
      <Image
        src="/gif/loading.gif"
        alt="Loading…"
        width={96}
        height={96}
        unoptimized
        className="w-24 h-24 object-contain"
        draggable={false}
      />
      <div className="text-center">
        <p className="text-[15px] font-bold text-foreground">{t("logout.signing_out")}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("logout.please_wait")}</p>
      </div>
    </div>
  );
}
