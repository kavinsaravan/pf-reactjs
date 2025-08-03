import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const displayName = localStorage.getItem('displayName');
    if (token) {
      setUser({ token, displayName });
    }
    setLoading(false);
  }, []);

  const signin = async (email, password) => {
    const response = await fetch('http://127.0.0.1:5000/api/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Sign in failed');
    }

    const data = await response.json();
    console.log('Sign in response:', data);
    const token = data.token;
    const displayName = data.display_name;
    
    if (token) {
      localStorage.setItem('token', token);
    }
    if (displayName) {
      localStorage.setItem('displayName', displayName);
    }
    setUser({ token, email, displayName });
    
    return data;
  };

  const signup = async (email, password, userDisplayName) => {
    const response = await fetch('http://127.0.0.1:5000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, display_name: userDisplayName }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Sign up failed');
    }

    const data = await response.json();
    console.log('Sign up response:', data);
    const token = data.token;
    const displayName = data.display_name;
    
    if (token) {
      localStorage.setItem('token', token);
    }
    if (displayName) {
      localStorage.setItem('displayName', displayName);
    }
    setUser({ token, email, displayName });
    
    return data;
  };

  const signout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('displayName');
    setUser(null);
  };

  const value = {
    user,
    signin,
    signup,
    signout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};