import React from "react";
import { Box } from "@mui/material";
import TechnicalSkillsConfigForm from "@/components/features/company/posts/create/steps/recruitment-flow-step/node-configuration/TechnicalSkillsConfigForm";
import SoftSkillsConfigForm from "@/components/features/company/posts/create/steps/recruitment-flow-step/node-configuration/SoftSkillsConfigForm";
import HRInterviewConfigForm from "@/components/features/company/posts/create/steps/recruitment-flow-step/node-configuration/HRInterviewConfigForm";
import TaskConfigForm from "@/components/features/company/posts/create/steps/recruitment-flow-step/node-configuration/TaskConfigForm";
import EmailConfigForm from "@/components/features/company/posts/create/steps/recruitment-flow-step/node-configuration/EmailConfigForm";

interface NodeConfigRendererProps {
  nodeType: string;
  initialConfig?: any;
  onSave: (config: any) => void;
  onCancel: () => void;
}

const NodeConfigRenderer: React.FC<NodeConfigRendererProps> = ({ nodeType, initialConfig, onSave, onCancel }) => {
  const renderForm = () => {
    switch (nodeType) {
      case "technical": return <TechnicalSkillsConfigForm initialConfig={initialConfig} onSave={onSave} onCancel={onCancel} />;
      case "soft":      return <SoftSkillsConfigForm      initialConfig={initialConfig} onSave={onSave} onCancel={onCancel} />;
      case "interview": return <HRInterviewConfigForm     initialConfig={initialConfig} onSave={onSave} onCancel={onCancel} />;
      case "task":      return <TaskConfigForm            initialConfig={initialConfig} onSave={onSave} onCancel={onCancel} />;
      case "email":     return <EmailConfigForm           initialConfig={initialConfig} onSave={onSave} onCancel={onCancel} />;
      default:          return <Box sx={{ p: 3, textAlign: "center", color: "#666" }}>Configuration not available for this node type.</Box>;
    }
  };
  return <Box sx={{ height: "100%", overflow: "auto" }}>{renderForm()}</Box>;
};

export default NodeConfigRenderer;
