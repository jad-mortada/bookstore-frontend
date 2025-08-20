/**
 * AuthContext.js
 * Provides simple JWT-based auth state to the app.
 * - Reads token from storage on load
 * - Exposes login/logout helpers and the decoded user object
 */

import React, { createContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

/**
 * React context carrying auth info and actions.
 * @type {React.Context<{user: null | {token:string, roles:string[], email?:string}, login:(token:string, rememberMe?:boolean)=>void, logout:()=>void}>}
 */
export const AuthContext = createContext();

/**
 * Read token from storage, preferring localStorage over sessionStorage.
 * @returns {string|null}
 */
const getToken = () =>
  localStorage.getItem('token') ||
  sessionStorage.getItem('token');

/**
 * Decode JWT and normalize the user shape used by the app.
 * Safely handles missing/invalid tokens.
 * @param {string|null|undefined} token
 * @returns {{token:string, roles:string[], email?:string} | null}
 */
const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    // Decode the JWT payload. jwt-decode does not validate signature; server must issue trusted tokens.
    const decoded = jwtDecode(token);

    // Normalize roles to an array. Some backends provide `roles` as array, others as comma-separated string
    // or `authorities`. We support both and coerce to string[].
    let roles = decoded.roles || decoded.authorities || [];
    if (typeof roles === 'string') {
      roles = roles.split(',').map(r => r.trim());
    }
    return {
      token,
      roles,
      // Prefer standard `sub` as user identifier; fall back to `email` when present.
      email: decoded.sub || decoded.email,
    };
  } catch {
    // If token is malformed/expired or decode fails, clear user state by returning null.
    return null;
  }
};

/**
 * Provider component storing the current user and exposing auth actions.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUserFromToken(getToken()));

  /**
   * Log in the user by storing the token and decoding user info.
   * @param {string} token JWT token
   * @param {boolean} [rememberMe=false] If true, persist in localStorage; otherwise sessionStorage
   */
  const login = (token, rememberMe = false) => {
    if (rememberMe) {
      // Persist across browser sessions
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token');
    } else {
      // Session-only persistence (clears on tab/browser close)
      sessionStorage.setItem('token', token);
      localStorage.removeItem('token');
    }
    // Decode and store normalized user in state
    setUser(getUserFromToken(token));
  };

  /**
   * Clear auth state and remove tokens from storage.
   */
  const logout = () => {
    // Remove token from both storage locations to be safe
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    // Clear in-memory user state
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};