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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic';
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
} from 'reactflow';
import 'reactflow/dist/style.css';

// Lazy load ReactFlow to improve initial page load performance
const ReactFlow = dynamic(
  () => import('reactflow').then((mod) => mod.default),
  { ssr: false }
);

const MiniMap = dynamic(
  () => import('reactflow').then((mod) => mod.MiniMap),
  { ssr: false }
);

const Controls = dynamic(
  () => import('reactflow').then((mod) => mod.Controls),
  { ssr: false }
);

const Background = dynamic(
  () => import('reactflow').then((mod) => mod.Background),
  { ssr: false }
);
import { toast } from "react-hot-toast";
// Icons
import EmailIcon from '@mui/icons-material/Email';
import ConditionIcon from '@mui/icons-material/AccountTree';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
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
import ManualJobDetailsForm, { ManualJobDetailsRef } from './recruitment-post/components/ManualJobDetailsForm';
import AgentConfigurationForm, { AgentConfigurationFormValues } from './AgentConfigurationForm';
import PaymentConfirmationDialog from './PaymentConfirmationDialog';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { selectProfile } from '@/store/slices/profileSlice';
import Navbar from '../dashboard-company/Navbar';
import { NodeConfigRenderer } from './recruitment-flow-config';

// Constants
const GREEN_MAIN = '#00FF9D';

const DEFAULT_AGENT_CONFIG: AgentConfigurationFormValues = {
  agentId: '',
  postId: '',
  thresholdPercent: 80,
  bidBudgetMin: 20,
  bidBudgetMax: 500,
  bidStep: 10,
  maxCandidatesToBid: 2,
  agentLifetimeDays: 30,
  bidLifetimeDays: 7,
  autoSubmitTopMatch: true,
  maxDailySpending: 150,
  isActive: true,
};

// Function to generate default pipeline nodes with unique IDs
const generateDefaultPipelineNodes = (): { nodes: Node[], edges: Edge[] } => {
  const timestamp = Date.now();
  const randomSuffix1 = Math.random().toString(36).substr(2, 9);
  const randomSuffix2 = Math.random().toString(36).substr(2, 9);
  const randomSuffix3 = Math.random().toString(36).substr(2, 9);

  const technicalId = `technical_${timestamp}_${randomSuffix1}`;
  const softId = `soft_${timestamp}_${randomSuffix2}`;
  const interviewId = `interview_${timestamp}_${randomSuffix3}`;

  const nodes: Node[] = [
    {
      id: technicalId,
      type: 'custom',
      position: { x: 250, y: 50 },
      data: {
        label: 'Technical Skills 1',
        type: 'technical',
        subtitle: 'Validate technical skills',
        config: {
          nodeNumber: 1,
          title: 'Technical Skills 1',
          configured: false,
        }
      }
    },
    {
      id: softId,
      type: 'custom',
      position: { x: 250, y: 180 },
      data: {
        label: 'Soft Skills 1',
        type: 'soft',
        subtitle: 'Assess soft skills',
        config: {
          nodeNumber: 2,
          title: 'Soft Skills 1',
          configured: false,
        }
      }
    },
    {
      id: interviewId,
      type: 'custom',
      position: { x: 250, y: 310 },
      data: {
        label: 'HR Interview 1',
        type: 'interview',
        subtitle: 'Conduct HR interview',
        config: {
          nodeNumber: 3,
          title: 'HR Interview 1',
          configured: false,
        }
      }
    }
  ];

  const edges: Edge[] = [
    {
      id: `edge-${technicalId}-${softId}`,
      source: technicalId,
      target: softId,
      type: 'default'
    },
    {
      id: `edge-${softId}-${interviewId}`,
      source: softId,
      target: interviewId,
      type: 'default'
    }
  ];

  return { nodes, edges };
};

// Styled components
const Container = styled(Box)({
  width: '100%',
  height: '100vh',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
});

const Header = styled(Box)(({ theme }) => ({
  padding: '20px 40px',
  backgroundColor: 'white',
  borderBottom: '1px solid #e1e5e9',
  [theme.breakpoints.down('sm')]: {
    padding: '16px 20px',
  },
}));

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

