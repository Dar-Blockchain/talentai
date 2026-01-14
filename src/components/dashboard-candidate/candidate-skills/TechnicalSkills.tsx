import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import AddIcon from "@mui/icons-material/Add";
import EmptySkills from "./EmptySkills";
import SkillCard from "./SkillCard";
import AssessmentModal from "../AssessmentModal";

function TechnicalSkills() {
  const { profile } = useSelector(
    (state: RootState) => state.user.connectedUser
  );
  const skills = profile?.skills ?? [];
  const [openModal, setOpenModal] = useState(false);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#000000",
            fontSize: "20px",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-4px",
              left: 0,
              width: "38px",
              height: "5px",
              background: "rgba(11, 82, 198, 1)",
              borderRadius: "2px",
            },
          }}
        >
          Technical Skills
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon sx={{ color: "rgba(11, 82, 198, 1)" }} />}
          onClick={() => setOpenModal(true)}
          sx={{
            background: "rgba(11, 82, 198, 0.08)",
            border: "1px solid rgba(11, 82, 198, 1)",
            color: "rgba(11, 82, 198, 1)",
            borderRadius: "38px",
            px: 2,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            "&:hover": {
              background: "rgba(11, 82, 198, 0.06)",
            },
          }}
        >
          Add Technical Skill
        </Button>
      </Box>
      {skills?.length === 0 && <EmptySkills type="technical" />}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {skills?.length > 0 &&
          skills.map((item: any, index: number) => (
            <SkillCard key={index} skill={item} type={"technical"} />
          ))}
      </Box>
      <AssessmentModal
        type={"technical"}
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </Box>
  );
}

export default TechnicalSkills;
