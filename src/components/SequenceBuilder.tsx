import React, { useState, useCallback, useMemo } from 'react';
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
  DialogContent
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

// Icons
import EmailIcon from '@mui/icons-material/Email';
import ConditionIcon from '@mui/icons-material/AccountTree';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';
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
import WorkIcon from '@mui/icons-material/Work';
import BoltIcon from '@mui/icons-material/Bolt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EditIcon from '@mui/icons-material/Edit';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AddIcon from '@mui/icons-material/Add';

// Import AvatarCustomizer component
import AvatarCustomizer from '../pages/avatar-customizer';

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

const SequenceBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Job Post Generator State Variables
  const [jobDescription, setJobDescription] = useState('');
  const [salaryRange, setSalaryRange] = useState({
    currency: '$',
    min: '',
    max: ''
  });
  const [isQuickGenerating, setIsQuickGenerating] = useState(false);
  const [isDetailedGenerating, setIsDetailedGenerating] = useState(false);
  const [generatedJob, setGeneratedJob] = useState<any>(null);
  const [jobPostError, setJobPostError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSharedToLinkedIn, setHasSharedToLinkedIn] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [linkedinCopySuccess, setLinkedinCopySuccess] = useState(false);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [editingSkillName, setEditingSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('3');
  const [showAddSkillInput, setShowAddSkillInput] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillWarning, setSkillWarning] = useState('');

  const steps = ['Job Post', 'Sequence', 'Avatar', 'Review'];

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

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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

  // Job Post Generator Helper Functions
  const isSalaryRangeValid = () => {
    return salaryRange.min && salaryRange.max && parseInt(salaryRange.max) >= parseInt(salaryRange.min);
  };

  const handleSalaryChange = (field: 'min' | 'max' | 'currency', value: string) => {
    setSalaryRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateJob = async (type: 'quick' | 'detailed') => {
    try {
      if (type === 'quick') {
        setIsQuickGenerating(true);
      } else {
        setIsDetailedGenerating(true);
      }
      setJobPostError('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock generated job data
      const mockJob = {
        jobDetails: {
          title: 'Senior Full Stack Developer',
          description: 'We are seeking a talented Senior Full Stack Developer to join our dynamic team...',
          requirements: ['5+ years experience with React.js', 'Strong TypeScript skills', 'Experience with Node.js'],
          responsibilities: ['Lead development of core features', 'Mentor junior developers', 'Design scalable services'],
          location: 'Remote',
          employmentType: 'Full-time',
          experienceLevel: 'Senior',
          salary: {
            min: parseInt(salaryRange.min),
            max: parseInt(salaryRange.max),
            currency: salaryRange.currency
          }
        },
        skillAnalysis: {
          requiredSkills: [
            { name: 'React.js', level: '5', importance: 'Required', category: 'Frontend' },
            { name: 'TypeScript', level: '4', importance: 'Required', category: 'Language' },
            { name: 'Node.js', level: '4', importance: 'Required', category: 'Backend' }
          ],
          suggestedSkills: {
            technical: [
              { name: 'Docker', reason: 'Containerization', category: 'DevOps', priority: 'High' }
            ],
            frameworks: [
              { name: 'Next.js', relatedTo: 'React', priority: 'Medium' }
            ],
            tools: [
              { name: 'Git', purpose: 'Version Control', category: 'Development' }
            ]
          },
          skillSummary: {
            mainTechnologies: ['React.js', 'TypeScript', 'Node.js'],
            complementarySkills: ['Docker', 'Next.js'],
            learningPath: ['JavaScript', 'React.js', 'TypeScript'],
            stackComplexity: 'Intermediate'
          }
        },
        linkedinPost: {
          formattedContent: {
            headline: '🌟 We\'re Hiring: Senior Full Stack Developer 🌟',
            introduction: 'Are you passionate about building interactive web applications?',
            companyPitch: 'Join a team where innovation drives us forward.',
            roleOverview: 'As a Senior Full Stack Developer, you\'ll be at the heart of our engineering process.',
            keyPoints: [
              '🔹 Develop cutting-edge web applications',
              '🔹 Work with a team of talented developers',
              '🔹 Remote work',
              `🔹 Salary range: ${salaryRange.currency}${salaryRange.min}-${salaryRange.max}`
            ],
            skillsRequired: '💻 Required Skills: React.js, TypeScript, Node.js',
            benefitsSection: '🎯 We offer a vibrant culture and mentorship opportunities.',
            callToAction: '✨ Ready to make a difference? Apply now!'
          },
          hashtags: ['#Hiring', '#TechJobs', '#RemoteWork'],
          formatting: {
            emojis: {
              company: '🏢',
              location: '🌍',
              salary: '💰',
              requirements: '📋',
              skills: '💻',
              benefits: '🎯',
              apply: '✨'
            }
          },
          finalPost: '🌟 We\'re Hiring: Senior Full Stack Developer 🌟\n\nAre you passionate about building interactive web applications? Join our dynamic team!'
        }
      };

      setGeneratedJob(mockJob);
      setEditedJob(mockJob);
    } catch (error) {
      setJobPostError('Failed to generate job post. Please try again.');
    } finally {
      setIsQuickGenerating(false);
      setIsDetailedGenerating(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedJob({ ...generatedJob });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedJob(null);
  };

  const handleSave = () => {
    setGeneratedJob(editedJob);
    setIsEditing(false);
    setEditedJob(null);
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editedJob) return;
    
    const keys = field.split('.');
    const newEditedJob = { ...editedJob };
    let current = newEditedJob;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setEditedJob(newEditedJob);
  };

  const handleEditSkill = (index: number, skill: any) => {
    setEditingSkillIndex(index);
    setEditingSkillName(skill.name);
    setNewSkillLevel(skill.level);
  };

  const handleSaveSkill = () => {
    if (!editedJob || editingSkillIndex === null) return;
    
    const newSkills = [...editedJob.skillAnalysis.requiredSkills];
    newSkills[editingSkillIndex] = {
      ...newSkills[editingSkillIndex],
      name: editingSkillName,
      level: newSkillLevel
    };
    
    handleInputChange('skillAnalysis.requiredSkills', newSkills);
    setEditingSkillIndex(null);
    setEditingSkillName('');
    setNewSkillLevel('3');
  };

  const getExperienceLevelFromNumber = (level: string | number): string => {
    const numLevel = parseInt(level.toString());
    if (numLevel <= 1) return 'Entry Level';
    if (numLevel <= 2) return 'Junior';
    if (numLevel <= 3) return 'Mid-Level';
    if (numLevel <= 4) return 'Senior';
    return 'Expert';
  };

  const handleShareLinkedIn = async () => {
    setIsPosting(true);
    // Simulate LinkedIn sharing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setHasSharedToLinkedIn(true);
    setLinkedinCopySuccess(true);
    setIsPosting(false);
    
    setTimeout(() => setLinkedinCopySuccess(false), 3000);
  };

  const saveJob = async () => {
    setIsSaving(true);
    // Simulate saving job
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // You can add success notification here
  };

  const SkillChip = ({ label, onDelete, deleteIcon, onClick, sx }: any) => (
    <Chip
      label={label}
      onDelete={onDelete}
      deleteIcon={deleteIcon}
      onClick={onClick}
      sx={{
        backgroundColor: GREEN_MAIN,
        color: 'black',
        fontSize: '0.75rem',
        height: '28px',
        '&:hover': {
          backgroundColor: 'rgba(0, 255, 157, 0.8)',
        },
        ...sx
      }}
    />
  );

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // Final step - save the sequence
      const sequenceData = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.data.type,
          label: node.data.label,
          position: node.position,
          config: node.data.config
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target
        }))
      };
      
      console.log('Sequence JSON:', JSON.stringify(sequenceData, null, 2));
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, overflow: 'hidden' }}>
            {/* Left Panel - Job Description Input */}
            <Box sx={{
              width: { xs: '100%', md: '50%' },
              height: { xs: 'auto', md: '100%' },
              borderRight: { xs: 'none', md: '1px solid rgba(255,255,255,0.1)' },
              borderBottom: { xs: '1px solid rgba(255,255,255,0.1)', md: 'none' },
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 2, sm: 3 },
              gap: 2,
              overflow: 'auto'
            }}>
              <Typography variant="h6" sx={{
                color: '#000',
                mb: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}>
                Job Description
              </Typography>
              <Typography variant="body2" sx={{
                color: '#000',
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Describe the position you're looking to fill. Be as detailed as possible about responsibilities, requirements, and desired skills.
              </Typography>

              <TextField
                multiline
                rows={8}
                fullWidth
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Example: 

We are seeking a Senior Full Stack Developer to join our dynamic team. The ideal candidate will have:

Technical Requirements:
- 5+ years of experience with React.js and Node.js
- Strong proficiency in TypeScript and modern JavaScript
- Experience with cloud platforms (AWS/Azure/GCP)
- Knowledge of microservices architecture
- Expertise in database design (SQL and NoSQL)

Responsibilities:
- Lead development of our core product features
- Mentor junior developers and conduct code reviews
- Design and implement scalable backend services
- Optimize application performance
- Collaborate with product and design teams

Additional Skills:
- Experience with CI/CD pipelines
- Knowledge of Docker and Kubernetes
- Strong problem-solving abilities
- Excellent communication skills

Benefits:
- Competitive salary range: $120,000 - $160,000
- Remote work options
- Health insurance
- 401(k) matching
- Professional development budget"
                InputLabelProps={{ sx: { color: GREEN_MAIN } }}
                InputProps={{
                  sx: {
                    color: '#000',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                  },
                }}
              />

              {!isSalaryRangeValid() && (
                <Alert
                  severity="warning"
                  sx={{
                    mt: 2,
                    backgroundColor: 'rgba(255,152,0,0.1)',
                    color: '#ffb74d',
                    border: '1px solid rgba(255,152,0,0.3)',
                    '& .MuiAlert-icon': {
                      color: '#ffb74d'
                    }
                  }}
                >
                  Please enter a valid salary range (minimum and maximum values required, maximum must be greater than or equal to minimum)
                </Alert>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#000', mb: 2 }}>
                  Salary Range
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: GREEN_MAIN }}>Currency</InputLabel>
                      <Select
                        value={salaryRange.currency}
                        onChange={(e) => handleSalaryChange('currency', e.target.value)}
                        sx={{
                          color: '#000',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                          },
                        }}
                      >
                        <MenuItem value="$" sx={{ backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'rgba(30,41,59,1)' } }}>$ (USD)</MenuItem>
                        <MenuItem value="€" sx={{ backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'rgba(30,41,59,1)' } }}>€ (EUR)</MenuItem>
                        <MenuItem value="£" sx={{ backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'rgba(30,41,59,1)' } }}>£ (GBP)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Minimum Salary"
                      type="string"
                      value={salaryRange.min}
                      onChange={(e) => handleSalaryChange('min', e.target.value)}
                      InputLabelProps={{ sx: { color: GREEN_MAIN } }}
                      InputProps={{
                        sx: {
                          color: '#000',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Maximum Salary"
                      type="string"
                      value={salaryRange.max}
                      onChange={(e) => handleSalaryChange('max', e.target.value)}
                      InputLabelProps={{ sx: { color: GREEN_MAIN } }}
                      InputProps={{
                        sx: {
                          color: "#000",
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleGenerateJob('quick')}
                  disabled={!jobDescription || isQuickGenerating || !isSalaryRangeValid()}
                  startIcon={isQuickGenerating ? <CircularProgress size={20} /> : <BoltIcon />}
                  sx={{
                    background: GREEN_MAIN,
                    '&:hover': {
                      background: GREEN_MAIN,
                    },
                    '&.Mui-disabled': {
                      background: GREEN_MAIN,
                      color: 'black'
                    }
                  }}
                >
                  {isQuickGenerating ? 'Generating...' : 'Quick Generate'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleGenerateJob('detailed')}
                  disabled={!jobDescription || isDetailedGenerating || !isSalaryRangeValid()}
                  startIcon={isDetailedGenerating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                  sx={{
                    borderColor: GREEN_MAIN,
                    color: GREEN_MAIN,
                    '&:hover': {
                      borderColor: '#02E2FF',
                      backgroundColor: 'rgba(2,226,255,0.1)'
                    },
                    '&.Mui-disabled': {
                      borderColor: GREEN_MAIN,
                      color: GREEN_MAIN
                    }
                  }}
                >
                  {isDetailedGenerating ? 'Generating...' : 'Detailed Generate'}
                </Button>
              </Box>

              {(isQuickGenerating || isDetailedGenerating) && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.875rem'
                  }}
                >
                  {isQuickGenerating ?
                    'Generating a concise job post...' :
                    'Performing detailed analysis and generating comprehensive job post...'}
                </Typography>
              )}
            </Box>

            {/* Right Panel - Generated Job Preview */}
            <Box sx={{
              width: { xs: '100%', md: '50%' },
              height: { xs: '50%', md: 'auto' },
              p: { xs: 2, sm: 3 },
              overflowY: 'auto',
            }}>
              {jobPostError ? (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    backgroundColor: 'rgba(211,47,47,0.1)',
                    color: '#ff8a80',
                    border: '1px solid rgba(211,47,47,0.3)',
                    '& .MuiAlert-icon': {
                      color: '#ff8a80'
                    }
                  }}
                >
                  {jobPostError}
                </Alert>
              ) : !generatedJob ? (
                <Box sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                  color: 'rgba(255,255,255,0.5)',
                  textAlign: 'center',
                  minHeight: { xs: '300px', md: 'auto' }
                }}>
                  <Box sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: '50%',
                    backgroundColor: GREEN_MAIN,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <WorkIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, color: 'black' }}>
                    Generated job post will appear here
                  </Typography>
                  <Typography variant="body2" sx={{
                    maxWidth: '80%',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    color: 'black'
                  }}>
                    Enter your job description on the left and click "Generate" to create a professional job posting
                  </Typography>
                </Box>
              ) : (
                <Box sx={{
                  color: '#fff',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}>
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          label="Job Title"
                          value={editedJob.jobDetails.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          InputLabelProps={{
                            sx: {
                              color: GREEN_MAIN,
                              fontSize: '1rem',
                              fontWeight: 500
                            }
                          }}
                          InputProps={{
                            sx: {
                              color: '#000',
                              fontSize: '1.1rem',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                            },
                          }}
                        />
                      ) : (
                        <Typography
                          variant="h5"
                          sx={{
                            color: GREEN_MAIN,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                          }}
                        >
                          {generatedJob.jobDetails.title}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!isEditing ? (
                          <>
                            <Button
                              variant="contained"
                              startIcon={<EditIcon />}
                              onClick={handleEdit}
                              sx={{
                                background: GREEN_MAIN,
                                color: 'black',
                                '&:hover': {
                                  background: 'rgba(0, 255, 157, 0.8)',
                                }
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="contained"
                              startIcon={<LinkedInIcon />}
                              onClick={handleShareLinkedIn}
                              disabled={isPosting}
                              sx={{
                                background: hasSharedToLinkedIn
                                  ? 'rgba(0,119,181,0.6)'
                                  : 'linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)',
                                '&:hover': {
                                  background: hasSharedToLinkedIn
                                    ? 'rgba(0,119,181,0.7)'
                                    : 'linear-gradient(135deg, #006097 0%, #0077B5 100%)',
                                }
                              }}
                            >
                              {isPosting
                                ? 'Sharing...'
                                : linkedinCopySuccess
                                  ? 'Shared!'
                                  : hasSharedToLinkedIn
                                    ? 'Already Shared'
                                    : 'Share on LinkedIn'}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outlined"
                              onClick={handleCancel}
                              sx={{
                                borderColor: GREEN_MAIN,
                                color: GREEN_MAIN,
                                '&:hover': {
                                  borderColor: GREEN_MAIN,
                                  backgroundColor: 'rgba(0, 255, 157, 0.1)'
                                }
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleSave}
                              sx={{
                                background: GREEN_MAIN,
                                color: 'black',
                                '&:hover': {
                                  background: 'rgba(0, 255, 157, 0.8)',
                                }
                              }}
                            >
                              Save
                            </Button>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Job Details */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: GREEN_MAIN, mb: 2 }}>
                        Job Details
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: 'black' }}>
                            {generatedJob.jobDetails.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: 'black' }}>
                            {generatedJob.jobDetails.salary.currency}{generatedJob.jobDetails.salary.min.toLocaleString()} - {generatedJob.jobDetails.salary.currency}{generatedJob.jobDetails.salary.max.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WorkIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: 'black' }}>
                            {generatedJob.jobDetails.employmentType}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUpIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: 'black' }}>
                            {generatedJob.jobDetails.experienceLevel}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Required Skills */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: GREEN_MAIN, mb: 2 }}>
                        Required Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {generatedJob.skillAnalysis.requiredSkills.map((skill: any, index: number) => (
                          <SkillChip
                            key={index}
                            label={`${skill.name} (${getExperienceLevelFromNumber(skill.level)})`}
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Description */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: GREEN_MAIN, mb: 2 }}>
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'black', lineHeight: 1.6 }}>
                        {generatedJob.jobDetails.description}
                      </Typography>
                    </Box>

                    {/* Requirements */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: GREEN_MAIN, mb: 2 }}>
                        Requirements
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, color: 'black' }}>
                        {generatedJob.jobDetails.requirements.map((req: string, index: number) => (
                          <Typography key={index} component="li" variant="body2" sx={{ mb: 1 }}>
                            {req}
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    {/* Responsibilities */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: GREEN_MAIN, mb: 2 }}>
                        Responsibilities
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, color: 'black' }}>
                        {generatedJob.jobDetails.responsibilities.map((resp: string, index: number) => (
                          <Typography key={index} component="li" variant="body2" sx={{ mb: 1 }}>
                            {resp}
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    {/* Save Button */}
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={saveJob}
                      disabled={isSaving}
                      startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                      sx={{
                        background: GREEN_MAIN,
                        color: 'black',
                        mt: 2,
                        '&:hover': {
                          background: 'rgba(0, 255, 157, 0.8)',
                        }
                      }}
                    >
                      {isSaving ? 'Saving...' : 'Save Job Post'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
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
          <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#1f2937' }}>
              Customize Your Avatar
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#6b7280' }}>
              Personalize your avatar to represent your brand in the sequence. This avatar will be used in all communications.
            </Typography>
              <AvatarCustomizer />
          </Box>
        );
      case 3:
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
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  style: {
                    color: index === activeStep ? '#16a34a' : index < activeStep ? '#16a34a' : '#9ca3af',
                  },
                }}
              >
                <Typography variant="body2" color={index <= activeStep ? 'primary' : 'textSecondary'}>
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

      <Footer>
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          sx={{ borderRadius: '8px' }}
        >
          Save
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep > 0 && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ borderRadius: '8px' }}
            >
              Back
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
              sx={{ 
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<PlayArrowIcon />}
              onClick={handleNext}
              sx={{ 
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #10b981 30%, #059669 90%)',
              }}
            >
              Launch Sequence
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

export default SequenceBuilder;