import { useMemo } from 'react';

interface Profile {
  _id?: string;
  firstName?: string;
  lastName?: string;
  skills?: Array<{ ScoreTest?: number; name: string }>;
  softSkills?: Array<{ ScoreTest?: number; name: string }>;
  interviewDetails?: any[];
  overallScore?: number | string;
  companyDetails?: {
    name?: string;
  };
}

interface ShareData {
  profileUrl: string;
  profileName: string;
  shareMessage: string;
}

export const useProfileShareData = (profile: Profile | null): ShareData | null => {
  return useMemo(() => {
    if (!profile || typeof window === 'undefined') {
      return null;
    }

    const profileUrl = window.location.href;
    const profileName = profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.companyDetails?.name || 'TalentAI User';

    // Calculate statistics
    const totalSkills = (profile?.skills?.length || 0) + (profile?.softSkills?.length || 0);
    const verifiedSkills = [
      ...(profile?.skills?.filter((s) => s.ScoreTest && s.ScoreTest > 0) || []),
      ...(profile?.softSkills?.filter((s) => s.ScoreTest && s.ScoreTest > 0) || []),
    ];
    const verifiedCount = verifiedSkills.length;
    const totalInterviews = profile?.interviewDetails?.length || 0;
    const overallScore = Number(profile?.overallScore) || 0;

    // Get top 3 verified skills with scores
    const topSkills = verifiedSkills
      .sort((a, b) => (b.ScoreTest || 0) - (a.ScoreTest || 0))
      .slice(0, 3)
      .map((s) => `${s.name} (${s.ScoreTest}/100)`)
      .join(', ');

    // Build comprehensive share message
    let shareMessage = `🎯 Verified Professional Profile - ${profileName}\n\n`;

    if (verifiedCount > 0) {
      shareMessage += `✅ ${verifiedCount} Blockchain-Verified Skills\n`;
    }
    if (totalInterviews > 0) {
      shareMessage += `📊 ${totalInterviews} Completed AI Interviews\n`;
    }
    if (overallScore > 0) {
      shareMessage += `⭐ Overall Score: ${overallScore}/100\n`;
    }
    if (topSkills) {
      shareMessage += `\n🏆 Top Skills: ${topSkills}\n`;
    }

    shareMessage += `\n🔗 View my full verified profile on TalentAI`;

    return {
      profileUrl,
      profileName,
      shareMessage,
    };
  }, [profile]);
};
