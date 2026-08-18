import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && typeof window !== "undefined") {
  console.error(
    "❌ NEXT_PUBLIC_API_URL is not set! " +
    "Please set it in Vercel Environment Variables to your backend URL (e.g., https://your-api.vercel.app)"
  );
}

const api = axios.create({
  baseURL: API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30 second timeout
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

// Handle 401 — redirect to login (avoid redirect loops on auth endpoints)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url || "";
    const isAuthEndpoint = url.includes("/api/auth/");
    if (status === 401 && typeof window !== "undefined" && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
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

  changePassword: (current_password: string, new_password: string) =>
    api.post("/api/auth/change-password", { current_password, new_password }),

  getMe: () =>
    api.get<{ id: number; email: string; full_name: string; is_active: boolean; is_admin: boolean }>("/api/auth/me"),

  getOAuthStatus: () =>
    api.get<{
      google_configured: boolean;
      linkedin_configured: boolean;
      oauth_available: boolean;
    }>("/api/auth/oauth/status"),
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
  
  generate: (data: {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    target_role?: string;
    experience_years?: string;
    summary?: string;
    education?: string;
    work_experience?: string;
    skills?: string;
    projects?: string;
    certifications?: string;
    languages?: string;
    achievements?: string;
    use_ai_enhancement?: boolean;
  }) => api.post("/api/cv/generate", data),
  
  rebuild: (target_role: string = "", file?: File) => {
    const form = new FormData();
    if (file) {
      form.append("file", file);
    }
    form.append("target_role", target_role);
    return api.post("/api/cv/rebuild", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  
  downloadPdf: async () => {
    const response = await api.get("/api/cv/download-pdf", {
      responseType: "blob"
    });
    return response;
  },

  generatePdf: (cv_text: string, full_name: string = "") =>
    api.post("/api/cv/generate-pdf", { cv_text, full_name }, {
      responseType: "blob",
    }),
  
  preview: () => api.get("/api/cv/preview"),
};

// ── Roadmap ───────────────────────────────────────────────────────────────────
export const roadmapApi = {
  generate: (career_goal: string) =>
    api.post("/api/roadmap/generate", { career_goal }),
  list: () => api.get("/api/roadmap/list"),
  get: (id: number) => api.get(`/api/roadmap/${id}`),
  delete: (id: number) => api.delete(`/api/roadmap/${id}`),
};

// ── Internships ───────────────────────────────────────────────────────────────
export const internshipsApi = {
  list: (skip = 0, limit = 20) =>
    api.get(`/api/internships/list?skip=${skip}&limit=${limit}`),
  getMatches: () => api.get("/api/internships/matches"),
  get: (id: number) => api.get(`/api/internships/${id}`),
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const coursesApi = {
  list: (skip = 0, limit = 20, category?: string, difficulty?: string, provider?: string, price_filter?: string) => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (category) params.append("category", category);
    if (difficulty) params.append("difficulty", difficulty);
    if (provider) params.append("provider", provider);
    if (price_filter) params.append("price_filter", price_filter);
    return api.get(`/api/courses/list?${params}`);
  },
  getMatches: () => api.get("/api/courses/matches"),
  get: (id: number) => api.get(`/api/courses/${id}`),
  getCategories: () => api.get("/api/courses/categories"),
  getProviders: () => api.get("/api/courses/providers"),
};

// ── Chatbot ───────────────────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: (message: string, history: { role: string; content: string }[], conversationId?: string) =>
    api.post("/api/chat/message", { message, history, conversation_id: conversationId }),
};

// ── Chat history (persisted) ──────────────────────────────────────────────────
export const chatHistoryApi = {
  get: (conversationId: string = "default") =>
    api.get("/api/chat/history", { params: { conversation_id: conversationId } }),
  clear: (conversationId?: string) =>
    api.delete("/api/chat/history", { params: conversationId ? { conversation_id: conversationId } : {} }),
  listConversations: () => api.get("/api/chat/conversations"),
};

// ── Planned courses (persisted) ───────────────────────────────────────────────
export const planApi = {
  list: () => api.get("/api/plan/list"),
  add: (course: {
    id: number;
    title: string;
    provider?: string;
    course_url?: string;
    duration?: string;
    difficulty_level?: string;
    description?: string;
    roadmap?: string;
  }) => api.post("/api/plan/add", course),
  remove: (courseId: number) => api.delete(`/api/plan/remove/${courseId}`),
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

// ── Applications (auto-apply) ──────────────────────────────────────────────────
export const applicationsApi = {
  apply: (jobId: number) => api.post("/api/applications/apply", { job_id: jobId }),
  list: () => api.get("/api/applications"),
  get: (id: number) => api.get(`/api/applications/${id}`),
  withdraw: (id: number) => api.post(`/api/applications/${id}/withdraw`),
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
    title: string; company: string; description: string; required_skills?: string[];
    location?: string; duration?: string; application_url?: string; salary_range?: string; remote_option?: string;
  }) => api.post("/api/admin/jobs", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/admin/jobs/${id}`, data),
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
    title: string; provider: string; description: string; instructor?: string;
    required_skills?: string[]; skills_gained?: string[]; difficulty_level?: string;
    duration?: string; price?: string; course_url: string; rating?: number; category?: string;
  }) => api.post("/api/admin/courses", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/admin/courses/${id}`, data),
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
