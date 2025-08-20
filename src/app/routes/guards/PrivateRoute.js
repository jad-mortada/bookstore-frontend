/**
 * PrivateRoute.js
 * Simple route guard: renders children if a user exists, otherwise redirects to /login.
 */

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../../shared/contexts/AuthContext';

/**
 * Protects nested routes by checking authentication state.
 * @param {{children: React.ReactElement}} props
 */
const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;