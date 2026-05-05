
export const REGISTER_DESKTOP_MIN_PX = 1021;
export const REGISTER_TABLET_MIN_PX = 600;
export const REGISTER_TABLET_MAX_PX = 1020;

export const registerMq = {
  desktopUp: `@media (min-width: ${REGISTER_DESKTOP_MIN_PX}px)`,
  tabletOnly: `@media (min-width: ${REGISTER_TABLET_MIN_PX}px) and (max-width: ${REGISTER_TABLET_MAX_PX}px)`,
  lgUp: "@media (min-width: 1200px)",
} as const;
