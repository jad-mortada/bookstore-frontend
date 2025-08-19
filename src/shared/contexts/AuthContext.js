import React, { createContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

const getToken = () =>
  localStorage.getItem('token') ||
  sessionStorage.getItem('token');

const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);

    let roles = decoded.roles || decoded.authorities || [];
    if (typeof roles === 'string') {
      roles = roles.split(',').map(r => r.trim());
    }
    return {
      token,
      roles,
      email: decoded.sub || decoded.email,
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUserFromToken(getToken()));

  const login = (token, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', token);
      localStorage.removeItem('token');
    }
    setUser(getUserFromToken(token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};