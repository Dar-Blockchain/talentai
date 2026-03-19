import React from "react";
import { Box, Typography, Alert, InputAdornment, TextField } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import EmployeeCard from "@/components/features/company/employees/list/EmployeeCard";
import EmployeeSkeletonCard from "@/components/features/company/employees/list/EmployeeSkeletonCard";
import Pagination from "@/components/ui/Pagination";
import { GRID } from "@/components/features/company/employees/list/constants";
import { DepartmentMember } from "@/store/slices/departmentSlice";
import { Member } from "@/store/slices/memberSlice";

const PURPLE = "#8310FF";
const PAGE_SIZE = 9;

interface DepartmentMembersSectionProps {
  members: DepartmentMember[];
  total: number;
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
}

const DepartmentMembersSection: React.FC<DepartmentMembersSectionProps> = ({
  members, total, loading, error, search, onSearchChange, page, onPageChange,
}) => (
  <Box>
    <Box sx={{
      bgcolor: "#fff", border: "1px solid #EDEEF0",
      borderRadius: "18px", p: { xs: 2, sm: 3 },
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      {/* Header row: title + search */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2.5, flexWrap: "wrap" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0F172A" }}>
          Team Members
          {!loading && (
            <Typography component="span" sx={{ ml: 1, fontSize: "0.75rem", color: "#94A3B8", fontWeight: 500 }}>
              {total} total
            </Typography>
          )}
        </Typography>

        <TextField
          size="small"
          placeholder="Search members…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ fontSize: 17, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 240,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px", bgcolor: "#F8FAFC", fontSize: "0.8125rem",
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: PURPLE, borderWidth: 2 },
            },
          }}
        />
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={GRID}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <EmployeeSkeletonCard key={i} />)}
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      ) : members.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <PeopleAltOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>
            {search ? "No members match your search" : "No members yet"}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mt: 0.5 }}>
            {search ? "Try a different name or email." : "Assign employees to this department to see them here."}
          </Typography>
        </Box>
      ) : (
        <Box sx={GRID}>
          {members.map((m, i) => (
            <EmployeeCard
              key={m._id}
              member={m as unknown as Member}
              index={i}
              onEdit={() => {}}
              onDelete={() => {}}
              onSelect={() => {}}
            />
          ))}
        </Box>
      )}
    </Box>

    {/* Pagination */}
    {!loading && !error && total > PAGE_SIZE && (
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={onPageChange} />
    )}
  </Box>
);

export default DepartmentMembersSection;
