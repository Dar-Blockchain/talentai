import React, { useMemo, useState } from 'react';
import {
  Box,
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
  const onStartTest = () => setTestModalOpen(true);

  const tasks: Task[] = useMemo(() => [
    {
      id: 'complete_profile',
      title: 'Complete Your Profile',
      description: 'Add your target role and experience',
      completed: !!(profile?.firstName && profile?.targetRole),
      action: () => router.push('/profile/candidate/settings'),
      icon: PersonIcon,
      reward: 'Increase match accuracy',
    },
    {
      id: 'first_skill_test',
      title: 'Take First Skill Test',
      description: 'Get verified & earn TAI',
      completed: (profile?.skills?.length || 0) > 0 || (profile?.softSkills?.length || 0) > 0,
      action: onStartTest,
      icon: PlayArrowIcon,
      reward: 'Earn up to 33.33 TAI',
    },
    {
      id: 'earn_tokens',
      title: 'Earn TAI Tokens',
      description: 'Complete an interview to start earning',
      completed: (profile?.interviewDetails?.length || 0) > 0,
      action: onStartTest,
      icon: AccountBalanceWalletIcon,
      reward: 'Start building wealth',
    },
    // {
    //   id: 'share_profile',
    //   title: 'Share Profile on LinkedIn',
    //   description: 'Show employers your skills',
    //   completed: profile?.linkedInShared || false,
    //   action: () => router.push(`/profile/candidate/${user?._id}`),
    //   icon: LinkedInIcon,
    //   reward: 'Get discovered',
    // },
    {
      id: 'milestone_100_tai',
      title: 'Reach 100 TAI',
      description: 'Complete 3 interviews',
      completed: tokenBalance >= 100,
      action: onStartTest,
      icon: EmojiEventsIcon,
      reward: 'Unlock premium features',
    },
    {
      id: 'get_3_verified',
      title: 'Get Verified in 3 Skills',
      description: 'Build credibility',
      completed: (profile?.skills?.filter((s: any) => s.ScoreTest > 0)?.length || 0) >= 3,
      action: onStartTest,
      icon: VerifiedIcon,
      reward: 'Boost visibility',
    },
  ], [profile, tokenBalance, onStartTest, router]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  return (
    <Box
      sx={{
        px: 5,
        py: 3,
        mb: 2,
        color: "#000",
        borderRadius: "12px",
        border: "1px solid rgba(84,98,116,0.1)",
        backgroundColor: 'white',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
                    <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "#000000",
              fontSize: "20px",
              mb: 3,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-4px",
                left: 0,
                width: "38px",
                height: "5px",
                background: "#8310FF",
                borderRadius: "2px",
              },
            }}
          >
            Your Progress Checklist
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {completedTasks}/{totalTasks} tasks completed
          </Typography>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8310FF 0%, #00B8D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
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
          height: 6,
          borderRadius: 3,
          mb: 2,
          bgcolor: 'rgba(131,16,255,0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #8310FF 0%, #00B8D4 100%)',
          },
        }}
      />

      {/* Task List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {tasks.map((task) => {
          const IconComponent = task.icon;
          return (
            <Box
              key={task.id}
              onClick={!task.completed ? task.action : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: task.completed ? 'rgba(76, 175, 80, 0.3)' : 'rgba(0,0,0,0.1)',
                bgcolor: task.completed ? 'rgba(76,175,80,0.05)' : '#fff',
                cursor: task.completed ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  ...(task.completed
                    ? {}
                    : {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(131,16,255,0.1)',
                        borderColor: '#8310FF',
                      }),
                },
              }}
            >
              {/* Icon/Checkbox */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: task.completed ? 'rgba(76,175,80,0.1)' : 'rgba(131,16,255,0.1)',
                  color: task.completed ? '#4CAF50' : '#8310FF',
                  flexShrink: 0,
                }}
              >
                {task.completed ? (
                  <CheckCircleIcon sx={{ fontSize: 20 }} />
                ) : (
                  <IconComponent sx={{ fontSize: 20 }} />
                )}
              </Box>

              {/* Task Info */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
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
                  bgcolor: task.completed ? 'rgba(76,175,80,0.1)' : 'rgba(131,16,255,0.1)',
                  color: task.completed ? '#4CAF50' : '#8310FF',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />

              {/* Arrow for incomplete tasks */}
              {!task.completed && <ArrowForwardIcon sx={{ color: '#8310FF', fontSize: 18 }} />}
            </Box>
          );
        })}
      </Box>

      {/* Completion Celebration */}
      {completedTasks === totalTasks && (
        <Alert severity="success" sx={{ mt: 2 }} icon={<EmojiEventsIcon fontSize="small" />}>
          <Typography variant="body2" fontWeight={700}>
            🎉 All tasks completed!
          </Typography>
          <Typography variant="caption">
            Keep taking tests to earn more TAI tokens and increase your ranking.
          </Typography>
        </Alert>
      )}

      <AssessmentModal open={testModalOpen} onClose={() => setTestModalOpen(false)} />
    </Box>
  );
}
