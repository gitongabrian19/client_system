const db = require('./config/database');

async function initializeLocations() {
    const locations = [
        { name: 'Main Office', description: 'Main company headquarters' },
        { name: 'Branch Office A', description: 'First branch location' },
        { name: 'Branch Office B', description: 'Second branch location' },
        { name: 'Data Center', description: 'Primary data center' },
        { name: 'Remote Site', description: 'Remote work location' }
    ];

    try {
        console.log('Adding initial locations...');
        for (const location of locations) {
            await db.query(
                'INSERT INTO locations (name, description) VALUES (?, ?)',
                [location.name, location.description]
            );
            console.log(`Added location: ${location.name}`);
        }
        console.log('All locations added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error adding locations:', error);
        process.exit(1);
    }
}

initializeLocations(); 