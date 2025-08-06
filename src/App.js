import './App.css';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthScreen from './AuthScreen';
import AppBar from './AppBar';
import Transactions from "./TransactionTable.js";
import { Box, CircularProgress } from '@mui/material';

function AppContent() {
  const { user, loading } = useAuth();

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

  return (
    <div className="App">
      <AppBar />
      <Transactions />
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
