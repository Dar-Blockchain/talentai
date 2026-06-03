import React from "react";
import { Box, Typography } from "@mui/material";
import SectionCard from "@/components/ui/SectionCard";
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
    <SectionCard>
      <SectionTitle icon={icon} title={title} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.map((item, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: bulletColor, mt: 0.75, flexShrink: 0 }} />
            <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.7 }}>{item}</Typography>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
};

export default BulletListCard;
