import './App.css';
import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './AuthContext';
import AuthScreen from './AuthScreen';
import AppBar from './AppBar';
import Transactions from "./TransactionTable.js";
import InsightsPanel from './InsightsPanel.js';
import { Box, CircularProgress, Tabs, Tab } from '@mui/material';
import theme from './theme';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      <AppBar />
      <Box
        sx={{
          borderBottom: 2,
          borderColor: 'divider',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            maxWidth: '1400px',
            mx: 'auto',
            px: 2,
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '1.05rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#64748b',
              '&.Mui-selected': {
                color: '#667eea',
              },
              '&:hover': {
                color: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.04)',
              },
            },
          }}
        >
          <Tab label="Transactions" />
          <Tab label="Insights" />
        </Tabs>
      </Box>

      {activeTab === 0 && <Transactions />}
      {activeTab === 1 && <InsightsPanel />}
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
