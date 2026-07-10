import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/conversations");
      return res.data?.data || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchUsers = createAsyncThunk(
  "chat/fetchUsers",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/users");
      return res.data?.data || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const startConversation = createAsyncThunk(
  "chat/startConversation",
  async (receiverId, thunkAPI) => {
    try {
      const res = await api.post("/conversations", { receiverId });
      return res.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, thunkAPI) => {
    try {
      const res = await api.get(`/messages/${conversationId}`);
      return {
        conversationId,
        messages: res.data?.data || [],
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ conversationId, text }, thunkAPI) => {
    try {
      const res = await api.post("/messages", {
        conversationId,
        text,
      });
      return {
        conversationId,
        message: res.data?.data,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);
