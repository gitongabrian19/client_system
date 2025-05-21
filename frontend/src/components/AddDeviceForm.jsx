import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
  Divider,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Router as RouterIcon,
  AccountTree as SwitchIcon,
  RouterOutlined as APIcon,
  Security as FirewallIcon,
  Hub as GatewayIcon,
  Devices as OtherDeviceIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { api } from '../utils/api';

const deviceTypeIcons = {
  switch: <SwitchIcon />,
  router: <RouterIcon />,
  ap: <APIcon />,
  gateway: <GatewayIcon />,
  firewall: <FirewallIcon />,
  other: <OtherDeviceIcon />
};

const deviceTypeDescriptions = {
  switch: 'Network switch for connecting multiple devices',
  router: 'Network router for routing traffic between networks',
  ap: 'Access Point for wireless network access',
  gateway: 'Gateway device for connecting different networks',
  firewall: 'Security device for network protection',
  other: 'Other network device'
};

const AddDeviceForm = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [locations, setLocations] = useState([]);
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors }
  } = useForm();

  const deviceType = watch('device_type', '');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await api.getLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setNotification({
          open: true,
          message: 'Error loading locations',
          severity: 'error'
        });
      }
    };
    fetchLocations();
  }, []);

  const validateIpAddress = (value) => {
    if (!value) return 'IP address is required';
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(value)) return 'Invalid IP address format';
    
    const parts = value.split('.').map(Number);
    const valid = parts.every(part => part >= 0 && part <= 255);
    if (!valid) return 'IP address parts must be between 0 and 255';
    
    const isPrivateIp = (
      (parts[0] === 10) || // 10.0.0.0 - 10.255.255.255
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0 - 172.31.255.255
      (parts[0] === 192 && parts[1] === 168) // 192.168.0.0 - 192.168.255.255
    );
    
    if (!isPrivateIp) {
      return 'Please use private IP ranges (10.x.x.x, 172.16-31.x.x, or 192.168.x.x)';
    }
    
    return true;
  };

  const onSubmit = async (data) => {
    try {
      const response = await api.addDevice(data);
      setNotification({
        open: true,
        message: 'Device added successfully',
        severity: 'success'
      });
      reset();
      
      // If the device is a switch, redirect to IP management for IP pool creation
      if (data.device_type === 'switch') {
        setTimeout(() => {
          navigate('/ips/add', { 
            state: { 
              deviceId: response.id,
              deviceName: data.device_name,
              deviceType: data.device_type,
              deviceIp: data.ip_address
            } 
          });
        }, 1500);
      }
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
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Add Network Device
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Device Type Selection */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Device Type
                </Typography>
                <Controller
                  name="device_type"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Device type is required' }}
                  render={({ field }) => (
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                      {Object.entries(deviceTypeIcons).map(([type, icon]) => (
                        <Tooltip key={type} title={deviceTypeDescriptions[type]} arrow>
                          <Card
                            sx={{
                              width: 120,
                              cursor: 'pointer',
                              bgcolor: field.value === type ? 'primary.main' : 'background.paper',
                              color: field.value === type ? 'primary.contrastText' : 'text.primary',
                              '&:hover': {
                                bgcolor: field.value === type ? 'primary.dark' : 'action.hover',
                              },
                            }}
                            onClick={() => field.onChange(type)}
                          >
                            <CardContent>
                              <Stack alignItems="center" spacing={1}>
                                {icon}
                                <Typography variant="body2" textTransform="capitalize">
                                  {type}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Tooltip>
                      ))}
                    </Stack>
                  )}
                />
                {errors.device_type && (
                  <FormHelperText error>{errors.device_type.message}</FormHelperText>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Device Name"
              {...register('device_name', { required: 'Device name is required' })}
              error={!!errors.device_name}
              helperText={errors.device_name?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.location_id}>
              <InputLabel>Location</InputLabel>
              <Controller
                name="location_id"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select label="Location" {...field}>
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {locations.map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.location_id && (
                <FormHelperText>{errors.location_id.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Network Information */}
          <Grid item xs={12}>
            <Divider textAlign="left">
              <Typography variant="subtitle2" color="textSecondary">
                Network Information
              </Typography>
            </Divider>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="MAC Address"
              placeholder="00:1A:2B:3C:4D:5E"
              {...register('mac_address', {
                required: 'MAC address is required',
                pattern: {
                  value: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
                  message: 'Invalid MAC address format'
                }
              })}
              error={!!errors.mac_address}
              helperText={errors.mac_address?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Format: 00:1A:2B:3C:4D:5E">
                      <IconButton edge="end" size="small">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Management IP Address"
              placeholder="192.168.1.1"
              {...register('management_ip', {
                required: 'Management IP address is required',
                validate: validateIpAddress
              })}
              error={!!errors.management_ip}
              helperText={errors.management_ip?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Use private IP ranges (e.g., 192.168.1.1)">
                      <IconButton edge="end" size="small">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12}>
            <Divider textAlign="left">
              <Typography variant="subtitle2" color="textSecondary">
                Additional Information
              </Typography>
            </Divider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              {...register('description')}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              Add Device
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddDeviceForm;
