import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
    baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth endpoints
export const authAPI = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    getMe: () => api.get("/auth/me"),
};

// Group endpoints
export const groupAPI = {
    getGroups: () => api.get("/groups"),
    getGroup: (id) => api.get(`/groups/${id}`),
    createGroup: (data) => api.post("/groups", data),
    addMember: (groupId, data) => api.post(`/groups/${groupId}/members`, data),
    removeMember: (groupId, userId) =>
        api.delete(`/groups/${groupId}/members/${userId}`),
    updateMemberRole: (groupId, userId, data) =>
        api.patch(`/groups/${groupId}/members/${userId}/role`, data),
};

// Robot endpoints
export const robotAPI = {
    getRobots: () => api.get("/robots"),
    getRobot: (serialNumber) => api.get(`/robots/${serialNumber}`),
    createRobot: (data) => api.post("/robots", data),
    deleteRobot: (serialNumber) => api.delete(`/robots/${serialNumber}`),
    grantPermission: (serialNumber, data) =>
        api.post(`/robots/${serialNumber}/permissions`, data),
    revokePermission: (serialNumber, userId) =>
        api.delete(`/robots/${serialNumber}/permissions/${userId}`),
};

// Settings endpoints
export const settingsAPI = {
    getAllSettings: () => api.get("/settings"),
    getSettings: (serialNumber) => api.get(`/settings/${serialNumber}`),
    saveSettings: (serialNumber, data) =>
        api.post(`/settings/${serialNumber}`, data),
};

export default api;
