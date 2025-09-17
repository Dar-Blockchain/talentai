import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';

interface TestCodingTaskProps {
  onTestComplete?: (result: any) => void;
}

const TestCodingTask: React.FC<TestCodingTaskProps> = ({ onTestComplete }) => {
  const [formData, setFormData] = useState({
    postId: '',
    candidateEmail: '',
    candidateName: 'Candidate', // Default value
    jobTitle: '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleSendCodingTest = async () => {
    if (!formData.postId || !formData.candidateEmail) {
      showNotification('Please fill in Post ID and Candidate Email', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('api_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/';
      const apiUrl = `${apiBaseUrl}task/send-task`;
      
      console.log('Sending coding test:', formData);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: formData.postId,
          candidateEmail: formData.candidateEmail,
          candidateName: formData.candidateName,
          jobTitle: formData.jobTitle || 'Software Developer',
          stepLabel: 'Coding Technical Test'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send coding test');
      }

      const result = await response.json();
      console.log('Coding test sent successfully:', result);
      
      showNotification(
        'Coding test sent successfully! The candidate will receive an email with the PDF coding assessment.',
        'success'
      );
      
      if (onTestComplete) {
        onTestComplete(result);
      }
      
    } catch (error) {
      console.error('Error sending coding test:', error);
      showNotification(
        `Error sending coding test: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon color="primary" />
            Test Coding Task API
          </Typography>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Test the coding technical test generation and email sending functionality.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Post ID *"
              value={formData.postId}
              onChange={(e) => setFormData(prev => ({ ...prev, postId: e.target.value }))}
              placeholder="Enter the post ID"
              fullWidth
            />
            
            <TextField
              label="Candidate Email *"
              type="email"
              value={formData.candidateEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, candidateEmail: e.target.value }))}
              placeholder="candidate@example.com"
              fullWidth
            />
            
            <TextField
              label="Candidate Name (Optional)"
              value={formData.candidateName}
              onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
              placeholder="John Doe (defaults to 'Candidate' if empty)"
              fullWidth
            />
            
            <TextField
              label="Job Title"
              value={formData.jobTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
              placeholder="Software Developer"
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleSendCodingTest}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
              sx={{
                backgroundColor: '#02E2FF',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#02C2E0',
                },
                mt: 2
              }}
            >
              {loading ? 'Sending Coding Test...' : 'Send Coding Test'}
            </Button>
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>What happens when you click "Send Coding Test":</strong>
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>AI generates a coding-focused technical test based on the post's technologies</li>
              <li>Creates a professional PDF with coding challenges and projects</li>
              <li>Sends an email to the candidate with the PDF attachment</li>
              <li>Candidate receives coding exercises, mini-projects, and code review tasks</li>
            </ul>
          </Alert>
        </CardContent>
      </Card>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestCodingTask;
