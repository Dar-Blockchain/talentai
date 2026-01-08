import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { isLoggingOutCheck, getAbortSignal } from "./authSlice";

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
}

export interface UpdateRolePayload {
  organizationId: string;
  userId: string;
  role: MemberRole;
}

export interface DeleteMemberPayload {
  organizationId: string;
  userId: string;
}

export interface Invitation {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedBy: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  expiresAt?: string;
  acceptedAt?: string;
}

interface MemberState {
  members: Member[];
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
}

const initialState: MemberState = {
  members: [],
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

  const token = localStorage.getItem("api_token");
  if (!token) {
    console.error(`❌ [MemberSlice] No token found - skipping API call`);
    return rejectWithValue("No authentication token found");
  }

  const abortSignal = getAbortSignal();

  try {
    console.log(`📡 [MemberSlice] Sending invitation via API...`);

    // Transform payload to match new invitation API
    const apiPayload = {
      email: payload.email,
      role: payload.role
    };

    console.log(`📡 [MemberSlice] Sending invitation payload:`, apiPayload);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}CompanyInvitation/sentInvitation`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
        signal: abortSignal || undefined,
      }
    );

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(`⚠️ [MemberSlice] Unauthorized (401) - Token expired or invalid`);
        return rejectWithValue("Token expired or invalid - Please login again");
      }

      const error = await response
        .json()
        .catch(() => ({ message: "Failed to add employee" }));
      console.error(`❌ [MemberSlice] API error:`, error);
      return rejectWithValue(error.message || "Failed to add employee");
    }

    const data = await response.json();

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after response - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Employee added successfully`, data);
    return data;
  } catch (error: any) {
    if (error.name === "AbortError" || isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue("An error occurred while adding employee");
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

  const token = localStorage.getItem("api_token");
  if (!token) {
    console.error(`❌ [MemberSlice] No token found - skipping API call`);
    return rejectWithValue("No authentication token found");
  }

  const abortSignal = getAbortSignal();

  try {
    console.log(`📡 [MemberSlice] Updating member role via API...`);

    const apiPayload = {
      role: payload.role
    };

    console.log(`📡 [MemberSlice] Sending payload:`, apiPayload);
    console.log(`📡 [MemberSlice] URL: SharedAccount/${payload.organizationId}/employees/${payload.userId}/role`);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}SharedAccount/${payload.organizationId}/employees/${payload.userId}/role`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
        signal: abortSignal || undefined,
      }
    );

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(`⚠️ [MemberSlice] Unauthorized (401) - Token expired or invalid`);
        return rejectWithValue("Token expired or invalid - Please login again");
      }

      const error = await response
        .json()
        .catch(() => ({ message: "Failed to update role" }));
      console.error(`❌ [MemberSlice] API error:`, error);
      return rejectWithValue(error.message || "Failed to update role");
    }

    const data = await response.json();

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after response - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Role updated successfully`, data);
    return data;
  } catch (error: any) {
    if (error.name === "AbortError" || isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue("An error occurred while updating role");
  }
});

// Delete member
export const deleteMember = createAsyncThunk<
  { userId: string },
  DeleteMemberPayload,
  { rejectValue: string }
