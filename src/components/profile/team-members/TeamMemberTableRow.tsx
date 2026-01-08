import React, { memo } from 'react';
import {
  TableRow,
  TableCell,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Box,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { Member } from '@/store/slices/memberSlice';

interface TeamMemberTableRowProps {
  member: Member;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, member: Member) => void;
  getRoleLabel: (role: string) => string;
  getRoleColor: (role: string) => 'primary' | 'success' | 'info' | 'default';
  getStatusColor: (status: string) => 'success' | 'warning' | 'error';
  getRoleIcon: (role: string) => React.ReactElement;
}

const ROLE_ICONS: Record<string, React.ReactElement> = {
  RH: <PersonIcon sx={{ fontSize: 18 }} />,
  TechLead: <BarChartIcon sx={{ fontSize: 18 }} />,
  Supervisor: <BarChartIcon sx={{ fontSize: 18 }} />,
  Manager: <BarChartIcon sx={{ fontSize: 18 }} />,
  Owner: <PersonAddIcon sx={{ fontSize: 18 }} />,
  hr: <PersonIcon sx={{ fontSize: 18 }} />,
  technical_leader: <BarChartIcon sx={{ fontSize: 18 }} />,
};

const TeamMemberTableRow: React.FC<TeamMemberTableRowProps> = ({
  member,
  onMenuOpen,
  getRoleLabel,
  getRoleColor,
  getStatusColor,
  getRoleIcon,
}) => {
  const avatarLetter = member.user?.username?.[0]?.toUpperCase() ||
                       member.user?.email?.[0]?.toUpperCase() ||
                       'U';

  return (
    <TableRow
      sx={{
        '&:hover': {
          backgroundColor: '#f8fafc',
        },
        borderBottom: '1px solid #f1f5f9'
      }}
    >
      {/* Member Info */}
      <TableCell sx={{ py: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#8310FF',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(131, 16, 255, 0.2)'
            }}
          >
            {avatarLetter}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>
              {member.user?.username || 'Pending'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              {member.user?.email || 'No email'}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Role */}
      <TableCell sx={{ py: 2.5 }}>
        <Chip
          icon={getRoleIcon(member.role)}
          label={getRoleLabel(member.role)}
          color={getRoleColor(member.role)}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.8rem',
            height: 28
          }}
        />
      </TableCell>

      {/* Status */}
      <TableCell sx={{ py: 2.5 }}>
        <Chip
          label={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
          color={getStatusColor(member.status)}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 28
          }}
        />
      </TableCell>

      {/* Actions */}
      <TableCell align="right" sx={{ py: 2.5 }}>
        <IconButton
          size="small"
          onClick={(e) => onMenuOpen(e, member)}
          sx={{
            color: '#64748b',
            '&:hover': {
              backgroundColor: 'rgba(131, 16, 255, 0.08)',
              color: '#8310FF',
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default memo(TeamMemberTableRow);
