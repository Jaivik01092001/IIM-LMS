import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const getConfig = () => ({
  headers: { "x-auth-token": localStorage.getItem("accessToken") },
});

// Get all comments for a course
export const getCourseComments = async (courseId) => {
  const response = await axios.get(
    `${API_URL}/comment/course/${courseId}`,
    getConfig()
  );
  return response.data;
};

// Add a comment to a course
export const addCourseComment = async (courseId, text) => {
  const response = await axios.post(
    `${API_URL}/comment/course/${courseId}`,
    { text },
    getConfig()
  );
  return response.data;
};

// Update a comment
export const updateCourseComment = async (courseId, commentId, text) => {
  const response = await axios.put(
    `${API_URL}/comment/course/${courseId}/${commentId}`,
    { text },
    getConfig()
  );
  return response.data;
};

// Delete a comment
export const deleteCourseComment = async (courseId, commentId) => {
  const response = await axios.delete(
    `${API_URL}/comment/course/${courseId}/${commentId}`,
    getConfig()
  );
  return response.data;
};

// Add a reply to a comment
export const addCommentReply = async (
  courseId,
  commentId,
  text,
  parentReplyId = null
) => {
  const response = await axios.post(
    `${API_URL}/comment/course/${courseId}/${commentId}/reply`,
    { text, parentReplyId },
    getConfig()
  );
  return response.data;
};

// Update a reply
export const updateCommentReply = async (
  courseId,
  commentId,
  replyId,
  text
) => {
  const response = await axios.put(
    `${API_URL}/comment/course/${courseId}/${commentId}/reply/${replyId}`,
    { text },
    getConfig()
  );
  return response.data;
};

// Delete a reply
export const deleteCommentReply = async (courseId, commentId, replyId) => {
  const response = await axios.delete(
    `${API_URL}/comment/course/${courseId}/${commentId}/reply/${replyId}`,
    getConfig()
  );
  return response.data;
};
