import React from 'react';
import { Stack, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface StatusPieData {
  name: string;
  value: number;
  color: string;
}

interface ChartsSectionProps {
  projectsPerTrack: any[];
  statusPieData: StatusPieData[];
  isPieDataEmpty: boolean;
  lineChartData: any[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
  projectsPerTrack,
  statusPieData,
  isPieDataEmpty,
  lineChartData,
}) => (
  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={5}>
    {/* Bar Chart: Projects per Track */}
    <Paper sx={{ flex: 2, p: 3, borderRadius: 4, minWidth: 320, mb: { xs: 3, md: 0 } }}>
      <Typography variant="h6" fontWeight={700} mb={2}>Projects per Track</Typography>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={projectsPerTrack} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="track" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Bar dataKey="count" fill="#7C4DFF" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
    {/* Pie Chart: Evaluation Status */}
    <Paper sx={{ flex: 1, p: 3, borderRadius: 4, minWidth: 240 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>Evaluation Status</Typography>
      <ResponsiveContainer width="100%" height={260}>
        {isPieDataEmpty ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body1" color="text.secondary">No data available</Typography>
          </Box>
        ) : (
          <PieChart>
            <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {statusPieData.map((entry, idx) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        )}
      </ResponsiveContainer>
    </Paper>
    {/* Line Chart: Submissions Over Time */}
    <Paper sx={{ flex: 2, p: 3, borderRadius: 4, minWidth: 320 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>Project Submissions Over Time</Typography>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Line type="monotone" dataKey="count" stroke="#00B8D4" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  </Stack>
);

export default ChartsSection; 