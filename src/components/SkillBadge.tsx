// components/SkillBadge.tsx
import { Box } from '@mui/material';

type SkillBadgeProps = {
  /** The text label on the badge (e.g. "React") */
  label: string;
  /** Background color hex without “#” (e.g. "61DAFB") */
  color: string;
  /** Simple‑Icons slug for the logo (e.g. "react") */
  logo: string;
};

/**
 * Renders a flat‑square Shields.io badge for a given skill.
 * URL pattern: https://img.shields.io/badge/{label}-{color}?style=flat-square&logo={logo}&logoColor=white
 */
export default function SkillBadge({ label, color, logo }: SkillBadgeProps) {
  const src = `https://img.shields.io/badge/${encodeURIComponent(
    label
  )}-${color}?style=flat-square&logo=${logo}&logoColor=white`;

  return (
    <Box
      component="img"
      src={src}
      alt={label}
      sx={{
        height: 24,
        mr: 1,
        mb: 1,
      }}
    />
  );
}
