"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Checkbox,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Skeleton,
  Alert,
  ListItemText,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchMembers, selectMembers } from "@/store/slices/memberSlice";
import { Member } from "@/store/slices/memberSlice";
import {
  fetchDepartments,
  selectDepartments,
} from "@/store/slices/departmentSlice";
import Pagination from "@/components/ui/Pagination";
import { ROLE_LABELS, ROLE_STYLES } from "@/components/features/company/employees/list/EmployeeCard";

const PURPLE = "#8310FF";
const PAGE_SIZE = 10;

const AVATAR_GRADIENTS = [
  "135deg, #8310FF, #A855F7",
  "135deg, #0D9488, #34D399",
  "135deg, #0891B2, #38BDF8",
  "135deg, #D97706, #FCD34D",
  "135deg, #DC2626, #F87171",
];

function pickGradient(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

interface ParticipantsStepProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

const EmployeeRowSkeleton: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      px: 2,
      py: 1.5,
      borderBottom: "1px solid #F3F4F6",
    }}
  >
    <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: 0.5, flexShrink: 0 }} />
    <Skeleton variant="circular" width={36} height={36} sx={{ flexShrink: 0 }} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="35%" height={16} />
      <Skeleton variant="text" width="55%" height={13} />
    </Box>
    <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: "6px", flexShrink: 0 }} />
  </Box>
);

