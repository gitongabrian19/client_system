const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateSMS = [
    body('locationId').isInt().withMessage('Location ID is required'),
    body('message').notEmpty().trim().withMessage('Message is required'),
];

// Send SMS to all clients in an area
router.post('/send-bulk', validateSMS, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { locationId, message } = req.body;

        // Get all clients' contact info in the specified location
        const [clients] = await db.query(`
            SELECT DISTINCT c.contact_info
            FROM clients c
            JOIN devices d ON c.device_id = d.id
            WHERE d.location_id = ? AND c.contact_info IS NOT NULL
        `, [locationId]);

        // TODO: Integrate with your preferred SMS service provider
        // This is a placeholder for SMS sending logic
        const phoneNumbers = clients.map(client => client.contact_info).filter(Boolean);
        
        if (phoneNumbers.length === 0) {
            return res.status(400).json({ error: 'No valid contact numbers found in this area' });
        }

        // Placeholder for SMS sending
        console.log('Sending SMS:', { phoneNumbers, message });
        
        // For now, just return success
        res.json({ 
            message: 'SMS sent successfully', 
            recipients: phoneNumbers.length 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
