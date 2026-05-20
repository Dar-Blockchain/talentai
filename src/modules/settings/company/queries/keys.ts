export const settingsKeys = {
  all:     ['settings']            as const,
  profile: ['settings', 'profile'] as const,
} as const;

export const apiKeysKeys = {
  all:  ['apiKeys']         as const,
  list: ['apiKeys', 'list'] as const,
} as const;
