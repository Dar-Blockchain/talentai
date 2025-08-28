import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface JobPostData {
  title: string;
  description: string;
  requirements: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  type: string;
  experienceLevel: string;
  requiredSkills: string[];
  benefits: string[];
}

interface JobPostDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (jobData: JobPostData) => void;
  isEditing: boolean;
  editData?: JobPostData;
  isLoading: boolean;
  error?: string;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    background: 'white',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    maxWidth: '800px',
    width: '100%',
  },
}));

const StepIcon = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 600,
  color: 'white',
  background: 'linear-gradient(135deg, #8310FF 0%, #02E2FF 100%)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
}));

const PrimaryButton = styled(ActionButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #8310FF 0%, #02E2FF 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #7A0AFF 0%, #00D2FF 100%)',
  },
}));

const SecondaryButton = styled(ActionButton)(({ theme }) => ({
  border: '2px solid #8310FF',
  color: '#8310FF',
  '&:hover': {
    backgroundColor: 'rgba(131, 16, 255, 0.08)',
  },
}));

// ============================================================================
// CONSTANTS
// ============================================================================

const STEPS = ['Job Details', 'Requirements', 'Compensation', 'Review'];

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
];

const EXPERIENCE_LEVELS = [
  'Entry Level',
  'Junior',
  'Mid Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'Executive',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * JobPostDialog Component
 * 
 * Multi-step dialog for creating and editing job posts
 */
const JobPostDialog: React.FC<JobPostDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isEditing,
  editData,
  isLoading,
  error,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [jobData, setJobData] = useState<JobPostData>(editData || {
    title: '',
    description: '',
    requirements: '',
    salary: { min: 0, max: 0, currency: 'USD' },
    location: '',
    type: 'Full-time',
    experienceLevel: 'Entry Level',
    requiredSkills: [],
    benefits: [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleInputChange = (field: keyof JobPostData, value: any) => {
    setJobData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSalaryChange = (field: keyof JobPostData['salary'], value: any) => {
    setJobData((prev) => ({
      ...prev,
      salary: {
        ...prev.salary,
        [field]: field === 'currency' ? value : Number(value),
      },
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !jobData.requiredSkills.includes(newSkill.trim())) {
      setJobData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setJobData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !jobData.benefits.includes(newBenefit.trim())) {
      setJobData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefit: string) => {
    setJobData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((b) => b !== benefit),
    }));
  };

  const handleSubmit = () => {
    onSubmit(jobData);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return jobData.title.trim() !== '' && jobData.description.trim() !== '';
      case 1:
        return jobData.requirements.trim() !== '' && jobData.requiredSkills.length > 0;
      case 2:
        return jobData.salary.min > 0 && jobData.salary.max >= jobData.salary.min;
      case 3:
        return true;
      default:
        return false;
    }
  };

  // ============================================================================
  // RENDER STEP CONTENT
  // ============================================================================

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                value={jobData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Senior React Developer"
                variant="outlined"
                size="large"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                value={jobData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the role and responsibilities..."
                variant="outlined"
                multiline
                rows={4}
                size="large"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={jobData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  label="Job Type"
                >
                  {JOB_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={jobData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., New York, NY or Remote"
                variant="outlined"
                size="large"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements"
                value={jobData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="List the key requirements and qualifications..."
                variant="outlined"
                multiline
                rows={3}
                size="large"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Experience Level</InputLabel>
                <Select
                  value={jobData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  label="Experience Level"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Required Skills
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={addSkill}
                  startIcon={<AddIcon />}
                  sx={{ background: '#8310FF' }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {jobData.requiredSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => removeSkill(skill)}
                    deleteIcon={<DeleteIcon />}
                    sx={{ background: 'rgba(131, 16, 255, 0.1)' }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Salary"
                type="number"
                value={jobData.salary.min}
                onChange={(e) => handleSalaryChange('min', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="large"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Salary"
                type="number"
                value={jobData.salary.max}
                onChange={(e) => handleSalaryChange('max', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="large"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={jobData.salary.currency}
                  onChange={(e) => handleSalaryChange('currency', e.target.value)}
                  label="Currency"
                >
                  {CURRENCIES.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      {currency}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Benefits & Perks
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit"
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={addBenefit}
                  startIcon={<AddIcon />}
                  sx={{ background: '#8310FF' }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {jobData.benefits.map((benefit) => (
                  <Chip
                    key={benefit}
                    label={benefit}
                    onDelete={() => removeBenefit(benefit)}
                    deleteIcon={<DeleteIcon />}
                    sx={{ background: 'rgba(131, 16, 255, 0.1)' }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#8310FF' }}>
              Review Your Job Post
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {jobData.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {jobData.type} • {jobData.location} • {jobData.experienceLevel}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {jobData.description}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Requirements
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {jobData.requirements}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {jobData.requiredSkills.map((skill) => (
                    <Chip key={skill} label={skill} size="small" />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Compensation
                </Typography>
                <Typography variant="body2">
                  {jobData.salary.currency} {jobData.salary.min.toLocaleString()} - {jobData.salary.max.toLocaleString()}
                </Typography>
              </Grid>
              {jobData.benefits.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Benefits
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {jobData.benefits.map((benefit) => (
                      <Chip key={benefit} label={benefit} size="small" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        pb: 2,
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WorkIcon sx={{ color: '#8310FF', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000' }}>
              {isEditing ? 'Edit Job Post' : 'Create New Job Post'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ 
              color: 'rgba(0,0,0,0.6)',
              '&:hover': {
                color: 'rgba(0,0,0,0.8)',
                backgroundColor: 'rgba(0,0,0,0.04)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={() => (
                    <StepIcon>
                      {index + 1}
                    </StepIcon>
                  )}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ minHeight: '400px' }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{
        p: 3,
        borderTop: '1px solid rgba(0,0,0,0.1)',
        gap: 2,
      }}>
        <SecondaryButton
          variant="outlined"
          onClick={onClose}
          size="large"
        >
          Cancel
        </SecondaryButton>
        
        {activeStep > 0 && (
          <SecondaryButton
            variant="outlined"
            onClick={handleBack}
            size="large"
          >
            Back
          </SecondaryButton>
        )}
        
        {activeStep < STEPS.length - 1 ? (
          <PrimaryButton
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid(activeStep)}
            size="large"
          >
            Next
          </PrimaryButton>
        ) : (
          <PrimaryButton
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading || !isStepValid(activeStep)}
            size="large"
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Posting...' : (isEditing ? 'Update Job' : 'Post Job')}
          </PrimaryButton>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default JobPostDialog;

