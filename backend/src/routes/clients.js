import express from 'express';
import {
  createTable,
  addClient,
  bulkAddClients,
  getAllClients,
  getAvailableIps,
  updateClient,
  deleteClient,
  getLocations
} from '../models/client.js';
import { parse } from 'csv-parse/sync';

const router = express.Router();

// Initialize the clients table
createTable().catch(console.error);

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await getAllClients();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available IPs for a device
router.get('/available-ips/:deviceId?', async (req, res) => {
  try {
    const ips = await getAvailableIps(req.params.deviceId);
    res.json(ips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unique locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await getLocations();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a single client
router.post('/', async (req, res) => {
  const { name, phone_number, location, device_id, ip_id } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Client name is required' });
  }
  
  try {
    const id = await addClient({ name, phone_number, location, device_id, ip_id });
    res.status(201).json({ id, message: 'Client added successfully' });
  } catch (error) {
    if (error.message.includes('already assigned')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Bulk add clients
router.post('/bulk', async (req, res) => {
  let clients;
  
  if (req.body.type === 'csv') {
    try {
      const records = parse(req.body.data, {
        columns: true,
        skip_empty_lines: true
      });
      
      clients = records.map(record => ({
        name: record.name,
        phone_number: record.phone_number,
        location: record.location,
        device_id: record.device_id || null,
        ip_id: record.ip_id || null
      }));
    } catch (error) {
      return res.status(400).json({ error: 'Invalid CSV format' });
    }
  } else {
    clients = req.body.clients;
  }
  
  // Validate clients
  const invalidClients = clients.filter(c => !c.name);
  
  if (invalidClients.length > 0) {
    return res.status(400).json({
      error: 'Invalid clients found',
      invalidClients
    });
  }
  
  try {
    const count = await bulkAddClients(clients);
    res.status(201).json({
      message: `Successfully added ${count} clients`
    });
  } catch (error) {
    if (error.message.includes('already assigned')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update a client
router.put('/:id', async (req, res) => {
  const { name, phone_number, location, device_id, ip_id } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Client name is required' });
  }
  
  try {
    const success = await updateClient(req.params.id, {
      name,
      phone_number,
      location,
      device_id,
      ip_id
    });
    
    if (success) {
      res.json({ message: 'Client updated successfully' });
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    if (error.message.includes('already assigned')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete a client
router.delete('/:id', async (req, res) => {
  try {
    const success = await deleteClient(req.params.id);
    if (success) {
      res.json({ message: 'Client deleted successfully' });
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
