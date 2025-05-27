import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';

const SMSManagement = () => {
  const [locations, setLocations] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  const [message, setMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [smsHistory, setSmsHistory] = useState([]);

  useEffect(() => {
    fetchLocations();
    fetchClients();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/locations');
      setLocations(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch locations', 'error');
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients/list');
      setClients(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch clients', 'error');
    }
  };

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
    setSelectedClients([]); // Clear selected clients when location changes
  };

  const handleClientSelect = (clientId) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      }
      return [...prev, clientId];
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSendToLocation = async () => {
    if (!selectedLocation || !message.trim()) {
      showSnackbar('Please select a location and enter a message', 'error');
      return;
    }

    try {
      await axios.post('/api/sms/send-by-location', {
        locationId: selectedLocation,
        message: message.trim()
      });
      showSnackbar('SMS sent successfully to all clients in the location');
      setMessage('');
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to send SMS', 'error');
    }
  };

  const handleSendToSelected = async () => {
    if (selectedClients.length === 0 || !message.trim()) {
      showSnackbar('Please select clients and enter a message', 'error');
      return;
    }

    try {
      await axios.post('/api/sms/send', {
        recipients: selectedClients,
        message: message.trim()
      });
      showSnackbar('SMS sent successfully to selected clients');
      setMessage('');
      setSelectedClients([]);
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to send SMS', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        SMS Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Send by Location
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Location</InputLabel>
              <Select
                value={selectedLocation}
                onChange={handleLocationChange}
                label="Location"
              >
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSendToLocation}
              disabled={!selectedLocation || !message.trim()}
            >
              Send to All Clients in Location
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Send to Selected Clients
            </Typography>
            <List sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
              {clients.map((client) => (
                <React.Fragment key={client.id}>
                  <ListItem
                    button
                    onClick={() => handleClientSelect(client.id)}
                    selected={selectedClients.includes(client.id)}
                  >
                    <ListItemText
                      primary={client.name}
                      secondary={client.contact_info}
                    />
                    {selectedClients.includes(client.id) && (
                      <Chip
                        label="Selected"
                        color="primary"
                        size="small"
                      />
                    )}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSendToSelected}
              disabled={selectedClients.length === 0 || !message.trim()}
            >
              Send to Selected Clients ({selectedClients.length})
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SMSManagement; 