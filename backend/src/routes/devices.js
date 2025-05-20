import express from 'express';
import {
  createTable,
  addDevice,
  bulkAddDevices,
  validateMacAddress,
  getAllDevices,
  deleteDevice
} from '../models/device.js';
import { parse } from 'csv-parse/sync';

const router = express.Router();

// Initialize the devices table
createTable().catch(console.error);

// Get all devices
router.get('/', async (req, res) => {
  try {
    const devices = await getAllDevices();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a single device
router.post('/', async (req, res) => {
  const { device_name, mac_address, location, description } = req.body;
  
  // Validate required fields
  if (!device_name || !mac_address) {
    return res.status(400).json({ error: 'Device name and MAC address are required' });
  }
  
  // Validate MAC address format
  if (!validateMacAddress(mac_address)) {
    return res.status(400).json({ error: 'Invalid MAC address format' });
  }
  
  try {
    const id = await addDevice({ device_name, mac_address, location, description });
    res.status(201).json({ id, message: 'Device added successfully' });
  } catch (error) {
    if (error.message === 'MAC address already exists') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Bulk add devices
router.post('/bulk', async (req, res) => {
  let devices;
  
  if (req.body.type === 'csv') {
    try {
      const records = parse(req.body.data, {
        columns: true,
        skip_empty_lines: true
      });
      
      devices = records.map(record => ({
        device_name: record.device_name,
        mac_address: record.mac_address,
        location: record.location,
        description: record.description
      }));
    } catch (error) {
      return res.status(400).json({ error: 'Invalid CSV format' });
    }
  } else {
    devices = req.body.devices;
  }
  
  // Validate devices
  const invalidDevices = devices.filter(
    d => !d.device_name || !d.mac_address || !validateMacAddress(d.mac_address)
  );
  
  if (invalidDevices.length > 0) {
    return res.status(400).json({
      error: 'Invalid devices found',
      invalidDevices
    });
  }
  
  try {
    const count = await bulkAddDevices(devices);
    res.status(201).json({
      message: `Successfully added ${count} devices`
    });
  } catch (error) {
    if (error.message === 'One or more MAC addresses already exist') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete a device
router.delete('/:id', async (req, res) => {
  try {
    const success = await deleteDevice(req.params.id);
    if (success) {
      res.json({ message: 'Device deleted successfully' });
    } else {
      res.status(404).json({ error: 'Device not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
