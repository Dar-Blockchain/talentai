import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import AddIcon from "@mui/icons-material/Add";
import EmptySkills from "./EmptySkills";
import SkillCard from "./SkillCard";
import AssessmentModal from "../AssessmentModal";

const PAGE_SIZE = 6;

function TechnicalSkills() {
  const { profile } = useSelector(
    (state: RootState) => state.user.connectedUser
  );
  const skills = profile?.skills ?? [];
  const [openModal, setOpenModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleSkills = skills.slice(0, visibleCount);
  const hasMore = visibleCount < skills.length;

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
        {visibleSkills.map((item: any, index: number) => (
          <SkillCard key={index} skill={item} type={"technical"} />
        ))}
      </Box>
      {hasMore && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            sx={{
              border: "1px solid rgba(11, 82, 198, 1)",
              color: "rgba(11, 82, 198, 1)",
              borderRadius: "38px",
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              "&:hover": { background: "rgba(11, 82, 198, 0.06)" },
            }}
          >
            Load More ({skills.length - visibleCount} remaining)
          </Button>
        </Box>
      )}
      <AssessmentModal
        type={"technical"}
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </Box>
  );
}

export default TechnicalSkills;
