import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { postRecruitmentSteps, selectPostStepsLoading, selectPostStepsError } from '../../store/slices/postSlice';
import { 
  Box, 
  Typography, 
  Button, 
  Stepper, 
  Step, 
  StepLabel, 
  IconButton, 
  Tooltip,
  Modal,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeTypes,
  Handle,
  Position,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from "react-hot-toast";
// Icons
import EmailIcon from '@mui/icons-material/Email';
import ConditionIcon from '@mui/icons-material/AccountTree';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PsychologyIcon from '@mui/icons-material/Psychology';
import InterviewIcon from '@mui/icons-material/RecordVoiceOver';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


import PostDetails from './recruitment-post/PostDetails';
import { PostDetailsRef } from './recruitment-post/types';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

// Constants
const GREEN_MAIN = '#00FF9D';

// Styled components
const Container = styled(Box)({
  width: '100%',
  height: '100vh',
  backgroundColor: '#f5f7fa',
  display: 'flex',
  flexDirection: 'column',
});

const Header = styled(Box)({
  padding: '20px 40px',
  backgroundColor: 'white',
  borderBottom: '1px solid #e1e5e9',
});

const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  position: 'relative',
});

const Sidebar = styled(Box)({
  width: '120px',
  backgroundColor: 'white',
  borderRight: '1px solid #e1e5e9',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px 10px',
  gap: '15px',
  overflowY: 'auto',
});

const Footer = styled(Box)({
  padding: '20px 40px',
  backgroundColor: 'white',
  borderTop: '1px solid #e1e5e9',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ActionButton = styled(Box)<{ actionType: string }>(({ actionType }) => ({
  width: '90px',
  height: '70px',
  borderRadius: '12px',
  border: '1px solid #e1e5e9',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  gap: '4px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f8fafc',
    transform: 'scale(1.05)',
  },
  ...(actionType === 'technical' && {
    '& .MuiSvgIcon-root': { color: '#2563eb' },
  }),
  ...(actionType === 'soft' && {
    '& .MuiSvgIcon-root': { color: '#7c3aed' },
  }),
  ...(actionType === 'interview' && {
    '& .MuiSvgIcon-root': { color: '#059669' },
  }),
  ...(actionType === 'task' && {
    '& .MuiSvgIcon-root': { color: '#dc2626' },
  }),
  ...(actionType === 'condition' && {
    '& .MuiSvgIcon-root': { color: '#ec4899' },
  }),
  ...(actionType === 'email' && {
    '& .MuiSvgIcon-root': { color: '#f59e0b' },
  }),
}));

const ModalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  borderRadius: '12px',
  boxShadow: 24,
  p: 4,
};

