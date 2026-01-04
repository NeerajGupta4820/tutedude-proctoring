// client/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================
// Auth API (/api/auth)
// ========================
export const authApi = {
  signup: async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
};

// ========================
// Candidate API (/api/candidate)
// ========================
export const candidateApi = {
  create: async (formData) => {
    const response = await apiClient.post('/candidate/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get('/candidate/all');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/candidate/${id}`);
    return response.data;
  },

  update: async (id, formData) => {
    const response = await apiClient.put(`/candidate/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/candidate/${id}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await apiClient.get('/candidate/profile/me');
    return response.data;
  },

  updateMyProfile: async (formData) => {
    const response = await apiClient.put('/candidate/profile/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  resetPassword: async (email) => {
    const response = await apiClient.post('/candidate/password/reset', {
      email,
    });
    return response.data;
  },

  updatePassword: async (passwordData) => {
    const response = await apiClient.put(
      '/candidate/password/update',
      passwordData
    );
    return response.data;
  },

  approve: async (candidateId) => {
    const response = await apiClient.post(`/candidate/${candidateId}/approve`);
    return response.data;
  },

  reject: async (candidateId) => {
    const response = await apiClient.post(`/candidate/${candidateId}/reject`);
    return response.data;
  },
};

// ========================
// Interviewer API (/api/interviewer)
// ========================
export const interviewerApi = {
  getAll: async () => {
    const response = await apiClient.get('/interviewer/all');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/interviewer/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/interviewer/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/interviewer/${id}`);
    return response.data;
  },

  approveCandidate: async (interviewerId, candidateId) => {
    const response = await apiClient.post(
      `/interviewer/${interviewerId}/approve-candidate/${candidateId}`
    );
    return response.data;
  },

  revokeCandidate: async (interviewerId, candidateId) => {
    const response = await apiClient.post(
      `/interviewer/${interviewerId}/revoke-candidate/${candidateId}`
    );
    return response.data;
  },

  getPendingCandidates: async (interviewerId) => {
    const response = await apiClient.get(
      `/interviewer/${interviewerId}/pending-candidates`
    );
    return response.data;
  },

  getApprovedCandidates: async (interviewerId) => {
    const response = await apiClient.get(
      `/interviewer/${interviewerId}/approved-candidates`
    );
    return response.data;
  },
};

// ========================
// Meeting API (/api/meeting)
// ========================
export const meetingApi = {
  create: async (meetingData) => {
    const response = await apiClient.post('/meeting', meetingData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get('/meeting');
    return response.data;
  },

  getById: async (meetingId) => {
    const response = await apiClient.get(`/meeting/${meetingId}`);
    return response.data;
  },

  update: async (meetingId, meetingData) => {
    const response = await apiClient.patch(
      `/meeting/${meetingId}`,
      meetingData
    );
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get('/meeting/users');
    return response.data;
  },

  getNext: async () => {
    const response = await apiClient.get('/meeting/next');
    return response.data;
  },

  getEditorState: async (meetingId) => {
    const response = await apiClient.get(`/meeting/${meetingId}/editor-state`);
    return response.data;
  },

  setEditorState: async (meetingId, editorState) => {
    const response = await apiClient.post(
      `/meeting/${meetingId}/editor-state`,
      editorState
    );
    return response.data;
  },
};

// ========================
// Question API (/api/question)
// ========================
export const questionApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/question', { params });
    return response.data;
  },

  getById: async (questionId) => {
    const response = await apiClient.get(`/question/${questionId}`);
    return response.data;
  },

  getBySlug: async (slug) => {
    const response = await apiClient.get(`/question/slug/${slug}`);
    return response.data;
  },

  getByCategory: async (category) => {
    const response = await apiClient.get(`/question/category/${category}`);
    return response.data;
  },

  getByDifficulty: async (difficulty) => {
    const response = await apiClient.get(`/question/difficulty/${difficulty}`);
    return response.data;
  },

  // Admin routes
  create: async (questionData) => {
    const response = await apiClient.post('/question', questionData);
    return response.data;
  },

  update: async (questionId, questionData) => {
    const response = await apiClient.patch(
      `/question/${questionId}`,
      questionData
    );
    return response.data;
  },

  delete: async (questionId) => {
    const response = await apiClient.delete(`/question/${questionId}`);
    return response.data;
  },

  bulkCreate: async (questions) => {
    const response = await apiClient.post('/question/bulk', { questions });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/question/stats/overview');
    return response.data;
  },
};

