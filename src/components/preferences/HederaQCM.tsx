import React from 'react';
import { Box, Typography, Paper, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';

// Hedera QCM questions
const HEDERA_QUESTIONS = [
  {
    id: 'q1',
    question: 'Which Hedera service have you used?',
    options: ['Consensus Service', 'Token Service', 'Smart Contract Service']
  },
  {
    id: 'q2',
    question: 'Which SDK have you used?',
    options: ['Java SDK', 'JavaScript SDK', 'Go SDK', 'Other']
  },
  {
    id: 'q3',
    question: 'On which network did you deploy?',
    options: ['Testnet', 'Mainnet', 'Previewnet']
  },
  {
    id: 'q4',
    question: 'How long have you worked with Hedera?',
    options: ['< 1 month', '1–3 months', '3–6 months', '> 6 months']
  },
  {
    id: 'q5',
    question: 'Have you implemented a Consensus topic?',
    options: ['Yes', 'No']
  }
];

interface HederaQCMProps {
  hedQcm: Record<string, string>;
  setQcm: (qid: string, ans: string) => void;
}

const HederaQCM: React.FC<HederaQCMProps> = ({ hedQcm, setQcm }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 3
        }}
      >
        Hedera Experience Verification
      </Typography>
      {HEDERA_QUESTIONS.map(({ id, question, options }) => (
        <Paper
          key={id}
          sx={{
            p: 3,
            mb: 2,
            backgroundColor: '#fff',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#02E2FF',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }
          }}
          elevation={0}
        >
          <Typography sx={{ color: '#00072D' }} gutterBottom>
            {question}
          </Typography>
          <RadioGroup
            value={hedQcm[id] || ''}
            onChange={e => setQcm(id, e.target.value)}
          >
            {options.map(opt => (
              <FormControlLabel
                key={opt}
                value={opt}
                control={
                  <Radio
                    sx={{
                      color: '#64748b',
                      '&.Mui-checked': {
                        color: '#02E2FF'
                      }
                    }}
                  />
                }
                label={opt}
                sx={{
                  color: '#1e293b',
                  '&:hover': { color: '#02E2FF' }
                }}
              />
            ))}
          </RadioGroup>
        </Paper>
      ))}
    </Box>
  );
};

export default HederaQCM;
