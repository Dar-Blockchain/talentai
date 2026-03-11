import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { isLoggingOutCheck } from "./authSlice";
import axiosInstance from "@/utils/axiosInstance";

// Type definitions based on your API response
export type MemberRole = "RH" | "TechLead" | "Supervisor" | "Manager" | "Owner";
export type MemberStatus = "active" | "pending" | "inactive";

export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface Member {
  _id: string;
  user: User;
  Organization: string;
  role: MemberRole;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface MemberResponse {
  success: boolean;
  members: Member[];
}

export interface AddMemberPayload {
  accountId?: string; // Optional - kept for backwards compatibility but not used in new invitation API
  email: string;
  role: MemberRole;
  departmentId?: string;
}

export interface UpdateRolePayload {
  membershipId: string; // CompanyMembership ID
  role: MemberRole;
}

export interface DeleteMemberPayload {
  membershipId: string; // CompanyMembership ID
}

export interface Invitation {
  _id: string;
  email: string;
  company?: any;
  user?: {
    _id: string;
    username: string;
    email: string;
  };
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled' | 'active' | 'revoked';
  invitedBy: {
    _id: string;
    username: string;
    email: string;
  };
  token?: string;
  createdAt: string;
  expiresAt?: string;
  acceptedAt?: string;
}

export interface MemberStats {
  total: number;
  memberships: { total: number };
  invitations: { total: number };
}

export interface FetchMembersParams {
  page: number;
  limit: number;
  search?: string;
  departmentIds?: string[];
}

interface MemberState {
  members: Member[];
  pageTotal: number;
  loading: boolean;
  error: string | null;
  addingMember: boolean;
  addMemberSuccess: boolean;
  updatingRole: boolean;
  updateRoleSuccess: boolean;
  deletingMember: boolean;
  deleteMemberSuccess: boolean;
  invitations: Invitation[];
  fetchingInvitations: boolean;
  resendingInvitation: boolean;
  cancellingInvitation: boolean;
  sharedAccountId: string | null;
  currentInvitation: (Invitation & { organization?: { _id: string; name: string } }) | null;
  fetchingInvitationDetails: boolean;
  respondingToInvitation: boolean;
  invitationResponse: { success: boolean; action: 'accept' | 'reject' } | null;
  stats: MemberStats | null;
  fetchingStats: boolean;
}

const initialState: MemberState = {
  members: [],
  pageTotal: 0,
  loading: false,
  error: null,
  addingMember: false,
  addMemberSuccess: false,
  updatingRole: false,
  updateRoleSuccess: false,
  deletingMember: false,
  deleteMemberSuccess: false,
  invitations: [],
  fetchingInvitations: false,
  resendingInvitation: false,
  cancellingInvitation: false,
  sharedAccountId: null,
  currentInvitation: null,
  fetchingInvitationDetails: false,
  respondingToInvitation: false,
  invitationResponse: null,
  stats: null,
  fetchingStats: false,
};

// Add a new member (employee)
export const addEmployee = createAsyncThunk<
  Member,
  AddMemberPayload,
  { rejectValue: string }
>("member/addEmployee", async (payload, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] addEmployee CALLED with payload:`, payload);

  // Check if logging out
  if (isLoggingOutCheck()) {
    console.log(`🚫 [MemberSlice] Logout in progress - aborting API call`);
    return rejectWithValue("Logout in progress");
  }

  try {
    console.log(`📡 [MemberSlice] Sending invitation via API...`);

    const apiPayload: { email: string; role: MemberRole; departmentId?: string } = {
      email: payload.email,
      role: payload.role,
      ...(payload.departmentId && { departmentId: payload.departmentId }),
    };

    console.log(`📡 [MemberSlice] Sending invitation payload:`, apiPayload);

    const response = await axiosInstance.post("CompanyInvitation/sentInvitation", apiPayload);

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Employee added successfully`, response.data);
    return response.data;
  } catch (error: any) {
    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue(error.response?.data?.message || "An error occurred while adding employee");
  }
});

// Update member role
export const updateMemberRole = createAsyncThunk<
  Member,
  UpdateRolePayload,
  { rejectValue: string }
