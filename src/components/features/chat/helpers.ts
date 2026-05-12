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

  if (participant.profile?.type === 'Company' && participant.profile?.companyDetails?.name) {
    return participant.profile.companyDetails.name;
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
