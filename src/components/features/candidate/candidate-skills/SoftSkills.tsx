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
    <Box>
      {skills.map((item: any, i: number) => (
        <SkillCard key={i} skill={item} type="soft" last={i === skills.length - 1} />
      ))}
    </Box>
  );
}

export default SoftSkills;
