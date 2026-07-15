import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export function QuestionScale({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value ?? 0;

  return (
    <div className="flex justify-center gap-2" onMouseLeave={() => setHovered(null)}>
      {[1,2,3,4,5].map(n => (
        <motion.button key={n} type="button" onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          whileTap={{ scale: 0.9 }}
          className="p-1 rounded-lg transition-colors"
        >
          <Star
            size={36}
            className={n <= active ? "text-[#6AD39C]" : "text-[#E7E5DE]"}
            fill={n <= active ? "#6AD39C" : "none"}
            strokeWidth={1.75}
          />
        </motion.button>
      ))}
    </div>
  );
}
