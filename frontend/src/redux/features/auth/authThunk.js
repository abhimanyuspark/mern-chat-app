import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export const register = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/auth/register", data);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await api.post("/auth/login", data);

    localStorage.setItem("accessToken", res.data.data.accessToken);

    localStorage.setItem("refreshToken", res.data.data.refreshToken);

    return res.data.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const getCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/auth/me");
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});
