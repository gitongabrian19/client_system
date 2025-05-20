import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import { api } from '../utils/api';

const AddDeviceForm = () => {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.addDevice(data);
      setNotification({
        open: true,
        message: 'Device added successfully',
        severity: 'success'
      });
      reset();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.error || 'Error adding device',
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
        Add Device
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Device Name"
          margin="normal"
          {...register('device_name', { required: 'Device name is required' })}
          error={!!errors.device_name}
          helperText={errors.device_name?.message}
        />

        <TextField
          fullWidth
          label="MAC Address"
          margin="normal"
          {...register('mac_address', {
            required: 'MAC address is required',
            pattern: {
              value: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
              message: 'Invalid MAC address format (e.g., 00:1A:2B:3C:4D:5E)'
            }
          })}
          error={!!errors.mac_address}
          helperText={errors.mac_address?.message}
        />

        <TextField
          fullWidth
          label="Location"
          margin="normal"
          {...register('location')}
        />

        <TextField
          fullWidth
          label="Description"
          margin="normal"
          multiline
          rows={3}
          {...register('description')}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Add Device
        </Button>
      </Box>

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

export default AddDeviceForm;
