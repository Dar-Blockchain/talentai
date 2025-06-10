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
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Close,
  Minimize,
  Fullscreen,
  FullscreenExit,
  ThumbUp,
  ThumbDown,
  RefreshRounded,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
  confidence?: number;
  suggestions?: string[];
  conversationId?: number;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  sessionId?: string;
}

const CHATBOT_API_URL = 'http://localhost:8001/api';

const ChatBot: React.FC<ChatBotProps> = ({ 
  isOpen, 
  onClose, 
  userId = 'guest',
  sessionId = `session_${Date.now()}`
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! Welcome to TalentAI! I'm here to help you navigate our AI-powered recruitment and certification platform. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        "What is TalentAI?",
        "How do I get started?",
        "What skills can I test?",
        "Tell me about certifications"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const response = await axios.post(`${CHATBOT_API_URL}/chat`, {
        message: inputValue,
        user_id: userId,
        session_id: sessionId,
        context: {
          user_type: "web_user",
          platform: "web_app"
        }
      });

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
        intent: response.data.intent,
        confidence: response.data.confidence,
        suggestions: response.data.suggestions,
        conversationId: response.data.context?.conversation_id
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: "I'm sorry, I'm having trouble connecting right now. Please make sure the chatbot service is running on port 8001.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to connect to chatbot service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleFeedback = async (conversationId: number, isHelpful: boolean) => {
    try {
      await axios.post(`${CHATBOT_API_URL}/feedback`, {
        conversation_id: conversationId,
        feedback_type: isHelpful ? 'helpful' : 'not_helpful',
        rating: isHelpful ? 5 : 2,
        comment: isHelpful ? 'Helpful response' : 'Not helpful response'
      });
      
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Chat cleared! How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        suggestions: [
          "What is TalentAI?",
          "How do I get started?",
          "What skills can I test?",
          "Tell me about certifications"
        ]
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        width: isFullscreen ? '100vw' : isMinimized ? 320 : 400,
        height: isFullscreen ? '100vh' : isMinimized ? 60 : 600,
        maxWidth: isFullscreen ? 'none' : '90vw',
        maxHeight: isFullscreen ? 'none' : '90vh',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isFullscreen ? 0 : 2,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                TalentAI Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                AI-powered recruitment help
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Clear Chat">
              <IconButton size="small" sx={{ color: 'white' }} onClick={clearChat}>
                <RefreshRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isMinimized ? "Restore" : "Minimize"}>
              <IconButton 
                size="small" 
                sx={{ color: 'white' }} 
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton 
                size="small" 
                sx={{ color: 'white' }} 
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton size="small" sx={{ color: 'white' }} onClick={onClose}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {!isMinimized && (
          <>
            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 1,
                background: '#f8fafc',
              }}
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                          alignItems: 'flex-start',
                          gap: 1,
                          flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: message.sender === 'user' ? '#667eea' : '#10b981',
                          }}
                        >
                          {message.sender === 'user' ? <Person /> : <SmartToy />}
                        </Avatar>
                        
                        <Box>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: message.sender === 'user' ? '#667eea' : 'white',
                              color: message.sender === 'user' ? 'white' : 'black',
                              borderRadius: 2,
                              boxShadow: 1,
                            }}
                          >
                            <Typography variant="body2">{message.text}</Typography>
                            
                            {message.intent && message.confidence && (
                              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  label={`Intent: ${message.intent}`}
                                  size="small"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                                <Chip
                                  label={`Confidence: ${(message.confidence * 100).toFixed(1)}%`}
                                  size="small"
                                  color={message.confidence > 0.8 ? 'success' : message.confidence > 0.6 ? 'warning' : 'error'}
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </Box>
                            )}
                          </Paper>
                          
                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {message.suggestions.map((suggestion, idx) => (
                                <Chip
                                  key={idx}
                                  label={suggestion}
                                  size="small"
                                  variant="outlined"
                                  clickable
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              ))}
                            </Box>
                          )}
                          
                          {/* Feedback buttons for bot messages */}
                          {message.sender === 'bot' && message.conversationId && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Helpful">
                                <IconButton
                                  size="small"
                                  onClick={() => handleFeedback(message.conversationId!, true)}
                                  sx={{ 
                                    color: 'success.main',
                                    '&:hover': { bgcolor: 'success.light', color: 'white' }
                                  }}
                                >
                                  <ThumbUp fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Not Helpful">
                                <IconButton
                                  size="small"
                                  onClick={() => handleFeedback(message.conversationId!, false)}
                                  sx={{ 
                                    color: 'error.main',
                                    '&:hover': { bgcolor: 'error.light', color: 'white' }
                                  }}
                                >
                                  <ThumbDown fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                          
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.6,
                              textAlign: message.sender === 'user' ? 'right' : 'left',
                            }}
                          >
                            {message.timestamp.toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981' }}>
                      <SmartToy />
                    </Avatar>
                    <Paper sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2">Thinking...</Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isLoading}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <IconButton
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&:disabled': { bgcolor: 'grey.300' },
                  }}
                >
                  <Send />
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </motion.div>
  );
};

export default ChatBot; 