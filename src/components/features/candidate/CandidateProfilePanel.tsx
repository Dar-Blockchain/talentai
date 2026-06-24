"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ClipboardList, GraduationCap, TrendingUp, Trophy, CheckCircle2, Circle, ArrowRight,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Progress } from "@/modules/shared/ui/shadcn/progress";
import { Separator } from "@/modules/shared/ui/shadcn/separator";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store/store";
import { fetchCandidateStats, selectCandidateStats } from "@/store/slices/jobApplicationSlice";

// ─── ProfileCard ──────────────────────────────────────────────────────────────

interface ProfileCardProps {
  displayName: string;
  email?: string;
  initial: string;
  avatarUrl?: string;
  targetRole?: string;
  experienceLevel?: string;
  totalApplications: number;
  totalInterviews: number;
  labelApplications: string;
  labelInterviews: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  displayName, email, initial, avatarUrl,
  targetRole, experienceLevel,
  totalApplications, totalInterviews,
  labelApplications, labelInterviews,
}) => (
  <div className="bg-card rounded-lg border overflow-hidden shadow-card">

    {/* Banner — logo gradient: deep-green → mint */}
    <div className="h-16 relative bg-gradient-to-br from-primary-dark to-primary overflow-hidden">
      {/* decorative circles using brand accent */}
      <div className="absolute -top-3 -right-3 size-14 rounded-full bg-accent/20" />
      <div className="absolute bottom-1 right-8 size-5 rounded-full bg-primary-foreground/10" />
      <div className="absolute top-2 left-3 size-3 rounded-full bg-accent/30" />
    </div>

    <div className="px-3 pb-3">
      {/* Avatar — floats out of banner */}
      <div className="-mt-7 mb-2.5">
        <Avatar className="size-14 border-[3px] border-card shadow-md">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Identity */}
      <p className="text-sm font-extrabold leading-tight text-gray-900">{displayName}</p>
      {email && (
        <p className="text-[0.7rem] text-muted-foreground mt-0.5 mb-2 truncate">{email}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {targetRole && (
          <Badge
            variant="outline"
            className="text-[0.65rem] h-5 px-2 font-semibold bg-primary-light border-primary-border text-primary-dark"
          >
            {targetRole}
          </Badge>
        )}
        {experienceLevel && (
          <div className="flex items-center gap-1">
            <Trophy className="size-3 text-warning shrink-0" />
            <span className="text-[0.68rem] text-gray-500 font-medium">{experienceLevel}</span>
          </div>
        )}
      </div>

      <Separator className="my-2.5" />

      {/* Stats */}
      <div className="flex flex-col gap-1.5">
        {/* Applications — secondary (purple) */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-secondary-light border border-secondary-border">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-secondary/25 flex items-center justify-center shrink-0">
              <ClipboardList className="size-3 text-secondary-dark" />
            </div>
            <span className="text-[0.75rem] font-semibold text-gray-700">{labelApplications}</span>
          </div>
          <span className="text-base font-black text-secondary-dark">{totalApplications}</span>
        </div>

        {/* Interviews — primary (mint green) */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-primary-light border border-primary-border">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-primary/25 flex items-center justify-center shrink-0">
              <GraduationCap className="size-3 text-primary-dark" />
            </div>
            <span className="text-[0.75rem] font-semibold text-gray-700">{labelInterviews}</span>
          </div>
          <span className="text-base font-black text-primary-dark">{totalInterviews}</span>
        </div>
      </div>
    </div>
  </div>
);

// ─── ProfileStrengthCard ──────────────────────────────────────────────────────

interface ChecklistItem { label: string; done: boolean; href?: string }

const ProfileStrengthCard: React.FC<{ checklist: ChecklistItem[]; label: string }> = ({ checklist, label }) => {
  const done = checklist.filter(c => c.done).length;
  const pct  = Math.round((done / checklist.length) * 100);

  return (
    <div className="bg-card rounded-lg border p-3 shadow-card">

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="size-6 rounded-md bg-primary-light flex items-center justify-center shrink-0">
          <TrendingUp className="size-3.5 text-primary-dark" />
        </div>
        <span className="text-[0.8rem] font-bold text-gray-900">{label}</span>
        <span className="ml-auto text-[0.72rem] font-bold text-primary-dark">{pct}%</span>
      </div>

      {/* Progress — mint green fill on light mint track */}
      <Progress
        value={pct}
        className="h-1.5 my-2.5 bg-primary-light [&>[data-slot=progress-indicator]]:bg-primary"
      />

      {/* Checklist */}
      <div className="flex flex-col gap-0.5">
        {checklist.map((item, i) => {
          const clickable = !item.done && !!item.href;
          return (
            <a
              key={i}
              href={clickable ? item.href : undefined}
              role={clickable ? "link" : undefined}
              className={cn(
                "group flex items-center gap-2 px-2 py-1 -mx-2 rounded-md text-[0.72rem] transition-colors duration-150",
                clickable
                  ? "cursor-pointer hover:bg-primary-light"
                  : "cursor-default",
                item.done ? "text-gray-700" : "text-gray-400",
              )}
            >
              {item.done
                ? <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                : <Circle       className="size-3.5 text-gray-300 shrink-0" />}

              <span className={cn("flex-1", item.done ? "font-medium" : "font-normal")}>
                {item.label}
              </span>

              {clickable && (
                <ArrowRight className="size-3 text-primary-dark opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
};

// ─── CandidateProfilePanel (connected) ───────────────────────────────────────

const CandidateProfilePanel: React.FC = () => {
  const { t }    = useTranslation("dashboard");
  const dispatch = useDispatch<AppDispatch>();
  const profile  = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user     = useSelector((state: RootState) => state.user.connectedUser.user);
  const stats    = useSelector(selectCandidateStats);

  useEffect(() => { dispatch(fetchCandidateStats()); }, [dispatch]);

  const totalApplications = stats?.totalApplications ?? 0;
  const totalInterviews   = stats?.totalInterviews   ?? 0;

  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
    : user?.username || "Candidate";
  const initial   = displayName[0]?.toUpperCase() || "C";
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${profile.user_image}`
    : undefined;

  const checklist = [
    { label: t("candidate.checklist.complete_profile"), done: !!(profile?.firstName && profile?.lastName), href: "/settings" },
    { label: t("candidate.checklist.add_target_role"),  done: !!profile?.targetRole,                       href: "/settings" },
    { label: t("candidate.checklist.set_experience"),   done: !!profile?.requiredExperienceLevel,          href: "/settings" },
    { label: t("candidate.checklist.first_application"),done: totalApplications > 0,                       href: "/candidate/dashboard" },
  ];

  return (
    <>
      <ProfileCard
        displayName={displayName}
        email={user?.email}
        initial={initial}
        avatarUrl={avatarUrl}
        targetRole={profile?.targetRole}
        experienceLevel={profile?.requiredExperienceLevel}
        totalApplications={totalApplications}
        totalInterviews={totalInterviews}
        labelApplications={t("candidate.profile.applications")}
        labelInterviews={t("candidate.profile.interviews")}
      />
      <ProfileStrengthCard
        checklist={checklist}
        label={t("candidate.profile.profile_strength")}
      />
    </>
  );
};

export default CandidateProfilePanel;
