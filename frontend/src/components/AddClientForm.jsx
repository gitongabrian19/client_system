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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Router as RouterIcon,
  AccountTree as SwitchIcon,
  NetworkCheck as NetworkIcon,
  LocationOn as LocationIcon,
  DnsRounded as IpIcon,
  ContactPhone as ContactIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { api } from '../utils/api';

const steps = ['Location', 'Network Device', 'IP Address', 'Client Details'];

const AddClientForm = () => {
  const [activeStep, setActiveStep] = useState(0);
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
    setValue,
    trigger,
    formState: { errors }
  } = useForm();

  const selectedDevice = watch('device_id');
  const selectedLocation = watch('location_id');

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
        console.error('Error loading data:', error);
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
        // If there's only one IP available, auto-select it
        if (ips.length === 1) {
          setValue('ip_id', ips[0].id);
        } else {
          setValue('ip_id', '');
        }
      } catch (error) {
        console.error('Error loading IPs:', error);
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
  }, [selectedDevice, setValue]);

  // When location changes, filter devices by location
  useEffect(() => {
    if (selectedLocation) {
      // If selected device is not in the selected location, clear it
      if (selectedDevice && devices.find(d => d.id === selectedDevice)?.location_id !== selectedLocation) {
        setValue('device_id', '');
      }
    }
  }, [selectedLocation, selectedDevice, devices, setValue]);

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'switch':
        return <SwitchIcon />;
      case 'router':
        return <RouterIcon />;
      default:
        return <NetworkIcon />;
    }
  };

  const handleNext = async () => {
    const isValid = await trigger(getFieldsForStep(activeStep));
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['location_id'];
      case 1:
        return ['device_id'];
      case 2:
        return ['ip_id'];
      case 3:
        return ['name', 'contact_info'];
      default:
        return [];
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.addClient(data);
      setNotification({
        open: true,
        message: 'Client added successfully',
        severity: 'success'
      });
      reset();
      setActiveStep(0);
    } catch (error) {
      console.error('Error adding client:', error);
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

  const filteredDevices = selectedLocation
    ? devices.filter(device => device.location_id === selectedLocation)
    : devices;

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon fontSize="small" /> Select Location
              </Typography>
              <FormControl fullWidth error={!!errors.location_id}>
                <InputLabel>Location</InputLabel>
                <Controller
                  name="location_id"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Please select a location' }}
                  render={({ field }) => (
                    <Select {...field} label="Location">
                      {locations.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <LocationIcon fontSize="small" />
                            <Typography>{location.name}</Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.location_id && (
                  <FormHelperText>{errors.location_id.message}</FormHelperText>
                )}
              </FormControl>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NetworkIcon fontSize="small" /> Select Network Device
              </Typography>
              <FormControl fullWidth error={!!errors.device_id}>
                <InputLabel>Device</InputLabel>
                <Controller
                  name="device_id"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Please select a device' }}
                  render={({ field }) => (
                    <Select {...field} label="Device">
                      {filteredDevices.map((device) => (
                        <MenuItem key={device.id} value={device.id}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {getDeviceIcon(device.device_type)}
                            <Box>
                              <Typography variant="body2">
                                {device.device_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {device.management_ip}
                              </Typography>
                            </Box>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.device_id && (
                  <FormHelperText>{errors.device_id.message}</FormHelperText>
                )}
              </FormControl>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IpIcon fontSize="small" /> Select IP Address
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <FormControl fullWidth error={!!errors.ip_id}>
                  <InputLabel>IP Address</InputLabel>
                  <Controller
                    name="ip_id"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Please select an IP address' }}
                    render={({ field }) => (
                      <Select {...field} label="IP Address">
                        {availableIps.map((ip) => (
                          <MenuItem key={ip.id} value={ip.id}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <IpIcon fontSize="small" />
                              <Typography>{ip.ip_address}</Typography>
                              <Chip
                                label="Available"
                                color="success"
                                size="small"
                                variant="outlined"
                              />
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.ip_id && (
                    <FormHelperText>{errors.ip_id.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" /> Client Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Client Name"
                    {...register('name', { required: 'Client name is required' })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Information"
                    {...register('contact_info')}
                    placeholder="Phone number or email"
                    InputProps={{
                      startAdornment: <ContactIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    {...register('description')}
                    InputProps={{
                      startAdornment: <DescriptionIcon color="action" sx={{ mr: 1, mt: 1 }} />
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon /> Add New Client
      </Typography>

      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                type="submit"
              >
                Add Client
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
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

export default AddClientForm;
