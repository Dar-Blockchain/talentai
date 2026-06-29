import type { Member } from "@/modules/company/members/types";
import type { Department } from "@/modules/company/departments/types";

/** Extended Member with optional API fields not yet in the base slice type. */
export interface ExtendedMember extends Member {
  department?: { _id: string; name: string } | null;
  departmentName?: string;
  departmentId?: string;
  campaignsCount?: number;
  campaigns?: unknown[];
  interviewsPassed?: number;
  skills?: string[];
  jobPostsCount?: number;
}

export type { Member, Department };
