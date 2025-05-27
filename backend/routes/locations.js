const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Validation middleware
const validateLocation = [
    body('name').notEmpty().trim().escape(),
    body('description').optional().trim().escape()
];

// Get all locations
router.get('/', async (req, res) => {
    try {
        const [locations] = await db.query('SELECT * FROM locations ORDER BY name');
        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
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
        console.error('Error fetching location:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add new location (protected)
router.post('/', [auth, validateLocation], async (req, res) => {
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
        
        const [newLocation] = await db.query('SELECT * FROM locations WHERE id = ?', [result.insertId]);
        res.status(201).json(newLocation[0]);
    } catch (error) {
        console.error('Error adding location:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update location (protected)
router.put('/:id', [auth, validateLocation], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description } = req.body;
        const [result] = await db.query(
            'UPDATE locations SET name = ?, description = ? WHERE id = ?',
            [name, description, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }

        const [updatedLocation] = await db.query('SELECT * FROM locations WHERE id = ?', [req.params.id]);
        res.json(updatedLocation[0]);
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete location (protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if location is being used by any devices
        const [devices] = await db.query('SELECT COUNT(*) as count FROM devices WHERE location_id = ?', [req.params.id]);
        
        if (devices[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete location: There are devices assigned to this location' 
            });
        }

        const [result] = await db.query('DELETE FROM locations WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }

        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
