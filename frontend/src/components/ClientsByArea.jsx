import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SmsIcon from '@mui/icons-material/Sms';
import { api } from '../utils/api';

const ClientsByArea = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [smsDialog, setSmsDialog] = useState({ open: false, locationId: null, locationName: '' });
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await api.getClientsByArea();
      setAreas(data);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error loading clients',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    try {
      await api.sendBulkSMS({
        locationId: smsDialog.locationId,
        message: message
      });
      
      setNotification({
        open: true,
        message: 'SMS sent successfully',
        severity: 'success'
      });
      
      handleCloseSmsDialog();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.error || 'Error sending SMS',
        severity: 'error'
      });
    }
  };

  const handleOpenSmsDialog = (locationId, locationName) => {
    setSmsDialog({ open: true, locationId, locationName });
  };

  const handleCloseSmsDialog = () => {
    setSmsDialog({ open: false, locationId: null, locationName: '' });
    setMessage('');
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Clients by Area
      </Typography>

      {areas.map((area) => (
        <Accordion key={area.location_id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{area.location_name || 'Unassigned'}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {JSON.parse(area.clients).map((client) => (
                client && client.id && (
                  <ListItem key={client.id}>
                    <ListItemText
                      primary={client.name}
                      secondary={`Device: ${client.device_name || 'N/A'} | IP: ${client.ip_address || 'N/A'}`}
                    />
                  </ListItem>
                )
              ))}
            </List>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SmsIcon />}
              onClick={() => handleOpenSmsDialog(area.location_id, area.location_name)}
              sx={{ mt: 2 }}
            >
              Send SMS to Area
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* SMS Dialog */}
      <Dialog open={smsDialog.open} onClose={handleCloseSmsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Send SMS to {smsDialog.locationName}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSmsDialog}>Cancel</Button>
          <Button 
            onClick={handleSendSMS} 
            variant="contained" 
            color="primary"
            disabled={!message.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientsByArea;
