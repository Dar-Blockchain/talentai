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
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useRef, useState } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeTypes,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import EmailIcon from "@mui/icons-material/Email";
import ConditionIcon from "@mui/icons-material/AccountTree";
import CloseIcon from "@mui/icons-material/Close";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PsychologyIcon from "@mui/icons-material/Psychology";
import InterviewIcon from "@mui/icons-material/RecordVoiceOver";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DeleteIcon from "@mui/icons-material/Delete";
import dynamic from "next/dynamic";
import styled from "@emotion/styled";
import Image from "next/image";
import { nodeTypes } from "./components/recruitment-flow/CustomNode";

const ReactFlow = dynamic(
  () => import("reactflow").then((mod) => mod.default),
  { ssr: false }
);
const MiniMap = dynamic(() => import("reactflow").then((mod) => mod.MiniMap), {
  ssr: false,
});
const Controls = dynamic(
  () => import("reactflow").then((mod) => mod.Controls),
  { ssr: false }
);
const Background = dynamic(
  () => import("reactflow").then((mod) => mod.Background),
  { ssr: false }
);
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}
const Sidebar = styled(Box)({
  width: "120px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "5px 10px",
  gap: "15px",
  overflowY: "auto",
});
const ActionButton = styled(Box)<{ actionType: string }>(({ actionType }) => ({
  width: "90px",
  height: "70px",
  borderRadius: "6px",
  border: "1px solid rgba(98, 111, 134, 0.18)",
  backgroundColor: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  gap: "4px",
  boxShadow: "0px 0px 6.1px 0px rgba(0, 0, 0, 0.06)",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#f8fafc",
    transform: "scale(1.05)",
  },
  ...(actionType === "technical" && {
    "& .MuiSvgIcon-root": { color: "#2563eb" },
  }),
  ...(actionType === "soft" && {
    "& .MuiSvgIcon-root": { color: "#7c3aed" },
  }),
  ...(actionType === "interview" && {
    "& .MuiSvgIcon-root": { color: "#059669" },
  }),
  ...(actionType === "task" && {
    "& .MuiSvgIcon-root": { color: "#dc2626" },
  }),
  ...(actionType === "condition" && {
    "& .MuiSvgIcon-root": { color: "#ec4899" },
  }),
  ...(actionType === "email" && {
    "& .MuiSvgIcon-root": { color: "#f59e0b" },
  }),
}));
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
// Menu items configuration
const menuItems = [
  {
    type: "technical",
    icon: (
      <Image
        src="/icons/technical.svg"
        alt="technical"
        width={17}
        height={17}
      />
    ),
    label: "Technical Skills",
    subtitle: "Validate technical skills",
  },
  {
    type: "soft",
    icon: <Image src="/icons/soft.svg" alt="soft" width={17} height={17} />,
    label: "Soft Skills",
    subtitle: "Assess soft skills",
  },
  {
    type: "interview",
    icon: <Image src="/icons/hr.svg" alt="hr" width={17} height={17} />,
    label: "HR Interview",
    subtitle: "Conduct HR interview",
  },
  {
    type: "task",
    icon: <Image src="/icons/task.svg" alt="task" width={17} height={17} />,
    label: "Task Creation",
    subtitle: "Create assessment task",
  },
  {
    type: "condition",
    icon: (
      <Image
        src="/icons/condition.svg"
        alt="condition"
        width={17}
        height={17}
      />
    ),
    label: "Condition",
    subtitle: "Add conditional logic",
  },
  {
    type: "email",
    icon: <Image src="/icons/email.svg" alt="email" width={17} height={17} />,
    label: "Email",
    subtitle: "Send email notification",
  },
];
const RecruitmentFlowStep = () => {
  const flowWrapper = useRef<HTMLDivElement | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      setSelectedNodes(selectedNodes);
    },
    []
  );
  const generateAIResponse = (nodeType: string, prompt: string): string => {
    const responses: { [key: string]: string } = {
      technical: `Based on your request "${prompt}", I've generated a technical skills assessment that includes:

🔧 **Skills to Evaluate**: React, JavaScript, TypeScript, Node.js
📊 **Assessment Type**: Coding challenges + Multiple choice
⏱️ **Duration**: 45 minutes
🎯 **Difficulty**: Intermediate level

**Sample Questions**:
1. Implement a custom React hook for API data fetching
2. Debug this TypeScript interface issue
3. Optimize this JavaScript algorithm

Would you like me to adjust the difficulty level or focus on specific technologies?`,

      soft: `Perfect! For "${prompt}", I've created a soft skills evaluation framework:

🧠 **Skills Focus**: Communication, Leadership, Problem-solving, Teamwork
📋 **Format**: Scenario-based questions + Behavioral interviews
🎭 **Situations**: Customer conflict, Team disagreement, Deadline pressure
⭐ **Scoring**: 1-5 scale with detailed rubrics

**Example Scenario**: "A team member consistently misses deadlines. How would you handle this situation?"

Ready to customize the scenarios or add specific competencies?`,

      interview: `Great choice! For "${prompt}", here's your HR interview structure:

👥 **Interview Format**: Structured behavioral interview
📝 **Key Areas**: Culture fit, Career goals, Experience review
⏰ **Duration**: 30-45 minutes
🎯 **Questions**: STAR method focused

**Sample Questions**:
- "Tell me about a challenging project you overcame"
- "Where do you see yourself in 5 years?"
- "Describe a time you had to learn something quickly"

Want me to add company-specific questions or adjust the format?`,

      task: `Excellent! Based on "${prompt}", I've designed a practical task:

📋 **Task Type**: Real-world project simulation
🎯 **Objective**: Build a mini feature/solve business problem
⏱️ **Time Limit**: 2-3 hours
📊 **Evaluation**: Code quality, approach, documentation

**Example Task**: "Create a simple todo app with React that syncs to localStorage and includes search functionality"

**Deliverables**: 
- Working code
- Brief explanation of approach
- Any trade-offs made

Need me to adjust complexity or add specific requirements?`,

      condition: `Perfect! I've set up a conditional routing system for "${prompt}":

🔀 **Field**: Assessment Score  
📊 **Condition**: score >= 75  
✅ **YES Path**: Candidate scored well - proceed to next step  
❌ **NO Path**: Score too low - send feedback/resources  

**How it works:**
- Green handle (YES): Routes candidates who meet the condition
- Red handle (NO): Routes candidates who don't meet the condition  
- You can connect each handle to different next steps

The condition form lets you customize:
- What field to check (score, experience, status, etc.)
- Comparison operator (>, >=, <, <=, ==, !=) 
- Value to compare against

This creates branching logic in your assessment flow!`,

      email: `Perfect! For "${prompt}", I've crafted your email automation:

📧 **Email Type**: Assessment completion notification
🎯 **Trigger**: When candidate completes evaluation
📝 **Personalization**: Name, score, next steps

**Subject**: "Next Steps in Your Application - [Company Name]"

**Template**:
"Hi {{candidateName}},

Thank you for completing our assessment! Based on your performance (Score: {{score}}%), {{#if passed}}we're excited to invite you to the next round{{else}}we'd like to provide some resources for improvement{{/if}}.

{{nextSteps}}

Best regards,
[Your Name]"

Ready to customize the content or add more triggers?`,
    };

    return (
      responses[nodeType] ||
      `I've processed your request "${prompt}" and generated appropriate content for this ${nodeType} step. The configuration has been updated with relevant settings and templates.`
    );
  };

  const handleSendPrompt = async () => {
    if (!currentPrompt.trim() || !selectedNode) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: currentPrompt,
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const promptToProcess = currentPrompt;
    setCurrentPrompt("");
    setIsGenerating(true);

    // Simulate AI response based on node type and prompt
    setTimeout(() => {
      const aiResponse = generateAIResponse(
        selectedNode.data.type,
        promptToProcess
      );
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);

      // Update node configuration
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  config: {
                    ...node.data.config,
                    lastPrompt: promptToProcess,
                    generatedContent: aiResponse,
                    configured: true,
                  },
                },
              }
            : node
        )
      );
    }, 2000);
  };
  const addNode = useCallback(
    (type: string) => {
      const menuItem = menuItems.find((item) => item.type === type);

      const lastNode = nodes[nodes.length - 1];

      let newX = 200;
      let newY = 50; // default top padding

      // If FIRST node
      if (!lastNode && flowWrapper.current) {
        const rect = flowWrapper.current.getBoundingClientRect();

        // Center horizontally, up top vertically
        newX = rect.width / 2 - 75; // assuming ~150px node width
        newY = 50;
      }

      // For next nodes → offset
      if (lastNode) {
        newX = lastNode.position.x + 40;
        newY = lastNode.position.y + 40;
      }

      const nodeCount =
        nodes.filter((node) => node.data.type === type).length + 1;

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type: "custom",
        position: { x: newX, y: newY },
        data: {
          label: `${menuItem?.label || type} ${nodeCount}`,
          type,
          subtitle: menuItem?.subtitle,
          config: {
            nodeNumber: nodeCount,
            title: `${menuItem?.label || type} ${nodeCount}`,
            configured: false,
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, menuItems, nodes, flowWrapper]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);

    // For condition nodes, don't start with chat - show form directly
    if (node.data.type === "condition") {
      setChatMessages([]);
    } else {
      setChatMessages([
        {
          id: "1",
          text: `Hi! I'm here to help you configure your ${node.data.label} step. What would you like this step to do?`,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
    setCurrentPrompt("");
    setModalOpen(true);
  }, []);
  const deleteNode = useCallback(
    (nodeId: string) => {
      // Remove the node
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));

      // Remove connected edges
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );

      setSelectedNodes([]);
    },
    [setNodes, setEdges]
  );

  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) return;

    const selectedNodeIds = selectedNodes.map((node) => node.id);

    // Remove nodes
    setNodes((nds) => nds.filter((node) => !selectedNodeIds.includes(node.id)));

    // Remove connected edges
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !selectedNodeIds.includes(edge.source) &&
          !selectedNodeIds.includes(edge.target)
      )
    );

    setSelectedNodes([]);
  }, [selectedNodes, setNodes, setEdges]);
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
    setSelectedNode(updatedNode);
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

    setModalOpen(false);
  };
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", pt: 2 }}>
      <Sidebar>
        {menuItems.map((item) => {
          return (
            <Tooltip key={item.type} title={item.label} placement="right">
              <ActionButton
                actionType={item.type}
                onClick={() => addNode(item.type)}
              >
                {item.icon}

                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "10px",
                    fontWeight: 500,
                    textAlign: "center",
                    color: "rgba(32, 45, 57, 1)",
                  }}
                >
                  {item.label.split(" ")[0]}
                </Typography>
              </ActionButton>
            </Tooltip>
          );
        })}
      </Sidebar>

      <Box
        sx={{
          display: "flex",
          jutifyContent: "center",
          flex: 1,
          height: "600px",
          width: "900px",
          mx: "auto",
        }}
        ref={flowWrapper}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          style={{
            position: "relative",
            borderRadius: "12px",
            border: "1px solid rgba(98, 111, 134, 0.18)",
            boxShadow: "0px 0px 8.7px 0px rgba(0, 0, 0, 0.06)",
          }}
        >
          <Controls />
          <MiniMap />
          <Background
            variant={"dots" as any}
            gap={12}
            size={1}
            style={{ backgroundColor: "rgba(75, 88, 101, 0.04)" }}
          />
          {/* Floating Delete Button */}
          {selectedNodes.length > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Tooltip title={"Or press Delete/Backspace"} placement="bottom">
                <Button
                  variant="contained"
                  startIcon={
                    <Image
                      src="/icons/delete.svg"
                      alt="search"
                      width={20}
                      height={20}
                    />
                  }
                  onClick={deleteSelectedNodes}
                  sx={{
                    borderRadius: "20px",
                    px: 3,
                    border: "1px solid rgba(224, 62, 92, 1)",
                    color: "rgba(224, 62, 92, 1)",
                    backgroundColor: "rgba(224, 62, 92, 0.08)",
                    fontSize: "14px",
                    fontWeight: 500,
                    boxShadow: "none",
                    textTransform: "none",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      borderColor: "rgba(224, 62, 92, 1)",
                      boxShadow: "none",
                    },
                  }}
                >
                  Delete {selectedNodes.length} item
                  {selectedNodes.length > 1 ? "s" : ""}
                </Button>
              </Tooltip>
            </Box>
          )}
        </ReactFlow>
      </Box>
      {/* Configuration Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        disableEnforceFocus
        disableAutoFocus
      >
        <Box
          sx={{
            ...ModalStyle,
            width: selectedNode?.data.type === "condition" ? 550 : 700,
            height: selectedNode?.data.type === "condition" ? "auto" : 600,
            maxHeight: selectedNode?.data.type === "condition" ? "80vh" : 600,
            overflow:
              selectedNode?.data.type === "condition" ? "auto" : "hidden",
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {selectedNode?.data.type === "condition" ? (
                <ConditionIcon color="primary" />
              ) : (
                <SmartToyIcon color="primary" />
              )}
              <Typography variant="h6">
                {selectedNode?.data.type === "condition"
                  ? "Configure Condition"
                  : "AI Assistant"}{" "}
                - {selectedNode?.data.label}
              </Typography>
            </Box>
            <IconButton onClick={() => setModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Condition Form */}
          {selectedNode?.data.type === "condition" ? (
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
          ) : (
            /* Chat Interface for other nodes */
            <>
              {/* Chat Messages Area */}
              <Box
                sx={{
                  height: 400,
                  overflowY: "auto",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  p: 2,
                  mb: 2,
                  backgroundColor: "#fafafa",
                }}
              >
                {chatMessages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: "flex",
                      justifyContent: message.isUser
                        ? "flex-end"
                        : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "80%",
                        p: 2,
                        borderRadius: "12px",
                        backgroundColor: message.isUser ? "#1976d2" : "#fff",
                        color: message.isUser ? "#fff" : "#000",
                        border: message.isUser ? "none" : "1px solid #e0e0e0",
                        wordWrap: "break-word",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {message.text}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                          display: "block",
                          mt: 0.5,
                          fontSize: "11px",
                        }}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {isGenerating && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        AI is thinking...
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Input Area */}
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  value={currentPrompt}
                  onChange={(e) => {
                    e.stopPropagation();
                    setCurrentPrompt(e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder={`Tell me what you want this ${selectedNode?.data.label.toLowerCase()} step to do...`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  }}
                  disabled={isGenerating}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendPrompt}
                  disabled={!currentPrompt.trim() || isGenerating}
                  color="primary"
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                    "&:disabled": {
                      backgroundColor: "#e0e0e0",
                    },
                    width: 48,
                    height: 48,
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          )}

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
                  setModalOpen(false);
                }
              }}
            >
              Delete Node
            </Button>

            <Box sx={{ display: "flex", gap: 1 }}>
              {selectedNode?.data.type === "condition" ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => setModalOpen(false)}
                  >
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
                </>
              ) : (
                <Button variant="outlined" onClick={() => setModalOpen(false)}>
                  Close
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default RecruitmentFlowStep;