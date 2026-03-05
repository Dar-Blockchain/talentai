import { Box, Typography } from '@mui/material';
import WorldMap from './WorldMap';

const AdminWorldMap = ({ userLocations, totalUsers }: { userLocations: any[]; totalUsers: number }) => (
  <Box sx={{ mb: 4 }}>
    <WorldMap userLocations={userLocations} totalUsers={totalUsers} />
  </Box>
);

export default AdminWorldMap; 