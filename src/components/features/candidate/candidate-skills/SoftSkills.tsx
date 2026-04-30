import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import AddOutlined from "@mui/icons-material/AddOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import EmptySkills from "./EmptySkills";
import SkillCard from "./SkillCard";
import AssessmentModal from "../AssessmentModal";

const COLOR = "#D97706";

function SoftSkills() {
  const { profile } = useSelector((state: RootState) => state.user.connectedUser);
  const skills = profile?.softSkills ?? [];
  const [openModal, setOpenModal] = useState(false);

  return (
    <Box>
      {/* Section header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PeopleOutlined sx={{ fontSize: 18, color: COLOR }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Soft Skills</Typography>
            <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>{skills.length} skill{skills.length !== 1 ? "s" : ""}</Typography>
          </Box>
        </Box>
        <Button
          disabled
          startIcon={<AddOutlined sx={{ fontSize: "15px !important" }} />}
          onClick={() => setOpenModal(true)}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "0.75rem",
            color: COLOR, bgcolor: "#FFFBEB", border: "1.5px solid #FDE68A",
            borderRadius: "10px", px: 1.75, py: 0.6, boxShadow: "none",
            "&.Mui-disabled": { color: "#9CA3AF", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB" },
            "&:hover": { bgcolor: "#FEF3C7" },
          }}
        >
          Add Skill
        </Button>
      </Box>

      {skills.length === 0 ? (
        <EmptySkills type="soft" />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
          {skills.map((item: any, i: number) => (
            <SkillCard key={i} skill={item} type="soft" />
          ))}
        </Box>
      )}

      <AssessmentModal type="soft" open={openModal} onClose={() => setOpenModal(false)} />
    </Box>
  );
}

export default SoftSkills;
