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
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { api } from '../utils/api';
import AssignIpDialog from './AssignIpDialog';

const IpAddressList = () => {
  const [ips, setIps] = useState([]);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [selectedIp, setSelectedIp] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const loadIps = async () => {
    try {
      const data = await api.getAllIpAddresses();
      setIps(data);
      setError(null);
    } catch (err) {
      setError('Failed to load IP addresses');
    }
  };

  const loadDevices = async () => {
    try {
      const data = await api.getAllDevices();
      setDevices(data);
    } catch (err) {
      setError('Failed to load devices');
    }
  };

  useEffect(() => {
    loadIps();
    loadDevices();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.deleteIpAddress(id);
      await loadIps();
    } catch (err) {
      setError('Failed to delete IP address');
    }
  };

  const handleAssignClick = (ip) => {
    setSelectedIp(ip);
    setAssignDialogOpen(true);
  };

  const handleAssignDialogClose = () => {
    setAssignDialogOpen(false);
    setSelectedIp(null);
  };

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        IP Addresses
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>IP Address</TableCell>
              <TableCell>Assigned Device</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ips.map((ip) => (
              <TableRow key={ip.id}>
                <TableCell>{ip.ip_address}</TableCell>
                <TableCell>
                  {ip.device_name ? (
                    <Chip
                      label={ip.device_name}
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label="Unassigned"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>{ip.description}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleAssignClick(ip)}
                    color="primary"
                  >
                    <LinkIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(ip.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {ips.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No IP addresses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedIp && (
        <AssignIpDialog
          open={assignDialogOpen}
          onClose={handleAssignDialogClose}
          ip={selectedIp}
          devices={devices}
          onAssign={loadIps}
        />
      )}
    </Paper>
  );
};

export default IpAddressList;
