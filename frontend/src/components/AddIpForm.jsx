import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useLocation } from "react-router-dom";
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
  FormHelperText,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { api } from "../utils/api";

const AddIpForm = () => {
  const location = useLocation();
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [devices, setDevices] = useState([]);
  const [generateRange, setGenerateRange] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // If we have a device from navigation state, set it as the selected device
  useEffect(() => {
    if (location.state?.deviceId) {
      setValue("device_id", location.state.deviceId);
      // If it's a switch, enable range generation by default
      if (location.state.deviceType === "switch") {
        setGenerateRange(true);
      }
    }
  }, [location.state, setValue]);

  const selectedDevice = watch("device_id");
  const selectedDeviceData = devices.find((d) => d.id === selectedDevice);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const data = await api.getAllDevices();
        setDevices(data);
      } catch (error) {
        console.error("Error loading devices:", error);
        setNotification({
          open: true,
          message: "Error loading devices",
          severity: "error",
        });
      }
    };
    loadDevices();
  }, []);

  const validateIpAddress = (value) => {
    if (!value) return "IP address is required";
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(value)) return "Invalid IP address format";

    const parts = value.split(".").map(Number);
    const valid = parts.every((part) => part >= 0 && part <= 255);
    if (!valid) return "IP address parts must be between 0 and 255";

    const lastOctet = parts[3];

    // Gateway IP must end with .1
    if (lastOctet !== 1) return "Gateway IP must end with .1";

    // Private IP ranges validation
    const isPrivateIp =
      parts[0] === 10 || // 10.0.0.0 - 10.255.255.255
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0 - 172.31.255.255
      (parts[0] === 192 && parts[1] === 168); // 192.168.0.0 - 192.168.255.255

    if (!isPrivateIp) {
      return "Please use private IP ranges (10.x.x.x, 172.16-31.x.x, or 192.168.x.x)";
    }

    return true;
  };

  const onSubmit = async (data) => {
    try {
      // Add the gateway IP first
      await api.addIpAddress({
        ip_address: data.ip_address,
        device_id: data.device_id,
        description: `Gateway IP for ${
          devices.find((d) => d.id === data.device_id)?.device_name
        }`,
      });

      // If it's a switch and range generation is enabled, create IP pool
      if (selectedDeviceData?.device_type === "switch" && generateRange) {
        // Get the management IP to determine the subnet
        const selectedDevice = devices.find((d) => d.id === data.device_id);
        const ipBase = selectedDevice.management_ip
          .split(".")
          .slice(0, 3)
          .join(".");

        // Generate IPs from .21 to .254 (excluding reserved IPs and broadcast)
        const ipRange = Array.from({ length: 234 }, (_, i) => ({
          ip_address: `${ipBase}.${i + 21}`, // Start from .21 (first 20 IPs reserved)
          device_id: data.device_id,
          description: `Auto-generated IP for ${selectedDevice.device_name}`,
        }));

        await api.bulkAddIpAddresses(ipRange);
      }

      setNotification({
        open: true,
        message: generateRange
          ? "IP range added successfully"
          : "Gateway IP added successfully",
        severity: "success",
      });
      reset();
    } catch (error) {
      console.error("Error adding IP address:", error);
      setNotification({
        open: true,
        message: error.response?.data?.error || "Error adding IP address",
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Add IP Address
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <FormControl fullWidth margin="normal" error={!!errors.device_id}>
          <InputLabel>Device *</InputLabel>
          <Controller
            name="device_id"
            control={control}
            rules={{ required: "Please select a device" }}
            render={({ field }) => (
              <Select label="Device *" {...field}>
                {devices
                  .filter((device) => device.device_type === "router")
                  .map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.device_name} ({device.device_type}) -{" "}
                      {device.mac_address}
                    </MenuItem>
                  ))}
              </Select>
            )}
          />
          {errors.device_id && (
            <FormHelperText>{errors.device_id.message}</FormHelperText>
          )}
        </FormControl>

        {selectedDevice && (
          <>
            <TextField
              fullWidth
              label="Gateway IP Address *"
              margin="normal"
              {...register("ip_address", {
                required: "IP address is required",
                validate: validateIpAddress,
              })}
              error={!!errors.ip_address}
              helperText={
                errors.ip_address?.message ||
                "Must end with .1 (e.g., 192.168.1.1)"
              }
            />

            {selectedDeviceData?.device_type === "switch" && (
              <>
                <Divider sx={{ my: 2 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={generateRange}
                      onChange={(e) => setGenerateRange(e.target.checked)}
                    />
                  }
                  label={`Generate IP Range (${
                    generateRange ? ".21 - .254" : "Off"
                  })`}
                />
                {generateRange && (
                  <Box sx={{ mt: 1, ml: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      Reserved IP Ranges:
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      component="div"
                      sx={{ ml: 1 }}
                    >
                      • .1: Gateway IP
                      <br />
                      • .2 - .20: Reserved for network devices
                      <br />• .255: Reserved for broadcast
                    </Typography>
                  </Box>
                )}
              </>
            )}

            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={2}
              {...register("description")}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
            >
              {generateRange ? "Add IP Range" : "Add Gateway IP"}
            </Button>
          </>
        )}
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddIpForm;
