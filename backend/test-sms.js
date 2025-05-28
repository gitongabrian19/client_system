const smsService = require('./utils/smsService');

async function testSMS() {
    try {
        const result = await smsService.sendSMS(
            '254726070752',  // ✅ Make sure this is a real, valid number for testing
            'Hello from RHAAHA - Testing UjumbeSMS API'
        );
        console.log('SMS API Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Error details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

console.log('🔄 Sending test SMS...');
testSMS();
