import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface AuthSubmitButtonProps {
  loading:       boolean;
  label:         string;
  loadingLabel?: string;
  disabled?:     boolean;
  type?:         "submit" | "button";
  onClick?:      () => void;
}

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  loading, label, loadingLabel, disabled, type = "submit", onClick,
}) => (
  <Button
    type={type}
    variant="gradient"
    size="lg"
    className="w-full mt-5 font-sans font-semibold"
    loading={loading}
    disabled={disabled}
    onClick={onClick}
  >
    {loading ? (loadingLabel ?? label) : (
      <>
        {label}
        <ArrowRight className="size-4" />
      </>
    )}
  </Button>
);
