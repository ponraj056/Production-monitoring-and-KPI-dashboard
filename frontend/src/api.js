const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get the stored token
const getToken = () => localStorage.getItem('token');

// Generic fetch wrapper that adds auth header automatically
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Auth
  login: (username, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (username, password, role) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    }),

  // Machines
  getMachines: () => apiRequest('/machines'),
  getMachineStats: (id, timeRange = 'all') => apiRequest(`/machines/${id}/stats?timeRange=${timeRange}`),
  createMachine: (machine) =>
    apiRequest('/machines', {
      method: 'POST',
      body: JSON.stringify(machine),
    }),
  updateMachine: (id, machine) =>
    apiRequest(`/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(machine),
    }),
  deleteMachine: (id) =>
    apiRequest(`/machines/${id}`, { method: 'DELETE' }),

  // Production Logs
  getProductionLogs: (timeRange = 'all') => apiRequest(`/production-logs?timeRange=${timeRange}`),
  createProductionLog: (log) =>
    apiRequest('/production-logs', {
      method: 'POST',
      body: JSON.stringify(log),
    }),

  // Downtime Logs
  getDowntimeLogs: (timeRange = 'all') => apiRequest(`/downtime-logs?timeRange=${timeRange}`),
  createDowntimeLog: (log) =>
    apiRequest('/downtime-logs', {
      method: 'POST',
      body: JSON.stringify(log),
    }),

  // KPI
  getKpiSummary: (machineId, timeRange = 'all') =>
    apiRequest(`/kpi?timeRange=${timeRange}${machineId ? `&machine_id=${machineId}` : ''}`),
};