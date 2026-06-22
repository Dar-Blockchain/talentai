import React from "react";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface Action {
  label: string;
  onClick: () => void;
  variant?: "contained" | "outlined";
  color?: string;
  hoverColor?: string;
}

interface EligibilityBlockedScreenProps {
  icon: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: Action[];
  maxWidth?: number;
}

export default function EligibilityBlockedScreen({
  icon,
  title,
  description,
  children,
  actions = [],
  maxWidth = 460,
}: EligibilityBlockedScreenProps) {
  const hasBody = !!(description || children);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10 md:py-16">
      <Card
        className="w-full rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] gap-0 py-0"
        style={{ maxWidth }}
      >
        <CardContent className="px-8 py-10 md:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-black/5 border-2 border-black/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-[2rem] leading-none select-none">{icon}</span>
          </div>

          <p
            className="font-[Poppins] font-extrabold text-[1.4rem] text-[#0F172A] leading-tight tracking-tight"
            style={{ marginBottom: hasBody ? '1.5rem' : 0 }}
          >
            {title}
          </p>

          {description && (
            <div className="font-[Poppins] text-[0.88rem] text-[#475569] leading-[1.8]">
              {description}
            </div>
          )}

          {children}

          {actions.length > 0 && (
            <div
              className="flex gap-3 justify-center flex-wrap"
              style={{ marginTop: hasBody ? '3.5rem' : '2rem' }}
            >
              {actions.map((action, i) => {
                const isOutlined = action.variant === "outlined" || (i > 0 && !action.variant);
                const hasCustomColor = !!action.color;

                if (isOutlined) {
                  return (
                    <Button
                      key={i}
                      variant="outline"
                      size="lg"
                      onClick={action.onClick}
                      className={`font-[Poppins] rounded-[12px] border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#475569] ${actions.length === 1 ? 'w-full' : ''}`}
                    >
                      {action.label}
                    </Button>
                  );
                }

                return (
                  <Button
                    key={i}
                    size="lg"
                    onClick={action.onClick}
                    className={`font-[Poppins] rounded-[12px] ${actions.length === 1 ? 'w-full' : ''}`}
                    style={hasCustomColor ? { background: action.color, color: '#fff' } : undefined}
                    onMouseEnter={hasCustomColor && action.hoverColor ? (e) => { e.currentTarget.style.background = action.hoverColor!; } : undefined}
                    onMouseLeave={hasCustomColor && action.hoverColor ? (e) => { e.currentTarget.style.background = action.color!; } : undefined}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
