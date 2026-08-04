export interface Step {
  target: string;
  titleKey: string;
  descKey: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

export const STEPS: Step[] = [
  { target: "center",                          position: "center", titleKey: "tour.steps.welcome.title",        descKey: "tour.steps.welcome.description" },
  { target: "center",                          position: "center", titleKey: "tour.steps.dashboard.title",      descKey: "tour.steps.dashboard.description" },
  { target: "[data-tour='nav-posts']",         position: "right",  titleKey: "tour.steps.posts.title",          descKey: "tour.steps.posts.description" },
  { target: "[data-tour='nav-applications']",  position: "right",  titleKey: "tour.steps.applications.title",   descKey: "tour.steps.applications.description" },
  { target: "[data-tour='nav-employees']",     position: "right",  titleKey: "tour.steps.employees.title",      descKey: "tour.steps.employees.description" },
  { target: "[data-tour='nav-campaigns']",     position: "right",  titleKey: "tour.steps.campaigns.title",      descKey: "tour.steps.campaigns.description" },
  { target: "[data-tour='nav-departments']",   position: "right",  titleKey: "tour.steps.departments.title",    descKey: "tour.steps.departments.description" },
  { target: "[data-tour='nav-settings']",      position: "right",  titleKey: "tour.steps.settings_info.title",  descKey: "tour.steps.settings_info.description" },
  { target: "[data-tour='settings-tab-contact']",  position: "bottom", titleKey: "tour.steps.settings_contact.title", descKey: "tour.steps.settings_contact.description" },
  { target: "[data-tour='settings-tab-apikeys']",  position: "bottom", titleKey: "tour.steps.settings_api.title",    descKey: "tour.steps.settings_api.description" },
  { target: "[data-tour='header-chat']",       position: "bottom", titleKey: "tour.steps.chat.title",           descKey: "tour.steps.chat.description" },
  { target: "[data-tour='header-notif']",      position: "bottom", titleKey: "tour.steps.notifications.title",  descKey: "tour.steps.notifications.description" },
  { target: "center",                          position: "center", titleKey: "tour.steps.finish.title",         descKey: "tour.steps.finish.description" },
];

export const TOTAL = STEPS.length;
