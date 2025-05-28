const axios = require('axios');
require('dotenv').config();

class SMSService {
    constructor() {
        this.apiKey = process.env.UJUMBE_API_KEY;
        this.email = process.env.UJUMBE_EMAIL;
        this.senderId = process.env.UJUMBE_SENDER_ID || 'UjumbeSMS';
        this.baseUrl = 'http://ujumbesms.co.ke/api/messaging';
    }

    async sendSMS(phoneNumbers, message) {
        try {
            const recipients = Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers];

            // ✅ Auto-format to international format
            const formattedNumbers = recipients.map(number => this.formatPhoneNumber(number)).join(',');

            const payload = {
                data: [
                    {
                        message_bag: {
                            numbers: formattedNumbers,
                            message: message,
                            sender: this.senderId
                        }
                    }
                ]
            };

            console.log('Sending request with payload:', JSON.stringify(payload, null, 2));

            const response = await axios.post(this.baseUrl, payload, {
                headers: {
                    'X-Authorization': this.apiKey,
                    'email': this.email,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            return response.data;
        } catch (error) {
            console.error('SMS sending error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to send SMS');
        }
    }

    // ✅ Format to international (E.164) format: 2547XXXXXXX
    formatPhoneNumber(phone) {
        let cleaned = phone.replace(/\D/g, '');

        // Remove leading 0 or + if present
        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.substring(1);
        } else if (cleaned.startsWith('+')) {
            cleaned = cleaned.substring(1);
        }

        // If it still doesn't start with 254, add it
        if (!cleaned.startsWith('254')) {
            cleaned = '254' + cleaned;
        }

        // Final validation: should be 12 digits starting with 254
        if (!/^254\d{9}$/.test(cleaned)) {
            throw new Error(`Invalid phone number: ${phone}`);
        }

        return cleaned;
    }
}

module.exports = new SMSService();
