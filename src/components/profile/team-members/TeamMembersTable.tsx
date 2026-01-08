import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from '@mui/material';
import TeamMemberTableRow from './TeamMemberTableRow';
import { Member } from '@/store/slices/memberSlice';

interface TeamMembersTableProps {
  members: Member[];
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, member: Member) => void;
  getRoleLabel: (role: string) => string;
  getRoleColor: (role: string) => 'primary' | 'success' | 'info' | 'default';
  getStatusColor: (status: string) => 'success' | 'warning' | 'error';
  getRoleIcon: (role: string) => React.ReactElement;
}

const TeamMembersTable: React.FC<TeamMembersTableProps> = ({
  members,
  onMenuOpen,
  getRoleLabel,
  getRoleColor,
  getStatusColor,
  getRoleIcon,
}) => {
  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
          Active Members
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          {members.length} team {members.length === 1 ? 'member' : 'members'}
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 'none',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{
              backgroundColor: '#f8fafc',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                py: 2
              }}>
                Member
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                py: 2
              }}>
                Role
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                py: 2
              }}>
                Status
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 600,
                  color: '#475569',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  py: 2
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TeamMemberTableRow
                key={member._id}
                member={member}
                onMenuOpen={onMenuOpen}
                getRoleLabel={getRoleLabel}
                getRoleColor={getRoleColor}
                getStatusColor={getStatusColor}
                getRoleIcon={getRoleIcon}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default memo(TeamMembersTable);
