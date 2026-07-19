import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

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
  verifyAdminLogin: (email: string, otp: string) =>
    api.post("/api/auth/login/verify-otp", { email, otp }),
  refresh: () => api.post("/api/auth/refresh"),
  forgotPassword: (email: string) =>
    api.post("/api/auth/forgot-password", { email }),
  resetPassword: (email: string, otp: string, new_password: string) =>
    api.post("/api/auth/reset-password", { email, otp, new_password }),
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: (
    message: string,
    history: { role: string; content: string }[] = [],
    conversation_id?: string
  ) => api.post("/api/chat/message", { message, history, conversation_id }),
};

// ── Admin Stats ───────────────────────────────────────────────────────────────
export const adminStatsApi = {
  get: () => api.get("/api/admin/stats"),
};

// ── Admin Users ───────────────────────────────────────────────────────────────
export const adminUsersApi = {
  list: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append("search", search);
    return api.get(`/api/admin/users?${params}`);
  },
  get: (id: number) => api.get(`/api/admin/users/${id}`),
  update: (id: number, data: { is_active?: boolean; is_verified?: boolean; is_admin?: boolean }) =>
    api.put(`/api/admin/users/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/users/${id}`),
};

// ── Admin Jobs ────────────────────────────────────────────────────────────────
export const adminJobsApi = {
  list: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append("search", search);
    return api.get(`/api/admin/jobs?${params}`);
  },
  get: (id: number) => api.get(`/api/admin/jobs/${id}`),
  create: (data: {
    title: string;
    company: string;
    description: string;
    required_skills?: string[];
    location?: string;
    duration?: string;
    application_url?: string;
    salary_range?: string;
    remote_option?: string;
  }) => api.post("/api/admin/jobs", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/api/admin/jobs/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/jobs/${id}`),
};

// ── Admin Courses ─────────────────────────────────────────────────────────────
export const adminCoursesApi = {
  list: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append("search", search);
    return api.get(`/api/admin/courses?${params}`);
  },
  get: (id: number) => api.get(`/api/admin/courses/${id}`),
  create: (data: {
    title: string;
    provider: string;
    description: string;
    instructor?: string;
    required_skills?: string[];
    skills_gained?: string[];
    difficulty_level?: string;
    duration?: string;
    price?: string;
    course_url: string;
    rating?: number;
    category?: string;
  }) => api.post("/api/admin/courses", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/api/admin/courses/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/courses/${id}`),
};

// ── Admin Sync ────────────────────────────────────────────────────────────────
export const adminSyncApi = {
  sync: (updateJobs = true, updateCourses = true) =>
    api.post("/api/admin/sync-data", { update_jobs: updateJobs, update_courses: updateCourses }),
};

// ── Admin DB Stats ────────────────────────────────────────────────────────────
export const adminDbApi = {
  stats: () => api.get("/api/admin/db/stats"),
  systemInfo: () => api.get("/api/admin/system/info"),
};

export default api;
