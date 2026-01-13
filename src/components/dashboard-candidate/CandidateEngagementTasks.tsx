import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Chip,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  PlayArrow as PlayArrowIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  LinkedIn as LinkedInIcon,
  EmojiEvents as EmojiEventsIcon,
  Verified as VerifiedIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import AssessmentModal from './AssessmentModal';
import { selectTokenBalance } from '@/store/slices/tokenSlice';
import { RootState } from '@/store/store';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: () => void;
  icon: React.ElementType;
  reward: string;
}

export default function CandidateEngagementTasks() {
  const router = useRouter();
  const { user, profile } = useSelector((state: RootState) => state.user.connectedUser);
  const tokenBalance = useSelector(selectTokenBalance) ?? 0;
  const [testModalOpen, setTestModalOpen] = useState(false);
  const onStartTest = () => {
    setTestModalOpen(true);
  };

  const tasks: Task[] = useMemo(
    () => [
      {
        id: 'complete_profile',
        title: 'Complete Your Profile',
        description: 'Add your target role and experience level',
        completed: !!(profile?.firstName && profile?.targetRole),
        action: () => router.push('/settings/profile'),
        icon: PersonIcon,
        reward: 'Increase match accuracy',
      },
      {
        id: 'first_skill_test',
        title: 'Take Your First Skill Test',
        description: 'Get verified and earn TAI tokens',
        completed: (profile?.skills?.length || 0) > 0 || (profile?.softSkills?.length || 0) > 0,
        action: onStartTest,
        icon: PlayArrowIcon,
        reward: 'Earn up to 33.33 TAI',
      },
      {
        id: 'earn_tokens',
        title: 'Earn Your First TAI Tokens',
        description: 'Complete an interview to start earning',
        completed: (profile?.interviewDetails?.length || 0) > 0,
        action: onStartTest,
        icon: AccountBalanceWalletIcon,
        reward: 'Start building wealth',
      },
      {
        id: 'share_profile',
        title: 'Share Your Profile on LinkedIn',
        description: 'Show employers your verified skills',
        completed: profile?.linkedInShared || false,
        action: () => router.push(`/profile/candidate/${user?._id}`),
        icon: LinkedInIcon,
        reward: 'Get discovered by recruiters',
      },
      {
        id: 'milestone_100_tai',
        title: 'Reach 100 TAI Tokens',
        description: 'Complete 3 interviews to hit this milestone',
        completed: tokenBalance >= 100,
        action: onStartTest,
        icon: EmojiEventsIcon,
        reward: 'Unlock premium features',
      },
      {
        id: 'get_3_verified',
        title: 'Get Verified in 3 Skills',
        description: 'Build your professional credibility',
        completed: (profile?.skills?.filter((s: any) => s.ScoreTest > 0)?.length || 0) >= 3,
        action: onStartTest,
        icon: VerifiedIcon,
        reward: 'Boost profile visibility',
      },
    ],
    [profile, tokenBalance, onStartTest, router]
  );

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  return (
    <Card
      sx={{
        p: 4,
        mb: 4,
        background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.05) 0%, rgba(0, 184, 212, 0.05) 100%)',
        borderRadius: 3,
        border: '2px solid rgba(131, 16, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(131, 16, 255, 0.1)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#000" mb={0.5}>
            Your Progress Checklist
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {completedTasks}/{totalTasks} tasks completed
          </Typography>
        </Box>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8310FF 0%, #00B8D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.25rem',
          }}
        >
          {progressPercentage}%
        </Box>
      </Box>

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progressPercentage}
        sx={{
          height: 8,
          borderRadius: 4,
          mb: 3,
          bgcolor: 'rgba(131, 16, 255, 0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #8310FF 0%, #00B8D4 100%)',
          },
        }}
      />

      {/* Task List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tasks.map((task) => {
          const IconComponent = task.icon;
          return (
            <Box
              key={task.id}
              onClick={!task.completed ? task.action : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: task.completed ? 'rgba(76, 175, 80, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                bgcolor: task.completed ? 'rgba(76, 175, 80, 0.05)' : '#fff',
                cursor: task.completed ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  ...(task.completed
                    ? {}
                    : {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(131, 16, 255, 0.15)',
                        borderColor: '#8310FF',
                      }),
                },
              }}
            >
              {/* Icon/Checkbox */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: task.completed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(131, 16, 255, 0.1)',
                  color: task.completed ? '#4CAF50' : '#8310FF',
                  flexShrink: 0,
                }}
              >
                {task.completed ? (
                  <CheckCircleIcon sx={{ fontSize: 24 }} />
                ) : (
                  <IconComponent sx={{ fontSize: 24 }} />
                )}
              </Box>

              {/* Task Info */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color={task.completed ? 'text.secondary' : '#000'}
                  sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                >
                  {task.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {task.description}
                </Typography>
              </Box>

              {/* Reward Badge */}
              <Chip
                label={task.reward}
                size="small"
                sx={{
                  bgcolor: task.completed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(131, 16, 255, 0.1)',
                  color: task.completed ? '#4CAF50' : '#8310FF',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />

              {/* Arrow for incomplete tasks */}
              {!task.completed && <ArrowForwardIcon sx={{ color: '#8310FF', fontSize: 20 }} />}
            </Box>
          );
        })}
      </Box>

      {/* Completion Celebration */}
      {completedTasks === totalTasks && (
        <Alert severity="success" sx={{ mt: 3 }} icon={<EmojiEventsIcon />}>
          <Typography variant="subtitle2" fontWeight={700}>
            🎉 All tasks completed! You're ready to get hired!
          </Typography>
          <Typography variant="caption">
            Keep taking tests to earn more TAI tokens and increase your ranking.
          </Typography>
        </Alert>
      )}
            <AssessmentModal
              open={testModalOpen}
              onClose={() => setTestModalOpen(false)}
            />
    </Card>
  );
}
