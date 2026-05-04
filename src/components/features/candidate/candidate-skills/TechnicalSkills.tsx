import React, { useState } from "react";
import { Box, Button } from "@mui/material";
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
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        {visible.map((item: any, i: number) => (
          <SkillCard key={i} skill={item} type="technical" last={false} />
        ))}
      </Box>
      {remaining > 0 && (
        <Box sx={{ pt: 1.5, display: "flex", justifyContent: "center" }}>
          <Button
            size="small"
            endIcon={<ExpandMoreOutlined sx={{ fontSize: "14px !important" }} />}
            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            sx={{
              textTransform: "none", fontWeight: 600, fontSize: "0.75rem",
              color: "#2563EB", bgcolor: "#EFF6FF", border: "1px solid #BFDBFE",
              borderRadius: "8px", px: 2, py: 0.5,
              "&:hover": { bgcolor: "#DBEAFE" },
            }}
          >
            Show {remaining} more
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default TechnicalSkills;
