import React from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Box,
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useAuth } from './AuthContext';

const AppBar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { signout, user } = useAuth();

  const getFirstName = (displayName) => {
    if (!displayName) return '';
    return displayName.split(' ')[0];
  };


  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    signout();
    handleClose();
  };

  const handleChangePassword = () => {
    handleClose();
    alert('Change password functionality will be coming soon!');
  };

  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Personal Finance
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user?.displayName && (
            <Typography variant="body1" sx={{ color: 'inherit' }}>
              {getFirstName(user.displayName)}
            </Typography>
          )}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{ mt: '45px' }}
          >
            {user && (
              <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {user.displayName || 'No Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email || 'No Email'}
                </Typography>
              </Box>
            )}
            <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
            <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
