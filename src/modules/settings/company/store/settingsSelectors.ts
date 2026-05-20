import type { SettingsState } from '../types';

type WithSettings = { settings: SettingsState };

export const selectSettingsUser              = (s: WithSettings) => s.settings.user;
export const selectSettingsProfile           = (s: WithSettings) => s.settings.profile;
export const selectSettingsCompanyMembership = (s: WithSettings) => s.settings.companyMembership;
export const selectSettingsPlanLimits        = (s: WithSettings) => s.settings.planLimits;
export const selectSettingsLoading           = (s: WithSettings) => s.settings.loading;
export const selectSettingsError             = (s: WithSettings) => s.settings.error;
export const selectSettings                  = (s: WithSettings) => s.settings;
