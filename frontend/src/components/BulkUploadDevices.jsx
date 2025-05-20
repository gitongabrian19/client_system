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

const BulkUploadDevices = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [textareaValue, setTextareaValue] = useState('');
  const fileInputRef = useRef();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const validateCsvData = (data) => {
    const requiredFields = ['device_name', 'mac_address'];
    const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

    return data.every(row => {
      return requiredFields.every(field => row[field]) &&
        macAddressRegex.test(row.mac_address);
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          if (!validateCsvData(results.data)) {
            throw new Error('Invalid data format in CSV');
          }
          await api.bulkAddDevices(results.data, 'json');
          setNotification({
            open: true,
            message: 'Devices added successfully',
            severity: 'success'
          });
          fileInputRef.current.value = '';
        } catch (error) {
          setNotification({
            open: true,
            message: error.message || 'Error adding devices',
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
      const devices = lines.map(line => {
        const [device_name, mac_address, location = '', description = ''] = line.split(',').map(s => s.trim());
        return { device_name, mac_address, location, description };
      });

      const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      const isValid = devices.every(d => 
        d.device_name && 
        d.mac_address && 
        macAddressRegex.test(d.mac_address)
      );

      if (!isValid) {
        throw new Error('Invalid data format. Each line should contain: device name, MAC address (optional: location, description)');
      }

      await api.bulkAddDevices(devices, 'json');
      setNotification({
        open: true,
        message: 'Devices added successfully',
        severity: 'success'
      });
      setTextareaValue('');
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Error adding devices',
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
        Bulk Add Devices
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
            CSV format: device_name, mac_address, location (optional), description (optional)
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
            placeholder="Enter one device per line:&#10;Device Name, MAC Address, Location (optional), Description (optional)"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleTextareaSubmit}
            fullWidth
          >
            Add Devices
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

export default BulkUploadDevices;
