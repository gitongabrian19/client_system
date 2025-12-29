import React, { useState, useEffect } from "react";
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
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { Send as SendIcon, History as HistoryIcon } from "@mui/icons-material";
import { api } from "../utils/api";

const SMSManagement = () => {
  const [locations, setLocations] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);
  const [message, setMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [smsHistory, setSmsHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const MAX_SMS_LENGTH = 160;

  useEffect(() => {
    fetchLocations();
    fetchClients();
    fetchSMSHistory();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await api.getLocations();
      setLocations(data);
    } catch (error) {
      showSnackbar("Failed to fetch locations", "error");
    }
  };

  const fetchClients = async () => {
    try {
      const data = await api.getAllClients();
      setClients(data);
    } catch (error) {
      showSnackbar("Failed to fetch clients", "error");
    }
  };

  const fetchSMSHistory = async () => {
    try {
      const data = await api.getSMSHistory();
      setSmsHistory(data);
    } catch (error) {
      showSnackbar("Failed to fetch SMS history", "error");
    }
  };

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
    setSelectedClients([]); // Clear selected clients when location changes
  };

  const handleClientSelect = (clientId) => {
    setSelectedClients((prev) => {
      if (prev.includes(clientId)) {
        return prev.filter((id) => id !== clientId);
      }
      return [...prev, clientId];
    });
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSendToLocation = async () => {
    if (!selectedLocation || !message.trim()) {
      showSnackbar("Please select a location and enter a message", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendSMSToLocation(selectedLocation, message.trim());
      const skipped = res.skipped || 0;
      if (skipped > 0) {
        showSnackbar(
          `SMS sent to ${res.recipients} recipients, skipped ${skipped} invalid contacts`,
          "warning"
        );
        console.warn('Skipped contacts:', res.invalidContacts);
      } else {
        showSnackbar("SMS sent successfully to all clients in the location");
      }
      setMessage("");
      fetchSMSHistory();
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || "Failed to send SMS",
        "error"
      );
    }
    setLoading(false);
  };

  const handleSendToAll = async () => {
    if (!message.trim()) {
      showSnackbar('Please enter a message', 'error');
      return;
    }

    // simple confirmation to avoid accidental broadcasts
    if (!window.confirm('Are you sure you want to send this message to ALL clients?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendSMSToAll(message.trim());
      const skipped = res.skipped || 0;
      if (skipped > 0) {
        showSnackbar(`SMS sent to ${res.recipients} recipients, skipped ${skipped} invalid contacts`, 'warning');
        console.warn('Skipped contacts:', res.invalidContacts);
      } else {
        showSnackbar('SMS sent to all clients successfully');
      }
      setMessage('');
      fetchSMSHistory();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to send SMS to all', 'error');
    }
    setLoading(false);
  };

  const handleSendToSelected = async () => {
    if (selectedClients.length === 0 || !message.trim()) {
      showSnackbar("Please select clients and enter a message", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendSMSToClients(selectedClients, message.trim());
      const skipped = res.skipped || 0;
      if (skipped > 0) {
        showSnackbar(
          `SMS sent to ${res.recipients} recipients, skipped ${skipped} invalid contacts`,
          "warning"
        );
        console.warn('Skipped contacts:', res.invalidContacts);
      } else {
        showSnackbar("SMS sent successfully to selected clients");
      }
      setMessage("");
      setSelectedClients([]);
      fetchSMSHistory();
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || "Failed to send SMS",
        "error"
      );
    }
    setLoading(false);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact_info.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderSendByLocation = () => (
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
        sx={{ mb: 1 }}
        error={message.length > MAX_SMS_LENGTH}
        helperText={`${message.length}/${MAX_SMS_LENGTH} characters ${
          message.length > MAX_SMS_LENGTH ? "(message too long)" : ""
        }`}
      />

      <Button
        fullWidth
        variant="contained"
        startIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
        onClick={() => {
          handleSendToLocation();
        }}
        disabled={
          !selectedLocation ||
          !message.trim() ||
          loading ||
          message.length > MAX_SMS_LENGTH
        }
      >
        {loading ? "Sending..." : "Send to All Clients in Location"}
      </Button>

      <Button
        fullWidth
        color="secondary"
        sx={{ mt: 1 }}
        variant="outlined"
        startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
        onClick={() => handleSendToAll()}
        disabled={
          !message.trim() || loading || message.length > MAX_SMS_LENGTH
        }
      >
        {loading ? 'Sending...' : 'Send to All Clients (DB)'}
      </Button>
    </Paper>
  );

  const renderSendToSelected = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Send to Selected Clients
      </Typography>

      <TextField
        fullWidth
        label="Search Clients"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      <List sx={{ maxHeight: 200, overflow: "auto", mb: 2 }}>
        {filteredClients.map((client) => (
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
                <Chip label="Selected" color="primary" size="small" />
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
        sx={{ mb: 1 }}
        error={message.length > MAX_SMS_LENGTH}
        helperText={`${message.length}/${MAX_SMS_LENGTH} characters ${
          message.length > MAX_SMS_LENGTH ? "(message too long)" : ""
        }`}
      />

      <Button
        fullWidth
        variant="contained"
        startIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
        onClick={() => {
          handleSendToSelected();
        }}
        disabled={
          selectedClients.length === 0 ||
          !message.trim() ||
          loading ||
          message.length > MAX_SMS_LENGTH
        }
      >
        {loading
          ? "Sending..."
          : `Send to Selected Clients (${selectedClients.length})`}
      </Button>
    </Paper>
  );

  const renderSMSHistory = () => (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          SMS History
        </Typography>
        <List>
          {smsHistory.map((sms, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {sms.recipients.map((r, i) => (
                    <span key={i}>
                      {r.name} ({r.contact}){i < sms.recipients.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {sms.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sent: {new Date(sms.timestamp).toLocaleString()}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Status: {sms.status}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </List>
      </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        SMS Management
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Send by Location" />
        <Tab label="Send to Selected" />
        <Tab label="SMS History" icon={<HistoryIcon />} iconPosition="end" />
      </Tabs>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {activeTab === 0 && renderSendByLocation()}
          {activeTab === 1 && renderSendToSelected()}
          {activeTab === 2 && renderSMSHistory()}
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SMSManagement;
