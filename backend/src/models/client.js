import { pool } from '../db.js';

// Create clients table if it doesn't exist
const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20),
      location VARCHAR(255),
      device_id INT,
      ip_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL,
      FOREIGN KEY (ip_id) REFERENCES ip_addresses(id) ON DELETE SET NULL,
      UNIQUE KEY ip_unique (ip_id)
    )
  `;
  
  try {
    await pool.query(query);
    console.log('Clients table created or already exists');
  } catch (error) {
    console.error('Error creating clients table:', error);
    throw error;
  }
};

// Add a single client
const addClient = async (client) => {
  const { name, phone_number, location, device_id, ip_id } = client;
  const query = `
    INSERT INTO clients 
    (name, phone_number, location, device_id, ip_id) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  try {
    const [result] = await pool.query(query, [
      name,
      phone_number,
      location,
      device_id || null,
      ip_id || null
    ]);
    return result.insertId;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('IP address is already assigned to another client');
    }
    throw error;
  }
};

// Add multiple clients
const bulkAddClients = async (clients) => {
  const query = `
    INSERT INTO clients 
    (name, phone_number, location, device_id, ip_id) 
    VALUES ?
  `;
  const values = clients.map(c => [
    c.name,
    c.phone_number,
    c.location,
    c.device_id || null,
    c.ip_id || null
  ]);
  
  try {
    const [result] = await pool.query(query, [values]);
    return result.affectedRows;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('One or more IP addresses are already assigned');
    }
    throw error;
  }
};

// Get all clients with related info
const getAllClients = async () => {
  const query = `
    SELECT 
      c.*,
      d.device_name,
      ip.ip_address
    FROM clients c
    LEFT JOIN devices d ON c.device_id = d.id
    LEFT JOIN ip_addresses ip ON c.ip_id = ip.id
    ORDER BY c.created_at DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

// Get available IPs for a device
const getAvailableIps = async (deviceId = null) => {
  let query = `
    SELECT id, ip_address, device_id
    FROM ip_addresses ip
    WHERE ip.id NOT IN (SELECT ip_id FROM clients WHERE ip_id IS NOT NULL)
  `;
  
  if (deviceId) {
    query += ' AND (device_id = ? OR device_id IS NULL)';
    const [rows] = await pool.query(query, [deviceId]);
    return rows;
  }
  
  const [rows] = await pool.query(query);
  return rows;
};

// Update client
const updateClient = async (id, clientData) => {
  const { name, phone_number, location, device_id, ip_id } = clientData;
  const query = `
    UPDATE clients 
    SET name = ?, phone_number = ?, location = ?, device_id = ?, ip_id = ?
    WHERE id = ?
  `;
  
  try {
    const [result] = await pool.query(query, [
      name,
      phone_number,
      location,
      device_id || null,
      ip_id || null,
      id
    ]);
    return result.affectedRows > 0;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('IP address is already assigned to another client');
    }
    throw error;
  }
};

// Delete client
const deleteClient = async (id) => {
  const query = 'DELETE FROM clients WHERE id = ?';
  const [result] = await pool.query(query, [id]);
  return result.affectedRows > 0;
};

// Get unique locations (for dropdown)
const getLocations = async () => {
  const query = 'SELECT DISTINCT location FROM clients WHERE location IS NOT NULL';
  const [rows] = await pool.query(query);
  return rows.map(row => row.location);
};

export {
  createTable,
  addClient,
  bulkAddClients,
  getAllClients,
  getAvailableIps,
  updateClient,
  deleteClient,
  getLocations
};
