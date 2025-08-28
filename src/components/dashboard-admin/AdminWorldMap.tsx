import { Box, Typography } from '@mui/material';
import WorldMap from './WorldMap';

const AdminWorldMap = ({ userLocations, totalUsers }: { userLocations: any[]; totalUsers: number }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h5" sx={{ fontWeight: 700, color: '#8310FF', mb: 2 }}>
      Global User Distribution
    </Typography>
    <WorldMap userLocations={userLocations} totalUsers={totalUsers} />
  </Box>
);

export default AdminWorldMap; 