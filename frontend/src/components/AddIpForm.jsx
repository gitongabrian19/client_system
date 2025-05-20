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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { api } from '../utils/api';

const AddIpForm = ({ devices = [], onSuccess }) => {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.addIpAddress(data);
      setNotification({
        open: true,
        message: 'IP address added successfully',
        severity: 'success'
      });
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.error || 'Error adding IP address',
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
        Add IP Address
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="IP Address"
          margin="normal"
          {...register('ip_address', {
            required: 'IP address is required',
            pattern: {
              value: /^(\d{1,3}\.){3}\d{1,3}$/,
              message: 'Invalid IP address format (e.g., 192.168.1.1)'
            }
          })}
          error={!!errors.ip_address}
          helperText={errors.ip_address?.message}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Device (Optional)</InputLabel>
          <Select
            label="Device (Optional)"
            defaultValue=""
            {...register('device_id')}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {devices.map((device) => (
              <MenuItem key={device.id} value={device.id}>
                {device.device_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
          Add IP Address
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

export default AddIpForm;
