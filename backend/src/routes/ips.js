import express from 'express';
import {
  createTable,
  validateIpAddress,
  addIpAddress,
  bulkAddIpAddresses,
  getAllIpAddresses,
  getDeviceIpAddresses,
  assignIpToDevice,
  unassignIpFromDevice,
  deleteIpAddress
} from '../models/ip.js';
import { parse } from 'csv-parse/sync';

const router = express.Router();

// Initialize the IP addresses table
createTable().catch(console.error);

// Get all IP addresses
router.get('/', async (req, res) => {
  try {
    const ips = await getAllIpAddresses();
    res.json(ips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get IP addresses for a specific device
router.get('/device/:deviceId', async (req, res) => {
  try {
    const ips = await getDeviceIpAddresses(req.params.deviceId);
    res.json(ips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a single IP address
router.post('/', async (req, res) => {
  const { ip_address, device_id, description } = req.body;
  
  if (!ip_address) {
    return res.status(400).json({ error: 'IP address is required' });
  }
  
  if (!validateIpAddress(ip_address)) {
    return res.status(400).json({ error: 'Invalid IP address format' });
  }
  
  try {
    const id = await addIpAddress({ ip_address, device_id, description });
    res.status(201).json({ id, message: 'IP address added successfully' });
  } catch (error) {
    if (error.message === 'IP address already exists') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Bulk add IP addresses
router.post('/bulk', async (req, res) => {
  let ips;
  
  if (req.body.type === 'csv') {
    try {
      const records = parse(req.body.data, {
        columns: true,
        skip_empty_lines: true
      });
      
      ips = records.map(record => ({
        ip_address: record.ip_address,
        device_id: record.device_id || null,
        description: record.description
      }));
    } catch (error) {
      return res.status(400).json({ error: 'Invalid CSV format' });
    }
  } else {
    ips = req.body.ips;
  }
  
  // Validate IP addresses
  const invalidIps = ips.filter(
    ip => !ip.ip_address || !validateIpAddress(ip.ip_address)
  );
  
  if (invalidIps.length > 0) {
    return res.status(400).json({
      error: 'Invalid IP addresses found',
      invalidIps
    });
  }
  
  try {
    const count = await bulkAddIpAddresses(ips);
    res.status(201).json({
      message: `Successfully added ${count} IP addresses`
    });
  } catch (error) {
    if (error.message === 'One or more IP addresses already exist') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Assign IP to device
router.put('/:ipId/assign/:deviceId', async (req, res) => {
  try {
    const success = await assignIpToDevice(req.params.ipId, req.params.deviceId);
    if (success) {
      res.json({ message: 'IP address assigned successfully' });
    } else {
      res.status(404).json({ error: 'IP address not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unassign IP from device
router.put('/:ipId/unassign', async (req, res) => {
  try {
    const success = await unassignIpFromDevice(req.params.ipId);
    if (success) {
      res.json({ message: 'IP address unassigned successfully' });
    } else {
      res.status(404).json({ error: 'IP address not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an IP address
router.delete('/:id', async (req, res) => {
  try {
    const success = await deleteIpAddress(req.params.id);
    if (success) {
      res.json({ message: 'IP address deleted successfully' });
    } else {
      res.status(404).json({ error: 'IP address not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
