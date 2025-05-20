import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import Papa from 'papaparse';
import { api } from '../utils/api';

const BulkAddIps = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [textareaValue, setTextareaValue] = useState('');
  const fileInputRef = useRef();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const validateIpAddress = (ip) => {
    const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!regex.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const ips = results.data.map(row => ({
            ip_address: row.ip_address,
            description: row.description || ''
          }));

          const invalidIps = ips.filter(ip => !validateIpAddress(ip.ip_address));
          if (invalidIps.length > 0) {
            throw new Error('Invalid IP addresses found in CSV');
          }

          await api.bulkAddIpAddresses(ips, 'json');
          setNotification({
            open: true,
            message: 'IP addresses added successfully',
            severity: 'success'
          });
          if (onSuccess) onSuccess();
          fileInputRef.current.value = '';
        } catch (error) {
          setNotification({
            open: true,
            message: error.message || 'Error adding IP addresses',
            severity: 'error'
          });
        }
      },
      error: (error) => {
        setNotification({
          open: true,
          message: 'Error parsing CSV file',
          severity: 'error'
        });
      }
    });
  };

  const handleTextareaSubmit = async () => {
    try {
      const lines = textareaValue.trim().split('\\n');
      const ips = lines.map(line => {
        const [ip_address, description = ''] = line.split(',').map(s => s.trim());
        return { ip_address, description };
      });

      const invalidIps = ips.filter(ip => !validateIpAddress(ip.ip_address));
      if (invalidIps.length > 0) {
        throw new Error('Invalid IP addresses found in input');
      }

      await api.bulkAddIpAddresses(ips, 'json');
      setNotification({
        open: true,
        message: 'IP addresses added successfully',
        severity: 'success'
      });
      if (onSuccess) onSuccess();
      setTextareaValue('');
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Error adding IP addresses',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Bulk Add IP Addresses
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="CSV Upload" />
          <Tab label="Text Input" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current.click()}
            fullWidth
          >
            Upload CSV File
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            CSV format: ip_address, description (optional)
          </Typography>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder="Enter one IP address per line:&#10;IP Address, Description (optional)"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleTextareaSubmit}
            fullWidth
          >
            Add IP Addresses
          </Button>
        </Box>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default BulkAddIps;
