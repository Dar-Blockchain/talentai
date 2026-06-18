import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Single, app-wide "signing out" overlay — mounted once in `_app.tsx` so every
 * account type (company, candidate, employee, admin) gets the exact same
 * behavior with no per-layout duplicates.
 *
 * Plain conditional render (no transition/animation) is intentional: a fade-in
 * leaves a brief window where it's semi-transparent, letting the already-cleared
 * dashboard (Redux user wiped on logout) flash through underneath. Mounting it
 * fully opaque, instantly, is what actually fixes that flicker.
 */
export default function LogoutOverlay({ open }: { open: boolean }) {
  const { t } = useTranslation("auth");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-2.5 bg-background">
      <Loader2 className="size-9 animate-spin text-primary" strokeWidth={2.5} />
      <div className="text-center">
        <p className="text-[15px] font-bold text-foreground">{t("logout.signing_out")}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("logout.please_wait")}</p>
      </div>
    </div>
  );
}
