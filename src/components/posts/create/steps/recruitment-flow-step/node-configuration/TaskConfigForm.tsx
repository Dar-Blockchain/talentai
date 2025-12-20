import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Chip,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import DescriptionIcon from "@mui/icons-material/Description";
import PresentationIcon from "@mui/icons-material/PresentToAll";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface TaskConfig {
  taskTitle: string;
  taskDescription: string;
  deliverableType: string;
  configured: boolean;
}

interface TaskConfigFormProps {
  initialConfig?: TaskConfig;
  onSave: (config: TaskConfig) => void;
  onCancel: () => void;
}

const DELIVERABLE_TYPES = [
  {
    value: "code",
    label: "Code Repository",
    icon: <CodeIcon />,
    description: "GitHub repo or code files",
  },
  {
    value: "document",
    label: "Document",
    icon: <DescriptionIcon />,
    description: "PDF, Word, or other documents",
  },
  {
    value: "presentation",
    label: "Presentation",
    icon: <PresentationIcon />,
    description: "Slides or demo",
  },
  {
    value: "design",
    label: "Design Files",
    icon: <DesignServicesIcon />,
    description: "Figma, Sketch, or images",
  },
  {
    value: "other",
    label: "Other",
    icon: <MoreHorizIcon />,
    description: "Custom deliverable format",
  },
];

const TaskConfigForm: React.FC<TaskConfigFormProps> = ({
  initialConfig,
  onSave,
  onCancel,
}) => {
  const [taskTitle, setTaskTitle] = useState(initialConfig?.taskTitle || "");
  const [taskDescription, setTaskDescription] = useState(
    initialConfig?.taskDescription || ""
  );
  const [deliverableType, setDeliverableType] = useState(
    initialConfig?.deliverableType || "code"
  );

  const handleSave = () => {
    const config: TaskConfig = {
      taskTitle,
      taskDescription,
      deliverableType,
      configured: taskTitle.trim() !== "" && taskDescription.trim() !== "",
    };
    onSave(config);
  };

  const isValid = taskTitle.trim() !== "" && taskDescription.trim() !== "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Configure Assessment Task
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Create a task for candidates to complete as part of the assessment
        </Typography>
      </Box>

      {/* Task Title */}
      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Task Title
        </Typography>
        <TextField
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="e.g., Build a React Component Library"
          variant="outlined"
          fullWidth
          error={taskTitle.trim() === ""}
          helperText={taskTitle.trim() === "" ? "Task title is required" : ""}
        />
      </FormControl>

      {/* Task Description */}
      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Task Description
        </Typography>
        <TextField
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Provide detailed instructions for the task..."
          variant="outlined"
          multiline
          rows={6}
          fullWidth
          error={taskDescription.trim() === ""}
          helperText={
            taskDescription.trim() === "" ? "Task description is required" : ""
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              fontFamily: "monospace",
              fontSize: "14px",
            },
          }}
        />
        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
          Be specific about requirements, deliverables, and evaluation criteria
        </Typography>
      </FormControl>

      {/* Deliverable Type */}
      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Expected Deliverable Type
        </Typography>
        <RadioGroup
          value={deliverableType}
          onChange={(e) => setDeliverableType(e.target.value)}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {DELIVERABLE_TYPES.map((type) => (
              <Box
                key={type.value}
                sx={{
                  border: "1px solid",
                  borderColor:
                    deliverableType === type.value ? "primary.main" : "#e0e0e0",
                  borderRadius: "8px",
                  p: 1.5,
                  backgroundColor:
                    deliverableType === type.value ? "#f0f7ff" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor:
                      deliverableType === type.value ? "#e3f2fd" : "#f5f5f5",
                    borderColor:
                      deliverableType === type.value
                        ? "primary.main"
                        : "#bdbdbd",
                  },
                }}
                onClick={() => setDeliverableType(type.value)}
              >
                <FormControlLabel
                  value={type.value}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {type.icon}
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight={
                            deliverableType === type.value ? 600 : 400
                          }
                        >
                          {type.label}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </Box>
            ))}
          </Box>
        </RadioGroup>
      </FormControl>

      {/* Preview */}
      {taskTitle && taskDescription && (
        <Box
          sx={{
            p: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Task Preview
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            {taskTitle}
          </Typography>

          <Typography
            variant="body2"
            sx={{ mb: 1.5, whiteSpace: "pre-wrap", color: "#666" }}
          >
            {taskDescription}
          </Typography>

          <Box>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              Expected deliverable:
            </Typography>
            <Chip
              label={
                DELIVERABLE_TYPES.find((t) => t.value === deliverableType)
                  ?.label
              }
              icon={
                DELIVERABLE_TYPES.find((t) => t.value === deliverableType)?.icon
              }
              color="primary"
              size="small"
            />
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 2 }}
      >
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!isValid}>
          Save Configuration
        </Button>
      </Box>
    </Box>
  );
};

export default TaskConfigForm;