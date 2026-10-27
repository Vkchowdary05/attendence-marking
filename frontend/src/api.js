import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginApi = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
};

export const getStudents = async (department) => {
  const params = department && department !== 'ALL' ? { department } : {};
  const res = await api.get('/students', { params });
  return res.data;
};

export const createStudent = async (studentData) => {
  const res = await api.post('/students', studentData);
  return res.data;
};

export const bulkCreateStudents = async (studentsList) => {
  const res = await api.post('/students/bulk', studentsList);
  return res.data;
};

export const updateStudent = async (id, studentData) => {
  const res = await api.put(`/students/${id}`, studentData);
  return res.data;
};

export const deleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}`);
  return res.data;
};

export const getDepartments = async () => {
  const res = await api.get('/students/departments');
  return res.data;
};

export const resetSampleData = async () => {
  const res = await api.post('/students/reset-sample-data');
  return res.data;
};

export const getDailyAttendance = async (date, department) => {
  const params = { date };
  if (department && department !== 'ALL') {
    params.department = department;
  }
  const res = await api.get('/attendance/daily', { params });
  return res.data;
};

export const saveDailyAttendance = async (payload) => {
  const res = await api.post('/attendance/daily', payload);
  return res.data;
};

export const markAllAttendance = async (date, department, status) => {
  const params = { date, status };
  if (department && department !== 'ALL') {
    params.department = department;
  }
  const res = await api.post('/attendance/mark-all', null, { params });
  return res.data;
};

export const getMonthlySummary = async (year, month, department, threshold = 75.0) => {
  const params = { year, month, threshold };
  if (department && department !== 'ALL') {
    params.department = department;
  }
  const res = await api.get('/attendance/monthly-summary', { params });
  return res.data;
};

export const getStudentMonthlyDetail = async (studentId, year, month) => {
  const params = { studentId, year, month };
  const res = await api.get('/attendance/student-monthly', { params });
  return res.data;
};

export const getMonthlyCsvDownloadUrl = (year, month, department, threshold = 75.0) => {
  let url = `${API_BASE}/attendance/export-monthly-csv?year=${year}&month=${month}&threshold=${threshold}`;
  if (department && department !== 'ALL') {
    url += `&department=${encodeURIComponent(department)}`;
  }
  return url;
};

export const getDailyCsvDownloadUrl = (date, department) => {
  let url = `${API_BASE}/attendance/export-daily-csv?date=${date}`;
  if (department && department !== 'ALL') {
    url += `&department=${encodeURIComponent(department)}`;
  }
  return url;
};

export const getDashboardStats = async (department) => {
  const params = department && department !== 'ALL' ? { department } : {};
  const res = await api.get('/dashboard/stats', { params });
  return res.data;
};

export default api;