>("member/updateMemberRole", async (payload, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] updateMemberRole CALLED with payload:`, payload);

  // Check if logging out
  if (isLoggingOutCheck()) {
    console.log(`🚫 [MemberSlice] Logout in progress - aborting API call`);
    return rejectWithValue("Logout in progress");
  }

  try {
    console.log(`📡 [MemberSlice] Updating member role via API...`);

    const apiPayload = { role: payload.role };

    console.log(`📡 [MemberSlice] Sending payload:`, apiPayload);
    console.log(`📡 [MemberSlice] URL: CompanyMembership/${payload.membershipId}/role`);

    const response = await axiosInstance.patch(`CompanyMembership/${payload.membershipId}/role`, apiPayload);

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Role updated successfully`, response.data);
    return response.data.updated || response.data;
  } catch (error: any) {
    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue(error.response?.data?.message || "An error occurred while updating role");
  }
});

// Delete member
export const deleteMember = createAsyncThunk<
  { membershipId: string },
  DeleteMemberPayload,
  { rejectValue: string }
>("member/deleteMember", async (payload, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] deleteMember CALLED with payload:`, payload);

  // Check if logging out
  if (isLoggingOutCheck()) {
    console.log(`🚫 [MemberSlice] Logout in progress - aborting API call`);
    return rejectWithValue("Logout in progress");
  }

  try {
    console.log(`📡 [MemberSlice] Deleting member via API...`);
    console.log(`📡 [MemberSlice] URL: CompanyMembership/${payload.membershipId}`);

    const response = await axiosInstance.delete(`CompanyMembership/${payload.membershipId}`);

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Member deleted successfully`, response.data);
    return { membershipId: payload.membershipId };
  } catch (error: any) {
    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue(error.response?.data?.message || "An error occurred while deleting member");
  }
});

// Fetch active members
export const fetchMembers = createAsyncThunk<
  Member[],
  void,
  { rejectValue: string }
>("member/fetchMembers", async (_, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] fetchMembers CALLED`);

  if (isLoggingOutCheck()) {
    console.log(`🚫 [MemberSlice] Logout in progress - aborting API call`);
    return rejectWithValue("Logout in progress");
  }

  try {
    console.log(`📡 [MemberSlice] Fetching members from API...`);
    const response = await axiosInstance.get("CompanyMembership/memberships");

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Members fetched successfully`, response.data);
    return response.data.memberships || response.data.members || [];
  } catch (error: any) {
    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue(error.response?.data?.message || "An error occurred while fetching members");
  }
});

// Fetch members with backend filtering and pagination
export const fetchMembersPage = createAsyncThunk<
  { members: Member[]; total: number },
  FetchMembersParams,
  { rejectValue: string }
>("member/fetchMembersPage", async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams();
    query.set("page", String(params.page));
    query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.departmentIds?.length) query.set("departmentId", params.departmentIds.join(","));

    const response = await axiosInstance.get(`CompanyMembership/memberships?${query.toString()}`);
    return {
      members: response.data.memberships || response.data.members || [],
      total: response.data.total ?? response.data.pagination?.total ?? 0,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "An error occurred while fetching members");
  }
});

// Fetch pending invitations
export const fetchInvitations = createAsyncThunk<
  Invitation[],
  void,
  { rejectValue: string }
>("member/fetchInvitations", async (_, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] fetchInvitations CALLED`);

  if (isLoggingOutCheck()) {
    console.log(`🚫 [MemberSlice] Logout in progress - aborting API call`);
    return rejectWithValue("Logout in progress");
  }

  try {
    console.log(`📡 [MemberSlice] Fetching invitations from API...`);
    const response = await axiosInstance.get("CompanyInvitation/myInvitations");

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Invitations fetched successfully`, response.data);
    return response.data.invitations || [];
  } catch (error: any) {
    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue(error.response?.data?.message || "An error occurred while fetching invitations");
  }
});

// Resend invitation
export const resendInvitation = createAsyncThunk<
  Invitation,
  string,
  { rejectValue: string }
