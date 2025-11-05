import { Box, Typography, TextField } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

interface PersonalDetailsProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
}

const PersonalDetails = ({ firstName, setFirstName, lastName, setLastName }: PersonalDetailsProps) => {
  const GREEN_MAIN = 'rgba(0, 255, 157, 1)';

  // Allow only letters, spaces, hyphens, and apostrophes commonly found in names
  const sanitizeName = (value: string) => {
    // Remove numbers and disallowed special characters, trim leading spaces
    // Hyphen must be at the end of character class or escaped to be literal
    const cleaned = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ '\-]/g, '');
    return cleaned.replace(/^\s+/, '');
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(sanitizeName(e.target.value));
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(sanitizeName(e.target.value));
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
          <PersonIcon sx={{ fontSize: 40, color: 'white' }} />
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
          Tell us about yourself
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
          Let's start building your professional profile. This information helps us personalize your experience and connect you with the right opportunities.
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
          label="First Name"
          value={firstName}
          onChange={handleFirstNameChange}
          required
          variant="outlined"
          inputProps={{ inputMode: 'text', pattern: "[A-Za-zÀ-ÖØ-öø-ÿ '\\-]+" }}
          helperText="Letters only. No numbers or special characters."
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
          fullWidth
          label="Last Name"
          value={lastName}
          onChange={handleLastNameChange}
          required
          variant="outlined"
          inputProps={{ inputMode: 'text', pattern: "[A-Za-zÀ-ÖØ-öø-ÿ '\\-]+" }}
          helperText="Letters only. No numbers or special characters."
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
          <strong>💡 Tip:</strong> Use your legal name as it appears on official documents. 
          This helps with verification and professional networking.
        </Typography>
      </Box>
    </Box>
  );
};

export default PersonalDetails;
