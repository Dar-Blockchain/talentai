import React from "react";
import { Box } from "@mui/material";
import SkillsHeader from "./SkillsHeader";
import TechnicalSkills from "./TechnicalSkills";
import SoftSkills from "./SoftSkills";

function CandidateSkills() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <SkillsHeader />
      <Box sx={{ bgcolor: "#fff", borderRadius: "18px", border: "1px solid #E5E7EB", p: 3 }}>
        <TechnicalSkills />
      </Box>
      <Box sx={{ bgcolor: "#fff", borderRadius: "18px", border: "1px solid #E5E7EB", p: 3 }}>
        <SoftSkills />
      </Box>
    </Box>
  );
}

export default CandidateSkills;
