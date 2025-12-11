import React from 'react';
import { Box, Typography, Chip, Stack, IconButton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CloseIcon from '@mui/icons-material/Close';

interface JobHeaderProps {
  job: any;
  onClose: () => void;
}

const JobHeader: React.FC<JobHeaderProps> = ({ job, onClose }) => {
  const details = job?.jobDetails || job;
  const createdAt = job?.createdAt || job?.created_at || job?.postedAt;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {details?.title || job?.title || 'Job Title'}
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
            {details?.location && (
              <Chip icon={<LocationOnIcon />} label={details.location} size="small" variant="outlined" />
            )}
            {details?.salary && (
              <Chip icon={<AttachMoneyIcon />} label={details.salary} size="small" variant="outlined" color="success" />
            )}
            {details?.type && (
              <Chip icon={<WorkOutlineIcon />} label={details.type} size="small" variant="outlined" color="primary" />
            )}
          </Stack>
        </Box>
        <IconButton onClick={onClose} sx={{ ml: 2 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {createdAt && (
        <Typography variant="caption" color="text.secondary">
          Posted: {new Date(createdAt).toLocaleDateString()}
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(JobHeader);
