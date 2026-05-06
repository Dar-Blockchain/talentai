import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import AddOutlined from "@mui/icons-material/AddOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import AssessmentModal from "../AssessmentModal";

type SkillType = "technical" | "soft";

const CONFIG = {
  technical: { Icon: CodeOutlined, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  soft:      { Icon: PeopleOutlined, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
};

const EmptySkills: React.FC<{ type: SkillType }> = ({ type }) => {
  const { t } = useTranslation("dashboard");
  const s = (k: string) => t(`candidate.skills.empty.${k}`) as string;
  const [openModal, setOpenModal] = useState(false);
  const { Icon, color, bg, border } = CONFIG[type];

  const title = type === "technical" ? s("technical_title") : s("soft_title");
  const desc  = type === "technical" ? s("technical_desc")  : s("soft_desc");
  const btn   = type === "technical" ? s("technical_btn")   : s("soft_btn");

  return (
    <>
      <Box sx={{ py: 6, px: 3, textAlign: "center", borderRadius: "14px", border: `1.5px dashed ${border}`, bgcolor: bg }}>
        <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "#fff", border: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, boxShadow: `0 4px 12px ${color}15` }}>
          <Icon sx={{ fontSize: 26, color }} />
        </Box>
        <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: "0.9rem", mb: 0.5 }}>{title}</Typography>
        <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", mb: 2.5, maxWidth: 320, mx: "auto" }}>{desc}</Typography>
        <Button
          disabled
          startIcon={<AddOutlined />}
          onClick={() => setOpenModal(true)}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "0.78rem",
            color, bgcolor: "#fff", border: `1.5px solid ${color}`,
            borderRadius: "10px", px: 2.5, py: 0.75,
            "&.Mui-disabled": { color: "#9CA3AF", border: "1.5px solid #E5E7EB", bgcolor: "#F9FAFB" },
          }}
        >
          {btn}
        </Button>
      </Box>
      <AssessmentModal type={type} open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
};

export default EmptySkills;
