import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip,
  Chip,
  Alert,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export interface AgentConfigurationFormValues {
  agentId: string;
  postId: string;
  thresholdPercent?: number;
  bidBudgetMin?: number;
  bidBudgetMax?: number;
  bidStep?: number;
  maxCandidatesToBid?: number;
  agentLifetimeDays?: number;
  bidLifetimeDays?: number;
  autoSubmitTopMatch: boolean;
  maxDailySpending?: number;
  isActive: boolean;
}

export interface AgentConfigurationFormProps {
  value: AgentConfigurationFormValues;
  onChange: (update: Partial<AgentConfigurationFormValues>) => void;
  disabled?: boolean;
  loading?: boolean;
  errorMessage?: string | null;
  agentSummary?: {
    agentName?: string;
    createdAt?: string;
  };
}

const numberFields: Array<{
  key: keyof AgentConfigurationFormValues;
  label: string;
  helper?: string;
  min?: number;
  max?: number;
  step?: number;
}> = [
  {
    key: 'thresholdPercent',
    label: 'Match Threshold (%)',
    helper: 'Minimum candidate score required to trigger automated actions',
    min: 0,
    max: 100,
    step: 1,
  },
  {
    key: 'bidBudgetMin',
    label: 'Minimum Bid Budget ($)',
    helper: 'Lowest amount your agent can bid for a candidate interaction',
    min: 0,
    step: 1,
  },
  {
    key: 'bidBudgetMax',
    label: 'Maximum Bid Budget ($)',
    helper: 'Highest bid amount allowed per candidate interaction',
    min: 0,
    step: 1,
  },
  {
    key: 'bidStep',
    label: 'Bid Increment ($)',
    helper: 'Incremental step used when increasing bids',
    min: 1,
    step: 1,
  },
  {
    key: 'maxCandidatesToBid',
    label: 'Max Candidates to Bid',
    helper: 'Number of concurrent candidates the agent can engage with',
    min: 1,
    step: 1,
  },
  {
    key: 'maxDailySpending',
    label: 'Daily Spending Limit ($)',
    helper: 'Cap the daily budget allocation for this agent',
    min: 0,
    step: 1,
  },
  {
    key: 'agentLifetimeDays',
    label: 'Agent Lifetime (days)',
    helper: 'Auto-deactivation period for the agent',
    min: 1,
    step: 1,
  },
  {
    key: 'bidLifetimeDays',
    label: 'Bid Lifetime (days)',
    helper: 'How long each bid remains valid before expiring',
    min: 1,
    step: 1,
  },
];

const AgentConfigurationForm: React.FC<AgentConfigurationFormProps> = ({
  value,
  onChange,
  disabled = false,
  loading = false,
  errorMessage,
  agentSummary,
}) => {
  const handleNumberChange =
    (key: keyof AgentConfigurationFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const parsed = raw === '' ? undefined : Number(raw);
      onChange({ [key]: Number.isNaN(parsed as number) ? undefined : parsed } as Partial<AgentConfigurationFormValues>);
    };

  const handleStringChange =
    (key: keyof AgentConfigurationFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ [key]: event.target.value } as Partial<AgentConfigurationFormValues>);
    };

  const handleBooleanChange =
    (key: keyof AgentConfigurationFormValues) =>
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      onChange({ [key]: checked } as Partial<AgentConfigurationFormValues>);
    };

  return (
    <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>
              Configure Agent Strategy
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
              Fine-tune bidding thresholds, spending limits, and automation rules before launching your recruitment flow.
            </Typography>
          </Box>
          <Tooltip
            title="Agent configurations determine how aggressively your AI agent bids and how it manages automation thresholds."
            placement="left"
            arrow
          >
            <InfoOutlinedIcon sx={{ color: '#6b7280' }} />
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Chip
            label={value.agentId ? `Agent ID: ${value.agentId}` : 'Agent ID pending'}
            color={value.agentId ? 'success' : 'default'}
            variant={value.agentId ? 'filled' : 'outlined'}
            sx={{ fontWeight: 500 }}
          />
          <Chip
            label={value.postId ? `Post ID: ${value.postId}` : 'Post not saved yet'}
            color={value.postId ? 'primary' : 'default'}
            variant={value.postId ? 'filled' : 'outlined'}
            sx={{ fontWeight: 500 }}
          />
          {agentSummary?.agentName && (
            <Chip
              label={`Agent: ${agentSummary.agentName}`}
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={3} sx={{ mb: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Agent ID"
              fullWidth
              value={value.agentId || ''}
              onChange={handleStringChange('agentId')}
              disabled={disabled || loading}
              helperText="Identifier of the AI agent responsible for this post."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Post ID"
              fullWidth
              value={value.postId || ''}
              disabled
              helperText="Job post identifier linked to this configuration."
            />
          </Grid>
        </Grid>

        {!value.agentId && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            The agent ID will appear automatically once the AI agent is created. Paste it here manually if you already have one.
          </Alert>
        )}

        <Grid container spacing={3}>
          {numberFields.map(({ key, label, helper, min, max, step }) => (
            <Grid item xs={12} md={6} key={key as string}>
              <TextField
                type="number"
                label={label}
                fullWidth
                value={(value[key] ?? '') as number | string}
                onChange={handleNumberChange(key)}
                inputProps={{
                  min,
                  max,
                  step,
                }}
                disabled={disabled || loading}
                helperText={helper}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(value.autoSubmitTopMatch)}
                  onChange={handleBooleanChange('autoSubmitTopMatch')}
                  disabled={disabled || loading}
                />
              }
              label="Automatically submit top matches"
            />
            <Typography variant="body2" sx={{ color: '#6b7280', ml: 1.5 }}>
              Enable this to automatically advance top-performing candidates to the next stage.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(value.isActive)}
                  onChange={handleBooleanChange('isActive')}
                  disabled={disabled || loading}
                />
              }
              label="Activate agent immediately"
            />
            <Typography variant="body2" sx={{ color: '#6b7280', ml: 1.5 }}>
              When enabled, the agent will start bidding as soon as the recruitment flow goes live.
            </Typography>
          </Grid>
        </Grid>

        {errorMessage && (
          <Box sx={{ mt: 4, color: '#b91c1c', fontWeight: 500 }}>
            {errorMessage}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AgentConfigurationForm;

