import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
} from '@mui/material';
import { useAuth } from './AuthContext';

const SignIn = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signin(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 440,
          position: 'relative',
          zIndex: 1,
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Sign in to manage your finances
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoFocus
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Box textAlign="center" sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" component="span">
            Don't have an account?{' '}
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={onToggleMode}
            sx={{
              cursor: 'pointer',
              fontWeight: 600,
              color: '#667eea',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
                color: '#764ba2',
              },
            }}
          >
            Sign Up
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignIn;