import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const api = {
  // Device Management
  getAllDevices: async () => {
    const response = await axios.get(`${API_URL}/devices`);
    return response.data;
  },

  addDevice: async (deviceData) => {
    const response = await axios.post(`${API_URL}/devices`, deviceData);
    return response.data;
  },

  bulkAddDevices: async (data, type = 'json') => {
    const response = await axios.post(`${API_URL}/devices/bulk`, {
      type,
      devices: type === 'json' ? data : undefined,
      data: type === 'csv' ? data : undefined,
    });
    return response.data;
  },

  deleteDevice: async (id) => {
    const response = await axios.delete(`${API_URL}/devices/${id}`);
    return response.data;
  },

  // IP Management
  getAllIpAddresses: async () => {
    const response = await axios.get(`${API_URL}/ips`);
    return response.data;
  },

  getDeviceIpAddresses: async (deviceId) => {
    const response = await axios.get(`${API_URL}/ips/device/${deviceId}`);
    return response.data;
  },

  addIpAddress: async (ipData) => {
    const response = await axios.post(`${API_URL}/ips`, ipData);
    return response.data;
  },

  bulkAddIpAddresses: async (data, type = 'json') => {
    const response = await axios.post(`${API_URL}/ips/bulk`, {
      type,
      ips: type === 'json' ? data : undefined,
      data: type === 'csv' ? data : undefined,
    });
    return response.data;
  },

  assignIpToDevice: async (ipId, deviceId) => {
    const response = await axios.put(`${API_URL}/ips/${ipId}/assign/${deviceId}`);
    return response.data;
  },

  unassignIp: async (ipId) => {
    const response = await axios.put(`${API_URL}/ips/${ipId}/unassign`);
    return response.data;
  },

  deleteIpAddress: async (id) => {
    const response = await axios.delete(`${API_URL}/ips/${id}`);
    return response.data;
  },

  // Client Management
  getAllClients: async () => {
    const response = await axios.get(`${API_URL}/clients`);
    return response.data;
  },

  getAvailableIps: async (deviceId = null) => {
    const url = deviceId 
      ? `${API_URL}/clients/available-ips/${deviceId}`
      : `${API_URL}/clients/available-ips`;
    const response = await axios.get(url);
    return response.data;
  },

  getLocations: async () => {
    const response = await axios.get(`${API_URL}/clients/locations`);
    return response.data;
  },

  addClient: async (clientData) => {
    const response = await axios.post(`${API_URL}/clients`, clientData);
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await axios.put(`${API_URL}/clients/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await axios.delete(`${API_URL}/clients/${id}`);
    return response.data;
  },

  bulkAddClients: async (data, type = 'json') => {
    const response = await axios.post(`${API_URL}/clients/bulk`, {
      type,
      clients: type === 'json' ? data : undefined,
      data: type === 'csv' ? data : undefined,
    });
    return response.data;
  },
};
