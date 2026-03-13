import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import AddIcon from "@mui/icons-material/Add";
import EmptySkills from "./EmptySkills";
import SkillCard from "./SkillCard";
import AssessmentModal from "../AssessmentModal";

function SoftSkills() {
  const { profile } = useSelector(
    (state: RootState) => state.user.connectedUser
  );
  const skills = profile?.softSkills ?? [];
  const [openModal, setOpenModal] = useState(false);

  return (
    <Box sx={{ mt: 4 }}>
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
              background: "rgba(250, 180, 70, 1)",
              borderRadius: "2px",
            },
          }}
        >
          Soft Skills
        </Typography>
        <Button
          onClick={() => setOpenModal(true)}
          variant="outlined"
          disabled
          startIcon={<AddIcon sx={{ color: "rgba(250, 180, 70, 1)" }} />}
          sx={{
            background: "rgba(250, 180, 70, 0.08)",
            border: "1px solid rgba(250, 180, 70, 1)",
            color: "rgba(250, 180, 70, 1)",
            borderRadius: "38px",
            px: 2,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            "&:hover": {
              background: "rgba(250, 180, 70, 0.06)",
            },
          }}
        >
          Add Soft Skill
        </Button>
      </Box>
      {skills?.length === 0 && <EmptySkills type="soft" />}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {skills?.length > 0 &&
          skills.map((item: any, index: number) => (
            <SkillCard key={index} skill={item} type={"soft"} />
          ))}
      </Box>
      <AssessmentModal
        type={"soft"}
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </Box>
  );
}

export default SoftSkills;