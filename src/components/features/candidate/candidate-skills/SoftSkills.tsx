import React from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import SkillCard from "./SkillCard";
import EmptySkills from "./EmptySkills";

function SoftSkills() {
  const { profile } = useSelector((state: RootState) => state.user.connectedUser);
  const skills = profile?.softSkills ?? [];

  if (skills.length === 0) return <EmptySkills type="soft" />;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        {skills.map((item: any, i: number) => (
          <SkillCard key={i} skill={item} type="soft" last={false} />
        ))}
      </Box>
    </Box>
  );
}

export default SoftSkills;