// Custom Node Component
const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'technical':
        return { backgroundColor: '#dbeafe', borderColor: '#2563eb', color: '#1d4ed8' };
      case 'soft':
        return { backgroundColor: '#ede9fe', borderColor: '#7c3aed', color: '#6d28d9' };
      case 'interview':
        return { backgroundColor: '#d1fae5', borderColor: '#059669', color: '#047857' };
      case 'task':
        return { backgroundColor: '#fee2e2', borderColor: '#dc2626', color: '#b91c1c' };
      case 'condition':
        return { backgroundColor: '#fce7f3', borderColor: '#ec4899', color: '#be185d' };
      case 'email':
        return { backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#d97706' };
      default:
        return { backgroundColor: '#f1f5f9', borderColor: '#64748b', color: '#475569' };
    }
  };

  const style = getNodeStyle(data.type);

  return (
    <Box
      sx={{
        padding: '12px 16px',
        borderRadius: '8px',
        border: `2px solid ${style.borderColor}`,
        backgroundColor: style.backgroundColor,
        color: style.color,
        minWidth: '150px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: selected ? '0 0 0 2px #3b82f6' : 'none',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Connection handles - larger and more visible */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ 
          background: style.borderColor, 
          width: 12, 
          height: 12,
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
      
      {/* Condition nodes have two output handles (Yes/No) */}
      {data.type === 'condition' ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            style={{ 
              background: '#10b981', 
              width: 12, 
              height: 12,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              left: '30%'
            }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            style={{ 
              background: '#ef4444', 
              width: 12, 
              height: 12,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              left: '70%'
            }}
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ 
            background: style.borderColor, 
            width: 12, 
            height: 12,
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {data.label}
        </Typography>
        {data.config?.configured && (
          <Box sx={{ 
            width: 8, 
            height: 8, 
            backgroundColor: '#10b981', 
            borderRadius: '50%',
            flexShrink: 0
          }} />
        )}
      </Box>
      
      {data.subtitle && (
        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>
          {data.subtitle}
        </Typography>
      )}
      
      {!data.config?.configured && (
        <Typography variant="caption" sx={{ 
          color: '#f59e0b', 
          display: 'block', 
          fontWeight: 'bold',
          fontSize: '10px'
        }}>
          Not configured
        </Typography>
      )}
      
      {/* Show condition details if configured */}
      {data.type === 'condition' && data.config?.field && data.config?.operator && data.config?.value && (
        <Box sx={{ mt: 1, fontSize: '11px', opacity: 0.9 }}>
          <Typography variant="caption" sx={{ display: 'block' }}>
            {data.config.field} {data.config.operator} {data.config.value}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>
              YES
            </Typography>
            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 'bold' }}>
              NO
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

interface NodeData {
  label: string;
  type: string;
  subtitle?: string;
  config?: any;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const RecruitmentFlowBuilder: React.FC = () => {
  const router = useRouter();
  
  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const postStepsLoading = useSelector(selectPostStepsLoading);
  const postStepsError = useSelector(selectPostStepsError);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const [isSavingJob, setIsSavingJob] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedJobId, setSavedJobId] = useState<string | null>(null);
    const [isSavingSteps, setIsSavingSteps] = useState(false);

  // Refs
  const postDetailsRef = useRef<PostDetailsRef>(null);

const steps = [
  'Job Details',              // Step 1: Job title, description, etc.
  'Recruitment Flow',         // Step 2: Define recruitment sequence
  // 'Final Review'              // Step 3: Confirm all before publishing
];
  // Define node types for React Flow
  const nodeTypes: NodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Menu items configuration
  const menuItems = [
    { 
      type: 'technical', 
      icon: EngineeringIcon, 
      label: 'Technical Skills', 
      subtitle: 'Validate technical skills' 
    },
    { 
      type: 'soft', 
      icon: PsychologyIcon, 
      label: 'Soft Skills', 
      subtitle: 'Assess soft skills' 
    },
    { 
      type: 'interview', 
      icon: InterviewIcon, 
      label: 'HR Interview', 
      subtitle: 'Conduct HR interview' 
    },
    { 
      type: 'task', 
      icon: AssignmentIcon, 
      label: 'Task Creation', 
      subtitle: 'Create assessment task' 
    },
    { 
      type: 'condition', 
      icon: ConditionIcon, 
      label: 'Condition', 
      subtitle: 'Add conditional logic' 
    },
    { 
      type: 'email', 
      icon: EmailIcon, 
      label: 'Email', 
      subtitle: 'Send email notification' 
    },
  ];

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    setSelectedNodes(selectedNodes);
  }, []);

  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) return;
    
    const selectedNodeIds = selectedNodes.map(node => node.id);
    
    // Remove nodes
    setNodes((nds) => nds.filter((node) => !selectedNodeIds.includes(node.id)));
    
    // Remove connected edges
    setEdges((eds) => eds.filter((edge) => 
      !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
    ));
    
    setSelectedNodes([]);
  }, [selectedNodes, setNodes, setEdges]);

  const deleteNode = useCallback((nodeId: string) => {
    // Remove the node
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    
    // Remove connected edges
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    
    setSelectedNodes([]);
  }, [setNodes, setEdges]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      deleteSelectedNodes();
    }
  }, [deleteSelectedNodes]);

  const addNode = useCallback((type: string) => {
    const menuItem = menuItems.find(item => item.type === type);
    const nodeCount = nodes.filter(node => node.data.type === type).length + 1;
    const newNode: Node = {
      id: `${type}_${Date.now()}`,
      type: 'custom',
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { 
        label: `${menuItem?.label || type} ${nodeCount}`,
        type: type,
        subtitle: menuItem?.subtitle,
        config: {
          nodeNumber: nodeCount,
          title: `${menuItem?.label || type} ${nodeCount}`,
          configured: false
        }
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, menuItems, nodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    
    // For condition nodes, don't start with chat - show form directly
    if (node.data.type === 'condition') {
      setChatMessages([]);
    } else {
      setChatMessages([
        {
          id: '1',
          text: `Hi! I'm here to help you configure your ${node.data.label} step. What would you like this step to do?`,
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }
    setCurrentPrompt('');
    setModalOpen(true);
  }, []);

  const handleSendPrompt = async () => {
    if (!currentPrompt.trim() || !selectedNode) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: currentPrompt,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const promptToProcess = currentPrompt;
    setCurrentPrompt('');
    setIsGenerating(true);

    // Simulate AI response based on node type and prompt
    setTimeout(() => {
      const aiResponse = generateAIResponse(selectedNode.data.type, promptToProcess);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
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
                    configured: true
                  } 
                }
              }
            : node
        )
      );
    }, 2000);
  };

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