>("member/deleteMember", async (payload, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] deleteMember CALLED with payload:`, payload);

  // Check if logging out
  if (isLoggingOutCheck()) {
    console.log(`🚫 [MemberSlice] Logout in progress - aborting API call`);
    return rejectWithValue("Logout in progress");
  }

  const token = localStorage.getItem("api_token");
  if (!token) {
    console.error(`❌ [MemberSlice] No token found - skipping API call`);
    return rejectWithValue("No authentication token found");
  }

  const abortSignal = getAbortSignal();

  try {
    console.log(`📡 [MemberSlice] Deleting member via API...`);
    console.log(`📡 [MemberSlice] URL: SharedAccount/${payload.organizationId}/employees/${payload.userId}`);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}SharedAccount/${payload.organizationId}/employees/${payload.userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: abortSignal || undefined,
      }
    );

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(`⚠️ [MemberSlice] Unauthorized (401) - Token expired or invalid`);
        return rejectWithValue("Token expired or invalid - Please login again");
      }

      const error = await response
        .json()
        .catch(() => ({ message: "Failed to delete member" }));
      console.error(`❌ [MemberSlice] API error:`, error);
      return rejectWithValue(error.message || "Failed to delete member");
    }

    const data = await response.json();

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after response - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Member deleted successfully`, data);
    // Return the userId so we can remove it from the state
    return { userId: payload.userId };
  } catch (error: any) {
    if (error.name === "AbortError" || isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue("An error occurred while deleting member");
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

  const token = localStorage.getItem("api_token");
  if (!token) {
    console.error(`❌ [MemberSlice] No token found - skipping API call`);
    return rejectWithValue("No authentication token found");
  }

  const abortSignal = getAbortSignal();

  try {
    console.log(`📡 [MemberSlice] Fetching invitations from API...`);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}CompanyInvitation/myInvitations`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: abortSignal || undefined,
      }
    );

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(`⚠️ [MemberSlice] Unauthorized (401) - Token expired or invalid`);
        return rejectWithValue("Token expired or invalid - Please login again");
      }

      const error = await response
        .json()
        .catch(() => ({ message: "Failed to fetch invitations" }));
      console.error(`❌ [MemberSlice] API error:`, error);
      return rejectWithValue(error.message || "Failed to fetch invitations");
    }

    const data = await response.json();

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after response - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Invitations fetched successfully`, data);
    return data.invitations || [];
  } catch (error: any) {
    if (error.name === "AbortError" || isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue("An error occurred while fetching invitations");
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

  const token = localStorage.getItem("api_token");
  if (!token) {
    console.error(`❌ [MemberSlice] No token found - skipping API call`);
    return rejectWithValue("No authentication token found");
  }

  const abortSignal = getAbortSignal();

  try {
    console.log(`📡 [MemberSlice] Resending invitation via API...`);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}CompanyInvitation/resendInvitation/${invitationId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: abortSignal || undefined,
      }
    );

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(`⚠️ [MemberSlice] Unauthorized (401) - Token expired or invalid`);
        return rejectWithValue("Token expired or invalid - Please login again");
      }

      const error = await response
        .json()
        .catch(() => ({ message: "Failed to resend invitation" }));
      console.error(`❌ [MemberSlice] API error:`, error);
      return rejectWithValue(error.message || "Failed to resend invitation");
    }

    const data = await response.json();

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after response - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Invitation resent successfully`, data);
    return data.updated;
  } catch (error: any) {
    if (error.name === "AbortError" || isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue("An error occurred while resending invitation");
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

  const token = localStorage.getItem("api_token");
  if (!token) {
    console.error(`❌ [MemberSlice] No token found - skipping API call`);
    return rejectWithValue("No authentication token found");
  }

  const abortSignal = getAbortSignal();

  try {
    console.log(`📡 [MemberSlice] Deleting invitation via API...`);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}CompanyInvitation/deleteInvitation/${invitationId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: abortSignal || undefined,
      }
    );

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after fetch - aborting`);
      return rejectWithValue("Logout in progress");
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(`⚠️ [MemberSlice] Unauthorized (401) - Token expired or invalid`);
        return rejectWithValue("Token expired or invalid - Please login again");
      }

      const error = await response
        .json()
        .catch(() => ({ message: "Failed to delete invitation" }));
      console.error(`❌ [MemberSlice] API error:`, error);
      return rejectWithValue(error.message || "Failed to delete invitation");
    }

    const data = await response.json();

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after response - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Invitation deleted successfully`, data);
    return invitationId;
  } catch (error: any) {
    if (error.name === "AbortError" || isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue("An error occurred while deleting invitation");
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}CompanyInvitation/respondInvitation/${invitationId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return rejectWithValue("Invitation not found or has expired");
      }

      const error = await response
        .json()
        .catch(() => ({ message: `Failed to ${action} invitation` }));
      console.error(`❌ [MemberSlice] API error:`, error);
      return rejectWithValue(error.message || `Failed to ${action} invitation`);
    }

    const data = await response.json();
    console.log(`✅ [MemberSlice] Invitation ${action}ed successfully`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue(`An error occurred while ${action}ing invitation`);
  }
});

// Fetch invitation details by ID
export const fetchInvitationDetails = createAsyncThunk<
  Invitation & { organization?: { _id: string; name: string } },
  string,
  { rejectValue: string }
>("member/fetchInvitationDetails", async (invitationId, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] fetchInvitationDetails CALLED with id:`, invitationId);
  const token = localStorage.getItem("api_token");
  if (!token) {
    console.error(`❌ [MemberSlice] No token found - skipping API call`);
    return rejectWithValue("No authentication token found");
  }
  try {
    console.log(token,'aaaaaaaaaa')
    console.log(`📡 [MemberSlice] Fetching invitation details from API...`);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}CompanyInvitation/details/${invitationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return rejectWithValue("Invitation not found or has expired");
      }

      const error = await response
        .json()
        .catch(() => ({ message: "Failed to load invitation details" }));
      console.error(`❌ [MemberSlice] API error:`, error);
      return rejectWithValue(error.message || "Failed to load invitation details");
    }

    const data = await response.json();
    console.log(`✅ [MemberSlice] Invitation details fetched successfully`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue("An error occurred while fetching invitation details");
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
        (state: MemberState, action: PayloadAction<{ userId: string }>) => {
          state.deletingMember = false;
          state.deleteMemberSuccess = true;
          console.log('✅ [MemberSlice] Member deleted successfully');
          // Remove the member from the list
          state.members = state.members.filter(m => m.user._id !== action.payload.userId);
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
});

export default memberSlice.reducer;
