import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip
} from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export interface MatchingCandidate {
  candidateId?: {
    _id: string;
    username?: string;
    email?: string;
    isVerified?: boolean;
    role?: string;
  };
  finalBid?: number;
  score?: number;
  matchedSkills?: Array<{ _id?: string; name?: string; experienceLevel?: string; proficiencyLevel?: number; ScoreTest?: number }>;
  requiredSkills?: Array<{ _id?: string; name?: string; level?: string }>;
}

interface MatchingProfilesProps {
  isLoading: boolean;
  error: string | null;
  profiles: MatchingCandidate[];
  displayCount: number;
  onShowMore: () => void;
  onBid: (candidate: MatchingCandidate) => void;
  selectedJobId?: string;
}

export const MatchingProfiles: React.FC<MatchingProfilesProps> = ({
  isLoading,
  error,
  profiles,
  displayCount,
  onShowMore,
  onBid,
  selectedJobId
}) => {
  // slice to displayCount
  const visible = profiles.slice(0, displayCount);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: '#02E2FF' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
  }

  if (profiles.length === 0) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
        backgroundColor: 'white',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0px 0px 2px 0px rgba(0, 255, 157, 1)'
      }}>
        <PersonSearchIcon sx={{ fontSize: 48, color: 'rgba(0, 255, 157, 1)', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'black', fontWeight: 600, mb: 1 }}>
          No Matching Candidates Found
        </Typography>
        <Typography variant="body2" sx={{ color: 'black', maxWidth: '400px' }}>
          We couldn't find any candidates that match your job requirements. Try adjusting your filters or requirements to find more matches.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {visible.map(candidate => (
        <Box key={candidate.candidateId?._id || Math.random()} sx={{ p: 3, background: 'white', borderRadius: '16px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(0,255,157,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'black' }}>
                {candidate.candidateId?.username?.charAt(0).toUpperCase() || '?'}
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="h6" sx={{ color: 'black', fontWeight: 600 }}>
                    {candidate.candidateId?.username || 'Anonymous'}
                  </Typography>
                  {candidate.candidateId?.isVerified && (
                    <StarIcon sx={{ fontSize: 16, color: '#4ade80' }} />
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: 'black' }}>{candidate.candidateId?.email || 'No email'}</Typography>
                <Typography variant="caption" sx={{ color: 'black' }}>{candidate.candidateId?.role || 'Role N/A'}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ background: 'rgba(0,255,157,1)', p: 1, borderRadius: '8px', textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 600 }}>{candidate.finalBid || 0}$</Typography>
                <Typography variant="caption">Current Bid</Typography>
              </Box>
              <Box sx={{ background: 'rgba(0,255,157,1)', p: 1, borderRadius: '8px', textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 600 }}>{candidate.score || 0}%</Typography>
                <Typography variant="caption">Match Score</Typography>
              </Box>
            </Box>
          </Box>

          {/* Matched Skills */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <StarIcon sx={{ color: 'rgba(0,255,157,1)' }} /> Matched Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {candidate.matchedSkills?.map(skill => (
                <Box key={skill._id || Math.random()} sx={{ background: 'rgba(0,255,157,1)', p: 1, borderRadius: '8px', flex: '1 1 calc(50% - 8px)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 500 }}>{skill.name}</Typography>
                    <Chip label={skill.experienceLevel} size="small" />
                  </Box>
                  <Box sx={{ width: '100%', height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ width: `${(skill.proficiencyLevel! / 5) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#02E2FF,#00FFC3)' }} />
                  </Box>
                  {skill.ScoreTest && (
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>Test Score: {skill.ScoreTest}%</Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Required Skills */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WorkIcon sx={{ color: 'rgba(0,255,157,1)' }} /> Required Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, background: 'rgba(0,0,0,0.05)', p: 1, borderRadius: '8px' }}>
              {candidate.requiredSkills?.map(skill => (
                <Chip key={skill._id || Math.random()} label={`${skill.name} (${skill.level})`} size="small" />
              ))}
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<EmailIcon />}
              href={`mailto:${candidate.candidateId?.email}`}
              disabled={!candidate.candidateId?.email}
            >
              Contact
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AttachMoneyIcon />}
              onClick={() => onBid(candidate)}
              disabled={!candidate.candidateId || !selectedJobId}
            >
              Place Bid
            </Button>
          </Box>
        </Box>
      ))}

      {profiles.length > displayCount && (
        <Button variant="outlined" onClick={onShowMore} sx={{ mt: 2 }}>
          Show More
        </Button>
      )}
    </Box>
  );
};
