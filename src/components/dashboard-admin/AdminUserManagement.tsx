import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Avatar, Typography, Stack } from '@mui/material';
import LocationIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const GREEN_MAIN = '#8310FF';

const AdminUserManagement = ({
  users,
  userUsernameFilter,
  setUserUsernameFilter,
  userEmailFilter,
  setUserEmailFilter,
  userRoleFilter,
  setUserRoleFilter,
  setUserStatusFilter,
  getRoleColor,
  handleDownloadExcel
}: any) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" fontWeight={900} color={GREEN_MAIN}>
        User Management
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => handleDownloadExcel('downloadUserExcel', 'users.xlsx')}
        >
          Download All Users Excel
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleDownloadExcel('download-users-with-assessment-zero', 'users_with_score_0.xlsx')}
        >
          Download Users with Assessment 0
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleDownloadExcel('download-users-with-assessment-Above50', 'users_with_score_above_50.xlsx')}
        >
          Download Users with Assessment ≥ 50
        </Button>
      </Box>
    </Box>
    <Paper sx={{ mb: 3, p: { xs: 2, md: 3 }, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
      <TextField
        label="Username"
        variant="outlined"
        size="small"
        value={userUsernameFilter}
        onChange={e => setUserUsernameFilter(e.target.value)}
        sx={{ minWidth: 160 }}
      />
      <TextField
        label="Email"
        variant="outlined"
        size="small"
        value={userEmailFilter}
        onChange={e => setUserEmailFilter(e.target.value)}
        sx={{ minWidth: 200 }}
      />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Role</InputLabel>
        <Select
          value={userRoleFilter}
          label="Role"
          onChange={e => setUserRoleFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Candidate">Candidate</MenuItem>
          <MenuItem value="Company">Company</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => { setUserUsernameFilter(''); setUserEmailFilter(''); setUserRoleFilter(''); setUserStatusFilter(''); }}
        sx={{ ml: 'auto' }}
      >
        Reset Filters
      </Button>
    </Paper>
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Last Login</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user: any) => (
            <TableRow key={user._id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: GREEN_MAIN }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    {user.profile && user.profile.firstName && user.profile.lastName ? (
                      <>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {user.profile.firstName} {user.profile.lastName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          @{user.username}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user.username}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={user.role}
                  color={getRoleColor(user.role) as any}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={user.isVerified ? 'Verified' : 'Pending'}
                  color={user.isVerified ? 'success' : 'warning'}
                  size="small"
                  icon={user.isVerified ? <CheckCircleIcon /> : <PendingIcon />}
                />
              </TableCell>
              <TableCell>
                <Box>
                  {user.Localisation ? (
                    <>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {user.Localisation}
                      </Typography>
                      {user.ip && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                          IP: {user.ip}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      No location data
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : 'Never'}
                </Typography>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  {/* Actions here */}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default AdminUserManagement; 