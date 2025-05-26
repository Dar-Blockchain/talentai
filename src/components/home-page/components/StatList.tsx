import StatCard from "@/components/home-page/components/StatCard";
import { Box, Stack } from "@mui/material";

const stats = [
  {
    value: "3x",
    label: "Time to Hire",
    description: "Faster than traditional methods",
  },
  {
    value: "90%",
    label: "Candidate Quality",
    description: "Faster than traditional methods",
  },
  { value: "50%", label: "Cost Savings", description: "Reduced hiring costs" },
  {
    value: "75%",
    label: "Team Productivity",
    description: "More efficient process",
  },
];

const StatList = () => {
  return (
    <Stack spacing={3}>
      {Array.from({ length: stats.length / 2 }).map((_, rowIndex) => (
        <Box
          key={rowIndex}
          display="flex"
          gap={4}
          sx={{
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {stats.slice(rowIndex * 2, rowIndex * 2 + 2).map((stat, index) => (
            <Box key={index} flex={1}>
              <StatCard {...stat} />
            </Box>
          ))}
        </Box>
      ))}
    </Stack>
  );
};

export default StatList;
