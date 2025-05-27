import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import Login from './components/Login';
import AddDeviceForm from './components/AddDeviceForm';
import BulkUploadDevices from './components/BulkUploadDevices';
import DevicesList from './components/DevicesList';
import AddIpForm from './components/AddIpForm';
import BulkAddIps from './components/BulkAddIps';
import IpAddressList from './components/IpAddressList';
import AddClientForm from './components/AddClientForm';
import ClientsList from './components/ClientsList';
import ClientsByArea from './components/ClientsByArea';
import { api } from './utils/api';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token');
        }
        await api.verifyToken();
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (loading) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="devices">
            <Route path="add" element={<AddDeviceForm />} />
            <Route path="bulk-add" element={<BulkUploadDevices />} />
            <Route path="list" element={<DevicesList />} />
          </Route>
          <Route path="ips">
            <Route path="add" element={<AddIpForm />} />
            <Route path="bulk-add" element={<BulkAddIps />} />
            <Route path="list" element={<IpAddressList />} />
          </Route>
          <Route path="clients">
            <Route path="add" element={<AddClientForm />} />
            <Route path="list" element={<ClientsList />} />
            <Route path="by-area" element={<ClientsByArea />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;