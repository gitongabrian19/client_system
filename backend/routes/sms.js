const express = require('express');
const router = express.Router();
const db = require('../config/database'); // MySQL Connection Pool
const smsService = require('../utils/smsService'); // Ujumbe API Service
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// --- 1. Validation Middleware ---
const validateSMS = [
    body('message').notEmpty().trim().withMessage('Message is required'),
    body('recipients').isArray().withMessage('Recipients must be an array of client IDs'),
];

const validateLocationSMS = [
    body('locationId').isInt().withMessage('Location ID is required and must be an integer'),
    body('message').notEmpty().trim().withMessage('Message is required'),
];

const validateAllSMS = [
    body('message').notEmpty().trim().withMessage('Message is required'),
];

/**
 * Executes the core logic for sending SMS and logging the results.
 * This function is used by all three POST routes to maintain consistency and use transactions.
 * @param {Array<Object>} clients - The list of client objects (must contain id and contact_info).
 * @param {string} message - The message content.
 * @param {object} res - The Express response object.
 */
const sendAndLogSMS = async (clients, message, res) => {
    // 1. Filter, Format, and Prepare Logs
    const phoneNumbers = [];
    const smsLog = [];
    const invalidContacts = [];

    for (const client of clients) {
        if (!client.contact_info) {
            console.warn(`Skipping client ${client.id}: contact_info is NULL.`);
            invalidContacts.push({ id: client.id, contact_info: client.contact_info, error: 'Contact info is NULL' });
            continue;
        }
        try {
            // Uses the robust formatting in smsService
            const formatted = smsService.formatPhoneNumber(client.contact_info);
            phoneNumbers.push(formatted);
            // Prepare log entry: [client_id, message, sent_at]
            smsLog.push([client.id, message, new Date()]); 
        } catch (e) {
            console.warn(`Skipping invalid contact for client ${client.id}:`, client.contact_info, e.message);
            invalidContacts.push({ id: client.id, contact_info: client.contact_info, error: e.message });
        }
    }

    if (phoneNumbers.length === 0) {
        return res.status(400).json({ error: 'No valid phone numbers to send to.', invalidContacts });
    }

    // 2. Send SMS via Ujumbe API
    const result = await smsService.sendSMS(phoneNumbers, message);

    // 3. Log the successful SMS sends (using Transaction)
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        
        if (smsLog.length > 0) {
            // MySQL bulk insert syntax: INSERT INTO table (cols) VALUES ?
            await connection.query('INSERT INTO sms_logs (client_id, message, sent_at) VALUES ?', [smsLog]);
        }

        await connection.commit();
    } catch (logError) {
        if (connection) await connection.rollback();
        console.error('CRITICAL: SMS sent but logging failed!', logError);
        // We log the error but still return success for the SMS, as the core job finished.
        return res.status(202).json({
            message: 'SMS sent, but logging failed. Check logs.',
            recipients: phoneNumbers.length,
            result,
            logError: logError.message
        });
    } finally {
        if (connection) connection.release();
    }

    // 4. Final Success Response
    res.json({
        message: 'SMS sent successfully',
        recipients: phoneNumbers.length,
        skipped: invalidContacts.length,
        invalidContacts,
        result
    });
};

// --- 2. SMS Sending Endpoints ---

// 🎯 Route 1: Send SMS to specific selected clients
router.post('/send', [auth, validateSMS], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { message, recipients } = req.body;

        // Get client contact information based on IDs
        const [clients] = await db.query(
            'SELECT id, name, contact_info FROM clients WHERE id IN (?)',
            [recipients]
        );

        if (clients.length === 0) {
            return res.status(400).json({ error: 'No recipients found for the provided IDs.' });
        }

        // Delegate to the transactional core logic
        await sendAndLogSMS(clients, message, res);

    } catch (error) {
        console.error('Error sending selected SMS:', error);
        res.status(500).json({ success: false, error: 'Internal server error during send process.' });
    }
});

// 🎯 Route 2: Send SMS to all clients in a location (Group Send)
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

        // Delegate to the transactional core logic
        await sendAndLogSMS(clients, message, res);

    } catch (error) {
        console.error('Error sending bulk SMS by location:', error);
        res.status(500).json({ success: false, error: 'Internal server error during location-based send process.' });
    }
});

// 🎯 Route 3: Send SMS to ALL clients in the database
router.post('/send-to-all', [auth, validateAllSMS], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { message } = req.body;

        // Query ALL clients with contact info
        const [clients] = await db.query(
            'SELECT id, name, contact_info FROM clients WHERE contact_info IS NOT NULL'
        );

        if (clients.length === 0) {
            return res.status(400).json({ error: 'No clients with contact numbers found in the database.' });
        }

        // Delegate to the transactional core logic
        await sendAndLogSMS(clients, message, res);

    } catch (error) {
        console.error('Error sending bulk SMS to all clients:', error);
        res.status(500).json({ success: false, error: 'Internal server error during bulk send process.' });
    }
});

// --- 3. History Endpoints ---

// Get SMS history for all clients (aggregated by message)
router.get('/history', auth, async (req, res) => {
    try {
        const [history] = await db.query(`
            SELECT sl.*, c.name, c.contact_info
            FROM sms_logs sl
            JOIN clients c ON sl.client_id = c.id
            ORDER BY sl.sent_at DESC
            LIMIT 100
        `);

        // Format the history data by aggregating recipients for the same bulk send
        const formattedHistory = history.reduce((acc, log) => {
            // 1. Correct the date conversion
            const sentDate = new Date(log.sent_at);
            const timestampKey = sentDate.toISOString(); // Use timestamp as key for grouping
            
            // 2. Use the new timestampKey
            const existingEntry = acc.find(entry => 
                entry.message === log.message && 
                entry.timestamp === timestampKey
            );

            if (existingEntry) {
                existingEntry.recipients.push({ name: log.name, contact: log.contact_info });
            } else {
                acc.push({
                    message: log.message,
                    timestamp: timestampKey,
                    recipients: [{ name: log.name, contact: log.contact_info }],
                    status: 'sent'
                });
            }

            return acc;
        }, []);

        res.json(formattedHistory);
    } catch (error) {
        console.error('Error fetching SMS history:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch general history.' });
    }
});

// Get SMS history for a specific client
router.get('/history/:clientId', auth, async (req, res) => {
    try {
        const [history] = await db.query(
            'SELECT * FROM sms_logs WHERE client_id = ? ORDER BY sent_at DESC',
            [req.params.clientId]
        );
        res.json(history);
    } catch (error) {
        console.error('Error fetching client SMS history:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch client history.' });
    }
});

module.exports = router;