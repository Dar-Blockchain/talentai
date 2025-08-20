import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface TodoState {
  todos: {
    data: any[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  generate: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
}

const initialState: TodoState = {
  todos: {
    data: [],
    status: "idle",
    error: null,
  },
  generate: {
    status: "idle",
    error: null,
  },
};

// Async: Fetch all todos
export const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}todo/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch todos"
      );
    }
  }
);

// Async: Generate todo list
export const generateTodos = createAsyncThunk(
  "todos/generateTodos",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}todo/profile`, {}, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to generate todos.";
      return rejectWithValue(errorMessage);
    }
  }
);

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTodos
      .addCase(fetchTodos.pending, (state) => {
        state.todos.status = "loading";
        state.todos.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction<any>) => {
        state.todos.status = "succeeded";
        state.todos.data = action.payload.todos;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.todos.status = "failed";
        state.todos.error = action.payload as string;
      })

      // generateTodos
      .addCase(generateTodos.pending, (state) => {
        state.generate.status = "loading";
        state.generate.error = null;
      })
      .addCase(generateTodos.fulfilled, (state) => {
        state.generate.status = "succeeded";
      })
      .addCase(generateTodos.rejected, (state, action) => {
        state.generate.status = "failed";
        state.generate.error = action.payload as string;
      });
  },
});

export default todoSlice.reducer;
