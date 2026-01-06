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
  accountId: string;
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
  sharedAccountId: string | null;
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
  sharedAccountId: null,
};

// Fetch shared account (activates shared account)
export const activateSharedAccount = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("member/activateSharedAccount", async (_, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] activateSharedAccount CALLED`);

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
    console.log(`📡 [MemberSlice] Activating shared account...`);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}SharedAccount/`,
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
        .catch(() => ({ message: "Failed to activate shared account" }));
      console.error(`❌ [MemberSlice] API error:`, error);
      return rejectWithValue(error.message || "Failed to activate shared account");
    }

    const data = await response.json();

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after response - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Shared account activated successfully`, data);
    return data;
  } catch (error: any) {
    if (error.name === "AbortError" || isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue("An error occurred while activating shared account");
  }
});

// Fetch all members (employees)
export const fetchMyEmployees = createAsyncThunk<
  MemberResponse,
  void,
  { rejectValue: string }
>("member/fetchMyEmployees", async (_, { rejectWithValue }) => {
  console.log(`🔑 [MemberSlice] fetchMyEmployees CALLED`);

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
    console.log(`📡 [MemberSlice] Fetching employees from API...`);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}SharedAccount/myEmployees`,
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
        .catch(() => ({ message: "Failed to fetch employees" }));
      console.error(`❌ [MemberSlice] API error:`, error);
      return rejectWithValue(error.message || "Failed to fetch employees");
    }

    const data = await response.json();

    if (isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Logout detected after response - aborting`);
      return rejectWithValue("Logout in progress");
    }

    console.log(`✅ [MemberSlice] Employees fetched successfully`, data);
    return data;
  } catch (error: any) {
    if (error.name === "AbortError" || isLoggingOutCheck()) {
      console.log(`🚫 [MemberSlice] Request aborted due to logout`);
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [MemberSlice] Exception:`, error);
    return rejectWithValue("An error occurred while fetching employees");
  }
});

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
    console.log(`📡 [MemberSlice] Adding employee via API...`);

    // Transform payload to match API expectations
    const apiPayload = {
      OrganizationId: payload.accountId,
      email: payload.email,
      role: payload.role
    };

    console.log(`📡 [MemberSlice] Sending payload:`, apiPayload);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}SharedAccount/employees`,
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
      // Handle activateSharedAccount
      .addCase(activateSharedAccount.pending, (state: MemberState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        activateSharedAccount.fulfilled,
        (state: MemberState, action: PayloadAction<any>) => {
          state.loading = false;
          // Extract the ID string from the API response
          let accountId = action.payload;

          // If it's an object, extract the _id field
          if (typeof accountId === 'object' && accountId !== null) {
            accountId = accountId._id || accountId.id || accountId.accountId;
          }

          state.sharedAccountId = accountId;
          console.log('✅ [MemberSlice] Shared account ID stored:', state.sharedAccountId);
          console.log('✅ [MemberSlice] Full payload:', action.payload);
        }
      )
      .addCase(
        activateSharedAccount.rejected,
        (state: MemberState, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "An error occurred";
        }
      )
      // Handle fetchMyEmployees
      .addCase(fetchMyEmployees.pending, (state: MemberState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyEmployees.fulfilled,
        (state: MemberState, action: PayloadAction<MemberResponse>) => {
          state.loading = false;
          state.members = action.payload.members || [];
        }
      )
      .addCase(
        fetchMyEmployees.rejected,
        (state: MemberState, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "An error occurred";
        }
      )
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
  sharedAccountId: state.member.sharedAccountId,
});

export default memberSlice.reducer;
