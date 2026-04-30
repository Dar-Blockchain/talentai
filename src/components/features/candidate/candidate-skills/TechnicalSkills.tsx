import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import AddOutlined from "@mui/icons-material/AddOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";
import EmptySkills from "./EmptySkills";
import SkillCard from "./SkillCard";
import AssessmentModal from "../AssessmentModal";

const PAGE_SIZE = 15;
const COLOR = "#2563EB";

function TechnicalSkills() {
  const { profile } = useSelector((state: RootState) => state.user.connectedUser);
  const skills = profile?.skills ?? [];
  const [openModal,     setOpenModal]     = useState(false);
  const [visibleCount,  setVisibleCount]  = useState(PAGE_SIZE);
  const visible = skills.slice(0, visibleCount);
  const remaining = skills.length - visibleCount;

  return (
    <Box>
      {/* Section header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CodeOutlined sx={{ fontSize: 18, color: COLOR }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Technical Skills</Typography>
            <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>{skills.length} skill{skills.length !== 1 ? "s" : ""}</Typography>
          </Box>
        </Box>
        <Button
          disabled
          startIcon={<AddOutlined sx={{ fontSize: "15px !important" }} />}
          onClick={() => setOpenModal(true)}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "0.75rem",
            color: COLOR, bgcolor: "#EFF6FF", border: "1.5px solid #BFDBFE",
            borderRadius: "10px", px: 1.75, py: 0.6, boxShadow: "none",
            "&.Mui-disabled": { color: "#9CA3AF", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB" },
            "&:hover": { bgcolor: "#DBEAFE" },
          }}
        >
          Add Skill
        </Button>
      </Box>

      {skills.length === 0 ? (
        <EmptySkills type="technical" />
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
            {visible.map((item: any, i: number) => (
              <SkillCard key={i} skill={item} type="technical" />
            ))}
          </Box>
          {remaining > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
              <Button
                endIcon={<ExpandMoreOutlined />}
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                sx={{
                  textTransform: "none", fontWeight: 700, fontSize: "0.78rem",
                  color: COLOR, bgcolor: "#EFF6FF", border: "1.5px solid #BFDBFE",
                  borderRadius: "10px", px: 2.5, py: 0.75,
                  "&:hover": { bgcolor: "#DBEAFE" },
                }}
              >
                Show {remaining} more
              </Button>
            </Box>
          )}
        </>
      )}

      <AssessmentModal type="technical" open={openModal} onClose={() => setOpenModal(false)} />
    </Box>
  );
}

export default TechnicalSkills;
