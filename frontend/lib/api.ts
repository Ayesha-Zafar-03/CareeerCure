import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; full_name: string; password: string }) =>
    api.post("/api/auth/register", data),

  verifyEmail: (email: string, otp: string) =>
    api.post("/api/auth/verify-email", { email, otp }),

  resendOtp: (email: string, purpose: string = "email_verification") =>
    api.post("/api/auth/resend-otp", { email, purpose }),

  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return api.post("/api/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  refresh: () => api.post("/api/auth/refresh"),

  forgotPassword: (email: string) =>
    api.post("/api/auth/forgot-password", { email }),

  resetPassword: (email: string, otp: string, new_password: string) =>
    api.post("/api/auth/reset-password", { email, otp, new_password }),

  changePassword: (current_password: string, new_password: string) =>
    api.post("/api/auth/change-password", { current_password, new_password }),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  getMe: () => api.get("/api/profile/me"),
  updateMe: (data: object) => api.put("/api/profile/me", data),
};

// ── CV ────────────────────────────────────────────────────────────────────────
export const cvApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/api/cv/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getAnalysis: () => api.get("/api/cv/analysis"),
};

// ── Roadmap ───────────────────────────────────────────────────────────────────
export const roadmapApi = {
  generate: (career_goal: string) =>
    api.post("/api/roadmap/generate", { career_goal }),
  list: () => api.get("/api/roadmap/list"),
  get: (id: number) => api.get(`/api/roadmap/${id}`),
};

// ── Internships ───────────────────────────────────────────────────────────────
export const internshipsApi = {
  list: (skip = 0, limit = 20) =>
    api.get(`/api/internships/list?skip=${skip}&limit=${limit}`),
  getMatches: () => api.get("/api/internships/matches"),
  get: (id: number) => api.get(`/api/internships/${id}`),
};

// ── Chatbot ───────────────────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: (message: string, history: { role: string; content: string }[]) =>
    api.post("/api/chat/message", { message, history }),
};

export default api;
