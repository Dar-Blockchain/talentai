import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ExpandMore,
  Refresh,
  Analytics,
  SmartToy,
  Assessment,
  Settings,
  Launch,
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import ChatBot from '../components/ChatBot';

const CHATBOT_API_URL = 'http://localhost:8001/api';

interface ModelInfo {
  is_initialized: boolean;
  model_type: string;
  spacy_model?: string;
  confidence_threshold: number;
  supported_intents: string[];
  total_intents: number;
}

interface LearningStatus {
  is_active: boolean;
  last_training?: string;
  total_conversations: number;
  total_feedback: number;
  model_version?: string;
  learning_metrics: any;
}

interface HealthStatus {
  status: string;
  service: string;
  version: string;
  environment: string;
  classifier_ready: boolean;
  learning_pipeline_ready: boolean;
}

const ChatBotTestPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [learningStatus, setLearningStatus] = useState<LearningStatus | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [availableIntents, setAvailableIntents] = useState<any>(null);
  const [isServiceConnected, setIsServiceConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sampleQuestions = [
    "Hello, what is TalentAI?",
    "How do I get started with the platform?",
    "What skills can I test?",
    "Tell me about certifications",
    "How does the AI recruitment work?",
    "Can you help me with interview preparation?",
    "What makes TalentAI different?",
    "How accurate are the skill assessments?",
    "I need help with my profile",
    "Show me the available job roles"
  ];

  useEffect(() => {
    checkServiceHealth();
    loadAllData();
  }, []);

  const checkServiceHealth = async () => {
    try {
      const response = await axios.get(`${CHATBOT_API_URL.replace('/api', '')}/health`);
      setHealthStatus(response.data);
      setIsServiceConnected(true);
      toast.success('Chatbot service is connected!');
    } catch (error) {
      setIsServiceConnected(false);
      toast.error('Failed to connect to chatbot service');
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadModelInfo(),
        loadLearningStatus(),
        loadAvailableIntents(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModelInfo = async () => {
    try {
      const response = await axios.get(`${CHATBOT_API_URL}/model/info`);
      setModelInfo(response.data);
    } catch (error) {
      console.error('Error loading model info:', error);
    }
  };

  const loadLearningStatus = async () => {
    try {
      const response = await axios.get(`${CHATBOT_API_URL}/learning/status`);
      setLearningStatus(response.data);
    } catch (error) {
      console.error('Error loading learning status:', error);
    }
  };

  const loadAvailableIntents = async () => {
    try {
      const response = await axios.get(`${CHATBOT_API_URL}/intents`);
      setAvailableIntents(response.data);
    } catch (error) {
      console.error('Error loading intents:', error);
    }
  };

  const triggerRetraining = async () => {
    try {
      const response = await axios.post(`${CHATBOT_API_URL}/learning/retrain`);
      toast.success('Manual retraining triggered!');
      setTimeout(() => loadLearningStatus(), 2000);
    } catch (error) {
      toast.error('Failed to trigger retraining');
    }
  };

  const testIntentAnalysis = async (text: string) => {
    try {
      const response = await axios.post(`${CHATBOT_API_URL}/analyze-intent`, {
        text: text
      });
      
      const { intent, confidence, all_intents } = response.data;
      
      toast.success(
        `Intent: ${intent} (${(confidence * 100).toFixed(1)}% confidence)`,
        { duration: 4000 }
      );
      
      console.log('Intent Analysis:', { intent, confidence, all_intents });
    } catch (error) {
      toast.error('Failed to analyze intent');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🤖 TalentAI Chatbot Test Center
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Comprehensive testing environment for the AI-powered recruitment assistant
        </Typography>
      </Box>

      {/* Service Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment /> Service Status
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={checkServiceHealth}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Box>
          
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip
              label={isServiceConnected ? 'Connected' : 'Disconnected'}
              color={isServiceConnected ? 'success' : 'error'}
            />
            {healthStatus && (
              <>
                <Chip
                  label={`Service: ${healthStatus.status}`}
                  color={healthStatus.status === 'healthy' ? 'success' : 'warning'}
                />
                <Chip
                  label={`Classifier: ${healthStatus.classifier_ready ? 'Ready' : 'Not Ready'}`}
                  color={healthStatus.classifier_ready ? 'success' : 'error'}
                />
                <Chip
                  label={`Learning: ${healthStatus.learning_pipeline_ready ? 'Ready' : 'Not Ready'}`}
                  color={healthStatus.learning_pipeline_ready ? 'success' : 'warning'}
                />
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Chat Interface */}
        <Box sx={{ flex: 2 }}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToy /> Interactive Chat Test
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isFullscreen}
                        onChange={(e) => setIsFullscreen(e.target.checked)}
                      />
                    }
                    label="Fullscreen"
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Launch />}
                    onClick={() => setIsChatOpen(!isChatOpen)}
                  >
                    {isChatOpen ? 'Hide' : 'Show'} Chat
                  </Button>
                </Box>
              </Box>
              
              {isChatOpen && (
                <Box
                  sx={{
                    height: isFullscreen ? '80vh' : '600px',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <ChatBot
                    isOpen={true}
                    onClose={() => {}}
                    userId="test_user"
                    sessionId={`test_session_${Date.now()}`}
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Quick Test Buttons */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Intent Analysis Tests
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click any sample question to test intent classification:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {sampleQuestions.map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    clickable
                    onClick={() => testIntentAnalysis(question)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Analytics & Info Panel */}
        <Box sx={{ flex: 1, minWidth: 350 }}>
          {/* Model Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings /> Model Information
              </Typography>
              {modelInfo && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Type:</strong> {modelInfo.model_type}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Confidence Threshold:</strong> {(modelInfo.confidence_threshold * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Total Intents:</strong> {modelInfo.total_intents}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>spaCy Model:</strong> {modelInfo.spacy_model || 'Not available'}
                  </Typography>
                  <Chip
                    label={modelInfo.is_initialized ? 'Initialized' : 'Not Initialized'}
                    color={modelInfo.is_initialized ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Learning Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Analytics /> Learning Pipeline
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={triggerRetraining}
                  disabled={!isServiceConnected}
                >
                  Retrain
                </Button>
              </Box>
              {learningStatus && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Status:</strong> {learningStatus.is_active ? 'Active' : 'Idle'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Conversations:</strong> {learningStatus.total_conversations}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Feedback Collected:</strong> {learningStatus.total_feedback}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Model Version:</strong> {learningStatus.model_version || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Last Training:</strong> {
                      learningStatus.last_training 
                        ? new Date(learningStatus.last_training).toLocaleString()
                        : 'Never'
                    }
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Available Intents */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Supported Intents ({availableIntents?.total_intents || 0})
              </Typography>
              {availableIntents && (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {availableIntents.intents.map((intent: string, index: number) => (
                    <Chip
                      key={index}
                      label={intent}
                      size="small"
                      sx={{ m: 0.25 }}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Instructions */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">📋 Testing Instructions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Basic Testing:
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul>
                      <li>Use the chat interface to test natural conversations</li>
                      <li>Try the sample questions for quick intent testing</li>
                      <li>Check intent confidence scores and classifications</li>
                      <li>Test edge cases and ambiguous inputs</li>
                    </ul>
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Advanced Testing:
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul>
                      <li>Use thumbs up/down for feedback collection</li>
                      <li>Monitor learning pipeline metrics</li>
                      <li>Trigger manual retraining when needed</li>
                      <li>Test fullscreen mode for better visibility</li>
                    </ul>
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {!isServiceConnected && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <strong>Service Not Connected:</strong> Make sure the chatbot microservice is running on port 8001.
          <br />
          Run: <code>cd chatbot-microservice && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload</code>
        </Alert>
      )}
    </Container>
  );
};

export default ChatBotTestPage; 