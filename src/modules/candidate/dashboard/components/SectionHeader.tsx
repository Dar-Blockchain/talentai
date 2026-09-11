import React from "react";
import { useRouter } from "next/router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface Props {
  icon:      React.ElementType;
  iconClass: string;
  title:     string;
  href?:     string;
}

const SectionHeader: React.FC<Props> = ({ icon: Icon, iconClass, title, href }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", iconClass)} />
        <span className="text-[0.88rem] font-extrabold text-gray-900">{title}</span>
      </div>
      {href && (
        <Button
          variant="ghost"
          onClick={() => router.push(href)}
          className="p-0 h-auto text-[0.72rem] font-bold text-gray-500 hover:bg-transparent hover:text-gray-900"
        >
          View all <ArrowRight className="size-3" />
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;
