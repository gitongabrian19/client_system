import { pool } from '../db.js';

// Create IP addresses table if it doesn't exist
const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ip_addresses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ip_address VARCHAR(15) NOT NULL,
      device_id INT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY ip_address_unique (ip_address),
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
    )
  `;
  
  try {
    await pool.query(query);
    console.log('IP addresses table created or already exists');
  } catch (error) {
    console.error('Error creating IP addresses table:', error);
    throw error;
  }
};

// Validate IP address format
const validateIpAddress = (ip) => {
  const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};

// Add a single IP address
const addIpAddress = async (ip) => {
  const { ip_address, device_id = null, description = '' } = ip;
  const query = 'INSERT INTO ip_addresses (ip_address, device_id, description) VALUES (?, ?, ?)';
  
  try {
    const [result] = await pool.query(query, [ip_address, device_id, description]);
    return result.insertId;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('IP address already exists');
    }
    throw error;
  }
};

// Add multiple IP addresses
const bulkAddIpAddresses = async (ips) => {
  const query = 'INSERT INTO ip_addresses (ip_address, device_id, description) VALUES ?';
  const values = ips.map(ip => [ip.ip_address, ip.device_id || null, ip.description || '']);
  
  try {
    const [result] = await pool.query(query, [values]);
    return result.affectedRows;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('One or more IP addresses already exist');
    }
    throw error;
  }
};

// Get all IP addresses
const getAllIpAddresses = async () => {
  const query = `
    SELECT ip.*, d.device_name 
    FROM ip_addresses ip 
    LEFT JOIN devices d ON ip.device_id = d.id 
    ORDER BY ip.created_at DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

// Get IP addresses for a specific device
const getDeviceIpAddresses = async (deviceId) => {
  const query = 'SELECT * FROM ip_addresses WHERE device_id = ?';
  const [rows] = await pool.query(query, [deviceId]);
  return rows;
};

// Assign IP address to device
const assignIpToDevice = async (ipId, deviceId) => {
  const query = 'UPDATE ip_addresses SET device_id = ? WHERE id = ?';
  try {
    const [result] = await pool.query(query, [deviceId, ipId]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Unassign IP address from device
const unassignIpFromDevice = async (ipId) => {
  const query = 'UPDATE ip_addresses SET device_id = NULL WHERE id = ?';
  const [result] = await pool.query(query, [ipId]);
  return result.affectedRows > 0;
};

// Delete an IP address
const deleteIpAddress = async (id) => {
  const query = 'DELETE FROM ip_addresses WHERE id = ?';
  const [result] = await pool.query(query, [id]);
  return result.affectedRows > 0;
};

export {
  createTable,
  validateIpAddress,
  addIpAddress,
  bulkAddIpAddresses,
  getAllIpAddresses,
  getDeviceIpAddresses,
  assignIpToDevice,
  unassignIpFromDevice,
  deleteIpAddress
};
