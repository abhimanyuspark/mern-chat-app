const onlineUsers = new Map();

/**
 * Map Structure
 *
 * onlineUsers = {
 *   "userId1" => "socketId1",
 *   "userId2" => "socketId2"
 * }
 */

export const addUser = (userId, socketId) => {
  onlineUsers.set(userId.toString(), socketId);
};

export const removeUser = (userId) => {
  onlineUsers.delete(userId.toString());
};

export const getSocketId = (userId) => {
  return onlineUsers.get(userId.toString());
};

export const getOnlineUsers = () => {
  return [...onlineUsers.keys()];
};

export default onlineUsers;