Ready to customize the content or add more triggers?`
    };

    return responses[nodeType] || `I've processed your request "${prompt}" and generated appropriate content for this ${nodeType} step. The configuration has been updated with relevant settings and templates.`;
  };

  const handleConditionFormUpdate = (field: string, value: any) => {
    if (!selectedNode) return;
    
    // Update the selected node state immediately for UI responsiveness
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        config: {
          ...selectedNode.data.config,
          [field]: value
        }
      }
    };
    setSelectedNode(updatedNode);
  };

  const handleConditionConfirm = () => {
    if (!selectedNode) return;
    
    const isComplete = selectedNode.data.config?.field && 
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
                  configured: isComplete
                }
              }
            }
          : node
      )
    );
    
    setModalOpen(false);
  };

    const handleNext = async () => {
    // Clear any previous save errors
    setSaveError(null);
    
    // If we're on the Job Post step (step 0), save the job first
    if (activeStep === 0) {
      if (!postDetailsRef.current?.canProceed()) {
        setSaveError('Please generate a job post before proceeding to the next step.');
        return;
      }
      
      setIsSavingJob(true);
      try {
        const saveResult : any = await postDetailsRef.current?.saveJob();
        if (!saveResult?.success || !saveResult?.jobId) {
          setSaveError('Failed to save job post. Please try again.');
          return;
        }
        
        // Use the actual job ID returned from the save operation
        setSavedJobId(saveResult.jobId);
    } catch (error) {
        console.error('Error during job save:', error);
        setSaveError('An error occurred while saving the job post. Please try again.');
        return;
    } finally {
        setIsSavingJob(false);
      }
    }

    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // Final step - save the sequence
      if (!savedJobId) {
        setSaveError('No job ID available. Please save the job post first.');
        return;
      }

      try {
        setIsSavingSteps(true)
        const sequenceData = nodes.map((node, index) => ({
            ...node,
            order: index,
            connections: edges
            .filter(edge => edge.source === node.id || edge.target === node.id)
            .map(edge => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              type: edge.source === node.id ? 'outgoing' : 'incoming'
            }))
          }));


        console.log('Sending steps to API:', sequenceData);

        // Call the Redux action to save the sequence
        const result = await dispatch(postRecruitmentSteps({
          postId: savedJobId,
          steps: sequenceData
        }));

        if (postRecruitmentSteps.fulfilled.match(result)) {
          console.log('Sequence saved successfully:', result.payload);
          setIsSavingSteps(false)
          toast.success("Job post created successfully! Your recruitment flow has been saved.");          
          // You can add success notification here
          router.push('/dashboard/company')
        } else {
                    setIsSavingSteps(false)

          console.error('Failed to save sequence:', result.payload);
          setSaveError(`Failed to save sequence: ${result.payload}`);
        }
        
      } catch (error) {
                  setIsSavingSteps(false)

        console.error('Error saving sequence:', error);
        setSaveError('An error occurred while saving the sequence. Please try again.');
      }
    }
  };

  // Clear errors when Redux error state changes
  React.useEffect(() => {
    if (postStepsError) {
      setSaveError(`Sequence Error: ${postStepsError}`);
    }
  }, [postStepsError]);

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <PostDetails ref={postDetailsRef} />
        );
      case 1:
        return (
          <Box sx={{ flex: 1, height: '100%', position: 'relative' }}>
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
            >
              <Controls />
              <MiniMap />
              <Background variant={'dots' as any} gap={12} size={1} />
            </ReactFlow>

            {/* Floating Delete Button */}
            {selectedNodes.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  alignItems: 'center'
                }}
              >
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={deleteSelectedNodes}
                  sx={{
                    borderRadius: '20px',
                    px: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  Delete {selectedNodes.length} item{selectedNodes.length > 1 ? 's' : ''}
                </Button>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    backgroundColor: 'rgba(0,0,0,0.7)', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}
                >
                  Or press Delete/Backspace
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ flex: 1, p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#1f2937' }}>
              Review & Launch
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#6b7280' }}>
              Review your sequence configuration before launching.
            </Typography>
            <Paper sx={{ p: 3, maxWidth: 800 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Sequence Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Nodes: {nodes.length}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Connections: {edges.length}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Your sequence is ready to be launched. Click "Launch Sequence" to start sending.
              </Typography>
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Header>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            padding: 3,
            backgroundColor: '#f9fafb', // Soft neutral background
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', // Gentle elevation
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  style: {
                    color:
                      index === activeStep
                        ? 'rgb(47, 212, 149)' // Current step
                        : index < activeStep
                        ? 'rgba(47, 212, 149, 0.7)' // Completed
                        : '#d1d5db', // Upcoming
                    fontSize: '1.5rem',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={index === activeStep ? 600 : 400}
                  sx={{
                    color:
                      index === activeStep
                        ? '#1f2937' // Strong text for current
                        : index < activeStep
                        ? 'rgba(47, 212, 149, 0.9)' // Soft green for completed
                        : '#9ca3af', // Gray for upcoming
                    textTransform: 'capitalize',
                    fontSize: '0.875rem',
                  }}
                >
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Header>


      <MainContent>
        {activeStep === 1 && (
          <Sidebar>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Tooltip key={item.type} title={item.label} placement="right">
                  <ActionButton 
                    actionType={item.type} 
                    onClick={() => addNode(item.type)}
                  >
                    <IconComponent fontSize="small" />
                    <Typography variant="caption" sx={{ fontSize: '10px', textAlign: 'center' }}>
                      {item.label.split(' ')[0]}
                    </Typography>
                  </ActionButton>
                </Tooltip>
              );
            })}
          </Sidebar>
        )}
        
        {renderStepContent()}
      </MainContent>

      <Footer sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {/* <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          sx={{ borderRadius: '8px' }}
        >
          Save
        </Button> */}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              borderRadius: '8px',
              paddingX: 2.5,
              paddingY: 1.25,
              fontWeight: 500,
              fontSize: '0.875rem',
              borderColor: '#64748b', // Slate-500
              color: '#1e293b', // Slate-800
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#f1f5f9', // Slate-100
                borderColor: '#475569', // Slate-600
              },
              '&.Mui-disabled': {
                borderColor: '#cbd5e1', // Slate-300
                color: '#94a3b8', // Slate-400
                backgroundColor: '#f8fafc', // subtle disabled background
              }
            }}
          >
            Back
          </Button>

          
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              endIcon={
                isSavingJob || isSavingSteps ? (
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                ) : (
                  <ArrowForwardIcon />
                )
              }
              onClick={handleNext}
              disabled={isSavingSteps || isSavingJob || (activeStep === 0 && postDetailsRef.current?.canProceed())}
              sx={{
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'none',
                color: '#ffffff',
                background: 'linear-gradient(90deg, rgb(47, 212, 149) 0%, rgb(5, 150, 105) 100%)',
                boxShadow: '0 2px 10px rgba(47, 212, 149, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(90deg, rgb(38, 180, 128) 0%, rgb(4, 120, 85) 100%)',
                },
                '&.Mui-disabled': {
                  background: 'rgba(47, 212, 149, 0.4)',
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            >
              {isSavingJob
                ? 'Saving Job...'
                : postStepsLoading
                ? 'Confirm...'
                : activeStep === steps.length - 1
                ? 'Save Sequence'
                : 'Next'}
            </Button>

          ) : (
            <Button
              variant="contained"
              endIcon={
                isSavingSteps ? (
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                ) : (
                  <PlayArrowIcon />
                )
              }
              disabled={isSavingSteps}
              onClick={handleNext}
              sx={{
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'none',
                color: '#ffffff',
                background: 'linear-gradient(90deg, rgb(47, 212, 149) 0%, rgb(5, 150, 105) 100%)',
                boxShadow: '0 2px 10px rgba(47, 212, 149, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(90deg, rgb(38, 180, 128) 0%, rgb(4, 120, 85) 100%)',
                },
              }}
            >
              Confirm
            </Button>
          )}
        </Box>
      </Footer>

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
            width: selectedNode?.data.type === 'condition' ? 550 : 700, 
            height: selectedNode?.data.type === 'condition' ? 'auto' : 600,
            maxHeight: selectedNode?.data.type === 'condition' ? '80vh' : 600,
            overflow: selectedNode?.data.type === 'condition' ? 'auto' : 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedNode?.data.type === 'condition' ? (
                <ConditionIcon color="primary" />
              ) : (
                <SmartToyIcon color="primary" />
              )}
              <Typography variant="h6">
                {selectedNode?.data.type === 'condition' ? 'Configure Condition' : 'AI Assistant'} - {selectedNode?.data.label}
              </Typography>
            </Box>
            <IconButton onClick={() => setModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Condition Form */}
          {selectedNode?.data.type === 'condition' ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2.5,
                minHeight: 'auto',
                pb: 2
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Define the condition that will determine which path to take. Candidates will follow different routes based on whether the condition is met.
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Field to Check</InputLabel>
                <Select
                  value={selectedNode?.data.config?.field || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleConditionFormUpdate('field', e.target.value);
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
                  value={selectedNode?.data.config?.operator || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleConditionFormUpdate('operator', e.target.value);
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
                value={selectedNode?.data.config?.value || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  handleConditionFormUpdate('value', e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="e.g., 75, Senior, Passed"
                fullWidth
                helperText="Enter the value to compare against (numbers for scores, text for status)"
              />

              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                p: 1.5, 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px',
                alignItems: 'center' 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    backgroundColor: '#10b981', 
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                  <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}>
                    YES - Condition is true
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mx: 1 }}>|</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    backgroundColor: '#ef4444', 
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                  <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>
                    NO - Condition is false
                  </Typography>
                </Box>
              </Box>

              {selectedNode?.data.config?.field && selectedNode?.data.config?.operator && selectedNode?.data.config?.value && (
                <Box sx={{ 
                  p: 1.5, 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '8px',
                  border: '1px solid #1976d2'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '13px' }}>
                    Condition Preview:
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    IF {selectedNode.data.config.field} {selectedNode.data.config.operator} {selectedNode.data.config.value}
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
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  p: 2,
                  mb: 2,
                  backgroundColor: '#fafafa'
                }}
              >
                {chatMessages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '80%',
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: message.isUser ? '#1976d2' : '#fff',
                        color: message.isUser ? '#fff' : '#000',
                        border: message.isUser ? 'none' : '1px solid #e0e0e0',
                        wordWrap: 'break-word'
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.text}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.7, 
                          display: 'block', 
                          mt: 0.5,
                          fontSize: '11px'
                        }}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                
                {isGenerating && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
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
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
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
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  }}
                  disabled={isGenerating}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                    }
                  }}
                />
                <IconButton 
                  onClick={handleSendPrompt}
                  disabled={!currentPrompt.trim() || isGenerating}
                  color="primary"
                  sx={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                    '&:disabled': {
                      backgroundColor: '#e0e0e0',
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2 }}>
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
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedNode?.data.type === 'condition' ? (
                <>
                  <Button variant="outlined" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleConditionConfirm}
                    disabled={!selectedNode?.data.config?.field || !selectedNode?.data.config?.operator || !selectedNode?.data.config?.value}
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
    </Container>
  );
};

export default RecruitmentFlowBuilder;