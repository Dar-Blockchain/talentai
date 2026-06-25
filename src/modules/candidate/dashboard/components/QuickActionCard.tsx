import React from "react";
import { Zap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";

interface Props {
  onOpen: () => void;
}

const QuickActionCard: React.FC<Props> = ({ onOpen }) => (
  <Card
    onClick={onOpen}
    className="cursor-pointer group hover:shadow-md hover:-translate-y-px transition-all duration-200 py-0 gap-0 overflow-hidden"
  >
    <div className="h-0.5 bg-gradient-to-r from-primary via-primary-dark to-secondary-dark" />
    <CardContent className="px-5 py-4 flex items-center gap-4">
      <div className="size-11 rounded-xl bg-primary-dark/10 border border-primary-dark/20 flex items-center justify-center shrink-0 group-hover:bg-primary-dark/15 transition-colors">
        <Zap className="size-5 text-primary-dark" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.9rem] font-extrabold text-gray-900">Start a Skill Interview</p>
        <p className="text-[0.72rem] text-gray-400 mt-0.5">
          Test your knowledge in any technical or soft skill
        </p>
      </div>
      <ArrowRight className="size-4 text-gray-300 group-hover:text-primary-dark group-hover:translate-x-0.5 transition-all shrink-0" />
    </CardContent>
  </Card>
);

export default QuickActionCard;
