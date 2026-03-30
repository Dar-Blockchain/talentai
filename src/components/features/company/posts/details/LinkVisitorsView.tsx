import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, Avatar, Chip, CircularProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { AppDispatch } from "@/store/store";
import {
  fetchApplicantsByJob,
  selectApplicantList,
  selectApplicantListLoading,
} from "@/store/slices/interviewApplicantSlice";

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  pending:     { label: "Viewed",      bg: "#FEF3C7", color: "#D97706" },
  in_progress: { label: "In Progress", bg: "#EDE9FE", color: "#7C3AED" },
  completed:   { label: "Completed",   bg: "#D1FAE5", color: "#059669" },
};

function fmtDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

interface Props { jobId: string }

const LinkVisitorsView: React.FC<Props> = ({ jobId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const visitors = useSelector(selectApplicantList);
  const loading  = useSelector(selectApplicantListLoading);

  useEffect(() => {
    if (jobId) dispatch(fetchApplicantsByJob(jobId));
  }, [dispatch, jobId]);

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <VisibilityOutlined sx={{ fontSize: 20, color: "#0D9488" }} />
        <Typography sx={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>
          Link Visitors
        </Typography>
        {!loading && (
          <Chip
            label={`${visitors.length} visitor${visitors.length !== 1 ? "s" : ""}`}
            size="small"
            sx={{ bgcolor: "#F3F4F6", color: "#6B7280", fontWeight: 600, fontSize: "11px" }}
          />
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#0D9488" }} size={32} />
        </Box>
      ) : visitors.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <VisibilityOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1 }} />
          <Typography sx={{ fontSize: "14px", color: "#9CA3AF" }}>
            No one has opened the interview link yet
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "#6B7280", py: 1.5 }}>Candidate</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "#6B7280", py: 1.5 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "#6B7280", py: 1.5 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "#6B7280", py: 1.5 }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "#6B7280", py: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeOutlined sx={{ fontSize: 13 }} /> Opened At
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visitors.map((v) => {
                const style = STATUS_STYLE[v.status] ?? STATUS_STYLE.pending;
                return (
                  <TableRow key={v._id} sx={{ "&:hover": { bgcolor: "#F9FAFB" } }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "#0D9488", fontSize: 11, fontWeight: 700 }}>
                          {getInitials(v.firstName, v.lastName)}
                        </Avatar>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                          {v.firstName} {v.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: "12px", color: "#6B7280", py: 1.5 }}>{v.email}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={style.label}
                        size="small"
                        sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, fontSize: "10px", height: 20 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "12px", color: "#6B7280", py: 1.5 }}>
                      {v.ref || "direct"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "12px", color: "#6B7280", py: 1.5 }}>
                      {fmtDate(v.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default LinkVisitorsView;
