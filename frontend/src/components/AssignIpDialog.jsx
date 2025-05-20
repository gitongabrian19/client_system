import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { api } from '../utils/api';

const AssignIpDialog = ({ open, onClose, ip, devices, onAssign }) => {
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState(null);

  const handleAssign = async () => {
    try {
      if (deviceId) {
        await api.assignIpToDevice(ip.id, deviceId);
      } else {
        await api.unassignIp(ip.id);
      }
      onAssign();
      onClose();
    } catch (err) {
      setError('Failed to assign IP address');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Assign IP Address: {ip?.ip_address}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Device</InputLabel>
          <Select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            label="Device"
          >
            <MenuItem value="">
              <em>Unassign</em>
            </MenuItem>
            {devices.map((device) => (
              <MenuItem key={device.id} value={device.id}>
                {device.device_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAssign} color="primary">
          {deviceId ? 'Assign' : 'Unassign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignIpDialog;
