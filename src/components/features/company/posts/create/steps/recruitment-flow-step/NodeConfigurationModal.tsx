"use client";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { useCallback } from "react";
import { Node } from "reactflow";
import "reactflow/dist/style.css";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import { toast } from "react-hot-toast";
import { NodeConfigRenderer } from "./node-configuration";

const NODE_TYPE_LABELS: Record<string, string> = {
  technical: "Technical Skills",
  soft: "Soft Skills",
  interview: "HR Interview",
  task: "Task",
  condition: "Condition",
  email: "Email",
};

interface NodeConfigurationModalProps {
  open: boolean;
  onClose: () => void;
  selectedNode: Node | null;
  onSelectedNodeChange: (node: Node | null) => void;
  onSelectedNodesChange?: (nodes: Node[]) => void;
  setNodes?: any;
  setEdges?: any;
}

const NodeConfigurationModal: React.FC<NodeConfigurationModalProps> = ({
  open,
  selectedNode,
  setNodes,
  setEdges,
  onClose,
  onSelectedNodeChange,
  onSelectedNodesChange,
}) => {
  const handleClose = () => onClose();

  const handleFormSave = useCallback(
    (config: any) => {
      if (!selectedNode) return;
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, config: { ...node.data.config, ...config } } }
            : node
        )
      );
      handleClose();
      toast.success("Configuration saved!");
    },
    [selectedNode, setNodes]
  );

  const handleFormCancel = useCallback(() => handleClose(), []);

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      onSelectedNodesChange([]);
    },
    [setNodes, setEdges]
  );

  const handleConditionFormUpdate = (field: string, value: any) => {
    if (!selectedNode) return;
    onSelectedNodeChange({
      ...selectedNode,
      data: { ...selectedNode.data, config: { ...selectedNode.data.config, [field]: value } },
    });
  };

  const handleConditionConfirm = () => {
    if (!selectedNode) return;
    const isComplete =
      selectedNode.data.config?.field &&
      selectedNode.data.config?.operator &&
      selectedNode.data.config?.value;
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...selectedNode, data: { ...selectedNode.data, config: { ...selectedNode.data.config, configured: isComplete } } }
          : node
      )
    );
    handleClose();
  };

  const typeLabel = selectedNode?.data.type ? (NODE_TYPE_LABELS[selectedNode.data.type] || selectedNode.data.type) : "";

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13px" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      disableEnforceFocus
      disableAutoFocus
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          overflow: "hidden",
        },
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Header ── */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 38, height: 38, borderRadius: "10px",
                bgcolor: "rgba(13,148,136,0.08)",
                border: "1px solid rgba(13,148,136,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <SettingsIcon sx={{ fontSize: 18, color: "#0D9488" }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.95rem", color: "#111827", lineHeight: 1.2 }}>
                Configure {typeLabel}
              </Typography>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", color: "#9CA3AF", mt: 0.2 }}>
                {selectedNode?.data.label}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#9CA3AF", "&:hover": { bgcolor: "#F3F4F6" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ── Content ── */}
      <DialogContent sx={{ px: 3, py: 2.5, maxHeight: "65vh", overflowY: "auto" }}>
        {selectedNode?.data.type === "condition" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }} onClick={(e) => e.stopPropagation()}>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "0.82rem", color: "#6B7280", lineHeight: 1.6 }}>
              Define the condition that routes candidates down different paths.
            </Typography>

            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: "13px" }}>Field to Check</InputLabel>
              <Select
                value={selectedNode?.data.config?.field || ""}
                onChange={(e) => { e.stopPropagation(); handleConditionFormUpdate("field", e.target.value); }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                label="Field to Check"
                sx={{ borderRadius: "10px", fontSize: "13px" }}
              >
                <MenuItem value="score">Assessment Score</MenuItem>
                <MenuItem value="experience">Years of Experience</MenuItem>
                <MenuItem value="status">Application Status</MenuItem>
                <MenuItem value="skillLevel">Skill Level</MenuItem>
                <MenuItem value="interviewScore">Interview Score</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: "13px" }}>Operator</InputLabel>
              <Select
                value={selectedNode?.data.config?.operator || ""}
                onChange={(e) => { e.stopPropagation(); handleConditionFormUpdate("operator", e.target.value); }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                label="Operator"
                sx={{ borderRadius: "10px", fontSize: "13px" }}
              >
                <MenuItem value=">">&gt; (greater than)</MenuItem>
                <MenuItem value=">=">&gt;= (greater than or equal)</MenuItem>
                <MenuItem value="<">&lt; (less than)</MenuItem>
                <MenuItem value="<=">&lt;= (less than or equal)</MenuItem>
                <MenuItem value="==">= (equal to)</MenuItem>
                <MenuItem value="!=">&ne; (not equal to)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Value"
              value={selectedNode?.data.config?.value || ""}
              onChange={(e) => { e.stopPropagation(); handleConditionFormUpdate("value", e.target.value); }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="e.g., 75, Senior, Passed"
              fullWidth
              sx={inputSx}
              helperText="Enter the value to compare against"
              FormHelperTextProps={{ sx: { ml: 0, fontSize: "11px" } }}
            />

            {/* Yes / No paths */}
            <Box
              sx={{
                display: "flex", gap: 2, p: 1.5,
                bgcolor: "#F9FAFB", border: "1px solid #E5E7EB",
                borderRadius: "10px", alignItems: "center",
              }}
            >
              {[
                { color: "#22c55e", label: "YES — Condition is true" },
                { color: "#ef4444", label: "NO — Condition is false" },
              ].map(({ color, label }) => (
                <Box key={label} display="flex" alignItems="center" gap={0.75}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Condition preview */}
            {selectedNode?.data.config?.field && selectedNode?.data.config?.operator && selectedNode?.data.config?.value && (
              <Box sx={{ p: 1.5, bgcolor: "rgba(13,148,136,0.05)", border: "1px solid rgba(13,148,136,0.2)", borderRadius: "10px" }}>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", fontWeight: 600, color: "#0D9488", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Preview
                </Typography>
                <Typography sx={{ fontFamily: "monospace", fontSize: "13px", color: "#374151" }}>
                  IF {selectedNode.data.config.field} {selectedNode.data.config.operator} {selectedNode.data.config.value}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <NodeConfigRenderer
            nodeType={selectedNode?.data.type || ""}
            initialConfig={selectedNode?.data.config}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        )}
      </DialogContent>

      {/* ── Footer (condition only — other forms have their own buttons) ── */}
      {selectedNode?.data.type === "condition" && (
        <>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
            <Button
              onClick={() => { if (selectedNode) { deleteNode(selectedNode.id); handleClose(); } }}
              startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
              sx={{
                fontFamily: "Poppins", fontWeight: 600, fontSize: "13px", textTransform: "none",
                color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px",
                px: 2.5, "&:hover": { bgcolor: "rgba(239,68,68,0.06)" },
              }}
            >
              Delete
            </Button>

            <Box display="flex" gap={1.5}>
              <Button
                onClick={handleClose}
                sx={{
                  fontFamily: "Poppins", fontWeight: 600, fontSize: "13px", textTransform: "none",
                  color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "10px", px: 2.5,
                  "&:hover": { bgcolor: "#F9FAFB" },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConditionConfirm}
                disabled={!selectedNode?.data.config?.field || !selectedNode?.data.config?.operator || !selectedNode?.data.config?.value}
                sx={{
                  fontFamily: "Poppins", fontWeight: 700, fontSize: "13px", textTransform: "none",
                  bgcolor: "#0D9488", color: "#fff", borderRadius: "10px", px: 3, boxShadow: "none",
                  "&:hover": { bgcolor: "#0F766E", boxShadow: "none" },
                  "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
                }}
              >
                Save
              </Button>
            </Box>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default NodeConfigurationModal;
