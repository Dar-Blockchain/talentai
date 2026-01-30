import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { sectionStyle, sectionTitleStyle } from './helpers';

interface RecommendationsSectionProps {
  recommendations: string[];
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ recommendations }) => {
  if (recommendations.length === 0) return null;

  return (
    <Box sx={sectionStyle}>
      <Typography variant="h5" sx={sectionTitleStyle('rgba(245, 158, 11, 0.83)')}>
        Recommendations ({recommendations.length})
      </Typography>

      <List sx={{ p: 0 }}>
        {recommendations.map((rec, index) => (
          <ListItem
            key={index}
            sx={{ py: 1, px: 0, '&:not(:last-child)': { borderBottom: '1px solid rgba(238, 240, 242, 1)' } }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>{index + 1}</Typography>
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={rec}
              sx={{ '& .MuiListItemText-primary': { fontWeight: 400, lineHeight: 1.5, fontSize: '13px', color: '#111827' } }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default React.memo(RecommendationsSection);
