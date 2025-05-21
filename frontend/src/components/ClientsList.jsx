import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Alert,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tooltip,
  Divider,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Router as RouterIcon,
  AccountTree as SwitchIcon,
  NetworkCheck as NetworkIcon,
  DnsRounded as IpIcon,
  Person as PersonIcon,
  ContactPhone as ContactIcon,
  ViewList as ListIcon,
  ViewModule as GroupIcon
} from '@mui/icons-material';
import { api } from '../utils/api';

const ClientsList = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'group'
  const [clients, setClients] = useState([]);
  const [groupedClients, setGroupedClients] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedArea, setExpandedArea] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (viewMode === 'list') {
        console.log('Loading clients in list view');
        const data = await api.getAllClients();
        console.log('Received clients:', data?.length);
        setClients(data || []);
        setGroupedClients([]);
      } else {
        console.log('Loading clients in group view');
        const data = await api.getClientsByArea();
        console.log('Received grouped clients:', data?.length);
        setGroupedClients(data || []);
        setClients([]);
        if (data?.length > 0) {
          setExpandedArea(data[0].location_id);
        }
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setError('Failed to load clients: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Defining loadData inside useEffect to avoid dependency issues
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (viewMode === 'list') {
          console.log('Loading clients in list view');
          const data = await api.getAllClients();
          console.log('Received clients:', data?.length);
          setClients(data || []);
          setGroupedClients([]);
        } else {
          console.log('Loading clients in group view');
          const data = await api.getClientsByArea();
          console.log('Received grouped clients:', data?.length);
          setGroupedClients(data || []);
          setClients([]);
          if (data?.length > 0) {
            setExpandedArea(data[0].location_id);
          }
        }
      } catch (error) {
        console.error('Error loading clients:', error);
        setError('Failed to load clients: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [viewMode]);

  const handleDelete = async (id) => {
    try {
      await api.deleteClient(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting client:', error);
      setError('Failed to delete client');
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'switch':
        return <SwitchIcon />;
      case 'router':
        return <RouterIcon />;
      default:
        return <NetworkIcon />;
    }
  };

  const handleAreaChange = (locationId) => {
    setExpandedArea(expandedArea === locationId ? null : locationId);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const renderClientCard = (client, locationName) => (
    <Grid item xs={12} md={6} key={client.id}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" component="div">
                {client.name}
              </Typography>
              <Box>
                <Tooltip title="Edit Client">
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Client">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(client.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider />

            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getDeviceIcon(client.device_type)}
                <Typography variant="body2" color="textSecondary">
                  {client.device_name}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IpIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {client.ip_address}
                </Typography>
              </Box>

              {client.contact_info && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ContactIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {client.contact_info}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  icon={<LocationIcon />}
                  label={locationName || client.location_name}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  icon={getDeviceIcon(client.device_type)}
                  label={client.device_type || 'Device'}
                  color="default"
                  variant="outlined"
                />
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon /> Clients
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="list">
            <Tooltip title="List View">
              <ListIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="group">
            <Tooltip title="Grouped by Area">
              <GroupIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'list' ? (
        <>
          {clients.length === 0 ? (
            <Typography color="textSecondary" align="center">
              No clients found
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {clients.map(client => renderClientCard(client))}
            </Grid>
          )}
        </>
      ) : (
        groupedClients.map((area) => (
          <Accordion
            key={area.location_id}
            expanded={expandedArea === area.location_id}
            onChange={() => handleAreaChange(area.location_id)}
            sx={{ mt: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <LocationIcon color="primary" />
                <Typography variant="h6">{area.location_name}</Typography>
                <Badge badgeContent={area.clients?.length || 0} color="primary" showZero>
                  <PersonIcon color="action" />
                </Badge>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {area.clients?.filter(Boolean).map(client => 
                  renderClientCard(client, area.location_name)
                )}
                {(!area.clients || area.clients.length === 0) && (
                  <Grid item xs={12}>
                    <Typography color="textSecondary" align="center">
                      No clients in this area
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Paper>
  );
};

export default ClientsList;
