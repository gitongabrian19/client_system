import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL
});

// Add token to requests if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  verifyToken: async () => {
    const response = await axiosInstance.get('/auth/verify');
    return response.data;
  },

  // Device Management
  getAllDevices: async () => {
    const response = await axiosInstance.get('/devices');
    return response.data;
  },

  addDevice: async (deviceData) => {
    const response = await axiosInstance.post('/devices', deviceData);
    return response.data;
  },

  bulkAddDevices: async (data, type = 'json') => {
    const response = await axiosInstance.post('/devices/bulk', {
      type,
      devices: type === 'json' ? data : undefined,
      data: type === 'csv' ? data : undefined,
    });
    return response.data;
  },

  deleteDevice: async (id) => {
    const response = await axiosInstance.delete(`/devices/${id}`);
    return response.data;
  },

  // IP Management
  getAllIpAddresses: async () => {
    const response = await axiosInstance.get('/ips');
    return response.data;
  },

  getDeviceIpAddresses: async (deviceId) => {
    const response = await axiosInstance.get(`/ips/device/${deviceId}`);
    return response.data;
  },

  addIpAddress: async (ipData) => {
    const response = await axiosInstance.post('/ips', ipData);
    return response.data;
  },

  bulkAddIpAddresses: async (ips) => {
    const response = await axiosInstance.post('/ips/bulk', { ips });
    return response.data;
  },

  assignIpToDevice: async (ipId, deviceId) => {
    const response = await axiosInstance.put(`/ips/${ipId}/assign/${deviceId}`);
    return response.data;
  },

  unassignIp: async (ipId) => {
    const response = await axiosInstance.put(`/ips/${ipId}/unassign`);
    return response.data;
  },

  deleteIpAddress: async (id) => {
    const response = await axiosInstance.delete(`/ips/${id}`);
    return response.data;
  },

  // Client Management
  getAllClients: async () => {
    const response = await axiosInstance.get('/clients');
    return response.data;
  },

  getClientsByArea: async () => {
    const response = await axiosInstance.get('/clients/by-area');
    return response.data;
  },

  getAvailableIps: async (deviceId = null) => {
    try {
      const url = deviceId 
        ? `/clients/available-ips/${deviceId}`
        : `/clients/available-ips`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error getting available IPs:', error);
      throw error;
    }
  },

  // Location Management
  getLocations: async () => {
    const response = await axiosInstance.get('/locations');
    return response.data;
  },

  addLocation: async (locationData) => {
    const response = await axiosInstance.post('/locations', locationData);
    return response.data;
  },

  updateLocation: async (id, locationData) => {
    const response = await axiosInstance.put(`/locations/${id}`, locationData);
    return response.data;
  },

  deleteLocation: async (id) => {
    const response = await axiosInstance.delete(`/locations/${id}`);
    return response.data;
  },

  addClient: async (clientData) => {
    const response = await axiosInstance.post('/clients', clientData);
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await axiosInstance.put(`/clients/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await axiosInstance.delete(`/clients/${id}`);
    return response.data;
  },

  bulkAddClients: async (data, type = 'json') => {
    const response = await axiosInstance.post('/clients/bulk', {
      type,
      clients: type === 'json' ? data : undefined,
      data: type === 'csv' ? data : undefined,
    });
    return response.data;
  },

  // SMS Management
  sendSMSToLocation: async (locationId, message) => {
    const response = await axiosInstance.post('/sms/send-by-location', {
      locationId,
      message
    });
    return response.data;
  },

  sendSMSToClients: async (recipients, message) => {
    const response = await axiosInstance.post('/sms/send', {
      recipients,
      message
    });
    return response.data;
  },

  getSMSHistory: async () => {
    const response = await axiosInstance.get('/sms/history');
    return response.data;
  },
};
