import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";
import SkillCard from "./SkillCard";
import EmptySkills from "./EmptySkills";

const PAGE_SIZE = 8;

function TechnicalSkills() {
  const { profile } = useSelector((state: RootState) => state.user.connectedUser);
  const skills = profile?.skills ?? [];
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible   = skills.slice(0, visibleCount);
  const remaining = skills.length - visibleCount;

  if (skills.length === 0) return <EmptySkills type="technical" />;

  return (
    <Box>
      {visible.map((item: any, i: number) => (
        <SkillCard key={i} skill={item} type="technical" last={i === visible.length - 1 && remaining <= 0} />
      ))}
      {remaining > 0 && (
        <Box sx={{ px: 2.5, py: 1.25, borderTop: "1px solid #F1F5F9" }}>
          <Button
            size="small"
            endIcon={<ExpandMoreOutlined sx={{ fontSize: "14px !important" }} />}
            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", color: "#2563EB", p: 0, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
          >
            Show {remaining} more
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default TechnicalSkills;