const Footer = styled(Box)(({ theme }) => ({
  padding: '20px 40px',
  backgroundColor: 'white',
  borderTop: '1px solid #e1e5e9',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    padding: '16px 20px',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'stretch',
  },
}));

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

  const apiBaseUrl = React.useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/';
    return base.endsWith('/') ? base : `${base}/`;
  }, []);

  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const postStepsLoading = useSelector(selectPostStepsLoading);
  const postStepsError = useSelector(selectPostStepsError);
  const { profile: authProfile, loading: authLoading } = useSelector(selectProfile);
  
  // Debug profile data
  console.log('RecruitmentFlowBuilder authProfile:', authProfile);

  // React Flow state - Initialize with default pipeline using unique IDs
  const defaultPipeline = React.useMemo(() => generateDefaultPipelineNodes(), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultPipeline.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultPipeline.edges);

  // UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [agentLoadingModalOpen, setAgentLoadingModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const [isSavingJob, setIsSavingJob] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedJobId, setSavedJobId] = useState<string | null>(null);
  const [agentConfig, setAgentConfig] = useState<AgentConfigurationFormValues>({ ...DEFAULT_AGENT_CONFIG });
  const [isSavingAgentConfig, setIsSavingAgentConfig] = useState(false);
  const [registeredAgentId, setRegisteredAgentId] = useState<string | null>(null);
  const [registeredAgentName, setRegisteredAgentName] = useState<string | null>(null);
  const [isSavingSteps, setIsSavingSteps] = useState(false);
  const [isRegisteringAgent, setIsRegisteringAgent] = useState(false);
  const [postDetailsReady, setPostDetailsReady] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [matchingConfig, setMatchingConfig] = useState<any>(null);

  // Refs
  const postDetailsRef = useRef<PostDetailsRef>(null);
  const manualJobDetailsRef = useRef<ManualJobDetailsRef>(null);

  // Prompt flow flag - when true, skip pipeline and redirect after agent config
  const [isPromptFlow, setIsPromptFlow] = useState<boolean | null>(null); // null = not chosen yet, true = prompt flow, false = pipeline flow
  const [flowTypeSelected, setFlowTypeSelected] = useState(false);

  React.useEffect(() => {
    if (savedJobId) {
      setAgentConfig((prev) => ({
        ...prev,
        postId: savedJobId,
      }));
    }
  }, [savedJobId]);

  React.useEffect(() => {
    if (registeredAgentId) {
      setAgentConfig((prev) => ({
        ...prev,
        agentId: registeredAgentId,
      }));
    }
  }, [registeredAgentId]);

  const handleAgentConfigChange = useCallback((update: Partial<AgentConfigurationFormValues>) => {
    setAgentConfig((prev) => ({
      ...prev,
      ...update,
    }));
  }, []);

  // Function to register HR Agent for the post
  const registerHRAgent = async (jobId: string) => {
    setIsRegisteringAgent(true);
    setAgentLoadingModalOpen(true);
    try {
      console.log('Full auth profile object:', authProfile);
      console.log('Auth profile structure:', {
        hasProfile: !!authProfile,
        hasUserId: !!authProfile?.userId,
        userId: authProfile?.userId,
        companyDetails: authProfile?.companyDetails,
        profileType: authProfile?.type
      });

      // Wait for profile to load if it's not available yet (with timeout)
      if (!authProfile && authLoading) {
        console.log('Profile still loading, waiting...');
        // Reduced wait time with timeout - check every 100ms
        let waited = 0;
        const maxWait = 2000; // 2 seconds max (reduced from original 2s fixed wait)
        const checkInterval = 100; // Check every 100ms
        
        while (!authProfile && waited < maxWait) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          waited += checkInterval;
        }

        if (!authProfile) {
          throw new Error('Company profile not loaded - please refresh the page and try again');
        }
      }

      // Check different possible profile structures
      let companyId, companyName;

      if (authProfile?.userId?._id) {
        // Structure: authProfile.userId._id
        companyId = authProfile.userId._id;
        companyName = authProfile.companyDetails?.name || 'Company';
        console.log('Using authProfile.userId._id structure');
      } else if (authProfile?._id) {
        // Structure: authProfile._id (direct profile ID)
        companyId = authProfile._id;
        companyName = authProfile.companyDetails?.name || 'Company';
        console.log('Using authProfile._id structure');
      } else {
        console.error('Available profile data:', authProfile);
        throw new Error('Company profile not found - unable to determine company ID');
      }

      // Get job title and skills from the appropriate ref based on flow type
      const currentRef = isPromptFlow ? postDetailsRef.current : manualJobDetailsRef.current;
      const postTitle = currentRef?.getJobTitle?.() || 'Post';
      const jobSkills = currentRef?.getJobSkills?.() || [];

       // Create agent name and avatar name in the format: company+_IdCompagny+{jobTitle}+_IdPost
       const agentName = `${companyName}_${companyId}${postTitle}_${jobId}`;
       const avatarName = `${companyName}_${companyId}${postTitle}_${jobId}`;
       console.log('Agent name:', agentName);
       console.log('Avatar name:', avatarName);
       console.log('Job skills:', jobSkills);
       
       // Enhanced agent configuration with detailed structure
       const agentConfig = {
         name: agentName,
         postId: jobId,
         avatarName: avatarName,
         role: "Technical Leadership Specialist",
         description: `Agent of ${companyName} for the ${postTitle} Post ${jobId}`,
         Company: companyId,
         hcs11CustomProfile: {
           agentPersonality: {
             communicationStyle: "technical_analytical",
             approachMethod: "systematic_deep_dive",
             evaluationPhilosophy: "Focus on scalable architecture and clean code practices"
           },
           specializedCapabilities: [
             "system_architecture_assessment",
             "api_design_evaluation"
           ],
           evaluationFramework: {
             primaryFocus: "backend_systems",
             assessmentCriteria: [
               "system_design_thinking",
               "code_architecture"
             ]
           },
           domainExpertise: {
             primaryTechnologies: jobSkills.length > 0 ? jobSkills : [
               "Node.js",
               "Python",
               "Java"
             ],
             specializations: [
               "API_gateway_design",
               "microservices"
             ]
           }
         }
       };

      // Validate agentConfig data
      console.log('Agent config validation:', {
        name: agentConfig.name,
        nameLength: agentConfig.name.length,
        avatarName: agentConfig.avatarName,
        avatarNameLength: agentConfig.avatarName.length,
        role: agentConfig.role,
        description: agentConfig.description,
        descriptionLength: agentConfig.description.length,
        hasHcs11Profile: !!agentConfig.hcs11CustomProfile
      });

      // Check for any undefined or null values
      if (!agentConfig.name || !agentConfig.avatarName || !agentConfig.role || !agentConfig.description) {
        throw new Error('Agent config has missing required fields');
      }

      // Check for empty strings
      if (agentConfig.name.trim() === '' || agentConfig.avatarName.trim() === '' || agentConfig.description.trim() === '') {
        throw new Error('Agent config has empty required fields');
      }

      // Validate hcs11CustomProfile structure if present
      if (agentConfig.hcs11CustomProfile) {
        const profile = agentConfig.hcs11CustomProfile;
        if (!profile.agentPersonality || !profile.specializedCapabilities || !profile.evaluationFramework || !profile.domainExpertise) {
          throw new Error('Agent config hcs11CustomProfile has missing required sections');
        }
      }

      // Try multiple token sources
      let token: string | undefined = Cookies.get("api_token");
      if (!token && typeof window !== 'undefined') {
        token =
          window.localStorage.getItem('api_token') ||
          window.localStorage.getItem('token') ||
          undefined;
      }

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Log the request details for debugging


      // Make the API request with retry logic
      let response;
      let lastError;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Attempt ${attempt}/3: Making HR agent registration request...`);

          response = await fetch(
            `${apiBaseUrl}hr-agents/initialize`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ 
                agentConfigs: [agentConfig],
              }),
            }
          );

          console.log(`Attempt ${attempt} - Response status:`, response.status);
          console.log(`Attempt ${attempt} - Response headers:`, Object.fromEntries(response.headers.entries()));

          // If we get a successful response, break out of retry loop
          if (response.ok) {
            break;
          }

          // If it's a client error (4xx), don't retry
          if (response.status >= 400 && response.status < 500) {
            break;
          }

          // For server errors (5xx), retry
          if (response.status >= 500) {
            lastError = new Error(`Server error ${response.status}, attempt ${attempt}/3`);
            if (attempt < 3) {
              console.log(`Server error, retrying in 2 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }
          }

        } catch (fetchError) {
          lastError = fetchError;
          console.error(`Attempt ${attempt} failed:`, fetchError);
          if (attempt < 3) {
            console.log(`Fetch error, retrying in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
        }
      }

      if (!response) {
        throw lastError || new Error('Failed to make API request after 3 attempts');
      }

      if (!response.ok) {
        let errorData;
        let responseText = '';

        try {
          responseText = await response.text();
          console.error('Raw error response text:', responseText);

          // Try to parse as JSON
          try {
            errorData = JSON.parse(responseText);
            console.error('Parsed error response data:', errorData);
          } catch (parseError) {
            console.error('Could not parse response as JSON:', parseError);
            errorData = { error: 'Invalid JSON response' };
          }
        } catch (textError) {
          console.error('Could not read response text:', textError);
          errorData = { error: 'Could not read response' };
        }

        const errorMessage = errorData?.error || errorData?.message || errorData?.details || `HTTP ${response.status}: Failed to register HR agent`;
        console.error('Final error message:', errorMessage);

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('HR Agent registered successfully:', result);
      toast.success('HR Agent registered successfully for this post');

      const firstAgent =
        (Array.isArray(result?.data) && result.data.length > 0 && result.data[0]) ||
        result?.agent ||
        null;
      const derivedAgentId =
        firstAgent?._id ||
        firstAgent?.id ||
        (typeof firstAgent === 'object' && 'agent' in firstAgent && (firstAgent as any).agent?._id);

      if (derivedAgentId) {
        setRegisteredAgentId(derivedAgentId);
      }

      if (firstAgent && typeof firstAgent === 'object' && 'name' in firstAgent) {
        setRegisteredAgentName((firstAgent as any).name as string);
      }

      return result;
    } catch (error) {
      console.error('Error registering HR agent:', error);
      throw error;
    } finally {
      setIsRegisteringAgent(false);
      setAgentLoadingModalOpen(false);
    }
  };

  // Dynamic steps based on flow type
  const steps = !flowTypeSelected
    ? ['Choose Creation Method', 'Job Details', 'Recruitment Flow', 'Agent Configuration'] // Selection step + all possible steps
    : isPromptFlow
    ? ['Choose Creation Method', 'Job Details', 'Agent Configuration'] // Prompt flow: 3 steps
    : ['Choose Creation Method', 'Job Details', 'Recruitment Flow', 'Agent Configuration']; // Pipeline flow: 4 steps (reordered)
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

    // 🔥 FIXED: Generate truly unique node ID to avoid database conflicts
    // Use timestamp + random string to ensure uniqueness across all posts
    const uniqueId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newNode: Node = {
      id: uniqueId,
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

    console.log('➕ Adding new node with unique ID:', {
      id: uniqueId,
      type,
      label: newNode.data.label
    });

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, menuItems, nodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setModalOpen(true);
  }, []);

  // Form save handlers for configuration forms
  const handleFormSave = useCallback((config: any) => {
    if (!selectedNode) return;

    console.log('💾 Saving configuration for node:', {
      nodeId: selectedNode.id,
      nodeType: selectedNode.data.type,
      nodeLabel: selectedNode.data.label,
      newConfig: config,
      configuredFlag: config.configured
    });

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
            ...node,
            data: {
              ...node.data,
              config: {
                ...node.data.config,
                ...config
              }
            }
          }
          : node
      )
    );

    setModalOpen(false);

    // Log the updated node after state update
    setTimeout(() => {
      const updatedNode = nodes.find(n => n.id === selectedNode.id);
      console.log('✅ Node updated in state:', {
        nodeId: selectedNode.id,
        configured: updatedNode?.data.config?.configured,
        fullConfig: updatedNode?.data.config
      });
    }, 50);

    toast.success('Configuration saved successfully!');
  }, [selectedNode, setNodes, nodes]);

  const handleFormCancel = useCallback(() => {
    setModalOpen(false);
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

  // Extract all skills configured in pipeline nodes
  const extractSkillsFromPipeline = useCallback((pipelineNodes: Node[]) => {
    const allSkills: any[] = [];

    pipelineNodes.forEach(node => {
      const nodeType = node.data.type;
      const config = node.data.config;

      if (!config || !config.configured) return;

      // Technical skills nodes
      if (nodeType === 'technical' && config.skills) {
        config.skills.forEach((skill: any) => {
          allSkills.push({
            name: skill.name,
            level: config.assessmentLevel || 'Mid Level',
            importance: 'high',
            category: config.categories?.[0] || 'Technical',
          });
        });
      }

      // Soft skills nodes
      if (nodeType === 'soft' && config.softSkills) {
        config.softSkills.forEach((skillName: string) => {
          allSkills.push({
            name: skillName,
            level: config.assessmentLevel || 'Mid Level',
            importance: 'medium',
            category: 'Soft Skills',
          });
        });
      }
    });

    // Remove duplicates by skill name
    const uniqueSkills = allSkills.filter((skill, index, self) =>
      index === self.findIndex(s => s.name === skill.name)
    );

    return uniqueSkills;
  }, []);

  // Payment success handler
  const handlePaymentSuccess = async () => {
    console.log('💳 Payment successful! Creating agent and finalizing setup...');
    setShowPaymentDialog(false);

    try {
      // 🔥 NEW: Create agent and agent config AFTER payment
      if (!savedJobId) {
        throw new Error('No job ID found');
      }

      toast.loading('Finalizing your recruitment setup...', { id: 'finalize' });

      // 1. Register HR agent
      console.log('1️⃣ Registering HR agent...');
      const agentResult = await registerHRAgent(savedJobId);
      const firstAgent =
        (Array.isArray(agentResult?.data) && agentResult.data.length > 0 && agentResult.data[0]) ||
        agentResult?.agent ||
        null;

      const agentIdToUse =
        firstAgent?._id ||
        firstAgent?.id ||
        null;

      if (!agentIdToUse) {
        throw new Error('Failed to get agent ID from registration response');
      }

      console.log('✅ Agent registered with ID:', agentIdToUse);

      // 2. Save agent configuration
      console.log('2️⃣ Saving agent configuration...');
      let token: string | undefined = Cookies.get("api_token");
      if (!token && typeof window !== 'undefined') {
        token =
          window.localStorage.getItem('api_token') ||
          window.localStorage.getItem('token') ||
          undefined;
      }

      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = {
        agentId: agentIdToUse,
        postId: savedJobId,
        thresholdPercent: Number(agentConfig.thresholdPercent),
        bidBudgetMin: Number(agentConfig.bidBudgetMin),
        bidBudgetMax: Number(agentConfig.bidBudgetMax),
        bidStep: Number(agentConfig.bidStep),
        maxCandidatesToBid: Number(agentConfig.maxCandidatesToBid),
        agentLifetimeDays: Number(agentConfig.agentLifetimeDays),
        bidLifetimeDays: Number(agentConfig.bidLifetimeDays),
        autoSubmitTopMatch: Boolean(agentConfig.autoSubmitTopMatch),
        maxDailySpending: Number(agentConfig.maxDailySpending),
        isActive: Boolean(agentConfig.isActive),
      };

      const response = await fetch(`${apiBaseUrl}agent-config/createAgentConfig`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save agent configuration');
      }

      console.log('✅ Agent configuration saved');

      // 3. Activate the post (change status from draft to open)
      console.log('3️⃣ Activating post...');
      const statusResponse = await fetch(
        `${apiBaseUrl}post/updatePostStatus/${savedJobId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'open' }),
        }
      );

      if (!statusResponse.ok) {
        const statusError = await statusResponse.json().catch(() => ({}));
        throw new Error(statusError.message || 'Failed to activate post');
      }

      console.log('✅ Post activated and ready for candidates!');

      toast.success("Job post created successfully! Your recruitment flow is active.", { id: 'finalize' });
      router.push('/dashboard/company');
    } catch (error) {
      console.error('❌ Error in post-payment setup:', error);
      toast.error(`Setup error: ${error}. Please contact support.`, { id: 'finalize' });
      // Don't redirect - allow user to retry or contact support
    }
  };

  const handleNext = async () => {
    setSaveError(null);

    // Step 0: Flow selection - handled by handleFlowSelection, should not reach here
    if (activeStep === 0) {
      return;
    }

    if (!authProfile && authLoading) {
      setSaveError('Profile is still loading. Please wait a moment and try again.');
      return;
    }

    if (!authProfile) {
      setSaveError('Company profile not found. Please ensure you are logged in as a company user.');
      return;
    }

    // Step 1: Job Details
    if (activeStep === 1) {
      // Get the appropriate ref based on flow type
      const currentRef = isPromptFlow ? postDetailsRef.current : manualJobDetailsRef.current;

      if (!currentRef?.canProceed()) {
        setSaveError(
          isPromptFlow
            ? 'Please generate a job post before proceeding to the next step.'
            : 'Please fill in all required fields before proceeding.'
        );
        return;
      }

      setIsSavingJob(true);
      try {
        const saveResult: any = await currentRef?.saveJob();
        if (!saveResult?.success || !saveResult?.jobId) {
          setSaveError('Failed to save job post. Please try again.');
          return;
        }

        setSavedJobId(saveResult.jobId);
        setAgentConfig({
          ...DEFAULT_AGENT_CONFIG,
          postId: saveResult.jobId,
          agentId: '',
        });
        setPostDetailsReady(false);
        setRegisteredAgentId(null);
        setRegisteredAgentName(null);

        // Save matching config
        try {
          let token: string | undefined = Cookies.get("api_token");
          if (!token && typeof window !== 'undefined') {
            token =
              window.localStorage.getItem('api_token') ||
              window.localStorage.getItem('token') ||
              undefined;
          }

          if (token) {
            const matchingConfigPayload = {
              jobId: saveResult.jobId,
              name: saveResult.jobData?.jobDetails?.title || 'Untitled Position',
              weights: {
                hardSkill: 50,
                SoftSkill: 10,
                experience: 20,
                salary: 5,
                workMode: 5,
                contract: 10,
              },
              importanceWeight: {
                Junior: 1.5,
                Mid_Level: 1.2,
                Senior: 1,
                Expert: 0.8,
              },
              exchangeRates: {
                USD: 1,
                EUR: 1.09,
                TND: 0.33,
              },
              softSkills: saveResult.jobData?.skillAnalysis?.softSkills || [],
            };

            const matchingConfigResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}matchingConfig/`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(matchingConfigPayload),
              }
            );

            if (!matchingConfigResponse.ok) {
              console.error('Failed to save matching config');
              toast.error('Warning: Matching configuration save failed. You can configure it later.');
            } else {
              const matchingConfigData = await matchingConfigResponse.json();
              console.log('Matching config saved successfully:', matchingConfigData);
              console.log('Setting matchingConfig to state:', matchingConfigData.data || matchingConfigPayload);
              setMatchingConfig(matchingConfigData.data || matchingConfigPayload);
            }
          }
        } catch (matchingConfigError) {
          console.error('Error saving matching config:', matchingConfigError);
          toast.error('Warning: Matching configuration save failed. You can configure it later.');
        }

        // Agent registration moved to Step 3 (Agent Configuration) - after pipeline is designed
      } catch (error) {
        console.error('Error during job save:', error);
        setSaveError('An error occurred while saving the job post. Please try again.');
        return;
      } finally {
        setIsSavingJob(false);
      }

      setActiveStep((prev) => prev + 1);
      return;
    }

    // Step 2: Pipeline Builder (was Step 3)
    if (activeStep === 2 && !isPromptFlow) {
      if (!savedJobId) {
        setSaveError('No job ID available. Please save the job post first.');
        return;
      }

      // Validate that pipeline has at least one node
      if (nodes.length === 0) {
        setSaveError('Please add at least one step to your recruitment pipeline before continuing.');
        return;
      }

      // 🔍 NEW: Check if any nodes are configured
      const configuredNodes = nodes.filter(node => node.data.config?.configured);
      const unconfiguredNodes = nodes.filter(node => !node.data.config?.configured);

      console.log(`📊 Pipeline status: ${configuredNodes.length} configured, ${unconfiguredNodes.length} unconfigured`);

      if (unconfiguredNodes.length > 0) {
        console.warn('⚠️ Unconfigured nodes:', unconfiguredNodes.map(n => ({
          id: n.id,
          type: n.data.type,
          label: n.data.label,
          configured: n.data.config?.configured
        })));

        // Show warning to user
        const shouldContinue = window.confirm(
          `You have ${unconfiguredNodes.length} unconfigured node(s).\n\n` +
          `Unconfigured: ${unconfiguredNodes.map(n => n.data.label).join(', ')}\n\n` +
          `These nodes will be saved with generic/default configuration.\n\n` +
          `Do you want to continue anyway?`
        );

        if (!shouldContinue) {
          return;
        }
      }

      try {
        setIsSavingSteps(true);
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

        console.log('📦 Sending pipeline steps to API:', sequenceData);

        // 🔍 NEW: Detailed logging of each node's configuration
        console.log('🔍 Node configurations being saved:');
        sequenceData.forEach((node, index) => {
          console.log(`  [${index}] ${node.data.type}:`, {
            id: node.id,
            label: node.data.label,
            configured: node.data.config?.configured,
            hasSkills: !!node.data.config?.skills,
            skillCount: node.data.config?.skills?.length || 0,
            hasSoftSkills: !!node.data.config?.softSkills,
            softSkillCount: node.data.config?.softSkills?.length || 0,
            assessmentLevel: node.data.config?.assessmentLevel,
            fullConfig: node.data.config
          });
        });

        const result = await dispatch(postRecruitmentSteps({
          postId: savedJobId,
          steps: sequenceData
        }));

        if (postRecruitmentSteps.fulfilled.match(result)) {
          console.log('✅ Pipeline saved successfully:', result.payload);

          // 🔍 NEW: Log what was actually saved
          console.log('💾 Backend response:', {
            success: result.payload.success,
            count: result.payload.count,
            created: result.payload.created,
            updated: result.payload.updated,
            steps: result.payload.data
          });

          toast.success('Pipeline saved successfully!');

          // 🔥 NEW: Extract skills from pipeline nodes
          const pipelineSkills = extractSkillsFromPipeline(nodes);
          console.log('Extracted skills from pipeline:', pipelineSkills);

          // Update post with creationType AND skills from pipeline
          try {
            let token: string | undefined = Cookies.get("api_token");
            if (token) {
              const updatePayload: any = {
                creationType: 'pipeline',
                // Keep status as 'draft' - will be activated after payment
              };

              // ✅ FIXED: Use dot notation to update nested field without triggering validation
              if (pipelineSkills.length > 0) {
                updatePayload['skillAnalysis.requiredSkills'] = pipelineSkills;
                console.log('Updating post with pipeline skills:', pipelineSkills.map(s => s.name));
              }

              // 🔥 FIXED: Correct URL - use /updatePost/ not /update/
              await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}post/updatePost/${savedJobId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatePayload),
              });
              console.log('Updated post creationType to pipeline (status remains draft)');
            }
          } catch (error) {
            console.error('Failed to update post:', error);
            // Don't block the flow if this fails
          }

          // Proceed to Agent Configuration (Step 3)
          setActiveStep((prev) => prev + 1);
        } else {
          console.error('Failed to save pipeline:', result.payload);
          setSaveError(`Failed to save pipeline: ${result.payload}`);
        }
      } catch (error) {
        console.error('Error saving pipeline:', error);
        setSaveError('An error occurred while saving the pipeline. Please try again.');
      } finally {
        setIsSavingSteps(false);
      }

      return;
    }

    // Step 3: Agent Configuration (was Step 2) - OR Step 2 for Prompt Flow
    if ((activeStep === 3 && !isPromptFlow) || (activeStep === 2 && isPromptFlow)) {
      if (!savedJobId) {
        setSaveError('No job ID available. Please save the job post before configuring the agent.');
        return;
      }

      // 🔥 CHANGED: Don't create agent or agent config yet - just validate fields
      // Agent will be created AFTER payment succeeds (for pipeline flow) or immediately (for prompt flow)

      const numericFields: Array<keyof AgentConfigurationFormValues> = [
        'thresholdPercent',
        'bidBudgetMin',
        'bidBudgetMax',
        'bidStep',
        'maxCandidatesToBid',
        'agentLifetimeDays',
        'bidLifetimeDays',
        'maxDailySpending',
      ];

      const incompleteField = numericFields.find((field) => {
        const value = agentConfig[field];
        return value === undefined || value === null || Number.isNaN(Number(value));
      });

      if (incompleteField) {
        setSaveError('Please complete all agent configuration fields before continuing.');
        return;
      }

      // 🔥 PROMPT FLOW: Create agent and config immediately, then redirect
      if (isPromptFlow) {
        try {
          setIsSavingAgentConfig(true);

          // 1. Register agent
          const agentResult = await registerHRAgent(savedJobId);
          const firstAgent =
            (Array.isArray(agentResult?.data) && agentResult.data.length > 0 && agentResult.data[0]) ||
            agentResult?.agent ||
            null;

          const agentIdToUse =
            firstAgent?._id ||
            firstAgent?.id ||
            null;

          if (!agentIdToUse) {
            throw new Error('Failed to get agent ID from registration response');
          }

          console.log('✅ Agent registered with ID:', agentIdToUse);

          // 2. Save agent config
          let token: string | undefined = Cookies.get("api_token");
          if (!token && typeof window !== 'undefined') {
            token =
              window.localStorage.getItem('api_token') ||
              window.localStorage.getItem('token') ||
              undefined;
          }

          if (!token) {
            throw new Error('No authentication token found');
          }

          const payload = {
            agentId: agentIdToUse,
            postId: savedJobId,
            thresholdPercent: Number(agentConfig.thresholdPercent),
            bidBudgetMin: Number(agentConfig.bidBudgetMin),
            bidBudgetMax: Number(agentConfig.bidBudgetMax),
            bidStep: Number(agentConfig.bidStep),
            maxCandidatesToBid: Number(agentConfig.maxCandidatesToBid),
            agentLifetimeDays: Number(agentConfig.agentLifetimeDays),
            bidLifetimeDays: Number(agentConfig.bidLifetimeDays),
            autoSubmitTopMatch: Boolean(agentConfig.autoSubmitTopMatch),
            maxDailySpending: Number(agentConfig.maxDailySpending),
            isActive: Boolean(agentConfig.isActive),
          };

          const response = await fetch(`${apiBaseUrl}agent-config/createAgentConfig`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error('Failed to save agent configuration');
          }

          // 🔥 NEW: Activate the post (change status from draft to open)
          const statusResponse = await fetch(
            `${apiBaseUrl}post/updatePostStatus/${savedJobId}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status: 'open' }),
            }
          );

          if (!statusResponse.ok) {
            console.warn('Failed to activate post status - post may remain as draft');
          } else {
            console.log('✅ Post activated and ready for candidates!');
          }

          toast.success('Job posted successfully! Candidates can now apply and interview.');
          router.push('/dashboard/company');
        } catch (error) {
          console.error('Error in prompt flow agent creation:', error);
          setSaveError(`Failed to complete setup: ${error}`);
          toast.error('An error occurred during setup. Please try again.');
        } finally {
          setIsSavingAgentConfig(false);
        }
        return;
      }

      // PIPELINE FLOW: Just store config and proceed to payment
      // Agent creation will happen in handlePaymentSuccess()
      console.log('✅ Agent configuration validated. Proceeding to payment...');
      setShowPaymentDialog(true);
      return;
    }
  };

  // Clear errors when Redux error state changes
  React.useEffect(() => {
    if (postStepsError) {
      setSaveError(`Sequence Error: ${postStepsError}`);
    }
  }, [postStepsError]);

  // Ensure profile is loaded when component mounts
  React.useEffect(() => {
    if (!authProfile && !authLoading) {
      console.log('No auth profile found, component may need to wait for profile to load');
    }
  }, [authProfile, authLoading]);


  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      // If going back to step 0, reset the flow selection
      if (activeStep === 1) {
        setFlowTypeSelected(false);
        setIsPromptFlow(null);
      }
    }
  };

  const handleFlowSelection = (promptFlow: boolean) => {
    setIsPromptFlow(promptFlow);
    setFlowTypeSelected(true);
    setActiveStep(1); // Move to Job Details step
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // Step 0: Choose Creation Method
        return (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <Box sx={{ maxWidth: 900, width: '100%' }}>
              <Typography
                variant="h4"
                sx={{
                  textAlign: 'center',
                  fontWeight: 700,
                  mb: 2,
                  color: '#111827',
                }}
              >
                How would you like to create your job post?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  color: '#6b7280',
                  mb: 5,
                  maxWidth: 600,
                  mx: 'auto',
                }}
              >
                Choose the method that best suits your needs. You can either use AI to quickly generate a post or build a custom recruitment pipeline.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 3,
                }}
              >
                {/* Prompt-Based Option */}
                <Box
                  onClick={() => handleFlowSelection(true)}
                  sx={{
                    p: 4,
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    '&:hover': {
                      borderColor: '#10b981',
                      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.15)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 1.5,
                      color: '#111827',
                    }}
                  >
                    AI-Powered Creation
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b7280',
                      lineHeight: 1.7,
                      mb: 3,
                    }}
                  >
                    Describe your ideal candidate and let AI generate a comprehensive job post with matching configuration in minutes.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        Quick & Easy (2 steps)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        AI-generated job description
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        Automatic candidate matching
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="Recommended"
                    size="small"
                    sx={{
                      mt: 3,
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {/* Pipeline-Based Option */}
                <Box
                  onClick={() => handleFlowSelection(false)}
                  sx={{
                    p: 4,
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    '&:hover': {
                      borderColor: '#6366f1',
                      boxShadow: '0 10px 30px rgba(99, 102, 241, 0.15)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <ConditionIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 1.5,
                      color: '#111827',
                    }}
                  >
                    Custom Pipeline Builder
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b7280',
                      lineHeight: 1.7,
                      mb: 3,
                    }}
                  >
                    Design your own recruitment workflow with custom tests, interviews, and conditions for complete control.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#6366f1',
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        Full customization (3 steps)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#6366f1',
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        Visual pipeline builder
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#6366f1',
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        Custom evaluation steps
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="Advanced"
                    size="small"
                    sx={{
                      mt: 3,
                      backgroundColor: '#e0e7ff',
                      color: '#4338ca',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        );
      case 1:
        // Conditionally render based on flow type
        if (isPromptFlow) {
          // AI-Powered Flow: Use PostDetails for AI generation
          return (
            <PostDetails
              ref={postDetailsRef}
              onReadyChange={setPostDetailsReady}
              matchingConfig={matchingConfig}
            />
          );
        } else {
          // Pipeline Flow: Use ManualJobDetailsForm for manual input
          return (
            <ManualJobDetailsForm
              ref={manualJobDetailsRef}
              onReadyChange={setPostDetailsReady}
            />
          );
        }
      case 2:
        // Step 2: Pipeline Builder (for Pipeline Flow) OR Agent Configuration (for Prompt Flow)
        if (isPromptFlow) {
          // Prompt Flow: Agent Configuration
          return (
            <AgentConfigurationForm
              value={agentConfig}
              onChange={handleAgentConfigChange}
              disabled={!savedJobId || isSavingAgentConfig || isRegisteringAgent}
              loading={isSavingAgentConfig}
              errorMessage={activeStep === 2 ? saveError : null}
              agentSummary={{
                agentName: registeredAgentName ?? undefined,
              }}
            />
          );
        } else {
          // Pipeline Flow: Pipeline Builder
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

              {/* Empty Flow Message */}
              {nodes.length === 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    zIndex: 1000,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '2px dashed #e1e5e9'
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <SmartToyIcon sx={{ fontSize: 48, color: '#6b7280', mb: 1 }} />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#374151', mb: 1, fontWeight: 600 }}>
                    Build Your Recruitment Flow
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, maxWidth: 300 }}>
                    Add recruitment steps from the sidebar to create your hiring process.
                    You need at least one step to continue.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['technical', 'soft', 'interview'].map((type) => {
                      const item = menuItems.find(item => item.type === type);
                      const IconComponent = item?.icon;
                      return (
                        <Button
                          key={type}
                          variant="outlined"
                          size="small"
                          startIcon={IconComponent && <IconComponent fontSize="small" />}
                          onClick={() => addNode(type)}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '12px',
                            borderColor: '#e5e7eb',
                            color: '#6b7280',
                            '&:hover': {
                              borderColor: '#d1d5db',
                              backgroundColor: '#f9fafb'
                            }
                          }}
                        >
                          Add {item?.label}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>
              )}

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
        }
      case 3:
        // Step 3: Agent Configuration (only for Pipeline Flow)
        return (
          <AgentConfigurationForm
            value={agentConfig}
            onChange={handleAgentConfigChange}
            disabled={!savedJobId || isSavingAgentConfig || isRegisteringAgent}
            loading={isSavingAgentConfig}
            errorMessage={activeStep === 3 ? saveError : null}
            agentSummary={{
              agentName: registeredAgentName ?? undefined,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Navbar profile={authProfile || {}} />
      
      <Header>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          width: '100%',
          position: 'relative'
        }}>
          {/* Left - Back Button */}
          <Button
            startIcon={<ArrowBackIcon sx={{ color: '#10b981', fontSize: { xs: 18, sm: 20 } }} />}
            onClick={() => router.back()}
            sx={{
              color: '#111827',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: 0,
              py: 0,
              minWidth: 'auto',
              position: 'absolute',
              left: 0,
              display: { xs: 'none', md: 'flex' },
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#059669'
              }
            }}
          >
            Back
          </Button>

          {/* Center - Progress Indicator */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            overflow: 'auto',
            maxWidth: { xs: 'calc(100vw - 120px)', sm: '100%' },
          }}>
            {steps.map((label, index) => {
              const isActive = activeStep === index;
              const isCompleted = activeStep > index;
              const circleColor = isActive || isCompleted ? '#10b981' : '#d1d5db';
              const textColor = isActive ? '#10b981' : isCompleted ? '#059669' : '#9ca3af';

              return (
                <React.Fragment key={label}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                    <Box
                      sx={{
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        borderRadius: '50%',
                        backgroundColor: circleColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography
                      sx={{
                        color: textColor,
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        display: { xs: 'none', sm: 'block' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        width: { xs: 20, sm: 40 },
                        height: 2,
                        backgroundColor: activeStep > index ? '#10b981' : '#e5e7eb',
                        borderRadius: 1,
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        </Box>

        {/* Profile Loading Indicator */}
        {authLoading && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 2,
            p: 1,
            backgroundColor: '#e3f2fd',
            borderRadius: 1,
            border: '1px solid #1976d2'
          }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="primary">
              Loading company profile...
            </Typography>
          </Box>
        )}

        {/* Agent Registration Loading Indicator */}
        {isRegisteringAgent && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 2,
            p: 1,
            backgroundColor: '#f3e5f5',
            borderRadius: 1,
            border: '1px solid #9c27b0'
          }}>
            <CircularProgress size={16} sx={{ color: '#9c27b0' }} />
            <Typography variant="body2" sx={{ color: '#9c27b0' }}>
              Creating your AI agent for this position...
            </Typography>
          </Box>
        )}

        {/* Profile Error Indicator */}
        {!authProfile && !authLoading && (
          <Box sx={{
            mt: 2,
            p: 1,
            backgroundColor: '#ffebee',
            borderRadius: 1,
            border: '1px solid #d32f2f'
          }}>
            <Typography variant="body2" color="error">
              Company profile not found. Please ensure you are logged in as a company user.
            </Typography>
          </Box>
        )}

        {saveError && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 1 }}>
              {saveError}
            </Alert>
          </Box>
        )}
      </Header>


      <MainContent>
        {activeStep === 2 && !isPromptFlow && (
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

        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          width: { xs: '100%', sm: 'auto' },
        }}>
          {activeStep > 0 && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{
                borderRadius: '8px',
                paddingX: { xs: 2, sm: 2.5 },
                paddingY: { xs: 1, sm: 1.25 },
                fontWeight: 500,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                borderColor: '#64748b',
                color: '#1e293b',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                flex: { xs: 1, sm: 'initial' },
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  borderColor: '#475569',
                },
                '&.Mui-disabled': {
                  borderColor: '#cbd5e1',
                  color: '#94a3b8',
                  backgroundColor: '#f8fafc',
                }
              }}
            >
              Back
            </Button>
          )}

          {activeStep > 0 && (
            <Button
              variant="contained"
              endIcon={
                isSavingJob || isSavingSteps || isRegisteringAgent || isSavingAgentConfig ? (
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                ) : (
                  <ArrowForwardIcon />
                )
              }
              onClick={handleNext}
              disabled={
                isSavingSteps ||
                isSavingJob ||
                isRegisteringAgent ||
                isSavingAgentConfig ||
                (activeStep === 1 && !postDetailsReady) ||
                (activeStep === 2 && !isPromptFlow && nodes.length === 0)
              }
              sx={{
                borderRadius: '8px',
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                fontWeight: 600,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                textTransform: 'none',
                color: '#ffffff',
                background: 'linear-gradient(90deg, rgb(47, 212, 149) 0%, rgb(5, 150, 105) 100%)',
                boxShadow: '0 2px 10px rgba(47, 212, 149, 0.4)',
                transition: 'all 0.3s ease',
                flex: { xs: 1, sm: 'initial' },
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
                : isSavingSteps
                  ? 'Saving Pipeline...'
                  : isRegisteringAgent
                    ? 'Creating AI Agent...'
                    : isSavingAgentConfig && isPromptFlow
                      ? 'Saving & Finishing...'
                      : isSavingAgentConfig
                        ? 'Saving Agent Config...'
                        : activeStep === 2 && isPromptFlow
                          ? 'Save & Finish'
                          : activeStep === 2 && !isPromptFlow
                            ? 'Save Pipeline'
                            : activeStep === 3
                              ? 'Save & Finish'
                              : 'Next'}
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
            width: { xs: '95vw', sm: 600, md: 700 },
            maxWidth: 700,
            height: 'auto',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Configure {selectedNode?.data.label}
            </Typography>
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
            /* Configuration Forms for other node types */
            <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
              <NodeConfigRenderer
                nodeType={selectedNode?.data.type || ''}
                initialConfig={selectedNode?.data.config}
                onSave={handleFormSave}
                onCancel={handleFormCancel}
              />
            </Box>
          )}

          {selectedNode?.data.type === 'condition' && (
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
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Agent Loading Modal */}
      <Modal
        open={agentLoadingModalOpen}
        disableEscapeKeyDown
        onClose={() => {}} // Prevent closing
        aria-labelledby="agent-loading-modal"
        aria-describedby="agent-loading-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 450,
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            border: 'none',
            outline: 'none'
          }}
        >
          {/* AI Robot Icon Animation */}
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 0 rgba(102, 126, 234, 0.7)'
                  },
                  '70%': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 0 10px rgba(102, 126, 234, 0)'
                  },
                  '100%': {
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 0 rgba(102, 126, 234, 0)'
                  }
                }
              }}
            >
              <SmartToyIcon 
                sx={{ 
                  fontSize: 40, 
                  color: 'white',
                  animation: 'rotate 3s linear infinite',
                  '@keyframes rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} 
              />
            </Box>
          </Box>

          {/* Loading Title */}
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 2, 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}
          >
            Creating Your AI Agent
          </Typography>

          {/* Description */}
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              color: '#6b7280',
              lineHeight: 1.6
            }}
          >
            We're setting up your personalized AI recruitment agent that will help you evaluate candidates and streamline your hiring process.
          </Typography>

          {/* Loading Animation */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress 
              size={40} 
              sx={{ 
                color: '#667eea',
                animation: 'spin 1s linear infinite'
              }} 
            />
          </Box>

          {/* Status Message */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#9ca3af',
              fontStyle: 'italic',
              animation: 'fadeInOut 2s infinite',
              '@keyframes fadeInOut': {
                '0%': { opacity: 0.5 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.5 }
              }
            }}
          >
            This may take a few moments...
          </Typography>

          {/* Progress Dots */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 1, 
              mt: 3 
            }}
          >
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#667eea',
                  animation: `bounce 1.4s infinite both`,
                  animationDelay: `${index * 0.16}s`,
                  '@keyframes bounce': {
                    '0%, 80%, 100%': {
                      transform: 'scale(0)',
                      opacity: 0.5
                    },
                    '40%': {
                      transform: 'scale(1)',
                      opacity: 1
                    }
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </Modal>

      {/* Payment Confirmation Dialog */}
      <PaymentConfirmationDialog
        open={showPaymentDialog}
        postId={savedJobId || ''}
        agentId={registeredAgentId || ''}
        numberOfSteps={nodes.length}
        onClose={() => setShowPaymentDialog(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Container>
  );
};

export default RecruitmentFlowBuilder;