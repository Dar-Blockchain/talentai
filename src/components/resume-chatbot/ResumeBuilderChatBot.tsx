import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  TextField,
  Paper,
  Avatar,
  Chip,
  Fade,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Close,
  Minimize,
  Fullscreen,
  FullscreenExit,
  AutoFixHigh,
  WorkOutline,
  SchoolOutlined,
  BuildOutlined,
  LanguageOutlined,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestedSection?: {
    type: string;
    content: string;
    title?: string;
  };
  suggestions?: string[];
}

interface ResumeBuilderChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  onSectionGenerated: (sectionData: any) => void;
  currentSections: any[];
  userId?: string;
}

const ResumeBuilderChatBot: React.FC<ResumeBuilderChatBotProps> = ({ 
  isOpen, 
  onClose, 
  onSectionGenerated,
  currentSections,
  userId = 'guest'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Resume Builder AI Assistant. I can help you create professional resume sections based on your experience and skills. Just tell me what you'd like to add to your resume!",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        "Help me create an experience section",
        "Generate an education section",
        "Create a skills section",
        "Write a professional summary"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResumeSection = async (userInput: string) => {
    try {
      const currentSectionTypes = currentSections.map(s => s.type);
      
      const response = await fetch('/api/resume-ai/generate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          currentSections: currentSectionTypes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate section');
      }

      const result = await response.json();
      return result.data;
    } catch (error: any) {
      console.error('Error generating resume section:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const sectionData = await generateResumeSection(inputValue);
      
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: `I've generated a ${sectionData.sectionType} section for you! Here's what I created:\n\n**${sectionData.title}**\n\n${sectionData.content}`,
        sender: 'bot',
        timestamp: new Date(),
        suggestedSection: sectionData,
        suggestions: sectionData.suggestions || [
          "Add this to my resume",
          "Modify this section",
          "Create another section",
          "Generate different content"
        ]
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating resume section:', error);
      
      const errorMessage: Message = {
        id: `bot_error_${Date.now()}`,
        text: "I apologize, but I encountered an error while generating your resume section. Please check your API configuration and try again.",
        sender: 'bot',
        timestamp: new Date(),
        suggestions: ["Try again", "Check API settings", "Contact support"]
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to generate resume section');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleAddToResume = (sectionData: any) => {
    // Convert the AI-generated section to the resume builder format
    const resumeSection = convertToResumeSection(sectionData);
    onSectionGenerated(resumeSection);
    toast.success('Section added to your resume!');
  };

  const convertToResumeSection = (sectionData: any) => {
    const baseSection = {
      id: `section_${Date.now()}`,
      x: 50,
      y: 50,
      width: 400,
      height: 150,
      zIndex: 1
    };

    switch (sectionData.sectionType) {
      case 'experience':
        return {
          ...baseSection,
          type: 'experience',
          company: sectionData.metadata?.company || 'Company Name',
          position: sectionData.metadata?.position || 'Position',
          startDate: sectionData.metadata?.startDate || '',
          endDate: sectionData.metadata?.endDate || '',
          location: sectionData.metadata?.location || '',
          description: sectionData.content,
        };
      
      case 'education':
        return {
          ...baseSection,
          type: 'education',
          institution: sectionData.metadata?.institution || 'Institution',
          degree: sectionData.metadata?.degree || 'Degree',
          graduationYear: sectionData.metadata?.graduationYear || '',
          gpa: sectionData.metadata?.gpa || '',
          description: sectionData.content,
        };
      
      case 'skills':
        return {
          ...baseSection,
          type: 'skills',
          skills: sectionData.content.split(',').map((skill: string) => skill.trim()),
        };
      
      case 'projects':
        return {
          ...baseSection,
          type: 'projects',
          title: sectionData.title,
          description: sectionData.content,
          technologies: sectionData.metadata?.technologies || [],
          link: sectionData.metadata?.link || '',
        };
      
      default:
        return {
          ...baseSection,
          type: 'custom',
          content: sectionData.content,
          title: sectionData.title,
        };
    }
  };

  const handlePreviewSection = (sectionData: any) => {
    setPreviewContent(sectionData);
    setPreviewModalOpen(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your Resume Builder AI Assistant. I can help you create professional resume sections based on your experience and skills. Just tell me what you'd like to add to your resume!",
        sender: 'bot',
        timestamp: new Date(),
        suggestions: [
          "Help me create an experience section",
          "Generate an education section", 
          "Create a skills section",
          "Write a professional summary"
        ]
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        bottom: isFullscreen ? 0 : 20,
        right: isFullscreen ? 0 : 20,
        width: isFullscreen ? '100vw' : isMinimized ? 320 : 420,
        height: isFullscreen ? '100vh' : isMinimized ? 60 : 600,
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isFullscreen ? 0 : 2,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'white', color: '#667eea', width: 32, height: 32 }}>
              <AutoFixHigh fontSize="small" />
            </Avatar>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Resume Builder AI
            </Typography>
          </Box>
          
          <Box>
            <Tooltip title={isMinimized ? 'Restore' : 'Minimize'}>
              <IconButton
                onClick={() => setIsMinimized(!isMinimized)}
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <Minimize />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              <IconButton
                onClick={() => setIsFullscreen(!isFullscreen)}
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton
                onClick={onClose}
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 1,
                background: 'rgba(255,255,255,0.95)',
              }}
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '80%',
                          display: 'flex',
                          flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                          alignItems: 'flex-start',
                          gap: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: message.sender === 'user' ? '#1976d2' : '#667eea',
                            width: 32,
                            height: 32,
                          }}
                        >
                          {message.sender === 'user' ? <Person /> : <SmartToy />}
                        </Avatar>
                        
                        <Box>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: message.sender === 'user' ? '#1976d2' : '#f5f5f5',
                              color: message.sender === 'user' ? 'white' : 'text.primary',
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {message.text}
                            </Typography>
                          </Paper>
                          
                          {/* Section Actions */}
                          {message.suggestedSection && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleAddToResume(message.suggestedSection!)}
                                sx={{ bgcolor: '#667eea' }}
                              >
                                Add to Resume
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handlePreviewSection(message.suggestedSection!)}
                              >
                                Preview
                              </Button>
                            </Box>
                          )}
                          
                          {/* Suggestions */}
                          {message.suggestions && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {message.suggestions.map((suggestion, index) => (
                                <Chip
                                  key={index}
                                  label={suggestion}
                                  size="small"
                                  clickable
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  sx={{
                                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' }
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32 }}>
                      <SmartToy />
                    </Avatar>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                        Generating section...
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box
              sx={{
                p: 2,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe what you want to add to your resume..."
                  variant="outlined"
                  size="small"
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white',
                    }
                  }}
                />
                <IconButton
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  sx={{
                    bgcolor: '#667eea',
                    color: 'white',
                    '&:hover': { bgcolor: '#5a6fd8' },
                    '&:disabled': { bgcolor: '#ccc' }
                  }}
                >
                  <Send />
                </IconButton>
              </Box>
              
              <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Press Enter to send, Shift+Enter for new line
                </Typography>
                <Button size="small" onClick={clearChat} variant="text">
                  Clear Chat
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* Preview Modal */}
      <Dialog
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Section Preview</DialogTitle>
        <DialogContent>
          {previewContent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {previewContent.title}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {previewContent.content}
              </Typography>
              {previewContent.metadata && Object.keys(previewContent.metadata).length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Additional Information:
                  </Typography>
                  {Object.entries(previewContent.metadata).map(([key, value]) => (
                    <Typography key={key} variant="body2" color="text.secondary">
                      <strong>{key}:</strong> {value as string}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewModalOpen(false)}>Close</Button>
          <Button 
            onClick={() => {
              handleAddToResume(previewContent);
              setPreviewModalOpen(false);
            }}
            variant="contained"
            sx={{ bgcolor: '#667eea' }}
          >
            Add to Resume
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default ResumeBuilderChatBot; 