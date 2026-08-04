import React from "react";
import { Building2, MapPin, DollarSign, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDate, fmtSalary, scoreTier } from "@/utils/functions";
import { STATUS_CLASSES, SCORE_CLASSES } from "../constants";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/modules/shared/ui/shadcn/avatar";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Button } from "@/modules/shared/ui/shadcn/button";
import type {
  CandidateApplication,
  ApplicationStatus,
} from "../types/application.types";

interface Props {
  app: CandidateApplication;
  statusLabel: string;
  onClick: () => void;
  onWithdraw?: (id: string) => void;
  onReactivate?: (id: string) => void;
}

const ApplicationCard: React.FC<Props> = ({
  app,
  statusLabel,
  onClick,
  onWithdraw,
  onReactivate,
}) => {
  const jd = app.post?.jobDetails || {};
  const company = app.company || {};
  const rawStatus = (
    (app.status || "visited") as ApplicationStatus
  ).toLowerCase() as ApplicationStatus;
  const sc = STATUS_CLASSES[rawStatus] ?? STATUS_CLASSES.visited;
  const matchScore = app.matchScore != null ? Math.round(app.matchScore) : null;
  const appliedDate = fmtDate(app.appliedAt || app.createdAt);
  const salary = fmtSalary(jd.salary);
  const canWithdraw    = rawStatus === "visited"   && !!onWithdraw;
  const canReactivate  = rawStatus === "withdrawn" && !!onReactivate;
  const logoUrl = company.logo
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${company.logo}`
    : undefined;

  return (
    <Card
      onClick={onClick}
      className="gap-0 py-0 cursor-pointer overflow-hidden hover:shadow-md hover:-translate-y-px transition-all duration-200"
    >
      {/* status stripe */}
      <div className={cn("h-0.5 w-full", sc.stripe)} />

      <CardContent className="px-4 py-3 flex items-start gap-3">
        {/* Company logo */}
        <Avatar className="size-10 rounded-xl border border-gray-200 bg-gray-50 shrink-0">
          <AvatarImage
            src={logoUrl}
            alt={company.companyName}
            className="object-contain p-1"
          />
          <AvatarFallback className="rounded-xl bg-gray-50">
            <Building2 className="size-4 text-gray-300" />
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + status badge */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <p className="text-[0.88rem] font-bold text-gray-900 truncate leading-tight">
              {jd.title || "Untitled Position"}
            </p>
            <Badge
              variant="outline"
              className={cn(
                "text-[0.6rem] font-bold shrink-0 rounded-full px-2 py-0.5 gap-1",
                sc.badge,
              )}
            >
              <span className={cn("size-1.5 rounded-full shrink-0", sc.dot)} />
              {statusLabel}
            </Badge>
          </div>

          {/* Company + location */}
          <div className="flex items-center gap-2 text-[0.75rem] text-gray-500 mb-1.5">
            {company.companyName && (
              <span className="font-medium text-gray-600 truncate">
                {company.companyName}
              </span>
            )}
            {company.companyName && jd.location && (
              <span className="size-1 rounded-full bg-gray-300 shrink-0" />
            )}
            {jd.location && (
              <span className="flex items-center gap-0.5 shrink-0">
                <MapPin className="size-2.5" />
                {jd.location}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            {salary && (
              <span className="flex items-center gap-0.5 text-[0.7rem] text-gray-400">
                <DollarSign className="size-2.5" />
                {salary}
              </span>
            )}
            {matchScore !== null && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-[0.7rem] font-semibold",
                  SCORE_CLASSES[scoreTier(matchScore)],
                )}
              >
                <TrendingUp className="size-2.5" />
                {matchScore}% match
              </span>
            )}
            {appliedDate !== "—" && (
              <span className="flex items-center gap-0.5 text-[0.7rem] text-gray-400">
                <Clock className="size-2.5" />
                Applied {appliedDate}
              </span>
            )}
            {canWithdraw && (
              <Button
                variant="destructive"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onWithdraw!(app._id);
                }}
                className="ml-auto bg-danger/5 text-danger border border-danger/25 hover:bg-danger/10 shadow-none text-[0.65rem] font-bold"
              >
                Withdraw
              </Button>
            )}
            {canReactivate && (
              <Button
                variant="outline"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onReactivate!(app._id);
                }}
                className="ml-auto text-primary-dark border-primary-dark/25 hover:bg-primary-dark/5 shadow-none text-[0.65rem] font-bold"
              >
                Reactivate
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;