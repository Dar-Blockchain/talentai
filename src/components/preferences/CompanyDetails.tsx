import { Box, Typography, TextField, MenuItem } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';

interface CompanyDetailsProps {
  companyDetails: {
    name: string;
    industry: string;
    size: string;
    location: string;
  };
  setCompanyDetails: (details: any) => void;
}

const CompanyDetails = ({ companyDetails, setCompanyDetails }: CompanyDetailsProps) => {
  const GREEN_MAIN = 'rgba(0, 255, 157, 1)';

  const handleChange = (field: string, value: string) => {
    setCompanyDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
          boxShadow: '0 8px 25px rgba(0, 255, 157, 0.3)'
        }}>
          <BusinessIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            color: 'black',
            fontWeight: 700,
            mb: 2
          }}
        >
          Tell us about your company
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#666',
            maxWidth: 500,
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Help us understand your organization better to find the perfect talent match for your needs.
        </Typography>
      </Box>

      {/* Enhanced Form */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4,
        maxWidth: 600,
        mx: 'auto'
      }}>
        <TextField
          fullWidth
          label="Company Name"
          value={companyDetails.name}
          onChange={(e) => handleChange('name', e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              },
              '&.Mui-focused': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(131, 16, 255, 0.2)'
              }
            },
            '& .MuiInputBase-input': { 
              color: '#333',
              fontSize: '1.1rem',
              padding: '16px 20px'
            },
            '& .MuiInputLabel-root': { 
              color: '#666',
              fontSize: '1rem',
              fontWeight: 500
            },
            '& .MuiOutlinedInput-notchedOutline': { 
              borderColor: '#E0E0E0',
              borderWidth: 2,
              transition: 'all 0.3s ease'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': { 
              borderColor: GREEN_MAIN 
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
              borderColor: GREEN_MAIN,
              borderWidth: 3
            }
          }}
        />

        <TextField
          select
          fullWidth
          label="Industry"
          value={companyDetails.industry}
          onChange={(e) => handleChange('industry', e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              },
              '&.Mui-focused': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(131, 16, 255, 0.2)'
              }
            },
            '& .MuiInputBase-input': { 
              color: '#333',
              fontSize: '1.1rem',
              padding: '16px 20px'
            },
            '& .MuiInputLabel-root': { 
              color: '#666',
              fontSize: '1rem',
              fontWeight: 500
            },
            '& .MuiOutlinedInput-notchedOutline': { 
              borderColor: '#E0E0E0',
              borderWidth: 2,
              transition: 'all 0.3s ease'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': { 
              borderColor: GREEN_MAIN 
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
              borderColor: GREEN_MAIN,
              borderWidth: 3
            }
          }}
        >
          <MenuItem value="Technology">Technology</MenuItem>
          <MenuItem value="Finance">Finance</MenuItem>
          <MenuItem value="Healthcare">Healthcare</MenuItem>
          <MenuItem value="Education">Education</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          label="Company Size"
          value={companyDetails.size}
          onChange={(e) => handleChange('size', e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              },
              '&.Mui-focused': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(131, 16, 255, 0.2)'
              }
            },
            '& .MuiInputBase-input': { 
              color: '#333',
              fontSize: '1.1rem',
              padding: '16px 20px'
            },
            '& .MuiInputLabel-root': { 
              color: '#666',
              fontSize: '1rem',
              fontWeight: 500
            },
            '& .MuiOutlinedInput-notchedOutline': { 
              borderColor: '#E0E0E0',
              borderWidth: 2,
              transition: 'all 0.3s ease'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': { 
              borderColor: GREEN_MAIN 
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
              borderColor: GREEN_MAIN,
              borderWidth: 3
            }
          }}
        >
          <MenuItem value="1-10">1-10 employees</MenuItem>
          <MenuItem value="11-50">11-50 employees</MenuItem>
          <MenuItem value="51-200">51-200 employees</MenuItem>
          <MenuItem value="201-500">201-500 employees</MenuItem>
          <MenuItem value="501+">501+ employees</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          label="Location"
          value={companyDetails.location}
          onChange={(e) => handleChange('location', e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              },
              '&.Mui-focused': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(131, 16, 255, 0.2)'
              }
            },
            '& .MuiInputBase-input': { 
              color: '#333',
              fontSize: '1.1rem',
              padding: '16px 20px'
            },
            '& .MuiInputLabel-root': { 
              color: '#666',
              fontSize: '1rem',
              fontWeight: 500
            },
            '& .MuiOutlinedInput-notchedOutline': { 
              borderColor: '#E0E0E0',
              borderWidth: 2,
              transition: 'all 0.3s ease'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': { 
              borderColor: GREEN_MAIN 
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
              borderColor: GREEN_MAIN,
              borderWidth: 3
            }
          }}
        >
          <MenuItem value="Remote">Remote</MenuItem>
          <MenuItem value="On-site">On-site</MenuItem>
          <MenuItem value="Hybrid">Hybrid</MenuItem>
        </TextField>
      </Box>

      {/* Help Text */}
      <Box sx={{ 
        mt: 4, 
        p: 3, 
        borderRadius: 3, 
        backgroundColor: '#F8F9FA',
        border: '2px solid #E9ECEF',
        maxWidth: 600,
        mx: 'auto',
        textAlign: 'center'
      }}>
        <Typography variant="body2" sx={{ color: '#495057', lineHeight: 1.6 }}>
          <strong>💡 Tip:</strong> Providing accurate company information helps us match you with the right candidates 
          and ensures a better hiring experience for your organization.
        </Typography>
      </Box>
    </Box>
  );
};

export default CompanyDetails;
