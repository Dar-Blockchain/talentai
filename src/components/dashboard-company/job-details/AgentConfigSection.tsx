import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useDispatch, useSelector } from 'react-redux';
import { updateAgentConfig } from '@/store/slices/agentConfigSlice';
import { AppDispatch, RootState } from '@/store/store';
import { toast } from 'react-toastify';

interface AgentConfigSectionProps {
  job: any;
  onRefresh?: () => void;
}

const AgentConfigSection: React.FC<AgentConfigSectionProps> = ({ job, onRefresh }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status: updateStatus } = useSelector((state: RootState) => state.agentConfig.updateConfig);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    thresholdPercent: 0,
    bidBudgetMin: 0,
    bidBudgetMax: 0,
    bidStep: 0,
    maxCandidatesToBid: 0,
    agentLifetimeDays: 0,
    bidLifetimeDays: 0,
    autoSubmitTopMatch: false,
    maxDailySpending: 0,
    isActive: false,
  });

  useEffect(() => {
    if (job?.agentConfig) {
      setForm({
        thresholdPercent: job.agentConfig.thresholdPercent || 0,
        bidBudgetMin: job.agentConfig.bidBudgetMin || 0,
        bidBudgetMax: job.agentConfig.bidBudgetMax || 0,
        bidStep: job.agentConfig.bidStep || 0,
        maxCandidatesToBid: job.agentConfig.maxCandidatesToBid || 0,
        agentLifetimeDays: job.agentConfig.agentLifetimeDays || 0,
        bidLifetimeDays: job.agentConfig.bidLifetimeDays || 0,
        autoSubmitTopMatch: job.agentConfig.autoSubmitTopMatch || false,
        maxDailySpending: job.agentConfig.maxDailySpending || 0,
        isActive: job.agentConfig.isActive || false,
      });
    }
  }, [job]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!job?.agentConfig?._id) {
      toast.error('Agent configuration ID not found');
      return;
    }

    try {
      await dispatch(updateAgentConfig({ id: job.agentConfig._id, data: form })).unwrap();
      toast.success('Agent configuration updated successfully!');
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Failed to update agent configuration');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (job?.agentConfig) {
      setForm({
        thresholdPercent: job.agentConfig.thresholdPercent || 0,
        bidBudgetMin: job.agentConfig.bidBudgetMin || 0,
        bidBudgetMax: job.agentConfig.bidBudgetMax || 0,
        bidStep: job.agentConfig.bidStep || 0,
        maxCandidatesToBid: job.agentConfig.maxCandidatesToBid || 0,
        agentLifetimeDays: job.agentConfig.agentLifetimeDays || 0,
        bidLifetimeDays: job.agentConfig.bidLifetimeDays || 0,
        autoSubmitTopMatch: job.agentConfig.autoSubmitTopMatch || false,
        maxDailySpending: job.agentConfig.maxDailySpending || 0,
        isActive: job.agentConfig.isActive || false,
      });
    }
  };

  return (
    <Accordion sx={{ mt: 2, boxShadow: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={2} alignItems="center">
          <SmartToyIcon color="primary" />
          <Typography variant="h6">AI Agent Configuration</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Configure the AI agent's behavior for this job posting
          </Typography>
          {!isEditing ? (
            <IconButton onClick={() => setIsEditing(true)} size="small" color="primary">
              <EditIcon />
            </IconButton>
          ) : (
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handleCancel} size="small">
                <CancelIcon />
              </IconButton>
              <IconButton onClick={handleSave} size="small" color="primary" disabled={updateStatus === 'loading'}>
                {updateStatus === 'loading' ? <CircularProgress size={20} /> : <SaveIcon />}
              </IconButton>
            </Stack>
          )}
        </Box>

        <Stack spacing={2}>
          <TextField
            label="Threshold Percentage"
            type="number"
            value={form.thresholdPercent}
            onChange={(e) => handleChange('thresholdPercent', Number(e.target.value))}
            disabled={!isEditing}
            fullWidth
            helperText="Minimum match percentage to consider candidates"
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Bid Budget Min (TAI)"
              type="number"
              value={form.bidBudgetMin}
              onChange={(e) => handleChange('bidBudgetMin', Number(e.target.value))}
              disabled={!isEditing}
              fullWidth
            />
            <TextField
              label="Bid Budget Max (TAI)"
              type="number"
              value={form.bidBudgetMax}
              onChange={(e) => handleChange('bidBudgetMax', Number(e.target.value))}
              disabled={!isEditing}
              fullWidth
            />
          </Stack>
          <TextField
            label="Bid Step (TAI)"
            type="number"
            value={form.bidStep}
            onChange={(e) => handleChange('bidStep', Number(e.target.value))}
            disabled={!isEditing}
            fullWidth
            helperText="Amount to increment bids"
          />
          <TextField
            label="Max Candidates to Bid"
            type="number"
            value={form.maxCandidatesToBid}
            onChange={(e) => handleChange('maxCandidatesToBid', Number(e.target.value))}
            disabled={!isEditing}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Agent Lifetime (Days)"
              type="number"
              value={form.agentLifetimeDays}
              onChange={(e) => handleChange('agentLifetimeDays', Number(e.target.value))}
              disabled={!isEditing}
              fullWidth
            />
            <TextField
              label="Bid Lifetime (Days)"
              type="number"
              value={form.bidLifetimeDays}
              onChange={(e) => handleChange('bidLifetimeDays', Number(e.target.value))}
              disabled={!isEditing}
              fullWidth
            />
          </Stack>
          <TextField
            label="Max Daily Spending (TAI)"
            type="number"
            value={form.maxDailySpending}
            onChange={(e) => handleChange('maxDailySpending', Number(e.target.value))}
            disabled={!isEditing}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.autoSubmitTopMatch}
                onChange={(e) => handleChange('autoSubmitTopMatch', e.target.checked)}
                disabled={!isEditing}
              />
            }
            label="Auto-submit Top Match"
          />
          <FormControlLabel
            control={<Switch checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} disabled={!isEditing} />}
            label="Agent Active"
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(AgentConfigSection);
