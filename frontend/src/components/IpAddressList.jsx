import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Tooltip,
  Badge,
  Tab,
  Tabs,
  LinearProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon,
  Router as RouterIcon,
  AccountTree as SwitchIcon,
  RouterOutlined as APIcon,
  Check as CheckIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { api } from '../utils/api';
import AssignIpDialog from './AssignIpDialog';

const IpAddressList = () => {
  const [ips, setIps] = useState([]);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [selectedIp, setSelectedIp] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const groupIpsByDevice = (ips) => {
    const groups = {};
    ips.forEach(ip => {
      if (ip.device_id) {
        if (!groups[ip.device_id]) {
          groups[ip.device_id] = {
            deviceName: ip.device_name,
            deviceType: ip.device_type,
            gateway: null,
            assigned: [],
            available: []
          };
        }
        
        // Check if this is a gateway IP (ends in .1)
        if (ip.ip_address.endsWith('.1')) {
          groups[ip.device_id].gateway = ip;
        } else {
          // Sort into assigned (has client) or available
          if (ip.client_id) {
            groups[ip.device_id].assigned.push(ip);
          } else {
            groups[ip.device_id].available.push(ip);
          }
        }
      }
    });
    return groups;
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'router':
        return <RouterIcon />;
      case 'switch':
        return <SwitchIcon />;
      case 'ap':
        return <APIcon />;
      default:
        return null;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [ipsData, devicesData] = await Promise.all([
        api.getAllIpAddresses(),
        api.getAllDevices()
      ]);
      setIps(ipsData);
      setDevices(devicesData);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.deleteIpAddress(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting IP:', err);
      setError('Failed to delete IP address');
    }
  };

  const handleAssignClick = (ip) => {
    setSelectedIp(ip);
    setAssignDialogOpen(true);
  };

  const handleAssignDialogClose = () => {
    setAssignDialogOpen(false);
    setSelectedIp(null);
  };

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  const deviceGroups = groupIpsByDevice(ips);
  const unusedIps = ips.filter(ip => !ip.device_id);

  if (loading) {
    return (
      <Paper sx={{ mt: 4, p: 2 }}>
        <LinearProgress />
      </Paper>
    );
  }

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        IP Addresses
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab 
          label={
            <Badge 
              badgeContent={Object.keys(deviceGroups).length} 
              color="primary"
            >
              Device IPs
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge 
              badgeContent={unusedIps.length} 
              color="error"
            >
              Unassigned IPs
            </Badge>
          } 
        />
      </Tabs>

      {activeTab === 0 && (
        Object.entries(deviceGroups).map(([deviceId, data]) => (
          <Accordion key={deviceId}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                  {getDeviceIcon(data.deviceType)}
                  <Box sx={{ ml: 1 }}>
                    <Typography>
                      {data.deviceName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Management IP: {data.management_ip}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    icon={<CheckIcon />}
                    label={`${data.assigned.length} Assigned`}
                    color="success"
                    size="small"
                  />
                  <Chip
                    icon={<ClearIcon />}
                    label={`${data.available.length} Available`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {data.gateway && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Gateway
                  </Typography>
                  <Chip
                    label={data.gateway.ip_address}
                    color="warning"
                    variant="outlined"
                  />
                </Box>
              )}
              
              <Typography variant="subtitle2" gutterBottom>
                IP Addresses
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...data.assigned, ...data.available]
                      .sort((a, b) => {
                        const aNum = Number(a.ip_address.split('.')[3]);
                        const bNum = Number(b.ip_address.split('.')[3]);
                        return aNum - bNum;
                      })
                      .map((ip) => (
                        <TableRow key={ip.id}>
                          <TableCell>{ip.ip_address}</TableCell>
                          <TableCell>
                            <Chip
                              label={ip.client_id ? "Assigned" : "Available"}
                              color={ip.client_id ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {ip.client_name || '-'}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Assign to Client">
                              <IconButton
                                size="small"
                                onClick={() => handleAssignClick(ip)}
                                disabled={!!ip.client_id}
                              >
                                <LinkIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(ip.id)}
                                disabled={!!ip.client_id}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {activeTab === 1 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>IP Address</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unusedIps.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell>{ip.ip_address}</TableCell>
                  <TableCell>{ip.description || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(ip.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {unusedIps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No unassigned IP addresses
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AssignIpDialog
        open={assignDialogOpen}
        onClose={handleAssignDialogClose}
        ip={selectedIp}
        devices={devices}
        onAssign={loadData}
      />
    </Paper>
  );
};

export default IpAddressList;
