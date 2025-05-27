const axios = require('axios');

class SMSService {
    constructor() {
        this.apiKey = process.env.UJUMBE_API_KEY;
        this.senderId = process.env.UJUMBE_SENDER_ID;
        this.baseUrl = 'https://ujumbe.co.ke/api/messaging';
    }

    async sendSMS(phoneNumbers, message) {
        try {
            const response = await axios.post(this.baseUrl, {
                data: {
                    sender_id: this.senderId,
                    message: message,
                    phone_numbers: Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers]
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('SMS sending error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to send SMS');
        }
    }

    // Format phone number to required format (e.g., +254...)
    formatPhoneNumber(phone) {
        // Remove any non-digit characters
        let cleaned = phone.replace(/\D/g, '');
        
        // If number starts with 0, replace with +254
        if (cleaned.startsWith('0')) {
            cleaned = '+254' + cleaned.substring(1);
        }
        
        // If number starts with 254, add +
        if (cleaned.startsWith('254')) {
            cleaned = '+' + cleaned;
        }
        
        // If number doesn't have country code, add it
        if (!cleaned.startsWith('+')) {
            cleaned = '+254' + cleaned;
        }
        
        return cleaned;
    }
}

module.exports = new SMSService(); 