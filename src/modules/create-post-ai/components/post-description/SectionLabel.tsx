import { Typography } from "@mui/material";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.25 }}>
    {children}
  </Typography>
);

export default SectionLabel;
