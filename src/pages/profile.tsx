import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Divider,
  Button,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProfile, selectProfile } from '../store/features/profileSlice';
import type { Profile } from '../store/features/profileSlice';
import { AppDispatch } from '../store/store';

const ProfileContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  backgroundColor: '#ffffff',
}));

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1),
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: '#000000',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

const InfoText = styled(Typography)(({ theme }) => ({
  color: '#000000',
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  color: '#666666',
  marginRight: theme.spacing(1),
}));

// Static data for experience and education
const staticData = {
  experience: [
    {
      title: "Senior Software Developer",
      company: "Tech Solutions Inc.",
      period: "2022 - Present",
      location: "New York, USA",
      description: "Leading development of enterprise applications using React and Node.js. Managing a team of 5 developers and implementing CI/CD pipelines.",
      achievements: [
        "Reduced application load time by 40% through optimization",
        "Implemented automated testing increasing coverage to 85%",
        "Mentored junior developers and conducted code reviews"
      ]
    },
    {
      title: "Software Developer",
      company: "Innovation Labs",
      period: "2020 - 2022",
      location: "San Francisco, USA",
      description: "Developed and maintained web applications using JavaScript and Python. Collaborated with UX designers to implement responsive designs.",
      achievements: [
        "Developed 3 major features that increased user engagement by 30%",
        "Reduced bug reports by 25% through improved testing",
        "Participated in agile development processes"
      ]
    }
  ],
  education: [
    {
      degree: "Master of Computer Science",
      school: "Stanford University",
      period: "2018 - 2020",
      location: "Stanford, CA",
      description: "Specialized in Artificial Intelligence and Machine Learning",
      courses: [
        "Advanced Machine Learning",
        "Deep Learning Systems",
        "Natural Language Processing"
      ]
    },
    {
      degree: "Bachelor of Computer Science",
      school: "MIT",
      period: "2014 - 2018",
      location: "Cambridge, MA",
      description: "Graduated with honors. Focus on Software Engineering and Data Structures.",
      courses: [
        "Data Structures and Algorithms",
        "Software Engineering",
        "Database Systems"
      ]
    }
  ]
};

const Profile = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector(selectProfile);

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  const getProficiencyColor = (level: number) => {
    const colors = {
      1: '#FFB74D', // Orange
      2: '#4CAF50', // Green
      3: '#2196F3', // Blue
      4: '#9C27B0', // Purple
      5: '#F44336', // Red
    };
    return colors[level as keyof typeof colors] || '#757575';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6" color="error">Error loading profile</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6">Profile not found</Typography>
      </Box>
    );
  }

  return (
    <ProfileContainer maxWidth="lg">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Profile Header */}
        <ProfilePaper>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              src="https://i.pravatar.cc/300"
              alt={profile.userId.username}
              sx={{ width: 100, height: 100, mr: 3 }}
            />
            <Box>
              <Typography variant="h4" gutterBottom sx={{ color: '#000000' }}>
                {profile.userId.username}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#666666' }}>
                {profile.userId.email}
              </Typography>
              <Typography variant="body1" sx={{ color: '#666666' }}>
                Overall Score: {profile.overallScore}%
              </Typography>
            </Box>
          </Box>
        </ProfilePaper>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Left Column */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Experience Section */}
            <ProfilePaper>
              <SectionTitle variant="h5">Experience</SectionTitle>
              <Divider sx={{ mb: 2 }} />
              {staticData.experience.map((exp, index) => (
                <Box key={index} mb={3}>
                  <Typography variant="h6" sx={{ color: '#000000', fontWeight: 600 }}>
                    {exp.title}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#666666' }}>
                    {exp.company} | {exp.period}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', mb: 1 }}>
                    {exp.location}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#000000', mb: 1 }}>
                    {exp.description}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    {exp.achievements.map((achievement, idx) => (
                      <Typography
                        key={idx}
                        component="li"
                        variant="body2"
                        sx={{ color: '#000000', mb: 0.5 }}
                      >
                        {achievement}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ))}
            </ProfilePaper>

            {/* Education Section */}
            <ProfilePaper>
              <SectionTitle variant="h5">Education</SectionTitle>
              <Divider sx={{ mb: 2 }} />
              {staticData.education.map((edu, index) => (
                <Box key={index} mb={3}>
                  <Typography variant="h6" sx={{ color: '#000000', fontWeight: 600 }}>
                    {edu.degree}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#666666' }}>
                    {edu.school} | {edu.period}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', mb: 1 }}>
                    {edu.location}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#000000', mb: 1 }}>
                    {edu.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: '#000000', mb: 0.5 }}>
                      Key Courses:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {edu.courses.map((course, idx) => (
                        <Chip
                          key={idx}
                          label={course}
                          size="small"
                          sx={{ backgroundColor: '#f5f5f5' }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              ))}
            </ProfilePaper>
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Skills Section */}
            <ProfilePaper>
              <SectionTitle variant="h5">Technical Skills</SectionTitle>
              <Divider sx={{ mb: 2 }} />
              {profile.skills.map((skill) => (
                <Box key={skill._id} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" sx={{ color: '#000000' }}>
                      {skill.name}
                    </Typography>
                    <Chip
                      label={`Level ${skill.proficiencyLevel}`}
                      sx={{
                        backgroundColor: getProficiencyColor(skill.proficiencyLevel),
                        color: 'white',
                      }}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <InfoLabel variant="body2">Experience:</InfoLabel>
                    <InfoText variant="body2">{skill.experienceLevel}</InfoText>
                  </Box>
                </Box>
              ))}
            </ProfilePaper>

            {/* Soft Skills Section */}
            <ProfilePaper>
              <SectionTitle variant="h5">Soft Skills</SectionTitle>
              <Divider sx={{ mb: 2 }} />
              {profile.softSkills.map((skill) => (
                <Box key={skill._id} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" sx={{ color: '#000000' }}>
                      {skill.name}
                    </Typography>
                    <Chip
                      label={skill.category}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <InfoLabel variant="body2">Experience:</InfoLabel>
                    <InfoText variant="body2">{skill.experienceLevel}</InfoText>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <InfoLabel variant="body2">Tests Passed:</InfoLabel>
                    <InfoText variant="body2">{skill.NumberTestPassed}</InfoText>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <InfoLabel variant="body2">Score:</InfoLabel>
                    <InfoText variant="body2">{skill.ScoreTest}%</InfoText>
                  </Box>
                </Box>
              ))}
            </ProfilePaper>

            {/* Company Details Section (if available) */}
            {profile.companyDetails && (
              <ProfilePaper>
                <SectionTitle variant="h5">Company Details</SectionTitle>
                <Divider sx={{ mb: 2 }} />
                <Box mb={2}>
                  <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 500 }}>
                    {profile.companyDetails.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Industry: {profile.companyDetails.industry}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Size: {profile.companyDetails.size}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Location: {profile.companyDetails.location}
                  </Typography>
                </Box>
              </ProfilePaper>
            )}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/test')}
          >
            Take Assessment
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => router.push('/resume-builder')}
          >
            Update Resume
          </Button>
        </Box>
      </Box>
    </ProfileContainer>
  );
};

export default Profile; 