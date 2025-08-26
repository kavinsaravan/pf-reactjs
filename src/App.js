import './App.css';
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthScreen from './AuthScreen';
import AppBar from './AppBar';
import Transactions from "./TransactionTable.js";
import InsightsPanel from './InsightsPanel.js';
import { Box, CircularProgress, Tabs, Tab } from '@mui/material';

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
    <div className="App">
      <AppBar />
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ maxWidth: '1400px', mx: 'auto', px: 2 }}
        >
          <Tab label="Transactions" />
          <Tab label="Insights" />
        </Tabs>
      </Box>
      
      {activeTab === 0 && <Transactions />}
      {activeTab === 1 && <InsightsPanel />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
