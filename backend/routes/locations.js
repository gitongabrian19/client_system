const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateLocation = [
    body('name').notEmpty().trim().escape(),
    body('description').optional().trim().escape()
];

// Get all locations
router.get('/', async (req, res) => {
    try {
        const [locations] = await db.query('SELECT * FROM locations');
        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get location by ID
router.get('/:id', async (req, res) => {
    try {
        const [locations] = await db.query('SELECT * FROM locations WHERE id = ?', [req.params.id]);
        
        if (locations.length === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }
        
        res.json(locations[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new location
router.post('/', validateLocation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description } = req.body;
        const [result] = await db.query(
            'INSERT INTO locations (name, description) VALUES (?, ?)',
            [name, description]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Location added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update location
router.put('/:id', validateLocation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description } = req.body;
        await db.query(
            'UPDATE locations SET name = ?, description = ? WHERE id = ?',
            [name, description, req.params.id]
        );
        
        res.json({ message: 'Location updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete location
router.delete('/:id', async (req, res) => {
    try {
        // First check if any devices are using this location
        const [devices] = await db.query('SELECT COUNT(*) as count FROM devices WHERE location_id = ?', [req.params.id]);
        
        if (devices[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete location: it is being used by one or more devices' 
            });
        }
        
        await db.query('DELETE FROM locations WHERE id = ?', [req.params.id]);
        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
