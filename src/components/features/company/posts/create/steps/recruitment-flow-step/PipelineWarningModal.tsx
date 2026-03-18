import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

/* ================= Styles ================= */

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    minWidth: 500,
    height: "100%",
    maxHeight: "98vh",
    [theme.breakpoints.down("sm")]: {
      minWidth: "90%",
      margin: 16,
    },
  },
}));

/* ================= Component ================= */

interface PipelineWarningDialogProps {
  open: boolean;
  nodes: any[];
  totalNodes?: number;
  onCancel: () => void;
  onConfirm: () => void;
}

const PipelineWarningDialog: React.FC<PipelineWarningDialogProps> = ({
  open,
  nodes,
  totalNodes,
  onCancel,
  onConfirm,
}) => {
  const allUnconfigured = totalNodes !== undefined
    ? nodes.length >= totalNodes
    : nodes.length > 0 && totalNodes === undefined;

  return (
    <StyledDialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      {/* ===== Title ===== */}
      <DialogTitle
        sx={{
          borderBottom: "1px solid rgba(227, 229, 233, 1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WarningAmberIcon sx={{ color: "rgba(222, 147, 0, 1)" }} />
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "20px",
                lineHeight: "25px",
                color: "rgba(222, 147, 0, 1)",
              }}
            >
              Unconfigured Steps
            </Typography>
          </Box>

          <IconButton onClick={onCancel} sx={{ color: "black" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ===== Content ===== */}
      <DialogContent sx={{ py: 3 }}>
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "22.4px",
            color: "rgba(75, 85, 99, 1)",
            my: 2,
          }}
        >
          Some steps in your recruitment pipeline haven’t been configured yet.
          If you continue, they will be saved using default settings.
        </Typography>

        {/* ===== Unconfigured Steps List ===== */}
        <Box
          sx={{
            background: "rgba(249, 250, 251, 1)",
            border: "1px solid rgba(229, 231, 235, 1)",
            borderRadius: "12px",
            p: 2,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "uppercase",
              color: "rgba(55, 65, 81, 1)",
              mb: 1.5,
            }}
          >
            Unconfigured Steps
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {nodes.map((node) => (
              <Box
                key={node.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  background: "white",
                  border: "1px solid rgba(229, 231, 235, 1)",
                  borderRadius: "8px",
                  px: 2,
                  py: 1.2,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "rgba(222, 147, 0, 1)",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "rgba(31, 41, 55, 1)",
                  }}
                >
                  {node.data?.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ===== Blocker message when nothing configured ===== */}
        {allUnconfigured && (
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px",
              px: 2,
              py: 1.25,
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 20, color: "rgba(239,68,68,1)", mt: "2px", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "13px", lineHeight: "20px", color: "rgba(185,28,28,1)", fontWeight: 500 }}>
              You must configure at least one step before continuing.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <Divider />

      {/* ===== Actions ===== */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            border: "none",
            background: "none",
            color: "rgba(133, 169, 227, 1)",
            "&:hover": {
              background: "none",
              color: "rgba(133, 169, 227, 0.8)",
            },
          }}
        >
          Go Back
        </Button>

        <Button
          variant="outlined"
          onClick={onConfirm}
          disabled={allUnconfigured}
          sx={{
            borderColor: allUnconfigured ? "rgba(209,213,219,1)" : "rgba(222, 147, 0, 1)",
            color: allUnconfigured ? "rgba(156,163,175,1)" : "rgba(222, 147, 0, 1)",
            fontWeight: 600,
            borderRadius: "38px",
            px: 3,
            py: 1.2,
            textTransform: "none",
            "&:hover": {
              backgroundColor: allUnconfigured ? "transparent" : "rgba(222, 147, 0, 0.08)",
            },
            "&.Mui-disabled": {
              borderColor: "rgba(209,213,219,1)",
              color: "rgba(156,163,175,1)",
            },
          }}
        >
          Continue Anyway
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default PipelineWarningDialog;
