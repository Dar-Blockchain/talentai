/**
 * Color Mapping Utilities for Admin Dashboard
 * Extracted from admin.tsx to improve maintainability and reusability
 */

// Type definitions for MUI color variants
export type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

/**
 * Get color for user role badges
 * @param role - User role ('admin', 'company', 'candidate')
 * @returns MUI Chip color variant
 */
export const getRoleColor = (role: string): ChipColor => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'error';
    case 'company':
      return 'primary';
    case 'candidate':
      return 'success';
    default:
      return 'default';
  }
};

/**
 * Get color for status badges
 * @param status - Status string ('active', 'inactive', 'draft', etc.)
 * @returns MUI Chip color variant
 */
export const getStatusColor = (status: string): ChipColor => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'error';
    case 'draft':
      return 'warning';
    default:
      return 'default';
  }
};

/**
 * Get color for assessment type badges
 * @param type - Assessment type ('technical', 'soft', 'personality')
 * @returns MUI Chip color variant
 */
export const getTypeColor = (type: string): ChipColor => {
  switch (type?.toLowerCase()) {
    case 'technical':
      return 'primary';
    case 'soft':
      return 'secondary';
    case 'personality':
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Get color for score display
 * @param score - Numeric score value
 * @returns Hex color code
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4caf50'; // Green - Excellent
  if (score >= 70) return '#2196f3'; // Blue - Good
  if (score >= 60) return '#ff9800'; // Orange - Average
  return '#f44336'; // Red - Below Average
};

/**
 * Get gradient background for score cards
 * @param score - Numeric score value
 * @returns CSS gradient string
 */
export const getScoreGradient = (score: number): string => {
  if (score >= 80) return 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
  if (score >= 70) return 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)';
  if (score >= 60) return 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
  return 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
};

/**
 * Get verification status color
 * @param isVerified - Boolean verification status
 * @returns MUI Chip color variant
 */
export const getVerificationColor = (isVerified: boolean): ChipColor => {
  return isVerified ? 'success' : 'warning';
};

/**
 * Get priority level color
 * @param priority - Priority level ('high', 'medium', 'low')
 * @returns MUI Chip color variant
 */
export const getPriorityColor = (priority: string): ChipColor => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Get experience level color
 * @param level - Experience level ('entry', 'mid', 'senior')
 * @returns MUI Chip color variant
 */
export const getExperienceLevelColor = (level: string): ChipColor => {
  switch (level?.toLowerCase()) {
    case 'entry':
    case 'junior':
      return 'info';
    case 'mid':
    case 'intermediate':
      return 'primary';
    case 'senior':
    case 'expert':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Color mapping constants for reuse
 */
export const COLOR_MAP = {
  roles: {
    admin: 'error' as ChipColor,
    company: 'primary' as ChipColor,
    candidate: 'success' as ChipColor,
  },
  status: {
    active: 'success' as ChipColor,
    inactive: 'error' as ChipColor,
    draft: 'warning' as ChipColor,
  },
  types: {
    technical: 'primary' as ChipColor,
    soft: 'secondary' as ChipColor,
    personality: 'info' as ChipColor,
  },
  scores: {
    excellent: '#4caf50',
    good: '#2196f3',
    average: '#ff9800',
    poor: '#f44336',
  },
} as const;
