import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocationOn as LocationIcon
} from '@mui/icons-material';
import { api } from '../utils/api';

const LocationManagement = () => {
    const [locations, setLocations] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const loadLocations = async () => {
        try {
            const data = await api.getLocations();
            setLocations(data);
        } catch (error) {
            showNotification('Error loading locations', 'error');
        }
    };

    useEffect(() => {
        loadLocations();
    }, []);

    const handleOpenDialog = (location = null) => {
        if (location) {
            setEditingLocation(location);
            setFormData({
                name: location.name,
                description: location.description || ''
            });
        } else {
            setEditingLocation(null);
            setFormData({ name: '', description: '' });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingLocation(null);
        setFormData({ name: '', description: '' });
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLocation) {
                await api.updateLocation(editingLocation.id, formData);
                showNotification('Location updated successfully');
            } else {
                await api.addLocation(formData);
                showNotification('Location added successfully');
            }
            handleCloseDialog();
            loadLocations();
        } catch (error) {
            showNotification(error.response?.data?.error || 'Error saving location', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            try {
                await api.deleteLocation(id);
                showNotification('Location deleted successfully');
                loadLocations();
            } catch (error) {
                showNotification(error.response?.data?.error || 'Error deleting location', 'error');
            }
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1">
                    Location Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Location
                </Button>
            </Box>

            <Paper elevation={2}>
                <List>
                    {locations.map((location) => (
                        <ListItem key={location.id} divider>
                            <ListItemText
                                primary={location.name}
                                secondary={location.description}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="edit"
                                    onClick={() => handleOpenDialog(location)}
                                    sx={{ mr: 1 }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleDelete(location.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    {locations.length === 0 && (
                        <ListItem>
                            <ListItemText
                                primary="No locations found"
                                secondary="Click 'Add Location' to create a new location"
                            />
                        </ListItem>
                    )}
                </List>
            </Paper>

            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>
                    {editingLocation ? 'Edit Location' : 'Add New Location'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Location Name"
                            type="text"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            type="text"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {editingLocation ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LocationManagement; 