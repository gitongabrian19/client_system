import { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  DevicesOther as DeviceIcon,
  Router as NetworkIcon,
  People as ClientIcon,
  Add as AddIcon,
  ViewList as ListIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { 
    type: 'item',
    name: 'Home',
    path: '/',
    icon: HomeIcon 
  },
  { type: 'divider' },
  {
    type: 'group',
    name: 'Device Management',
    items: [
      { name: 'Add Device', path: '/devices/add', icon: AddIcon },
      { name: 'Bulk Add Devices', path: '/devices/bulk-add', icon: UploadIcon },
      { name: 'View Devices', path: '/devices/list', icon: ListIcon },
    ]
  },
  { type: 'divider' },
  {
    type: 'group',
    name: 'Client Management',
    items: [
      { name: 'Add Client', path: '/clients/add', icon: AddIcon },
      { name: 'View Clients', path: '/clients/list', icon: ListIcon },
      { name: 'Clients by Area', path: '/clients/by-area', icon: ClientIcon },
    ]
  },
  { type: 'divider' },
  {
    type: 'group',
    name: 'IP Management',
    items: [
      { name: 'Add IP', path: '/ips/add', icon: AddIcon },
      { name: 'Bulk Add IPs', path: '/ips/bulk-add', icon: UploadIcon },
      { name: 'IP Pool', path: '/ips/list', icon: ListIcon },
    ]
  },
  { type: 'divider' },
  {
    type: 'group',
    name: 'Client Management',
    items: [
      { name: 'Add Client', path: '/clients/add', icon: AddIcon },
      { name: 'View Clients', path: '/clients/list', icon: ListIcon },
    ]
  },
];

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return <Divider key={index} />;
          }

          if (item.type === 'group') {
            return (
              <Box key={index}>
                <ListItem>
                  <ListItemText 
                    primary={item.name}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                  />
                </ListItem>
                {item.items.map((subItem) => (
                  <ListItem key={subItem.path} disablePadding>
                    <ListItemButton
                      selected={location.pathname === subItem.path}
                      onClick={() => handleNavigation(subItem.path)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon>
                        <subItem.icon />
                      </ListItemIcon>
                      <ListItemText primary={subItem.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </Box>
            );
          }

          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Network Management System
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
