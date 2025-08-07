import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const login = (credentials) => api.post('/login', credentials);
export const register = (userData) => api.post('/register', userData);

// Chat services
export const createChat = () => api.post('/chat/new');
export const getUserChats = () => api.get('/chats');
export const getChatMessages = (chatId) => api.get(`/chat/${chatId}`);
export const sendMessage = (chatId, message) => api.post('/chat', { chat_id: chatId, message });

// Admin services
export const getAllChats = () => api.get('/admin/chats');
export const verifyAnswer = (messageId, verified) => api.post('/admin/verify', { message_id: messageId, verified });
export const correctAnswer = (messageId, correction) => api.post('/admin/correct', { message_id: messageId, correction });
export const uploadKnowledge = (formData) => api.post('/admin/knowledge', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getKnowledgeFiles = () => api.get('/admin/knowledge');

export default api; 