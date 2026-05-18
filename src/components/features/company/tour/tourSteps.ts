import type { TFunction } from "i18next";

export interface Step {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

export const getSteps = (t: TFunction): Step[] => [
  { target: "center", position: "center", title: t("tour.steps.welcome.title"), description: t("tour.steps.welcome.description") },
  { target: "center", position: "center", title: t("tour.steps.dashboard.title"), description: t("tour.steps.dashboard.description") },
  { target: "[data-tour='nav-posts']", position: "right", title: t("tour.steps.posts.title"), description: t("tour.steps.posts.description") },
  { target: "[data-tour='nav-applications']", position: "right", title: t("tour.steps.applications.title"), description: t("tour.steps.applications.description") },
  { target: "[data-tour='nav-employees']", position: "right", title: t("tour.steps.employees.title"), description: t("tour.steps.employees.description") },
  { target: "[data-tour='nav-campaigns']", position: "right", title: t("tour.steps.campaigns.title"), description: t("tour.steps.campaigns.description") },
  { target: "[data-tour='nav-departments']", position: "right", title: t("tour.steps.departments.title"), description: t("tour.steps.departments.description") },
  { target: "[data-tour='nav-settings']", position: "right", title: t("tour.steps.settings_info.title"), description: t("tour.steps.settings_info.description") },
  { target: "[data-tour='settings-tab-contact']", position: "bottom", title: t("tour.steps.settings_contact.title"), description: t("tour.steps.settings_contact.description") },
  { target: "[data-tour='settings-tab-apikeys']", position: "bottom", title: t("tour.steps.settings_api.title"), description: t("tour.steps.settings_api.description") },
  { target: "[data-tour='header-chat']", position: "bottom", title: t("tour.steps.chat.title"), description: t("tour.steps.chat.description") },
  { target: "[data-tour='header-notif']", position: "bottom", title: t("tour.steps.notifications.title"), description: t("tour.steps.notifications.description") },
  { target: "center", position: "center", title: t("tour.steps.finish.title"), description: t("tour.steps.finish.description") },
];

export const TOTAL = 13;
