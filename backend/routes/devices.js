const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateDevice = [
    body('device_name').notEmpty().trim().escape(),
    body('mac_address').optional().matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).withMessage('Invalid MAC address format'),
    body('description').optional().trim().escape(),
    body('location_id').optional().isInt()
];

// Get all devices
router.get('/', async (req, res) => {
    try {
        const [devices] = await db.query(`
            SELECT 
                d.*,
                l.name as location_name,
                d.management_ip,
                COUNT(DISTINCT ip.id) as assigned_ips_count
            FROM devices d 
            LEFT JOIN locations l ON d.location_id = l.id
            LEFT JOIN ip_addresses ip ON d.id = ip.device_id
            GROUP BY d.id
        `);
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new device
router.post('/', validateDevice, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { device_name, device_type, mac_address, management_ip, location_id, description } = req.body;
        const [result] = await db.query(
            'INSERT INTO devices (device_name, device_type, mac_address, management_ip, location_id, description) VALUES (?, ?, ?, ?, ?, ?)',
            [device_name, device_type, mac_address, management_ip, location_id || null, description]
        );
        res.status(201).json({ id: result.insertId, message: 'Device added successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'MAC address already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Update device
router.put('/:id', validateDevice, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { device_name, mac_address, location_id, description } = req.body;
        await db.query(
            'UPDATE devices SET device_name = ?, mac_address = ?, location_id = ?, description = ? WHERE id = ?',
            [device_name, mac_address, location_id || null, description, req.params.id]
        );
        res.json({ message: 'Device updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'MAC address already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Delete device
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM devices WHERE id = ?', [req.params.id]);
        res.json({ message: 'Device deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
