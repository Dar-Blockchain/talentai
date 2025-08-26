import React from 'react';
import { Box, Typography, Chip, Paper, Tabs, Tab, RadioGroup, FormControlLabel, Radio, Slider, Tooltip } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BugReportIcon from '@mui/icons-material/BugReport';
import BusinessIcon from '@mui/icons-material/Business';

// Skills data
const ALL_SKILLS = [
  { label: 'JavaScript', color: 'F7DF1E', category: 'development' },
  { label: 'TypeScript', color: '3178C6', category: 'development' },
  { label: 'React', color: '61DAFB', category: 'development' },
  { label: 'Node.js', color: '339933', category: 'development' },
  { label: 'Python', color: '3776AB', category: 'development' },
  { label: 'Hedera', color: '02E2FF', category: 'development' },
  { label: 'Solidity', color: '363636', category: 'web3' },
  { label: 'Ethereum', color: '627EEA', category: 'web3' },
  { label: 'Machine Learning', color: 'FF6B6B', category: 'ai' },
  { label: 'Deep Learning', color: '00B894', category: 'ai' },
  { label: 'SEO', color: 'FF6B6B', category: 'marketing' },
  { label: 'Content Marketing', color: '4ECDC4', category: 'marketing' },
  { label: 'Manual Testing', color: '9C27B0', category: 'qa' },
  { label: 'Project Management', color: '6C5CE7', category: 'business' },
];

const CATEGORIES = [
  { id: 'development', label: 'Development', icon: <CodeIcon /> },
  { id: 'web3', label: 'Web3', icon: <DesignServicesIcon /> },
  { id: 'ai', label: 'AI', icon: <AnalyticsIcon /> },
  { id: 'marketing', label: 'Marketing', icon: <AnalyticsIcon /> },
  { id: 'qa', label: 'Quality Assurance', icon: <BugReportIcon /> },
  { id: 'business', label: 'Business', icon: <BusinessIcon /> },
];

interface SkillsSelectionProps {
  userType: 'candidate' | 'company' | '';
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  skills: string[];
  setSkills: (skills: string[]) => void;
  requiredSkills: string[];
  setRequiredSkills: (skills: string[]) => void;
  hederaExp: 'yes' | 'no' | '';
  setHederaExp: (exp: 'yes' | 'no' | '') => void;
  skillWarning: string;
  GREEN_MAIN: string;
}

