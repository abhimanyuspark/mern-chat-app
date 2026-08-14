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
  async (query = "", thunkAPI) => {
    try {
      const res = await api.get("/users/search", {
        params: { q: query },
      });
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

export const fetchConversationById = createAsyncThunk(
  "chat/fetchConversationById",
  async (conversationId, thunkAPI) => {
    try {
      const res = await api.get(`/conversations/${conversationId}`);
      return res.data?.data || null;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ conversationId, text, replyTo }, thunkAPI) => {
    try {
      const res = await api.post("/messages", {
        conversationId,
        text,
        replyTo,
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

export const deleteMessages = createAsyncThunk(
  "chat/deleteMessages",
  async ({ conversationId, ids, mode = "me" }, thunkAPI) => {
    try {
      const res = await api.delete("/messages", {
        data: { ids, mode },
      });
      return {
        conversationId,
        deletedIds: res.data?.data?.deletedIds || ids,
        mode,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createGroup = createAsyncThunk(
  "chat/createGroup",
  async ({ name, participants }, thunkAPI) => {
    try {
      const res = await api.post("/conversations/group", { name, participants });
      return res.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateGroupInfo = createAsyncThunk(
  "chat/updateGroupInfo",
  async ({ conversationId, name, groupAvatar }, thunkAPI) => {
    try {
      const res = await api.patch(`/conversations/group/${conversationId}`, {
        name,
        groupAvatar,
      });
      return res.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const addGroupMember = createAsyncThunk(
  "chat/addGroupMember",
  async ({ conversationId, memberId }, thunkAPI) => {
    try {
      const res = await api.post(`/conversations/group/${conversationId}/add`, {
        memberId,
      });
      return res.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const removeGroupMember = createAsyncThunk(
  "chat/removeGroupMember",
  async ({ conversationId, memberId }, thunkAPI) => {
    try {
      const res = await api.post(
        `/conversations/group/${conversationId}/remove`,
        { memberId },
      );
      return res.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const leaveGroup = createAsyncThunk(
  "chat/leaveGroup",
  async (conversationId, thunkAPI) => {
    try {
      await api.post(`/conversations/group/${conversationId}/leave`);
      return conversationId;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);
