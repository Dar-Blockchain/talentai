// Re-exports for backward compatibility — source of truth is settings/company/
export { settingsReducer, clearSettingsError, setSettingsLoading } from '../company/store';
export * from '../company/store/settingsSelectors';
export type { SettingsState, SettingsProfile, SettingsUserEntity, UpdateProfilePayload, ProfileApiResponse } from '../company/types';
export { settingsApi } from '../company/api';
export { useSettingsProfile, useUpdateSettingsProfile, useUploadSettingsAvatar } from '../company/queries';
export { settingsKeys } from '../company/queries/keys';