const ParticipantsStep: React.FC<ParticipantsStepProps> = ({
  selected,
  onChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading, error } = useSelector(selectMembers);
  const departments = useSelector(selectDepartments);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [search, deptFilter]);

  const filtered = useMemo(() => {
    let result = members;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.user?.username?.toLowerCase().includes(q) ||
          m.user?.email?.toLowerCase().includes(q)
      );
    }

    if (deptFilter.length > 0) {
      result = result.filter((m) => {
        const memberDept = (m as any).department?._id || (m as any).departmentId;
        return memberDept && deptFilter.includes(memberDept);
      });
    }

    return result;
  }, [members, search, deptFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds = paginated.map((m) => m._id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const somePageSelected =
    pageIds.some((id) => selected.includes(id)) && !allPageSelected;

  const toggleMember = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const toggleAllOnPage = () => {
    if (allPageSelected) {
      onChange(selected.filter((id) => !pageIds.includes(id)));
    } else {
      onChange([...new Set([...selected, ...pageIds])]);
    }
  };

  const getDeptLabel = (deptIds: string[]) => {
    if (deptIds.length === 0) return "";
    if (deptIds.length === 1) {
      return departments.find((d) => d._id === deptIds[0])?.name ?? "1 department";
    }
    return `${deptIds.length} departments`;
  };

  return (
    <Box>
      {/* Info banner */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2,
          mb: 2.5,
          borderRadius: 2,
          bgcolor: "#F5F3FF",
          border: `1px solid ${PURPLE}20`,
        }}
      >
        <PeopleAltOutlined sx={{ fontSize: 18, color: PURPLE, flexShrink: 0 }} />
        <Typography sx={{ fontSize: "13px", color: "#374151" }}>
          Select the employees who can participate in this campaign. Leave empty to allow all employees.
        </Typography>
        {selected.length > 0 && (
          <Chip
            label={`${selected.length} selected`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "12px",
              bgcolor: PURPLE,
              color: "#fff",
              ml: "auto",
              flexShrink: 0,
              "& .MuiChip-label": { px: 1.5 },
            }}
          />
        )}
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            maxWidth: 380,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "14px",
              bgcolor: "#fff",
            },
          }}
        />

        {departments.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BusinessOutlined sx={{ fontSize: 14 }} />
                Filter by Department
              </Box>
            </InputLabel>
            <Select
              multiple
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value as string[])}
              input={<OutlinedInput label="Filter by Department" />}
              renderValue={(ids) =>
                ids.length === 0 ? "All Departments" : getDeptLabel(ids)
              }
              sx={{ bgcolor: "#fff", borderRadius: 2 }}
            >
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  <Checkbox
                    checked={deptFilter.includes(dept._id)}
                    size="small"
                    sx={{
                      color: "#D1D5DB",
                      "&.Mui-checked": { color: PURPLE },
                      p: 0,
                      mr: 1,
                    }}
                  />
                  <ListItemText
                    primary={dept.name}
                    slotProps={{
                      primary: { style: { fontSize: "13px", fontWeight: 500 } },
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {deptFilter.length > 0 && (
          <Chip
            label="Clear filters"
            size="small"
            onClick={() => setDeptFilter([])}
            sx={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#6B7280",
              bgcolor: "#F3F4F6",
              cursor: "pointer",
              alignSelf: "center",
              "&:hover": { bgcolor: "#E5E7EB" },
            }}
          />
        )}
      </Box>

      {/* Results count */}
      {!loading && !error && (
        <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mb: 1.5 }}>
          {filtered.length} employee{filtered.length !== 1 ? "s" : ""}
          {search || deptFilter.length > 0 ? " match your filters" : " total"}
        </Typography>
      )}

      {/* Employee list */}
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Select all header */}
        {!loading && !error && paginated.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.25,
              bgcolor: "#F9FAFB",
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <Checkbox
              size="small"
              checked={allPageSelected}
              indeterminate={somePageSelected}
              onChange={toggleAllOnPage}
              sx={{
                color: "#D1D5DB",
                "&.Mui-checked": { color: PURPLE },
                "&.MuiCheckbox-indeterminate": { color: PURPLE },
                p: 0,
              }}
            />
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
              Select all on this page ({paginated.length})
            </Typography>
          </Box>
        )}

        {error ? (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box>
            {Array.from({ length: 6 }).map((_, i) => (
              <EmployeeRowSkeleton key={i} />
            ))}
          </Box>
        ) : paginated.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <PeopleAltOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              {search || deptFilter.length > 0
                ? "No employees match your filters"
                : "No employees found"}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.5 }}>
              {search || deptFilter.length > 0
                ? "Try adjusting your search or department filter."
                : "Invite employees to your workspace first."}
            </Typography>
          </Box>
        ) : (
          paginated.map((member, i) => {
            const isSelected = selected.includes(member._id);
            const name = member.user?.username || "Pending";
            const email = member.user?.email || "";
            const letter = name[0]?.toUpperCase() || "U";
            const roleStyle = ROLE_STYLES[member.role] ?? ROLE_STYLES.Manager;
            const roleLabel = ROLE_LABELS[member.role] ?? member.role;

            return (
              <Box
                key={member._id}
                onClick={() => toggleMember(member._id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  borderBottom:
                    i < paginated.length - 1 ? "1px solid #F3F4F6" : "none",
                  bgcolor: isSelected ? "#F5F3FF" : "transparent",
                  "&:hover": {
                    bgcolor: isSelected ? "#EDE9FE" : "#F9FAFB",
                  },
                  transition: "background-color 0.15s",
                }}
              >
                <Checkbox
                  size="small"
                  checked={isSelected}
                  onChange={() => toggleMember(member._id)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    color: "#D1D5DB",
                    "&.Mui-checked": { color: PURPLE },
                    p: 0,
                    flexShrink: 0,
                  }}
                />
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#fff",
                    background: `linear-gradient(${pickGradient(email || name)})`,
                    flexShrink: 0,
                  }}
                >
                  {letter}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#111827",
                      lineHeight: 1.3,
                    }}
                  >
                    {name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#6B7280",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {email}
                  </Typography>
                </Box>
                <Chip
                  label={roleLabel}
                  size="small"
                  sx={{
                    fontSize: "11px",
                    fontWeight: 700,
                    height: 22,
                    color: roleStyle.color,
                    bgcolor: roleStyle.bg,
                    border: `1px solid ${roleStyle.color}25`,
                    borderRadius: "6px",
                    flexShrink: 0,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              </Box>
            );
          })
        )}
      </Box>

      {/* Pagination */}
      {!loading && filtered.length > PAGE_SIZE && (
        <Pagination
          page={page}
          limit={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />
      )}
    </Box>
  );
};

export default ParticipantsStep;