// ========================
// Code Execution API (/api/code)
// ========================
export const codeApi = {
  // Run code (sample test cases only)
  run: async ({ code, language, questionId }) => {
    const response = await apiClient.post('/code/run', {
      code,
      language,
      questionId,
    });
    return response.data;
  },

  // Submit code (all test cases + save result)
  submit: async ({ code, language, questionId, meetingId, candidateId }) => {
    const response = await apiClient.post('/code/submit', {
      code,
      language,
      questionId,
      meetingId,
      candidateId,
    });
    return response.data;
  },

  // Get single submission
  getSubmission: async (submissionId) => {
    const response = await apiClient.get(`/code/submissions/${submissionId}`);
    return response.data;
  },

  // Get all submissions for a meeting
  getMeetingSubmissions: async (meetingId) => {
    const response = await apiClient.get(
      `/code/submissions/meeting/${meetingId}`
    );
    return response.data;
  },

  // Get submissions for specific question in meeting
  getQuestionSubmissions: async (meetingId, questionId) => {
    const response = await apiClient.get(
      `/code/submissions/meeting/${meetingId}/question/${questionId}`
    );
    return response.data;
  },

  // Add feedback to submission
  addFeedback: async (submissionId, feedback) => {
    const response = await apiClient.patch(
      `/code/submissions/${submissionId}/feedback`,
      { feedback }
    );
    return response.data;
  },

  // Get candidate stats
  getCandidateStats: async (candidateId) => {
    const response = await apiClient.get(
      `/code/stats/candidate/${candidateId}`
    );
    return response.data;
  },

  // Get latest submission
  getLatestSubmission: async (meetingId, questionId, candidateId) => {
    const response = await apiClient.get(
      `/code/latest/${meetingId}/${questionId}/${candidateId}`
    );
    return response.data;
  },
};

// ========================
// Interview Results API (/api/interview-results)
// ========================
export const interviewResultApi = {
  getAll: async () => {
    const response = await apiClient.get('/interview-results');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get('/interview-results/stats/dashboard');
    return response.data;
  },

  getByMeeting: async (meetingId) => {
    const response = await apiClient.get(
      `/interview-results/meeting/${meetingId}`
    );
    return response.data;
  },

  getByCandidate: async (candidateId) => {
    const response = await apiClient.get(
      `/interview-results/candidate/${candidateId}`
    );
    return response.data;
  },

  updateEvaluation: async (resultId, evaluation) => {
    const response = await apiClient.patch(
      `/interview-results/${resultId}/evaluation`,
      evaluation
    );
    return response.data;
  },

  updateFinalResult: async (resultId, result) => {
    const response = await apiClient.patch(
      `/interview-results/${resultId}/result`,
      result
    );
    return response.data;
  },

  addFeedback: async (resultId, feedback) => {
    const response = await apiClient.patch(
      `/interview-results/${resultId}/feedback`,
      { feedback }
    );
    return response.data;
  },

  updateQuestionRating: async (resultId, questionId, rating) => {
    const response = await apiClient.patch(
      `/interview-results/${resultId}/question/${questionId}/rating`,
      { rating }
    );
    return response.data;
  },

  updateIntegrityFlags: async (resultId, flags) => {
    const response = await apiClient.patch(
      `/interview-results/${resultId}/integrity`,
      flags
    );
    return response.data;
  },
};

// ========================
// Chat API (/api/chats)
// ========================
export const chatApi = {
  getByRoomId: async (roomId) => {
    const response = await apiClient.get(`/chats/room/${roomId}`);
    return response.data;
  },

  getByMeeting: async (meetingId) => {
    const response = await apiClient.get(`/chats/meeting/${meetingId}`);
    return response.data;
  },

  sendMessage: async (meetingId, message) => {
    const response = await apiClient.post(`/chats/meeting/${meetingId}`, {
      message,
    });
    return response.data;
  },

  getStats: async (meetingId) => {
    const response = await apiClient.get(`/chats/meeting/${meetingId}/stats`);
    return response.data;
  },

  markAsRead: async (meetingId) => {
    const response = await apiClient.post(`/chats/meeting/${meetingId}/read`);
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await apiClient.delete(`/chats/message/${messageId}`);
    return response.data;
  },

  deleteAllChats: async (meetingId) => {
    const response = await apiClient.delete(`/chats/meeting/${meetingId}/all`);
    return response.data;
  },
};

// ========================
// Log API (/api/log)
// ========================
export const logApi = {
  create: async (logData) => {
    const response = await apiClient.post('/log', logData);
    return response.data;
  },
};

// ========================
// Report API (/api/report)
// ========================
export const reportApi = {
  get: async () => {
    const response = await apiClient.get('/report');
    return response.data;
  },
};

// Default export with all APIs
export default {
  auth: authApi,
  candidate: candidateApi,
  interviewer: interviewerApi,
  meeting: meetingApi,
  question: questionApi,
  code: codeApi,
  interviewResult: interviewResultApi,
  chat: chatApi,
  log: logApi,
  report: reportApi,
};
