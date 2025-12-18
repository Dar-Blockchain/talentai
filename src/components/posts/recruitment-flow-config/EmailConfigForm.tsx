import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Chip,
  Paper,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

interface EmailConfig {
  emailType: string;
  subject: string;
  body: string;
  sendTo: string;
  configured: boolean;
}

interface EmailConfigFormProps {
  initialConfig?: EmailConfig;
  onSave: (config: EmailConfig) => void;
  onCancel: () => void;
}

const EMAIL_TEMPLATES = [
  {
    value: 'welcome',
    label: 'Welcome Email',
    defaultSubject: 'Welcome to {{companyName}} - Next Steps',
    defaultBody: `Dear {{candidateName}},

Thank you for your interest in the {{positionTitle}} position at {{companyName}}.

We're excited to move forward with your application. Here are the next steps in our recruitment process:

1. Complete the technical skills assessment
2. Soft skills evaluation
3. HR interview

We look forward to getting to know you better!

Best regards,
{{companyName}} Team`,
  },
  {
    value: 'assessment',
    label: 'Assessment Invitation',
    defaultSubject: 'Assessment Invitation - {{positionTitle}}',
    defaultBody: `Dear {{candidateName}},

We're pleased to invite you to complete the assessment for the {{positionTitle}} position.

Please complete the assessment at your earliest convenience. You will have access to all necessary instructions once you begin.

If you have any questions, please don't hesitate to reach out.

Best regards,
{{companyName}} Team`,
  },
  {
    value: 'interview',
    label: 'Interview Invitation',
    defaultSubject: 'Interview Invitation - {{positionTitle}} at {{companyName}}',
    defaultBody: `Dear {{candidateName}},

Congratulations! We're impressed with your profile and would like to invite you to an interview for the {{positionTitle}} position.

Interview Details:
- Date: {{interviewDate}}
- Format: Video Call
- Duration: Approximately 45 minutes

Please confirm your availability at your earliest convenience.

Best regards,
{{companyName}} Team`,
  },
  {
    value: 'rejection',
    label: 'Rejection Email',
    defaultSubject: 'Update on Your Application - {{positionTitle}}',
    defaultBody: `Dear {{candidateName}},

Thank you for your interest in the {{positionTitle}} position at {{companyName}}.

After careful consideration, we have decided to move forward with other candidates whose experience more closely aligns with our current needs.

We appreciate the time you invested in the application process and encourage you to apply for future opportunities that match your skills and experience.

Best wishes in your job search.

Best regards,
{{companyName}} Team`,
  },
  {
    value: 'offer',
    label: 'Offer Letter',
    defaultSubject: 'Job Offer - {{positionTitle}} at {{companyName}}',
    defaultBody: `Dear {{candidateName}},

We are delighted to offer you the position of {{positionTitle}} at {{companyName}}!

We believe your skills and experience will be a great addition to our team. Detailed offer information will follow in a separate communication.

Please let us know if you have any questions.

We look forward to welcoming you to the team!

Best regards,
{{companyName}} Team`,
  },
  {
    value: 'custom',
    label: 'Custom Email',
    defaultSubject: '',
    defaultBody: '',
  },
];

const SEND_TO_OPTIONS = [
  { value: 'candidate', label: 'Candidate' },
  { value: 'company', label: 'Company' },
  { value: 'both', label: 'Both Candidate and Company' },
];

const EmailConfigForm: React.FC<EmailConfigFormProps> = ({
  initialConfig,
  onSave,
  onCancel,
}) => {
  const [emailType, setEmailType] = useState(initialConfig?.emailType || 'welcome');
  const [subject, setSubject] = useState(initialConfig?.subject || '');
  const [body, setBody] = useState(initialConfig?.body || '');
  const [sendTo, setSendTo] = useState(initialConfig?.sendTo || 'candidate');

  // Update subject and body when email type changes
  useEffect(() => {
    if (!initialConfig) {
      const template = EMAIL_TEMPLATES.find((t) => t.value === emailType);
      if (template) {
        setSubject(template.defaultSubject);
        setBody(template.defaultBody);
      }
    }
  }, [emailType, initialConfig]);

  const handleSave = () => {
    const config: EmailConfig = {
      emailType,
      subject,
      body,
      sendTo,
      configured: subject.trim() !== '' && body.trim() !== '',
    };
    onSave(config);
  };

  const isValid = subject.trim() !== '' && body.trim() !== '';

  const placeholders = [
    '{{candidateName}}',
    '{{companyName}}',
    '{{positionTitle}}',
    '{{interviewDate}}',
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          <EmailIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Configure Email Notification
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Set up automated email communication for this recruitment step
        </Typography>
      </Box>

      {/* Email Template Selection */}
      <FormControl fullWidth>
        <InputLabel>Email Template</InputLabel>
        <Select
          value={emailType}
          onChange={(e) => setEmailType(e.target.value)}
          label="Email Template"
        >
          {EMAIL_TEMPLATES.map((template) => (
            <MenuItem key={template.value} value={template.value}>
              {template.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Available Placeholders */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          backgroundColor: '#f0f7ff',
          border: '1px solid #2196f3',
          borderRadius: '8px',
        }}
      >
        <Typography variant="caption" color="primary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
          Available Placeholders:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {placeholders.map((placeholder) => (
            <Chip
              key={placeholder}
              label={placeholder}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontFamily: 'monospace', fontSize: '11px' }}
            />
          ))}
        </Box>
      </Paper>

      {/* Subject Line */}
      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Subject Line
        </Typography>
        <TextField
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter email subject"
          variant="outlined"
          fullWidth
          error={subject.trim() === ''}
          helperText={subject.trim() === '' ? 'Subject is required' : ''}
        />
      </FormControl>

      {/* Email Body */}
      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Email Body
        </Typography>
        <TextField
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter email content..."
          variant="outlined"
          multiline
          rows={10}
          fullWidth
          error={body.trim() === ''}
          helperText={body.trim() === '' ? 'Email body is required' : 'Use placeholders above to personalize the email'}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: 'system-ui',
              fontSize: '14px',
            },
          }}
        />
      </FormControl>

      {/* Send To */}
      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Send To
        </Typography>
        <RadioGroup
          value={sendTo}
          onChange={(e) => setSendTo(e.target.value)}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {SEND_TO_OPTIONS.map((option) => (
              <Box
                key={option.value}
                sx={{
                  border: '1px solid',
                  borderColor: sendTo === option.value ? 'primary.main' : '#e0e0e0',
                  borderRadius: '8px',
                  p: 1.5,
                  backgroundColor: sendTo === option.value ? '#f0f7ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: sendTo === option.value ? '#e3f2fd' : '#f5f5f5',
                  },
                }}
                onClick={() => setSendTo(option.value)}
              >
                <FormControlLabel
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              </Box>
            ))}
          </Box>
        </RadioGroup>
      </FormControl>

      {/* Preview */}
      {subject && body && (
        <Box
          sx={{
            p: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Email Preview
          </Typography>

          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
              Subject:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {subject}
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
              Body:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                color: '#666',
                maxHeight: '200px',
                overflow: 'auto',
                p: 1,
                backgroundColor: 'white',
                borderRadius: '4px',
              }}
            >
              {body}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
              Recipient:
            </Typography>
            <Chip
              label={SEND_TO_OPTIONS.find((o) => o.value === sendTo)?.label}
              size="small"
              color="primary"
            />
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2 }}>
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

export default EmailConfigForm;
