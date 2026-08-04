import React from "react";
import { Card } from "@/modules/shared/ui/shadcn/card";
import SectionTitle from "./SectionTitle";

interface Props {
  icon: React.ReactNode;
  title: string;
  items: string[];
  bulletColor?: string;
}

const BulletListCard: React.FC<Props> = ({ icon, title, items, bulletColor = "#0D9488" }) => {
  if (!items.length) return null;

  return (
    <Card className="p-6 gap-0">
      <SectionTitle icon={icon} title={title} />
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: bulletColor }} />
            <p className="text-[13px] leading-[1.7] text-gray-700">{item}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BulletListCard;
