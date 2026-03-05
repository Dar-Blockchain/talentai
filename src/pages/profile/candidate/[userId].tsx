"use client";

import React, { useEffect, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";

import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  Card,
  Skeleton,
} from "@mui/material";

import {
  Person,
  Work,
  CalendarToday,
  Star,
  Code,
  Psychology,
  Settings,
  VisibilityOff,
  Verified,
  EmojiEvents,
} from "@mui/icons-material";

import Header from "@/components/layout/Header";
import PageContainer from "@/components/layout/PageContainer";
import SkillsSection from "@/components/profile/SkillsSection";
import { getProfileById, clearTargetUser } from "@/store/slices/userSlice";
import { generateBadgesFromProfile } from "@/utils/generateProfileBadges";

/* -------------------------------------------------------------------------- */
/*                                   Tokens                                   */
/* -------------------------------------------------------------------------- */

const CANDIDATE = "rgba(131, 16, 255, 1)";
const CANDIDATE_LIGHT = "rgba(131, 16, 255, 0.08)";
const BORDER = "#E5E7EB";
const TEXT_MUTED = "#6B7280";

/* -------------------------------------------------------------------------- */
/*                                UI Blocks                                   */
/* -------------------------------------------------------------------------- */
const ProfileHeaderSkeleton = () => (
  <Paper sx={{ p: 4, mb: 4, borderRadius: 4 }}>
    <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
      <Skeleton variant="circular" width={96} height={96} />

      <Box flex={1}>
        <Skeleton width="40%" height={36} />
        <Skeleton width={100} height={28} sx={{ mt: 1 }} />
      </Box>
    </Box>

    <Divider sx={{ my: 4 }} />

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(4,1fr)" },
        gap: 2,
      }}
    >
      {[...Array(4)].map((_, i) => (
        <Card
          key={i}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${BORDER}`,
          }}
        >
          <Skeleton width="60%" height={18} />
          <Skeleton width="40%" height={36} />
        </Card>
      ))}
    </Box>

    <Divider sx={{ my: 4 }} />

    <Box
      sx={{
        display: "grid",
        gap: 3,
        gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
      }}
    >
      {[...Array(3)].map((_, i) => (
        <Box key={i} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="30%" height={14} />
            <Skeleton width="70%" height={20} />
          </Box>
        </Box>
      ))}
    </Box>
  </Paper>
);

const SkillsSkeleton = () => (
  <Paper sx={{ p: 4, mb: 4, borderRadius: 4 }}>
    <Skeleton width="30%" height={32} sx={{ mb: 2 }} />
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {[...Array(6)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          width={90}
          height={32}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Box>
  </Paper>
);

const StatCard = ({ icon: Icon, label, value }: any) => (
  <Card
    sx={{
      p: 3,
      borderRadius: 3,
      border: `1px solid ${BORDER}`,
      boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      <Icon sx={{ fontSize: 18, color: CANDIDATE }} />
      <Typography variant="caption" sx={{ color: TEXT_MUTED, fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
    <Typography variant="h4" fontWeight={700}>
      {value}
    </Typography>
  </Card>
);

const InfoItem = ({ icon: Icon, label, value }: any) => (
  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: CANDIDATE_LIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon sx={{ color: CANDIDATE }} />
    </Box>
    <Box>
      <Typography variant="caption" color={TEXT_MUTED}>
        {label}
      </Typography>
      <Typography fontWeight={600}>{value}</Typography>
    </Box>
  </Box>
);

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

const CandidateProfile: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = router.query;

  const { profile, user, loading, companyMembership } = useSelector(
    (state: RootState) => state.user.targetUser
  );

  // Check if target user has a company membership (profile should be hidden)
  const targetHasMembership = !!companyMembership?._id;
  const connectedProfile = useSelector(
    (state: RootState) => state.user.connectedUser.profile
  );

  const isOwnProfile =
    connectedProfile?._id &&
    profile?._id &&
    connectedProfile._id === profile._id;

  useEffect(() => {
    if (typeof userId === "string") dispatch(getProfileById(userId));
    return () => {
      dispatch(clearTargetUser());
    };
  }, [userId, dispatch]);

  const profileData = useMemo(() => {
    if (!profile) return null;
    return {
      name:
        `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
        profile.userId?.username,
      email: user?.email,
      image: profile.user_image,
      joined: new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [profile, user]);

  const { technicalBadges, softBadges } = useMemo(() => {
    if (!profile) return { technicalBadges: [], softBadges: [] };
    return generateBadgesFromProfile(
      profile.skills || [],
      profile.softSkills || []
    );
  }, [profile]);

  const verifiedCount =
    (profile?.skills?.filter((s: any) => s.ScoreTest > 0) || []).length +
    (profile?.softSkills?.filter((s: any) => s.ScoreTest > 0) || []).length;

  /* ---------------------------- Private Profile ---------------------------- */

  // Block access if profile is private OR if target user has a company membership
  if (profile && (!profile.isPublicProfile || targetHasMembership) && !isOwnProfile) {
    return (
      <PageContainer>
        <Header />
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 4, mt: 3 }}>
          <VisibilityOff sx={{ fontSize: 64, color: CANDIDATE }} />
          <Typography variant="h4" fontWeight={700} mt={2}>
            Private Profile
          </Typography>
          <Typography color={TEXT_MUTED} mt={1} mb={3}>
            {targetHasMembership
              ? "This profile is private due to company membership."
              : "This candidate has disabled public visibility."}
          </Typography>
          <Button
            onClick={() => router.back()}
            variant="outlined"
            sx={{
              borderColor: CANDIDATE,
              color: CANDIDATE,
              textTransform: "none",
            }}
          >
            Go Back
          </Button>
        </Paper>
      </PageContainer>
    );
  }

  if (loading || !profileData) {
    return (
      <PageContainer>
        <Header />
        <ProfileHeaderSkeleton />
        <SkillsSkeleton />
        <SkillsSkeleton />{" "}
      </PageContainer>
    );
  }

  /* ---------------------------------- JSX --------------------------------- */

  return (
    <PageContainer>
      <Head>
        <title>{profileData.name} – Candidate</title>
      </Head>

      <Header />

      {/* Header */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 4 }}>
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <Avatar
            src={profileData.image}
            sx={{
              width: 96,
              height: 96,
              border: `3px solid ${CANDIDATE_LIGHT}`,
              background: CANDIDATE_LIGHT,
            }}
          >
            <Person
              sx={{ width: 50, height: 50, color: "rgba(107, 114, 128, 0.5)" }}
            />
          </Avatar>

          <Box flex={1}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h4" fontWeight={700}>
                {profileData.name}
              </Typography>
              {isOwnProfile && (
                <Button
                  size="small"
                  startIcon={<Settings />}
                  onClick={() => router.push("/profile/candidate/settings")}
                  sx={{
                    textTransform: "none",
                    color: CANDIDATE,
                  }}
                >
                  Settings
                </Button>
              )}
            </Box>

            <Chip
              label="Candidate"
              sx={{
                mt: 1,
                backgroundColor: CANDIDATE_LIGHT,
                color: CANDIDATE,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Stats */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(4,1fr)" },
            gap: 2,
          }}
        >
          <StatCard
            icon={Verified}
            label="Verified Skills"
            value={verifiedCount}
          />
          <StatCard
            icon={Psychology}
            label="AI Interviews"
            value={profile.interviewDetails?.length || 0}
          />
          <StatCard
            icon={Star}
            label="Overall Score"
            value={profile.overallScore || "—"}
          />
          <StatCard
            icon={Code}
            label="Total Skills"
            value={
              (profile.skills?.length || 0) + (profile.softSkills?.length || 0)
            }
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Info */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          }}
        >
          <InfoItem icon={Person} label="Email" value={profileData.email} />
          <InfoItem
            icon={CalendarToday}
            label="Member Since"
            value={profileData.joined}
          />
          {profile.targetRole && (
            <InfoItem
              icon={Work}
              label="Target Role"
              value={profile.targetRole}
            />
          )}
        </Box>
      </Paper>

      {/* Skills */}
      <SkillsSection
        title="Technical Skills"
        skills={profile.skills || []}
        icon={Code}
        type={'technical'}
      />
      <SkillsSection
        title="Soft Skills"
        skills={profile.softSkills || []}
        icon={Psychology}
        type={'soft'}
      />
    </PageContainer>
  );
};

export default CandidateProfile;
