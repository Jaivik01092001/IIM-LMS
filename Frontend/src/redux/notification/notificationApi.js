import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const getConfig = () => ({
  headers: { "x-auth-token": localStorage.getItem("accessToken") },
});

// Get all notifications for the current user
export const getUserNotifications = async () => {
  const response = await axios.get(
    `${API_URL}/notification`,
    getConfig()
  );
  return response.data;
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  const response = await axios.put(
    `${API_URL}/notification/${notificationId}/read`,
    {},
    getConfig()
  );
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await axios.put(
    `${API_URL}/notification/read-all`,
    {},
    getConfig()
  );
  return response.data;
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  const response = await axios.delete(
    `${API_URL}/notification/${notificationId}`,
    getConfig()
  );
  return response.data;
};
