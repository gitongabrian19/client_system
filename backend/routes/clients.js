const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateClient = [
    body('name').notEmpty().trim().escape(),
    body('device_id').optional().isInt(),
    body('ip_id').optional().isInt(),
    body('description').optional().trim().escape(),
    body('contact_info').optional().trim().escape()
];

// Get all clients
router.get('/', async (req, res) => {
    try {
        const [clients] = await db.query(`
            SELECT 
                c.id,
                c.name,
                c.description,
                c.contact_info,
                c.device_id,
                c.ip_id,
                d.device_name,
                d.device_type,
                i.ip_address,
                d.mac_address,
                l.name as location_name,
                l.id as location_id
            FROM clients c
            LEFT JOIN devices d ON c.device_id = d.id
            LEFT JOIN ip_addresses i ON c.ip_id = i.id
            LEFT JOIN locations l ON d.location_id = l.id
            ORDER BY c.name
        `);
        console.log('Fetched clients:', clients.length);
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get clients grouped by area
router.get('/by-area', async (req, res) => {
    try {
        const [clients] = await db.query(`
            SELECT 
                l.id as location_id,
                l.name as location_name,
                COALESCE(
                    JSON_ARRAYAGG(
                        IF(c.id IS NOT NULL,
                            JSON_OBJECT(
                                'id', c.id,
                                'name', c.name,
                                'contact_info', c.contact_info,
                                'device_name', d.device_name,
                                'device_type', d.device_type,
                                'ip_address', i.ip_address
                            ),
                            NULL
                        )
                    ),
                    JSON_ARRAY()
                ) as clients
            FROM locations l
            LEFT JOIN devices d ON d.location_id = l.id
            LEFT JOIN clients c ON c.device_id = d.id
            LEFT JOIN ip_addresses i ON c.ip_id = i.id
            GROUP BY l.id, l.name
            ORDER BY l.name
        `);
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available IPs
router.get('/available-ips', async (req, res) => {
    try {
        const query = `
            SELECT 
                i.*,
                d.device_name,
                d.device_type
            FROM ip_addresses i 
            LEFT JOIN devices d ON i.device_id = d.id
            LEFT JOIN clients c ON i.id = c.ip_id
            WHERE c.id IS NULL
            AND (
                -- For switch networks, exclude gateway (.1) and reserved range (.2 to .20)
                (d.device_type = 'switch' AND CAST(SUBSTRING_INDEX(i.ip_address, '.', -1) AS UNSIGNED) > 20)
                -- For other device types, exclude only gateway (.1)
                OR (d.device_type != 'switch' AND CAST(SUBSTRING_INDEX(i.ip_address, '.', -1) AS UNSIGNED) != 1)
                -- For unassigned IPs, exclude .1 (gateway)
                OR (d.id IS NULL AND CAST(SUBSTRING_INDEX(i.ip_address, '.', -1) AS UNSIGNED) != 1)
            )
            ORDER BY i.ip_address
        `;
        
        const [ips] = await db.query(query);
        res.json(ips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available IPs for a specific device
router.get('/available-ips/:deviceId', async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        const query = `
            SELECT 
                i.*,
                d.device_name,
                d.device_type
            FROM ip_addresses i 
            LEFT JOIN devices d ON i.device_id = d.id
            LEFT JOIN clients c ON i.id = c.ip_id
            WHERE c.id IS NULL
            AND (i.device_id = ? OR i.device_id IS NULL)
            AND (
                -- For switch networks, exclude gateway (.1) and reserved range (.2 to .20)
                (d.device_type = 'switch' AND CAST(SUBSTRING_INDEX(i.ip_address, '.', -1) AS UNSIGNED) > 20)
                -- For other device types, exclude only gateway (.1)
                OR (d.device_type != 'switch' AND CAST(SUBSTRING_INDEX(i.ip_address, '.', -1) AS UNSIGNED) != 1)
                -- For unassigned IPs, exclude .1 (gateway)
                OR (d.id IS NULL AND CAST(SUBSTRING_INDEX(i.ip_address, '.', -1) AS UNSIGNED) != 1)
            )
            ORDER BY i.ip_address
        `;
        
        const [ips] = await db.query(query, [deviceId]);
        res.json(ips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get client by ID
router.get('/:id', async (req, res) => {
    try {
        const [clients] = await db.query(`
            SELECT c.*, 
                   d.device_name,
                   i.ip_address,
                   d.mac_address
            FROM clients c
            LEFT JOIN devices d ON c.device_id = d.id
            LEFT JOIN ip_addresses i ON c.ip_id = i.id
            WHERE c.id = ?
        `, [req.params.id]);
        
        if (clients.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json(clients[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new client
router.post('/', validateClient, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, device_id, ip_id, description, contact_info } = req.body;
        
        // Check if IP is available
        if (ip_id) {
            const [ipCheck] = await db.query(
                'SELECT * FROM clients WHERE ip_id = ? AND id != ?',
                [ip_id, req.params.id || 0]
            );
            if (ipCheck.length > 0) {
                return res.status(400).json({ error: 'IP address already assigned to another client' });
            }
        }

        const [result] = await db.query(
            'INSERT INTO clients (name, device_id, ip_id, description, contact_info) VALUES (?, ?, ?, ?, ?)',
            [name, device_id || null, ip_id || null, description, contact_info]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Client added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update client
router.put('/:id', validateClient, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, device_id, ip_id, description, contact_info } = req.body;
        
        // Check if IP is available
        if (ip_id) {
            const [ipCheck] = await db.query(
                'SELECT * FROM clients WHERE ip_id = ? AND id != ?',
                [ip_id, req.params.id]
            );
            if (ipCheck.length > 0) {
                return res.status(400).json({ error: 'IP address already assigned to another client' });
            }
        }

        await db.query(
            'UPDATE clients SET name = ?, device_id = ?, ip_id = ?, description = ?, contact_info = ? WHERE id = ?',
            [name, device_id || null, ip_id || null, description, contact_info, req.params.id]
        );
        
        res.json({ message: 'Client updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete client
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
