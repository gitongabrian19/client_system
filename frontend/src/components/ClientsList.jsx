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
  Edit as EditIcon,
} from '@mui/icons-material';
import { api } from '../utils/api';

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);

  const loadClients = async () => {
    try {
      const data = await api.getAllClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError('Failed to load clients');
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.deleteClient(id);
      await loadClients();
    } catch (err) {
      setError('Failed to delete client');
    }
  };

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Clients List
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Device</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.phone_number || '-'}</TableCell>
                <TableCell>{client.location || '-'}</TableCell>
                <TableCell>
                  {client.device_name ? (
                    <Chip
                      label={client.device_name}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {client.ip_address ? (
                    <Chip
                      label={client.ip_address}
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(client.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No clients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ClientsList;
