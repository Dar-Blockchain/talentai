/**
 * Profile Settings Constants
 * Centralized constants for profile settings functionality
 */

export const experienceLevels = [
  'Entry Level',
  'Junior',
  'Mid Level',
  'Senior',
  'Expert'
];

export const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Tunisia', 'Morocco', 'Egypt', 'Algeria', 'Libya', 'Saudi Arabia', 'UAE',
  'Other'
];

export const languages = [
  'English', 'French', 'Spanish', 'German', 'Arabic', 'Chinese', 'Japanese',
  'Portuguese', 'Russian', 'Italian', 'Dutch', 'Korean', 'Other'
];

export const timezones = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00',
  'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00',
  'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+04:00', 'UTC+05:00',
  'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00'
];

export const employmentTypes = [
  'Remote',
  'Hybrid',
  'On-site'
];

export const companySizes = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500-1000',
  '1000+'
];

export const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Media & Entertainment',
  'Real Estate',
  'Transportation',
  'Energy',
  'Telecommunications',
  'Other'
];

// Static notification data
export const staticNotifications = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Interview Completed',
    message: 'Your React Developer technical interview has been completed successfully. Results are now available.',
    timestamp: '2 hours ago',
    isRead: false,
    icon: 'success'
  },
  {
    id: '2',
    type: 'info' as const,
    title: 'New Match Found',
    message: 'A new candidate matches your JavaScript Developer position with 85% compatibility.',
    timestamp: '5 hours ago',
    isRead: false,
    icon: 'info'
  },
  {
    id: '3',
    type: 'success' as const,
    title: 'Purchase Successful',
    message: 'You successfully purchased candidate profile for 150 TAI. Contact information has been revealed.',
    timestamp: '1 day ago',
    isRead: true,
    icon: 'success'
  },
  {
    id: '4',
    type: 'warning' as const,
    title: 'Interview Reminder',
    message: 'You have a scheduled HR interview starting in 30 minutes. Please be prepared.',
    timestamp: '2 days ago',
    isRead: true,
    icon: 'warning'
  },
  {
    id: '5',
    type: 'info' as const,
    title: 'Profile Updated',
    message: 'Your profile information has been successfully updated and saved.',
    timestamp: '3 days ago',
    isRead: true,
    icon: 'info'
  },
  {
    id: '6',
    type: 'success' as const,
    title: 'Skill Assessment Passed',
    message: 'Congratulations! You passed the TypeScript skill assessment with a score of 92%.',
    timestamp: '5 days ago',
    isRead: true,
    icon: 'success'
  },
  {
    id: '7',
    type: 'info' as const,
    title: 'New Job Posted',
    message: 'Your Senior Frontend Developer position has been posted successfully and is now live.',
    timestamp: '1 week ago',
    isRead: true,
    icon: 'info'
  }
];
