import { Box, Typography, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';

interface UserTypeSelectionProps {
  userType: string;
  onUserTypeSelect: (type: 'candidate' | 'company') => void;
  isTestJobReturnUrl: boolean;
}

const UserTypeSelection = ({ userType, onUserTypeSelect, isTestJobReturnUrl }: UserTypeSelectionProps) => {
  const GREEN_MAIN = 'rgba(0, 255, 157, 1)';

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      {/* Enhanced Header Section */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            color: 'black',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #7C4DFF 0%, #00B8D4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Welcome to TalentAI
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#666',
            fontWeight: 500,
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6,
            fontSize: { xs: '1rem', sm: '1.1rem' }
          }}
        >
          Are you a candidate looking for opportunities or a company seeking talent?
        </Typography>
      </Box>

      {/* Warning Message */}
      {isTestJobReturnUrl && (
        <Box sx={{ 
          mb: 4,
          p: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
          color: 'white',
          maxWidth: 500,
          mx: 'auto',
          boxShadow: '0 4px 20px rgba(255, 152, 0, 0.3)'
        }}>
          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
            ⚠️ You're accessing a job test, so only candidate registration is available.
          </Typography>
        </Box>
      )}

      {/* Enhanced Selection Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: { xs: 3, sm: 4 },
        maxWidth: 800,
        mx: 'auto',
        mt: 6
      }}>
        {/* Candidate Card */}
        <Box
          sx={{
            p: 4,
            borderRadius: 4,
            border: `3px solid ${userType === 'candidate' ? GREEN_MAIN : '#E0E0E0'}`,
            backgroundColor: userType === 'candidate' ? `${GREEN_MAIN}15` : 'white',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              borderColor: GREEN_MAIN,
              backgroundColor: `${GREEN_MAIN}10`
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: userType === 'candidate' 
                ? `linear-gradient(90deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
                : 'transparent',
              transition: 'all 0.3s ease'
            }
          }}
          onClick={() => onUserTypeSelect('candidate')}
        >
          {/* Icon Container */}
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: userType === 'candidate' 
              ? `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
              : 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            transition: 'all 0.3s ease',
            boxShadow: userType === 'candidate' 
              ? '0 8px 25px rgba(0, 255, 157, 0.3)'
              : '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <PersonIcon sx={{ 
              fontSize: 40, 
              color: userType === 'candidate' ? 'white' : '#666',
              transition: 'all 0.3s ease'
            }} />
          </Box>

          {/* Content */}
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: userType === 'candidate' ? GREEN_MAIN : '#333',
              mb: 2,
              transition: 'color 0.3s ease'
            }}
          >
            I'm a Candidate
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: userType === 'candidate' ? '#555' : '#666',
              lineHeight: 1.6,
              mb: 3,
              transition: 'color 0.3s ease'
            }}
          >
            Looking for exciting opportunities? Showcase your skills and connect with top companies.
          </Typography>

          {/* Features List */}
          <Box sx={{ textAlign: 'left', mb: 3 }}>
            {[
              '✓ Take skill assessments',
              '✓ Build your profile',
              '✓ Get matched with jobs',
              '✓ Earn certifications'
            ].map((feature, index) => (
              <Typography 
                key={index}
                variant="body2" 
                sx={{ 
                  color: userType === 'candidate' ? '#555' : '#666',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.9rem'
                }}
              >
                {feature}
              </Typography>
            ))}
          </Box>

          {/* Status Badge */}
          {userType === 'candidate' && (
            <Box sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              px: 2,
              py: 0.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`,
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(0, 255, 157, 0.3)'
            }}>
            SELECTED
          </Box>
          )}
        </Box>

        {/* Company Card */}
        <Box
          sx={{
            p: 4,
            borderRadius: 4,
            border: `3px solid ${userType === 'company' ? GREEN_MAIN : '#E0E0E0'}`,
            backgroundColor: userType === 'company' ? `${GREEN_MAIN}15` : 'white',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            opacity: isTestJobReturnUrl ? 0.5 : 1,
            '&:hover': {
              transform: isTestJobReturnUrl ? 'none' : 'translateY(-8px)',
              boxShadow: isTestJobReturnUrl ? 'none' : '0 20px 40px rgba(0,0,0,0.15)',
              borderColor: isTestJobReturnUrl ? '#E0E0E0' : GREEN_MAIN,
              backgroundColor: isTestJobReturnUrl ? 'white' : `${GREEN_MAIN}10`
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: userType === 'company' 
                ? `linear-gradient(90deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
                : 'transparent',
              transition: 'all 0.3s ease'
            }
          }}
          onClick={() => !isTestJobReturnUrl && onUserTypeSelect('company')}
        >
          {/* Icon Container */}
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: userType === 'company' 
              ? `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`
              : 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            transition: 'all 0.3s ease',
            boxShadow: userType === 'company' 
              ? '0 8px 25px rgba(0, 255, 157, 0.3)'
              : '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <BusinessIcon sx={{ 
              fontSize: 40, 
              color: userType === 'company' ? 'white' : '#666',
              transition: 'all 0.3s ease'
            }} />
          </Box>

          {/* Content */}
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: userType === 'company' ? GREEN_MAIN : '#333',
              mb: 2,
              transition: 'color 0.3s ease'
            }}
          >
            I'm a Company
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: userType === 'company' ? '#555' : '#666',
              lineHeight: 1.6,
              mb: 3,
              transition: 'color 0.3s ease'
            }}
          >
            Need talented professionals? Find the perfect match for your projects and teams.
          </Typography>

          {/* Features List */}
          <Box sx={{ textAlign: 'left', mb: 3 }}>
            {[
              '✓ Post job opportunities',
              '✓ Access talent pool',
              '✓ Skill-based matching',
              '✓ Quality assessments'
            ].map((feature, index) => (
              <Typography 
                key={index}
                variant="body2" 
                sx={{ 
                  color: userType === 'company' ? '#555' : '#666',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.9rem'
                }}
              >
                {feature}
              </Typography>
            ))}
          </Box>

          {/* Status Badge */}
          {userType === 'company' && (
            <Box sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              px: 2,
              py: 0.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #00B8D4 100%)`,
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(0, 255, 157, 0.3)'
            }}>
            SELECTED
          </Box>
          )}

          {/* Disabled Overlay */}
          {isTestJobReturnUrl && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.1)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                Not Available
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Bottom Info */}
      <Box sx={{ mt: 6, p: 3, borderRadius: 3, backgroundColor: '#F8F9FA', maxWidth: 600, mx: 'auto' }}>
        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
          <strong>💡 Tip:</strong> Choose the option that best describes your current role. 
          You can always update your preferences later in your profile settings.
        </Typography>
      </Box>
    </Box>
  );
};

export default UserTypeSelection;
