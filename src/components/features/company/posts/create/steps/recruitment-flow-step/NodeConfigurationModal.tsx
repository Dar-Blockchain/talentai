"use client";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import { Node } from "reactflow";
import "reactflow/dist/style.css";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-hot-toast";
import { NodeConfigRenderer } from "./node-configuration";

const ModalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4,
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

  const handleClose = () => {
    onClose();
  };

  // Form save handlers for configuration forms
  const handleFormSave = useCallback(
    (config: any) => {
      if (!selectedNode) return;

      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  config: {
                    ...node.data.config,
                    ...config,
                  },
                },
              }
            : node
        )
      );

      handleClose();

      toast.success("Configuration saved successfully!");
    },
    [selectedNode, setNodes]
  );

  const handleFormCancel = useCallback(() => {
    handleClose();
  }, []);

  const deleteNode = useCallback(
    (nodeId: string) => {
      // Remove the node
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));

      // Remove connected edges
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );

      onSelectedNodesChange([]);
    },
    [setNodes, setEdges]
  );

  const handleConditionFormUpdate = (field: string, value: any) => {
    if (!selectedNode) return;

    // Update the selected node state immediately for UI responsiveness
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        config: {
          ...selectedNode.data.config,
          [field]: value,
        },
      },
    };
    onSelectedNodeChange(updatedNode);
  };

  const handleConditionConfirm = () => {
    if (!selectedNode) return;

    const isComplete =
      selectedNode.data.config?.field &&
      selectedNode.data.config?.operator &&
      selectedNode.data.config?.value;

    // Update the nodes array with final configuration
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...selectedNode,
              data: {
                ...selectedNode.data,
                config: {
                  ...selectedNode.data.config,
                  configured: isComplete,
                },
              },
            }
          : node
      )
    );

    handleClose();
  };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      disableEnforceFocus
      disableAutoFocus
    >
      <Box
        sx={{
          ...ModalStyle,
          width: { xs: "95vw", sm: 600, md: 700 },
          maxWidth: 700,
          height: "auto",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            Configure {selectedNode?.data.label}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Condition Form */}
        {selectedNode?.data.type === "condition" ? (
          <Box sx={{maxHeight: "70vh", overflow: "auto"}}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              minHeight: "auto",
              pb: 2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Define the condition that will determine which path to take.
              Candidates will follow different routes based on whether the
              condition is met.
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Field to Check</InputLabel>
              <Select
                value={selectedNode?.data.config?.field || ""}
                onChange={(e) => {
                  e.stopPropagation();
                  handleConditionFormUpdate("field", e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <MenuItem value="score">Assessment Score</MenuItem>
                <MenuItem value="experience">Years of Experience</MenuItem>
                <MenuItem value="status">Application Status</MenuItem>
                <MenuItem value="skillLevel">Skill Level</MenuItem>
                <MenuItem value="interviewScore">Interview Score</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Operator</InputLabel>
              <Select
                value={selectedNode?.data.config?.operator || ""}
                onChange={(e) => {
                  e.stopPropagation();
                  handleConditionFormUpdate("operator", e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <MenuItem value=">">&gt; (greater than)</MenuItem>
                <MenuItem value=">=">&gt;= (greater than or equal)</MenuItem>
                <MenuItem value="<">&lt; (less than)</MenuItem>
                <MenuItem value="<=">&lt;= (less than or equal)</MenuItem>
                <MenuItem value="==">=== (equal to)</MenuItem>
                <MenuItem value="!=">&ne; (not equal to)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Value"
              value={selectedNode?.data.config?.value || ""}
              onChange={(e) => {
                e.stopPropagation();
                handleConditionFormUpdate("value", e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="e.g., 75, Senior, Passed"
              fullWidth
              helperText="Enter the value to compare against (numbers for scores, text for status)"
            />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                p: 1.5,
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    backgroundColor: "#10b981",
                    borderRadius: "50%",
                    border: "2px solid white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#10b981",
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
                >
                  YES - Condition is true
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mx: 1 }}>
                |
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    backgroundColor: "#ef4444",
                    borderRadius: "50%",
                    border: "2px solid white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#ef4444",
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
                >
                  NO - Condition is false
                </Typography>
              </Box>
            </Box>

            {selectedNode?.data.config?.field &&
              selectedNode?.data.config?.operator &&
              selectedNode?.data.config?.value && (
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: "#e3f2fd",
                    borderRadius: "8px",
                    border: "1px solid #1976d2",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", mb: 0.5, fontSize: "13px" }}
                  >
                    Condition Preview:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "monospace", fontSize: "14px" }}
                  >
                    IF {selectedNode.data.config.field}{" "}
                    {selectedNode.data.config.operator}{" "}
                    {selectedNode.data.config.value}
                  </Typography>
                </Box>
              )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                if (selectedNode) {
                  deleteNode(selectedNode.id);
                  handleClose();
                }
              }}
            >
              Delete Node
            </Button>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConditionConfirm}
                disabled={
                  !selectedNode?.data.config?.field ||
                  !selectedNode?.data.config?.operator ||
                  !selectedNode?.data.config?.value
                }
              >
                Confirm
              </Button>
            </Box>
          </Box>
        
          </Box>
        ) : (
          /* Configuration Forms for other node types */
          <Box sx={{ maxHeight: "70vh", overflow: "auto" }}>
            <NodeConfigRenderer
              nodeType={selectedNode?.data.type || ""}
              initialConfig={selectedNode?.data.config}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default NodeConfigurationModal;