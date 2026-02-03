import { Typography, Box } from '@mui/material';

const AdminHeader = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography variant="body2" sx={{ color: '#6c6c80', fontWeight: 500, mb: 0.5 }}>
          Welcome back
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#1a1a2e',
            letterSpacing: '-0.5px',
            position: 'relative',
            pb: 1.5,
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '60px',
              height: '4px',
              background: 'linear-gradient(90deg, #8310FF 0%, #00FFC3 100%)',
              borderRadius: '2px',
            },
          }}
        >
          Admin Dashboard
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#6c6c80', fontWeight: 500 }}>
        {formattedDate}
      </Typography>
    </Box>
  );
};

export default AdminHeader;