>("member/resendInvitation", async (invitationId, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] resendInvitation CALLED with id:`, invitationId);

  if (isLoggingOutCheck()) {
    console.log(`🚫 [MemberSlice] Logout in progress - aborting API call`);
    return rejectWithValue("Logout in progress");
  }

  try {
    console.log(`📡 [MemberSlice] Resending invitation via API...`);
    const response = await axiosInstance.post(`CompanyInvitation/resendInvitation/${invitationId}`);

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Invitation resent successfully`, response.data);
    return response.data.updated;
  } catch (error: any) {
    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue(error.response?.data?.message || "An error occurred while resending invitation");
  }
});

// Cancel invitation
export const cancelInvitation = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("member/cancelInvitation", async (invitationId, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] cancelInvitation CALLED with id:`, invitationId);

  if (isLoggingOutCheck()) {
    console.log(`🚫 [MemberSlice] Logout in progress - aborting API call`);
    return rejectWithValue("Logout in progress");
  }

  try {
    console.log(`📡 [MemberSlice] Deleting invitation via API...`);
    const response = await axiosInstance.delete(`CompanyInvitation/deleteInvitation/${invitationId}`);

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Invitation deleted successfully`, response.data);
    return invitationId;
  } catch (error: any) {
    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue(error.response?.data?.message || "An error occurred while deleting invitation");
  }
});

// Respond to invitation (accept or reject)
export const respondToInvitation = createAsyncThunk<
  { success: boolean; message: string },
  { invitationId: string; action: 'accept' | 'reject' },
  { rejectValue: string }
>("member/respondToInvitation", async ({ invitationId, action }, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] respondToInvitation CALLED with id: ${invitationId}, action: ${action}`);
  try {
    console.log(`📡 [MemberSlice] Responding to invitation via API...`);
    const response = await axiosInstance.post(`CompanyInvitation/respondInvitation/${invitationId}`, { action });
    console.log(`✅ [MemberSlice] Invitation ${action}ed successfully`, response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return rejectWithValue("Invitation not found or has expired");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue(error.response?.data?.message || `An error occurred while ${action}ing invitation`);
  }
});

// Fetch membership stats
export const fetchMemberStats = createAsyncThunk<
  MemberStats,
  void,
  { rejectValue: string }
>("member/fetchMemberStats", async (_, { rejectWithValue }) => {
  if (isLoggingOutCheck()) return rejectWithValue("Logout in progress");
  try {
    const response = await axiosInstance.get("CompanyMembership/memberships/stats");
    return response.data.stats as MemberStats;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "An error occurred while fetching stats");
  }
});

// Fetch invitation details by ID
export const fetchInvitationDetails = createAsyncThunk<
  Invitation & { organization?: { _id: string; name: string } },
  string,
  { rejectValue: string }
>("member/fetchInvitationDetails", async (invitationId, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] fetchInvitationDetails CALLED with id:`, invitationId);
  try {
    console.log(`📡 [MemberSlice] Fetching invitation details from API...`);
    const response = await axiosInstance.get(`CompanyInvitation/details/${invitationId}`);
    console.log(`✅ [MemberSlice] Invitation details fetched successfully`, response.data);
    return response.data.invitation || response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return rejectWithValue("Invitation not found or has expired");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue(error.response?.data?.message || "An error occurred while fetching invitation details");
  }
});

