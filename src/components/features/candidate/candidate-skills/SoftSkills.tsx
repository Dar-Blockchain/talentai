import React from "react";
import { Box, Button, InputBase, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";
import { UseSkillsReturn } from "@/hooks/useSkills";
import SkillCard from "./SkillCard";
import EmptySkills from "./EmptySkills";

type Props = UseSkillsReturn;

function SkeletonGrid() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: "14px" }} />
      ))}
    </Box>
  );
}

function SoftSkills({ skills, pagination, loading, loadingMore, search, setSearch, loadMore }: Props) {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>

      {/* Search */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 0.75,
        px: 1.25, py: 0.6, borderRadius: "10px",
        bgcolor: "#F8FAFC", border: "1px solid #E2E8F0",
      }}>
        <SearchOutlined sx={{ fontSize: 15, color: "#94A3B8", flexShrink: 0 }} />
        <InputBase
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={s("search_placeholder")}
          sx={{ fontSize: "0.78rem", color: "#374151", flex: 1, "& input::placeholder": { color: "#CBD5E1" } }}
        />
      </Box>

      {/* Content */}
      {loading ? (
        <SkeletonGrid />
      ) : skills.length === 0 ? (
        <EmptySkills type="soft" />
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            {skills.map((item) => (
              <SkillCard key={item._id} skill={item} type="soft" last={false} />
            ))}
          </Box>

          {pagination?.hasNext && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                size="small"
                disabled={loadingMore}
                endIcon={<ExpandMoreOutlined sx={{ fontSize: "14px !important" }} />}
                onClick={loadMore}
                sx={{
                  textTransform: "none", fontWeight: 600, fontSize: "0.75rem",
                  color: "#D97706", bgcolor: "#FFFBEB", border: "1px solid #FDE68A",
                  borderRadius: "8px", px: 2, py: 0.5,
                  "&:hover": { bgcolor: "#FEF3C7" },
                }}
              >
                {loadingMore ? s("loading") : s("show_more", { count: (pagination.total - skills.length) })}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default SoftSkills;
