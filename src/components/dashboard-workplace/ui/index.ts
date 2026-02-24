/**
 * Workplace Dashboard — Reusable UI Primitives
 * ─────────────────────────────────────────────
 * Import any component from this barrel:
 *
 *   import { StatCard, TabBar, StatusBadge } from "@/components/dashboard-workplace/ui";
 */

// Layout & structure
export { default as SectionCard } from "./SectionCard";
export type { SectionCardProps } from "./SectionCard";

export { default as SectionHeader } from "./SectionHeader";
export type { SectionHeaderProps } from "./SectionHeader";

export { default as PageBanner } from "./PageBanner";
export type { PageBannerProps, BannerStat } from "./PageBanner";

// Navigation
export { default as TabBar } from "./TabBar";
export type { TabBarProps, TabItem } from "./TabBar";

// Metric & progress
export { default as StatCard } from "./StatCard";
export type { StatCardProps } from "./StatCard";

export { default as ProgressRing } from "./ProgressRing";
export type { ProgressRingProps } from "./ProgressRing";

// Data display
export { default as DataRow } from "./DataRow";
export type { DataRowProps } from "./DataRow";

export { default as StatusBadge } from "./StatusBadge";
export type { StatusBadgeProps } from "./StatusBadge";

// Feedback & alerts
export { default as InfoBanner } from "./InfoBanner";
export type { InfoBannerProps } from "./InfoBanner";

export { default as EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

export { default as LoadingOverlay } from "./LoadingOverlay";
export type { LoadingOverlayProps } from "./LoadingOverlay";

// Interactions
export { default as ActionMenu } from "./ActionMenu";
export type { ActionMenuProps, ActionMenuItem } from "./ActionMenu";

export { default as FilterBar } from "./FilterBar";
export type { FilterBarProps, FilterSelect, FilterOption } from "./FilterBar";
