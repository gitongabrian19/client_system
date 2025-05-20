import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import AddDeviceForm from './components/AddDeviceForm';
import BulkUploadDevices from './components/BulkUploadDevices';
import DevicesList from './components/DevicesList';
import AddIpForm from './components/AddIpForm';
import BulkAddIps from './components/BulkAddIps';
import IpAddressList from './components/IpAddressList';
import AddClientForm from './components/AddClientForm';
import ClientsList from './components/ClientsList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
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
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;