const SkillsSelection: React.FC<SkillsSelectionProps> = ({
  userType,
  selectedCategory,
  setSelectedCategory,
  skills,
  setSkills,
  requiredSkills,
  setRequiredSkills,
  hederaExp,
  setHederaExp,
  skillWarning,
  GREEN_MAIN
}) => {
  const filteredSkills = ALL_SKILLS.filter(s => s.category === selectedCategory);

  const toggleSkill = (label: string) => {
    if (skills.includes(label)) {
        const x = skills.filter((s: string) => s !== label) || []
      setSkills(x);
    } else {
      if (skills.length >= 1) return;
      const x = [...skills, label]
      setSkills(x);
    }
  };

  const toggleRequiredSkill = (label: string) => {
    if (requiredSkills.includes(label)) {
        const x = requiredSkills.filter((s: string) => s !== label)
      setRequiredSkills(x);
    } else {
        const x = [...requiredSkills, label]
      setRequiredSkills(x);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
          boxShadow: '0 8px 25px rgba(0, 255, 157, 0.3)'
        }}>
          <CodeIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ color: 'black', fontWeight: 700, mb: 2 }}>
          {userType === 'company' ? 'Required Skills Selection' : 'Skill Assessment'}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
          {userType === 'company' 
            ? 'Choose the skills that best match your company\'s requirements.'
            : 'Select the skill you want to be assessed on.'
          }
        </Typography>
      </Box>

      {/* Categories Tabs */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)', border: '2px solid #DEE2E6' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600, textAlign: 'center' }}>
          Choose a Skill Category
        </Typography>
        <Tabs
          value={selectedCategory}
          onChange={(_, v) => setSelectedCategory(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 140,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#666',
              borderRadius: 2,
              mx: 0.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 157, 0.1)',
                color: GREEN_MAIN
              },
              '&.Mui-selected': {
                color: GREEN_MAIN,
                backgroundColor: 'rgba(0, 255, 157, 0.15)',
                fontWeight: 700
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: GREEN_MAIN,
              height: 4,
              borderRadius: 2
            }
          }}
        >
          {CATEGORIES.map(c => (
            <Tab
              key={c.id}
              value={c.id}
              label={c.label}
              icon={c.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Skills Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" mb={3} sx={{ color: '#333', fontWeight: 600, textAlign: 'center' }}>
          {userType === 'company' ? `Select ${selectedCategory} skills` : `Choose your ${selectedCategory} skill`}
        </Typography>

        {skillWarning && (
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: '#FFF3CD', border: '1px solid #FFEAA7', textAlign: 'center' }}>
            <Typography color="warning.main" sx={{ fontWeight: 600 }}>⚠️ {skillWarning}</Typography>
          </Box>
        )}

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' },
          gap: 3,
          mb: 4
        }}>
          {filteredSkills.map(skill => {
            const isCompany = userType === 'company';
            const skillsList = isCompany ? requiredSkills : skills;
            const sel = skillsList.includes(skill.label);

            return (
              <Tooltip key={skill.label} title={`Click to ${sel ? 'remove' : 'add'} ${skill.label}`} arrow>
                <Box sx={{ cursor: 'pointer', transition: 'all 0.3s ease', transform: sel ? 'scale(1.05)' : 'scale(1)' }}>
                  <Chip
                    label={skill.label}
                    clickable
                    onClick={() => {
                      if (isCompany) {
                        toggleRequiredSkill(skill.label);
                      } else {
                        toggleSkill(skill.label);
                      }
                    }}
                    sx={{
                      width: '100%',
                      height: 50,
                      border: `2px solid #${skill.color}`,
                      backgroundColor: sel ? `#${skill.color}` : 'white',
                      color: sel ? '#fff' : `#${skill.color}`,
                      fontWeight: sel ? 700 : 600,
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: `#${skill.color}`,
                        color: '#fff',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  />
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        {/* Skills Summary */}
        <Box sx={{ p: 3, borderRadius: 3, backgroundColor: '#F8F9FA', border: '2px solid #E9ECEF', textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#495057', fontWeight: 600, mb: 1 }}>
            {userType === 'company' ? 'Selected Skills:' : 'Your Selected Skill:'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {userType === 'company' ? (
              requiredSkills.length > 0 ? (
                requiredSkills.map((skill, index) => (
                  <Chip key={index} label={skill} sx={{ background: GREEN_MAIN, color: 'white', fontWeight: 600 }} />
                ))
              ) : (
                <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>No skills selected yet</Typography>
              )
            ) : (
              skills.length > 0 ? (
                skills.map((skill, index) => (
                  <Chip key={index} label={skill} sx={{ background: GREEN_MAIN, color: 'white', fontWeight: 600 }} />
                ))
              ) : (
                <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>No skill selected yet</Typography>
              )
            )}
          </Box>
        </Box>
      </Box>

      {/* Hedera Experience Question */}
      {((userType === 'candidate' && skills.includes('Hedera')) ||
        (userType === 'company' && requiredSkills.includes('Hedera'))) && (
        <Box sx={{ mt: 6, p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #02E2FF08 0%, #00FFC308 100%)', border: '2px solid #02E2FF30', textAlign: 'center' }}>
          <Box sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 6px 20px rgba(2, 226, 255, 0.3)'
          }}>
            <BugReportIcon sx={{ fontSize: 30, color: 'white' }} />
          </Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 600, mb: 3 }}>
            {userType === 'company' ? 'Is Hedera experience required?' : 'Do you have experience working with Hedera?'}
          </Typography>
          <RadioGroup
            row
            value={hederaExp}
            onChange={(e) => setHederaExp(e.target.value as 'yes' | 'no')}
            sx={{ justifyContent: 'center', gap: 4 }}
          >
            <FormControlLabel
              value="yes"
              control={<Radio sx={{ color: '#02E2FF', '&.Mui-checked': { color: '#02E2FF' } }} />}
              label={<Typography sx={{ color: '#333', fontWeight: 500 }}>Yes, I have experience</Typography>}
            />
            <FormControlLabel
              value="no"
              control={<Radio sx={{ color: '#02E2FF', '&.Mui-checked': { color: '#02E2FF' } }} />}
              label={<Typography sx={{ color: '#333', fontWeight: 500 }}>No, I'm new to Hedera</Typography>}
            />
          </RadioGroup>
        </Box>
      )}

      {/* Help Text */}
      <Box sx={{ mt: 4, p: 3, borderRadius: 3, backgroundColor: '#E8F5E8', border: '2px solid #C8E6C9', textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
        <Typography variant="body2" sx={{ color: '#2E7D32', lineHeight: 1.6 }}>
          <strong>💡 Tip:</strong> {userType === 'company' 
            ? 'Select skills that accurately represent your company\'s needs.'
            : 'Choose the skill you\'re most confident in.'
          }
        </Typography>
      </Box>
    </Box>
  );
};

export default SkillsSelection;
