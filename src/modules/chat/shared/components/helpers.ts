export interface Participant {
  _id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email: string;
  profile?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    type?: 'Candidate' | 'Company';
    companyDetails?: {
      name?: string;
    };
  };
}

export const getParticipantDisplayName = (participant: Participant | undefined): string => {
  if (!participant) return 'Unknown';

  if (participant.displayName?.trim()) {
    return participant.displayName.trim();
  }

  const orgName = participant.profile?.companyDetails?.name?.trim();
  if (orgName) {
    return orgName;
  }

  if (participant.profile?.firstName || participant.profile?.lastName) {
    return `${participant.profile.firstName || ''} ${participant.profile.lastName || ''}`.trim();
  }

  if (participant.firstName || participant.lastName) {
    return `${participant.firstName || ''} ${participant.lastName || ''}`.trim();
  }

  return 'Unknown';
};

export const getParticipantInitial = (participant: Participant | undefined): string => {
  const name = getParticipantDisplayName(participant);
  return name.charAt(0).toUpperCase() || '?';
};

export const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatListTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export const isSameCalendarDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Stable key for grouping messages by calendar day (local). */
export const messageDayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Shared 3-dot context menus (message delete + sidebar conversation delete). */
export const CHAT_CONTEXT_MENU_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

export const chatContextMenuContentCn = "min-w-[200px] mt-1 overflow-hidden rounded-lg border border-[rgba(15,23,42,0.14)] shadow-[0_12px_36px_rgba(15,23,42,0.09)]";

export const chatContextMenuItemCn = "rounded-md mx-1 py-1.5 transition-[background-color,padding-left] duration-[180ms] hover:pl-2.5";
