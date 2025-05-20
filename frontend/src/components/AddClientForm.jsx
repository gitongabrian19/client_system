import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { api } from '../utils/api';

const AddClientForm = () => {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [devices, setDevices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [availableIps, setAvailableIps] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm();

  const selectedDevice = watch('device_id');

  // Load devices and locations on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [devicesData, locationsData] = await Promise.all([
          api.getAllDevices(),
          api.getLocations()
        ]);
        setDevices(devicesData);
        setLocations(locationsData);
      } catch (error) {
        setNotification({
          open: true,
          message: 'Error loading form data',
          severity: 'error'
        });
      }
    };
    loadData();
  }, []);

  // Load available IPs when device selection changes
  useEffect(() => {
    const loadAvailableIps = async () => {
      if (!selectedDevice) {
        setAvailableIps([]);
        return;
      }
      
      setLoading(true);
      try {
        const ips = await api.getAvailableIps(selectedDevice);
        setAvailableIps(ips);
      } catch (error) {
        setNotification({
          open: true,
          message: 'Error loading available IPs',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    loadAvailableIps();
  }, [selectedDevice]);

  const onSubmit = async (data) => {
    try {
      await api.addClient({
        ...data,
        device_id: data.device_id?.id,
        ip_id: data.ip_id?.id
      });
      setNotification({
        open: true,
        message: 'Client added successfully',
        severity: 'success'
      });
      reset();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.error || 'Error adding client',
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
        Add New Client
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Name"
          margin="normal"
          {...register('name', { required: 'Client name is required' })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          fullWidth
          label="Phone Number"
          margin="normal"
          {...register('phone_number', {
            pattern: {
              value: /^[0-9+\-() ]+$/,
              message: 'Invalid phone number format'
            }
          })}
          error={!!errors.phone_number}
          helperText={errors.phone_number?.message}
        />

        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={locations}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location/Area"
                  margin="normal"
                  fullWidth
                />
              )}
              onChange={(_, value) => field.onChange(value)}
            />
          )}
        />

        <Controller
          name="device_id"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={devices}
              getOptionLabel={(option) => option.device_name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Device"
                  margin="normal"
                  fullWidth
                />
              )}
              onChange={(_, value) => field.onChange(value)}
            />
          )}
        />

        <Controller
          name="ip_id"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={availableIps}
              getOptionLabel={(option) => option.ip_address || ''}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="IP Address"
                  margin="normal"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              onChange={(_, value) => field.onChange(value)}
              disabled={!selectedDevice}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Add Client
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

export default AddClientForm;
