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
    <MuiAppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Typography
          variant="h5"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Personal Finance
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user?.displayName && (
            <Typography
              variant="body1"
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: '1.05rem',
              }}
            >
              {getFirstName(user.displayName)}
            </Typography>
          )}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              },
            }}
          >
            <AccountCircle sx={{ fontSize: 32 }} />
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
