import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CardActionArea,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  DevicesOther as DeviceIcon,
  Router as NetworkIcon,
  People as ClientIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const StatCard = ({ title, value, loading }) => (
  <Paper 
    elevation={2}
    sx={{ 
      p: 2, 
      textAlign: 'center',
      bgcolor: 'primary.light',
      color: 'primary.contrastText'
    }}
  >
    <Typography variant="h6" component="div">
      {title}
    </Typography>
    <Typography variant="h4" component="div" sx={{ mt: 1 }}>
      {loading ? <CircularProgress size={30} /> : value}
    </Typography>
  </Paper>
);

const menuItems = [
  {
    title: 'Device Management',
    description: 'Add, edit and manage network devices',
    icon: DeviceIcon,
    items: [
      { name: 'Add Device', path: '/devices/add' },
      { name: 'Bulk Add Devices', path: '/devices/bulk-add' },
      { name: 'View Devices', path: '/devices/list' },
    ]
  },
  {
    title: 'IP Management',
    description: 'Manage IP address pool and assignments',
    icon: NetworkIcon,
    items: [
      { name: 'Add IP', path: '/ips/add' },
      { name: 'Bulk Add IPs', path: '/ips/bulk-add' },
      { name: 'IP Pool', path: '/ips/list' },
    ]
  },
  {
    title: 'Client Management',
    description: 'Manage client information and assignments',
    icon: ClientIcon,
    items: [
      { name: 'Add Client', path: '/clients/add' },
      { name: 'View Clients', path: '/clients/list' },
    ]
  },
];

const Home = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    devices: 0,
    ips: 0,
    clients: 0,
    loading: true
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [devices, ips, clients] = await Promise.all([
          api.getAllDevices(),
          api.getAllIpAddresses(),
          api.getAllClients()
        ]);
        setStats({
          devices: devices.length,
          ips: ips.length,
          clients: clients.length,
          loading: false
        });
      } catch (error) {
        console.error('Error loading statistics:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    loadStats();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          mb: 4,
          fontWeight: 'bold',
          color: 'primary.main'
        }}
      >
        Network Management System
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Total Devices" 
            value={stats.devices} 
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="IP Addresses" 
            value={stats.ips} 
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Active Clients" 
            value={stats.clients} 
            loading={stats.loading}
          />
        </Grid>
      </Grid>

      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        Quick Access
      </Typography>

      <Grid container spacing={3}>
        {menuItems.map((section) => (
          <Grid item xs={12} md={4} key={section.title}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <section.icon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h2" color="primary">
                    {section.title}
                  </Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {section.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {section.items.map((item) => (
                    <CardActionArea
                      key={item.name}
                      onClick={() => navigate(item.path)}
                      sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <Typography variant="body2" color="text.primary">
                        {item.name}
                      </Typography>
                    </CardActionArea>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
