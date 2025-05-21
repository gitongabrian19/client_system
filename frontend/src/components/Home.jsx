import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CardActionArea,
  CircularProgress,
  Paper,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import {
  DevicesOther as DeviceIcon,
  Router as NetworkIcon,
  People as ClientIcon,
  TrendingUp as TrendingIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
  const [chartTimeframe, setChartTimeframe] = useState('week');

  const [stats, setStats] = useState({
    devices: 0,
    ips: 0,
    clients: 0,
    deviceTypes: [],
    ipUtilization: 0,
    clientsByArea: [],
    ipHistory: [],
    loading: true
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [devices, ips, clients, locations] = await Promise.all([
          api.getAllDevices(),
          api.getAllIpAddresses(),
          api.getAllClients(),
          api.getLocations()
        ]);

        // Calculate device types distribution
        const deviceTypeCounts = devices.reduce((acc, device) => {
          acc[device.device_type] = (acc[device.device_type] || 0) + 1;
          return acc;
        }, {});

        const deviceTypes = Object.entries(deviceTypeCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }));

        // Calculate IP utilization
        const totalIps = ips.length;
        const usedIps = ips.filter(ip => ip.client_id).length;
        const ipUtilization = totalIps > 0 ? Math.round((usedIps / totalIps) * 100) : 0;

        // Calculate clients by area
        const clientsByArea = locations.map(location => ({
          name: location.name,
          value: clients.filter(client => 
            devices.find(d => d.id === client.device_id)?.location_id === location.id
          ).length
        }));

        // Generate mock historical data for the IP usage chart
        const today = new Date();
        const ipHistory = Array.from({ length: 7 }).map((_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            used: Math.floor(usedIps * (0.85 + Math.random() * 0.3)),
            total: totalIps
          };
        });

        setStats({
          devices: devices.length,
          ips: totalIps,
          clients: clients.length,
          deviceTypes,
          ipUtilization,
          clientsByArea,
          ipHistory,
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
        Network Dashboard
      </Typography>

      {/* Summary Cards */}
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

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* IP Usage Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingIcon color="primary" /> IP Usage Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.ipHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="used" 
                    name="Used IPs"
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Total IPs"
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* IP Utilization */}
        <Grid item xs={12} sm={6} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon color="primary" /> IP Utilization
            </Typography>
            <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h2" color="primary" sx={{ mb: 1 }}>
                {stats.ipUtilization}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of IP addresses in use
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Device Types Distribution */}
        <Grid item xs={12} sm={6} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeviceIcon color="primary" /> Device Types
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.deviceTypes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats.deviceTypes.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Clients by Area */}
        <Grid item xs={12} sm={6} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ClientIcon color="primary" /> Clients by Area
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.clientsByArea}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#8884d8" name="Clients" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Access Section */}
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
