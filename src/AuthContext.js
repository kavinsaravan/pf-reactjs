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

  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await response.json();
      setUser({
        token,
        displayName: profileData.display_name,
        email: profileData.email,
        ...profileData
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('displayName');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email, password) => {
    const response = await fetch(`${API_URL}/api/signin`, {
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

    if (token) {
      localStorage.setItem('token', token);
      await fetchUserProfile(token);
    }

    return data;
  };

  const signup = async (email, password, userDisplayName) => {
    const response = await fetch(`${API_URL}/api/signup`, {
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

    if (token) {
      localStorage.setItem('token', token);
      await fetchUserProfile(token);
    }

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
