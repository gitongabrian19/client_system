import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AddClientForm from './components/AddClientForm';
import AddDeviceForm from './components/AddDeviceForm';
import AddIpForm from './components/AddIpForm';
import BulkAddIps from './components/BulkAddIps';
import BulkUploadDevices from './components/BulkUploadDevices';
import ClientsByArea from './components/ClientsByArea';
import ClientsList from './components/ClientsList';
import DevicesList from './components/DevicesList';
import Home from './components/Home';
import IpAddressList from './components/IpAddressList';
import Layout from './components/Layout';
import LocationManagement from './components/LocationManagement';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import SMSManagement from './components/SMSManagement';

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
          <Route path="locations" element={<LocationManagement />} />
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
            <Route path="sms" element={<SMSManagement />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;