const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateIp = [
    body('ip_address').matches(/^(\d{1,3}\.){3}\d{1,3}$/).withMessage('Invalid IP address format'),
    body('device_id').optional().isInt(),
    body('description').optional().trim().escape()
];

// Get all IP addresses
router.get('/', async (req, res) => {
    try {
        const [ips] = await db.query(`
            SELECT 
                i.*,
                d.device_name,
                d.device_type,
                c.id as client_id,
                c.name as client_name
            FROM ip_addresses i 
            LEFT JOIN devices d ON i.device_id = d.id
            LEFT JOIN clients c ON i.id = c.ip_id
            ORDER BY i.ip_address
        `);
        res.json(ips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available IPs for a device
router.get('/available/:deviceId', async (req, res) => {
    try {
        const [ips] = await db.query(
            'SELECT * FROM ip_addresses WHERE device_id IS NULL OR device_id = ?',
            [req.params.deviceId]
        );
        res.json(ips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new IP address
router.post('/', validateIp, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { ip_address, device_id, description } = req.body;
        const [result] = await db.query(
            'INSERT INTO ip_addresses (ip_address, device_id, description) VALUES (?, ?, ?)',
            [ip_address, device_id || null, description]
        );
        res.status(201).json({ id: result.insertId, message: 'IP address added successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'IP address already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Bulk add IP addresses
router.post('/bulk', async (req, res) => {
    try {
        const { ips } = req.body;
        const values = ips.map(ip => [ip.ip_address, ip.device_id || null, ip.description]);
        
        await db.query(
            'INSERT INTO ip_addresses (ip_address, device_id, description) VALUES ?',
            [values]
        );
        
        res.status(201).json({ message: 'IP addresses added successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'One or more IP addresses already exist' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Update IP address
router.put('/:id', validateIp, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { ip_address, device_id, description } = req.body;
        await db.query(
            'UPDATE ip_addresses SET ip_address = ?, device_id = ?, description = ? WHERE id = ?',
            [ip_address, device_id || null, description, req.params.id]
        );
        res.json({ message: 'IP address updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'IP address already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Delete IP address
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM ip_addresses WHERE id = ?', [req.params.id]);
        res.json({ message: 'IP address deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
