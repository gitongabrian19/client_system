import { pool } from '../db.js';

// Create devices table if it doesn't exist
const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS devices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_name VARCHAR(255) NOT NULL,
      mac_address VARCHAR(17) NOT NULL,
      location VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY mac_address_unique (mac_address)
    )
  `;
  
  try {
    await pool.query(query);
    console.log('Devices table created or already exists');
  } catch (error) {
    console.error('Error creating devices table:', error);
    throw error;
  }
};

// Add a single device
const addDevice = async (device) => {
  const { device_name, mac_address, location, description } = device;
  const query = 'INSERT INTO devices (device_name, mac_address, location, description) VALUES (?, ?, ?, ?)';
  
  try {
    const [result] = await pool.query(query, [device_name, mac_address, location, description]);
    return result.insertId;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('MAC address already exists');
    }
    throw error;
  }
};

// Add multiple devices
const bulkAddDevices = async (devices) => {
  const query = 'INSERT INTO devices (device_name, mac_address, location, description) VALUES ?';
  const values = devices.map(d => [d.device_name, d.mac_address, d.location, d.description]);
  
  try {
    const [result] = await pool.query(query, [values]);
    return result.affectedRows;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('One or more MAC addresses already exist');
    }
    throw error;
  }
};

// Validate MAC address format
const validateMacAddress = (mac) => {
  const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return regex.test(mac);
};

// Get all devices
const getAllDevices = async () => {
  const query = 'SELECT * FROM devices ORDER BY created_at DESC';
  const [rows] = await pool.query(query);
  return rows;
};

// Delete a device
const deleteDevice = async (id) => {
  const query = 'DELETE FROM devices WHERE id = ?';
  const [result] = await pool.query(query, [id]);
  return result.affectedRows > 0;
};

export {
  createTable,
  addDevice,
  bulkAddDevices,
  validateMacAddress,
  getAllDevices,
  deleteDevice
};