const memberSlice = createSlice({
  name: "member",
  initialState,
  reducers: {
    clearMembers: (state: MemberState) => {
      state.members = [];
      state.error = null;
    },
    clearError: (state: MemberState) => {
      state.error = null;
    },
    clearAddMemberSuccess: (state: MemberState) => {
      state.addMemberSuccess = false;
    },
    clearUpdateRoleSuccess: (state: MemberState) => {
      state.updateRoleSuccess = false;
    },
    clearDeleteMemberSuccess: (state: MemberState) => {
      state.deleteMemberSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle addEmployee
      .addCase(addEmployee.pending, (state: MemberState) => {
        state.addingMember = true;
        state.error = null;
        state.addMemberSuccess = false;
      })
      .addCase(
        addEmployee.fulfilled,
        (state: MemberState, action: PayloadAction<any>) => {
          state.addingMember = false;
          state.addMemberSuccess = true;
          console.log('✅ [MemberSlice] Member added successfully:', action.payload);
          // The API might return the member directly or wrapped in an object
          const newMember = action.payload.member || action.payload;
          if (newMember && newMember._id) {
            state.members.push(newMember);
          }
        }
      )
      .addCase(
        addEmployee.rejected,
        (state: MemberState, action: PayloadAction<string | undefined>) => {
          state.addingMember = false;
          state.error = action.payload || "An error occurred";
          state.addMemberSuccess = false;
        }
      )
      // Handle updateMemberRole
      .addCase(updateMemberRole.pending, (state: MemberState) => {
        state.updatingRole = true;
        state.error = null;
        state.updateRoleSuccess = false;
      })
      .addCase(
        updateMemberRole.fulfilled,
        (state: MemberState, action: PayloadAction<any>) => {
          state.updatingRole = false;
          state.updateRoleSuccess = true;
          console.log('✅ [MemberSlice] Role updated successfully:', action.payload);
          // Update the member in the list
          const updatedMember = action.payload.member || action.payload;
          if (updatedMember && updatedMember._id) {
            const index = state.members.findIndex(m => m._id === updatedMember._id);
            if (index !== -1) {
              state.members[index] = updatedMember;
            }
          }
        }
      )
      .addCase(
        updateMemberRole.rejected,
        (state: MemberState, action: PayloadAction<string | undefined>) => {
          state.updatingRole = false;
          state.error = action.payload || "An error occurred";
          state.updateRoleSuccess = false;
        }
      )
      // Handle deleteMember
      .addCase(deleteMember.pending, (state: MemberState) => {
        state.deletingMember = true;
        state.error = null;
        state.deleteMemberSuccess = false;
      })
      .addCase(
        deleteMember.fulfilled,
        (state: MemberState, action: PayloadAction<{ membershipId: string }>) => {
          state.deletingMember = false;
          state.deleteMemberSuccess = true;
          console.log('✅ [MemberSlice] Member deleted successfully');
          // Remove the member from the list by membership ID
          state.members = state.members.filter(m => m._id !== action.payload.membershipId);
        }
      )
      .addCase(
        deleteMember.rejected,
        (state: MemberState, action: PayloadAction<string | undefined>) => {
          state.deletingMember = false;
          state.error = action.payload || "An error occurred";
          state.deleteMemberSuccess = false;
        }
      )
      // Handle fetchMembers
      .addCase(fetchMembers.pending, (state: MemberState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMembers.fulfilled,
        (state: MemberState, action: PayloadAction<Member[]>) => {
          state.loading = false;
          state.members = action.payload;
          console.log('✅ [MemberSlice] Members fetched successfully');
        }
      )
      .addCase(
        fetchMembers.rejected,
        (state: MemberState, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "An error occurred";
        }
      )
      // Handle fetchMembersPage
      .addCase(fetchMembersPage.pending, (state: MemberState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembersPage.fulfilled, (state: MemberState, action) => {
        state.loading = false;
        state.members = action.payload.members;
        state.pageTotal = action.payload.total;
      })
      .addCase(fetchMembersPage.rejected, (state: MemberState, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
      })
      // Handle fetchInvitations
      .addCase(fetchInvitations.pending, (state: MemberState) => {
        state.fetchingInvitations = true;
        state.error = null;
      })
      .addCase(
        fetchInvitations.fulfilled,
        (state: MemberState, action: PayloadAction<Invitation[]>) => {
          state.fetchingInvitations = false;
          state.invitations = action.payload;
          console.log('✅ [MemberSlice] Invitations fetched successfully');
        }
      )
      .addCase(
        fetchInvitations.rejected,
        (state: MemberState, action: PayloadAction<string | undefined>) => {
          state.fetchingInvitations = false;
          state.error = action.payload || "An error occurred";
        }
      )
      // Handle resendInvitation
      .addCase(resendInvitation.pending, (state: MemberState) => {
        state.resendingInvitation = true;
        state.error = null;
      })
      .addCase(
        resendInvitation.fulfilled,
        (state: MemberState, action: PayloadAction<Invitation>) => {
          state.resendingInvitation = false;
          console.log('✅ [MemberSlice] Invitation resent successfully');
          // Update the invitation in the list
          const index = state.invitations.findIndex(inv => inv._id === action.payload._id);
          if (index !== -1) {
            state.invitations[index] = action.payload;
          }
        }
      )
      .addCase(
        resendInvitation.rejected,
        (state: MemberState, action: PayloadAction<string | undefined>) => {
          state.resendingInvitation = false;
          state.error = action.payload || "An error occurred";
        }
      )
      // Handle cancelInvitation
      .addCase(cancelInvitation.pending, (state: MemberState) => {
        state.cancellingInvitation = true;
        state.error = null;
      })
      .addCase(
        cancelInvitation.fulfilled,
        (state: MemberState, action: PayloadAction<string>) => {
          state.cancellingInvitation = false;
          console.log('✅ [MemberSlice] Invitation cancelled successfully');
          // Remove the invitation from the list
          state.invitations = state.invitations.filter(inv => inv._id !== action.payload);
        }
      )
      .addCase(
        cancelInvitation.rejected,
        (state: MemberState, action: PayloadAction<string | undefined>) => {
          state.cancellingInvitation = false;
          state.error = action.payload || "An error occurred";
        }
      )
      // Handle respondToInvitation
      .addCase(respondToInvitation.pending, (state: MemberState) => {
        state.respondingToInvitation = true;
        state.error = null;
        state.invitationResponse = null;
      })
      .addCase(
        respondToInvitation.fulfilled,
        (state: MemberState, action) => {
          state.respondingToInvitation = false;
          state.invitationResponse = {
            success: true,
            action: action.meta.arg.action,
          };
          console.log('✅ [MemberSlice] Invitation response successful');
        }
      )
      .addCase(
        respondToInvitation.rejected,
        (state: MemberState, action: PayloadAction<string | undefined>) => {
          state.respondingToInvitation = false;
          state.error = action.payload || "An error occurred";
        }
      )
      // Handle fetchMemberStats
      .addCase(fetchMemberStats.pending, (state: MemberState) => {
        state.fetchingStats = true;
      })
      .addCase(fetchMemberStats.fulfilled, (state: MemberState, action: PayloadAction<MemberStats>) => {
        state.fetchingStats = false;
        state.stats = action.payload;
      })
      .addCase(fetchMemberStats.rejected, (state: MemberState) => {
        state.fetchingStats = false;
      })
      // Handle fetchInvitationDetails
      .addCase(fetchInvitationDetails.pending, (state: MemberState) => {
        state.fetchingInvitationDetails = true;
        state.error = null;
        state.currentInvitation = null;
      })
      .addCase(
        fetchInvitationDetails.fulfilled,
        (state: MemberState, action: PayloadAction<Invitation & { organization?: { _id: string; name: string } }>) => {
          state.fetchingInvitationDetails = false;
          state.currentInvitation = action.payload;
          console.log('✅ [MemberSlice] Invitation details fetched successfully');
        }
      )
      .addCase(
        fetchInvitationDetails.rejected,
        (state: MemberState, action: PayloadAction<string | undefined>) => {
          state.fetchingInvitationDetails = false;
          state.error = action.payload || "An error occurred";
        }
      );
  },
});

export const { clearMembers, clearError, clearAddMemberSuccess, clearUpdateRoleSuccess, clearDeleteMemberSuccess } = memberSlice.actions;

export const selectMembers = (state: RootState) => ({
  members: state.member.members,
  pageTotal: state.member.pageTotal,
  loading: state.member.loading,
  error: state.member.error,
  addingMember: state.member.addingMember,
  addMemberSuccess: state.member.addMemberSuccess,
  updatingRole: state.member.updatingRole,
  updateRoleSuccess: state.member.updateRoleSuccess,
  deletingMember: state.member.deletingMember,
  deleteMemberSuccess: state.member.deleteMemberSuccess,
  invitations: state.member.invitations,
  fetchingInvitations: state.member.fetchingInvitations,
  resendingInvitation: state.member.resendingInvitation,
  cancellingInvitation: state.member.cancellingInvitation,
  sharedAccountId: state.member.sharedAccountId,
  currentInvitation: state.member.currentInvitation,
  fetchingInvitationDetails: state.member.fetchingInvitationDetails,
  respondingToInvitation: state.member.respondingToInvitation,
  invitationResponse: state.member.invitationResponse,
  stats: state.member.stats,
  fetchingStats: state.member.fetchingStats,
});

export default memberSlice.reducer;
