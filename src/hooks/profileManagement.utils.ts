import { UserProfile } from '@/types/profile';
import { ConnectedUserEntity, ConnectedUserProfile } from '@/store/slices/userSlice';
import { contactInformationSchema } from '@/validations/profileSchemas';

export const VALID_TABS = ['personal', 'contact', 'preferences', 'language', 'notifications', 'visibility'];

export const initialProfile: UserProfile = {
  username: '',
  email: '',
  requiredExperienceLevel: 'Mid Level',
  targetRole: '',
  firstName: '',
  lastName: '',
  gender: 'Male',
  country: 'Tunisia',
  language: 'English',
  timezone: 'UTC+01:00',
  phone: '',
  address: '',
  linkedinUrl: '',
  githubUrl: '',
  personalWebsite: '',
  location: '',
  avatar: '',
  profileType: 'Candidate',
  companyName: '',
  name: '',
  industry: '',
  companySize: '',
  size: '',
  employmentType: 'Remote',
  requiredSkills: [],
};

const CANDIDATE_CONTACT_FIELDS: Array<keyof UserProfile> = [
  'phone',
  'location',
  'address',
  'linkedinUrl',
  'githubUrl',
  'personalWebsite',
];

export const trimValue = (value?: string) => value?.trim() || '';

export const areStringValuesEqual = (a?: string, b?: string) => trimValue(a) === trimValue(b);

export const areStringArraysEqual = (a: string[] = [], b: string[] = []) => (
  a.length === b.length && a.every((value, index) => value === b[index])
);

const mapZodIssuesToErrors = (issues: Array<{ path: (string | number)[]; message: string }>) => {
  const nextErrors: Record<string, string> = {};
  issues.forEach((issue) => {
    const key = issue.path[0];
    if (typeof key === 'string' && !nextErrors[key]) {
      nextErrors[key] = issue.message;
    }
  });
  return nextErrors;
};

const getContactValidationInput = (source: UserProfile) => ({
  phone: source.phone || '',
  location: source.location || '',
  address: source.address || '',
  linkedinUrl: source.linkedinUrl || '',
  githubUrl: source.githubUrl || '',
  personalWebsite: source.personalWebsite || '',
});

export const validateContactInformation = (source: UserProfile) => {
  const validation = contactInformationSchema.safeParse(getContactValidationInput(source));
  if (!validation.success) {
    return { errors: mapZodIssuesToErrors(validation.error.issues), isValid: false };
  }
  return { errors: null, isValid: true };
};

export const buildContactInformation = (source: UserProfile, options?: { includeEmail?: boolean }) => {
  const contactInformation: Record<string, string> = {};
  if (options?.includeEmail && trimValue(source.email)) contactInformation.email = trimValue(source.email);
  if (trimValue(source.phone)) contactInformation.phone = trimValue(source.phone);
  if (trimValue(source.location)) contactInformation.location = trimValue(source.location);
  if (trimValue(source.address)) contactInformation.address = trimValue(source.address);
  if (trimValue(source.linkedinUrl)) contactInformation.linkedinUrl = trimValue(source.linkedinUrl);
  if (trimValue(source.githubUrl)) contactInformation.githubUrl = trimValue(source.githubUrl);
  if (trimValue(source.personalWebsite)) contactInformation.personalWebsite = trimValue(source.personalWebsite);
  return contactInformation;
};

export const hasCandidateContactChanges = (current: UserProfile, saved: UserProfile) =>
  CANDIDATE_CONTACT_FIELDS.some((field) => !areStringValuesEqual(current[field] as string, saved[field] as string));

const getAvatarUrl = (reduxProfile?: ConnectedUserProfile, userData?: ConnectedUserEntity) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (reduxProfile?.user_image) {
    return `${base}images/Users/${reduxProfile.user_image}`;
  }
  if (userData?.user_image) {
    return `${base}images/Users/${userData.user_image}`;
  }
  return '';
};

export const buildSyncedProfile = (reduxProfile?: ConnectedUserProfile, user?: ConnectedUserEntity): UserProfile => {
  const userData = reduxProfile?.userId;
  const isCompany = reduxProfile?.type === 'Company';

  return {
    username: userData?.username || user?.username || '',
    email: userData?.email || user?.email || '',
    requiredExperienceLevel: reduxProfile?.requiredExperienceLevel || 'Mid Level',
    targetRole: reduxProfile?.targetRole ?? '',
    firstName: reduxProfile?.firstName ?? '',
    lastName: reduxProfile?.lastName ?? '',
    gender: reduxProfile?.gender || 'Male',
    country: reduxProfile?.country || 'Tunisia',
    language: reduxProfile?.language || 'English',
    timezone: reduxProfile?.timeZone || reduxProfile?.timezone || 'UTC+01:00',
    phone: reduxProfile?.phone || reduxProfile?.contactInformation?.phone || '',
    address: reduxProfile?.address || reduxProfile?.contactInformation?.address || '',
    linkedinUrl: reduxProfile?.linkedinUrl || reduxProfile?.contactInformation?.linkedinUrl || '',
    githubUrl: reduxProfile?.githubUrl || reduxProfile?.contactInformation?.githubUrl || '',
    personalWebsite: reduxProfile?.personalWebsite || reduxProfile?.contactInformation?.personalWebsite || '',
    location: reduxProfile?.location || reduxProfile?.contactInformation?.location || '',
    avatar: getAvatarUrl(reduxProfile, userData),
    profileType: (isCompany ? 'Company' : 'Candidate') as 'Candidate' | 'Company',
    companyName: reduxProfile?.companyDetails?.name || '',
    name: reduxProfile?.companyDetails?.name || '',
    industry: reduxProfile?.companyDetails?.industry || '',
    companySize: reduxProfile?.companyDetails?.size || '',
    size: reduxProfile?.companyDetails?.size || '',
    employmentType: reduxProfile?.companyDetails?.employmentType || 'Remote',
    requiredSkills: reduxProfile?.requiredSkills || [],
  };
};
