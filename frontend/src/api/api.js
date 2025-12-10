// api.js

import axios from "axios";

// Base API (for public routes like login, signup, get all jobs)
const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// --- Interceptor for CANDIDATE token ("token") ---
const CandidateAPI = axios.create({
  baseURL: "http://127.0.0.1:8000",
});
CandidateAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Candidate token
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// --- Interceptor for HR token ("hr_token") ---
const HrAPI = axios.create({
  baseURL: "http://127.0.0.1:8000",
});
HrAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("hr_token"); // HR token
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// --- Interceptor for ADMIN token ("admin_token") ---
const AdminAPI = axios.create({
  baseURL: "http://127.0.0.1:8000",
});
AdminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token"); // Admin token
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));


// ========================================================
// PUBLIC / AUTH Endpoints (Use base API)
// ========================================================
// Candidate
export const createCandidate = (data) => API.post("/candidates/", data).then(res => res.data);
export const loginCandidate = (data) => API.post("/candidates/login", data).then(res => res.data);
// HR
export const loginHr = (data) => API.post("/hr/login", data).then(res => res.data);
// Admin
export const loginAdmin = (data) => API.post("/api/admin/login", data).then(res => res.data);


// ========================================================
// CANDIDATE Endpoints (Protected by CandidateAPI)
// ========================================================
export const getMe = () => CandidateAPI.get("/candidates/me").then(res => res.data);
export const updateCandidateProfile = (data) => CandidateAPI.put(`/candidates/profile`, data).then(res => res.data);
export const uploadCandidateResume = (formData) => CandidateAPI.post(`/candidates/upload-resume`, formData).then(res => res.data);
export const uploadCandidateLinkedinPdf = (formData) => CandidateAPI.post(`/candidates/upload-linkedin-pdf`, formData).then(res => res.data);
export const getApplicationsByCandidate = () => CandidateAPI.get(`/applications/candidate`).then(res => res.data);
export const changeCandidatePassword = (data) => CandidateAPI.put("/candidates/me/change-password", data).then(res => res.data);
export const deleteCandidateAccount = () => CandidateAPI.delete("/candidates/me").then(res => res.data);
export const createApplication = (formData) => CandidateAPI.post("/applications/apply", formData).then(res => res.data);

// NEW: Candidate Feedback
export const getMyFeedback = () => CandidateAPI.get("/candidates/my-feedback").then(res => res.data);


// ========================================================
// HR Endpoints (Protected by HrAPI)
// ========================================================
export const getHrMe = () => HrAPI.get(`/hr/me`).then(res => res.data);
export const getJobsByHr = (hr_id) => HrAPI.get(`/hr/${hr_id}/jobs`).then(res => res.data);
export const createJob = (jobData) => HrAPI.post("/jobs/", jobData).then(res => res.data);
export const getRankedApplicantsForJob = (job_id) => HrAPI.get(`/hr-views/jobs/${job_id}/rankings`).then(res => res.data);
export const getDashboardKpis = () => HrAPI.get('/hr/dashboard/kpis').then(res => res.data);
export const getDashboardJobSummaries = () => HrAPI.get('/hr/dashboard/job-summaries').then(res => res.data);
export const getDashboardApplicantVolume = () => HrAPI.get('/hr/dashboard/applicant-volume').then(res => res.data);
export const retryAnalysis = (applicationId) => HrAPI.post(`/analysis/retry/${applicationId}`).then(res => res.data);
export const rerunAnalysis = (applicationId, cvFile) => {
  const formData = new FormData();
  formData.append("file", cvFile);
  return HrAPI.post(`/analysis/rerun/${applicationId}`, formData).then(res => res.data);
};
export const changeHrPassword = (hrId, passwordData) => {
  return HrAPI.put(`/hr/${hrId}/change-password`, passwordData).then(res => res.data);
};
export const deleteHrAccount = (hrId) => {
  return HrAPI.delete(`/hr/${hrId}`).then(res => res.data);
};

// NEW: HR Feedback/Messaging
export const getAllHrApplicants = () => HrAPI.get('/hr/my-applicants/list').then(res => res.data);
export const getAvailableReports = (candid) => HrAPI.get(`/hr/my-applicants/reports/${candid}`).then(res => res.data);
export const sendFeedback = (feedbackData) => HrAPI.post('/hr/feedback', feedbackData).then(res => res.data);


// ========================================================
// ADMIN Endpoints (Protected by AdminAPI)
// ========================================================
export const getAdminMe = () => AdminAPI.get("/api/admin/me").then(res => res.data);

// NEW: Admin Dashboard Endpoints
export const getAdminDashboardKpis = () => AdminAPI.get("/admin-dashboard/kpis").then(res => res.data);
export const getAdminHrActivity = () => AdminAPI.get("/admin-dashboard/hr-activity").then(res => res.data);

// HR Management
export const createHr = (hrData) => AdminAPI.post("/hr/", hrData).then(res => res.data);
export const getAllHrUsers = () => AdminAPI.get("/api/admin/hr").then(res => res.data);
export const suspendHr = (hrId) => AdminAPI.post(`/api/admin/hr/${hrId}/suspend`).then(res => res.data);
export const activateHr = (hrId) => AdminAPI.post(`/api/admin/hr/${hrId}/activate`).then(res => res.data);
export const deleteHr = (hrId) => AdminAPI.delete(`/api/admin/hr/${hrId}`).then(res => res.data);
// Candidate Management
export const getAllCandidates = () => AdminAPI.get("/api/admin/candidates").then(res => res.data);
export const suspendCandidate = (candidateId) => AdminAPI.post(`/api/admin/candidates/${candidateId}/suspend`).then(res => res.data);
export const activateCandidate = (candidateId) => AdminAPI.post(`/api/admin/candidates/${candidateId}/activate`).then(res => res.data);
export const deleteCandidate = (candidateId) => AdminAPI.delete(`/api/admin/candidates/${candidateId}`).then(res => res.data);
//ADMIN PASSWORD RESET FUNCTIONS ---
export const adminResetHrPassword = (hrId, new_password) => 
  AdminAPI.put(`/api/admin/hr/${hrId}/reset-password`, { new_password }).then(res => res.data);
  
export const adminResetCandidatePassword = (candidateId, new_password) => 
  AdminAPI.put(`/api/admin/candidates/${candidateId}/reset-password`, { new_password }).then(res => res.data);

export const getSystemLogs = () => AdminAPI.get("/api/admin/system-logs").then(res => res.data);
// ========================================================
// PUBLIC Endpoints (No token needed)
// ========================================================
export const getJobs = () => API.get("/jobs/").then(res => res.data);