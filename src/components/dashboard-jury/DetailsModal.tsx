import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  detailsProject: any;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ open, onClose, detailsProject }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
      Project Assessment Details
      <IconButton aria-label="close" onClick={onClose} size="large" sx={{ ml: 2 }}>
        <CloseIcon fontSize="inherit" />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      {detailsProject && (
        <Box>
          <Typography variant="h5" sx={{ mt: 1, mb: 1 }}>{detailsProject.name}</Typography>
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>{detailsProject.description || 'No description provided.'}</Typography>
          {detailsProject.assessment ? (
            <>
              <Typography variant="h5" sx={{ mt: 1, mb: 2 }}>Combined Score: <b>{detailsProject.score}</b></Typography>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Technical Test</Typography>
              {detailsProject.assessment.technicalData ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Track: {detailsProject.assessment.technicalData.track}</Typography>
                  <Typography variant="body2">Overall Score: {detailsProject.assessment.technicalData.overallScore ?? 'N/A'}</Typography>
                  <Typography variant="body2">Summary: {detailsProject.assessment.technicalData.summary ?? 'N/A'}</Typography>
                </Box>
              ) : (
                <Typography variant="body2">No technical test data.</Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Business Test</Typography>
              {detailsProject.assessment.businessData ? (
                <Box>
                  <Typography variant="subtitle2">Problem: {detailsProject.assessment.businessData.problem}</Typography>
                  <Typography variant="body2">Overall Score: {detailsProject.assessment.businessData.overallScore ?? 'N/A'}</Typography>
                  <Typography variant="body2">Summary: {detailsProject.assessment.businessData.summary ?? 'N/A'}</Typography>
                </Box>
              ) : (
                <Typography variant="body2">No business test data.</Typography>
              )}
            </>
          ) : (
            <Typography>No assessment data available.</Typography>
          )}
        </Box>
      )}
    </DialogContent>
  </Dialog>
);

export default DetailsModal; 