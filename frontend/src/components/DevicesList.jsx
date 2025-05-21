import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { api } from '../utils/api';

const DevicesList = () => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);

  const loadDevices = async () => {
    try {
      const data = await api.getAllDevices();
      setDevices(data);
      setError(null);
    } catch (err) {
      console.error('Error loading devices:', err);
      setError('Failed to load devices');
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.deleteDevice(id);
      await loadDevices();
    } catch (err) {
      console.error('Error deleting device:', err);
      setError('Failed to delete device');
    }
  };

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Devices List
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Device Name</TableCell>
              <TableCell>MAC Address</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>{device.device_name}</TableCell>
                <TableCell>{device.mac_address}</TableCell>
                <TableCell>{device.location_name || 'No Location'}</TableCell>
                <TableCell>{device.description}</TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(device.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {devices.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No devices found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DevicesList;
