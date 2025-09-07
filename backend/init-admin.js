require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function initializeAdmin() {
    const admin = {
        username: 'admin',
        password: 'admin123', 
        email: 'admin@example.com'
    };

    try {
        console.log('Adding initial admin user...');

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password, salt);

        // Insert admin into database
        await db.query(
            'INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
            [admin.username, hashedPassword, admin.email]
        );

        console.log('Admin user created successfully!');
        console.log('Username:', admin.username);
        console.log('Password:', admin.password);
        console.log('\nPlease change these credentials after first login!');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('Admin user already exists');
        } else {
            console.error('Error adding admin:', error);
        }
        process.exit(1);
    }
}

initializeAdmin(); 