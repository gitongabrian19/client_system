const express = require('express');
const router = express.Router();
const db = require('../config/database');
const smsService = require('../utils/smsService');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Validation middleware
const validateSMS = [
    body('message').notEmpty().trim().withMessage('Message is required'),
    body('recipients').isArray().withMessage('Recipients must be an array'),
];

const validateLocationSMS = [
    body('locationId').isInt().withMessage('Location ID is required'),
    body('message').notEmpty().trim().withMessage('Message is required'),
];

// Send SMS to specific clients
router.post('/send', [auth, validateSMS], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { message, recipients } = req.body;

        // Get client contact information
        const [clients] = await db.query(
            'SELECT id, name, contact_info FROM clients WHERE id IN (?)',
            [recipients]
        );

        const validClients = clients.filter(client => client.contact_info);
        
        if (validClients.length === 0) {
            return res.status(400).json({ error: 'No valid contact numbers found' });
        }

        // Format phone numbers and send SMS
        const phoneNumbers = validClients.map(client => 
            smsService.formatPhoneNumber(client.contact_info)
        );

        const result = await smsService.sendSMS(phoneNumbers, message);

        // Log the SMS sending
        const smsLog = validClients.map(client => [
            client.id,
            message,
            new Date()
        ]);

        await db.query(
            'INSERT INTO sms_logs (client_id, message, sent_at) VALUES ?',
            [smsLog]
        );

        res.json({
            message: 'SMS sent successfully',
            recipients: validClients.length,
            result
        });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send SMS to all clients in a location
router.post('/send-by-location', [auth, validateLocationSMS], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { locationId, message } = req.body;

        // Get all clients' contact info in the specified location
        const [clients] = await db.query(`
            SELECT DISTINCT c.id, c.name, c.contact_info
            FROM clients c
            JOIN devices d ON c.device_id = d.id
            WHERE d.location_id = ? AND c.contact_info IS NOT NULL
        `, [locationId]);

        if (clients.length === 0) {
            return res.status(400).json({ error: 'No valid contact numbers found in this location' });
        }

        // Format phone numbers and send SMS
        const phoneNumbers = clients.map(client => 
            smsService.formatPhoneNumber(client.contact_info)
        );

        const result = await smsService.sendSMS(phoneNumbers, message);

        // Log the SMS sending
        const smsLog = clients.map(client => [
            client.id,
            message,
            new Date()
        ]);

        await db.query(
            'INSERT INTO sms_logs (client_id, message, sent_at) VALUES ?',
            [smsLog]
        );

        res.json({ 
            message: 'SMS sent successfully', 
            recipients: clients.length,
            result
        });
    } catch (error) {
        console.error('Error sending bulk SMS:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get SMS history for a client
router.get('/history/:clientId', auth, async (req, res) => {
    try {
        const [history] = await db.query(
            'SELECT * FROM sms_logs WHERE client_id = ? ORDER BY sent_at DESC',
            [req.params.clientId]
        );
        res.json(history);
    } catch (error) {
        console.error('Error fetching SMS history:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

