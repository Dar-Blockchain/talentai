/**
 * Notification Sound Settings Component
 * Allows users to configure notification sounds
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Slider,
  Chip,
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNotificationSound } from '@/hooks/useNotificationSound';

const NotificationSoundSettings: React.FC = () => {
  const {
    enabled,
    volume,
    setEnabled,
    setVolume,
  } = useNotificationSound();

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        mb: 3,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1f2937',
              mb: 1,
            }}
          >
            Notification Sounds
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#6b7280' }}
          >
            Configure sound alerts to never miss important notifications
          </Typography>
        </Box>

        {/* Enable/Disable Toggle */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            mb: 3,
            backgroundColor: enabled ? 'rgba(131, 16, 255, 0.04)' : '#f9fafb',
            borderRadius: 2,
            border: '1px solid',
            borderColor: enabled ? 'rgba(131, 16, 255, 0.2)' : '#e5e7eb',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {enabled ? (
              <VolumeUpIcon sx={{ color: '#8310FF', fontSize: 28 }} />
            ) : (
              <VolumeOffIcon sx={{ color: '#9ca3af', fontSize: 28 }} />
            )}
            <Box>
              <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>
                Enable sounds
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {enabled ? 'Sounds enabled for all notifications' : 'Sounds disabled'}
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#8310FF',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#8310FF',
              },
            }}
          />
        </Box>

        {/* Volume Control */}
        {enabled && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>
                Volume
              </Typography>
              <Chip
                label={`${volume}%`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(131, 16, 255, 0.1)',
                  color: '#8310FF',
                  fontWeight: 600,
                }}
              />
            </Box>
            <Slider
              value={volume}
              onChange={(_, value) => setVolume(value as number)}
              min={0}
              max={100}
              sx={{
                color: '#8310FF',
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(131, 16, 255, 0.16)',
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Info Box */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: '#eff6ff',
            borderRadius: 2,
            border: '1px solid #bfdbfe',
          }}
        >
          <Typography variant="body2" sx={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon sx={{ fontSize: 18 }} />
            Sounds play automatically with each new notification, even when the tab is in the background
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationSoundSettings;
