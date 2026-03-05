import React from "react";
import { Box, Divider } from "@mui/material";
import SkillsHeader from "./SkillsHeader";
import TechnicalSkills from "./TechnicalSkills";
import SoftSkills from "./SoftSkills";

function CandidateSkills() {

  return (
    <Box
      sx={{
        px: 5,
        py: 3,
        mb: 2,
        color: "#000000",
        borderRadius: "12px",
        border: "1px solid rgba(84,98,116,0.1)",
        backgroundColor: "white",
      }}
    >
      <SkillsHeader />
       <Divider sx={{my: 2, color: "rgba(232, 232, 232, 1)"}} />
       <TechnicalSkills />
       <SoftSkills/>
    </Box>
  );
}

export default CandidateSkills;
