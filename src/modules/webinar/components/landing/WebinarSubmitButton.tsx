import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";

const CTA_CLASS =
  "w-full rounded-2xl bg-[#0F9D73] font-sans text-[15px] leading-none font-medium tracking-[-0.01em] text-white shadow-[0_10px_30px_rgba(15,157,115,0.22)] ring-1 ring-inset ring-white/20 transition-all hover:bg-[#0C8A64] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0";

/** Shared "advance" CTA — registration form submit, funnel next/confirm, header/hero nav links — so their styling stays in one place. */
export function WebinarSubmitButton({
  label,
  loading,
  disabled,
  onClick,
  type = "submit",
  href,
  className,
}: {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  type?: "submit" | "button";
  /** Renders as a nav link (e.g. header/hero "scroll to register" CTA) instead of a submit/action button. */
  href?: string;
  className?: string;
}) {
  if (href) {
    return (
      <Button asChild size="lg" className={cn(CTA_CLASS, "w-auto", className)}>
        <Link href={href} onClick={onClick}>
          {label}
          <ArrowRight size={16} />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type={type}
      size="lg"
      onClick={onClick}
      className={cn(CTA_CLASS, className)}
      loading={loading}
      disabled={disabled}
    >
      {label}
      <ArrowRight size={16} />
    </Button>
  );
}
