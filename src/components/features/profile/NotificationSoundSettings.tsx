import React from 'react';
import { Box, Typography, Switch, Slider, Chip } from '@mui/material';
import { VolumeUp as VolumeUpIcon, VolumeOff as VolumeOffIcon, Info as InfoIcon } from '@mui/icons-material';
import { useNotificationSound } from '@/hooks/useNotificationSound';

const T    = "#0D9488";
const TBG  = "#F0FDFA";
const TBRD = "#99F6E4";
const NAVY = "#0D1B2A";

const NotificationSoundSettings: React.FC = () => {
  const { enabled, volume, setEnabled, setVolume } = useNotificationSound();

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", mb: 2 }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #F1F5F9" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: NAVY }}>Notification Sounds</Typography>
        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", mt: 0.25 }}>Configure sound alerts to never miss important notifications</Typography>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {/* Toggle row */}
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          p: 2, mb: enabled ? 2 : 0, borderRadius: "12px",
          bgcolor: enabled ? TBG : "#F9FAFB",
          border: `1px solid ${enabled ? TBRD : "#E5E7EB"}`,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: enabled ? T : "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {enabled
                ? <VolumeUpIcon  sx={{ fontSize: 18, color: "#fff" }} />
                : <VolumeOffIcon sx={{ fontSize: 18, color: "#fff" }} />
              }
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: NAVY }}>Enable sounds</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>
                {enabled ? "Sounds enabled for all notifications" : "Sounds disabled"}
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: T, "&:hover": { bgcolor: `${T}14` } },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: T },
            }}
          />
        </Box>

        {/* Volume slider */}
        {enabled && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: NAVY }}>Volume</Typography>
              <Chip label={`${volume}%`} size="small" sx={{ bgcolor: TBG, color: T, fontWeight: 700, fontSize: "0.72rem", border: `1px solid ${TBRD}` }} />
            </Box>
            <Slider
              value={volume}
              onChange={(_, v) => setVolume(v as number)}
              min={0} max={100}
              sx={{
                color: T,
                "& .MuiSlider-thumb": { "&:hover, &.Mui-focusVisible": { boxShadow: `0 0 0 8px ${T}29` } },
              }}
            />
          </Box>
        )}

        {/* Info note */}
        <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: TBG, border: `1px solid ${TBRD}`, display: "flex", alignItems: "center", gap: 1 }}>
          <InfoIcon sx={{ fontSize: 15, color: T, flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.75rem", color: T }}>
            Sounds play automatically with each new notification, even when the tab is in the background
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default NotificationSoundSettings;
