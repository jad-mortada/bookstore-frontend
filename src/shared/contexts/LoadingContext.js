/**
 * LoadingContext.js
 * Global loading state shared across the app for simple spinners and busy indicators.
 */

import React, { createContext, useState, useContext } from 'react';

/**
 * Context carrying loading boolean and its setter.
 * @type {React.Context<{loading: boolean, setLoading: React.Dispatch<React.SetStateAction<boolean>>}>}
 */
// Simple boolean-based loading context; consumers can show spinners/overlays
// when `loading === true`. No reducer is used to keep the API minimal.
const LoadingContext = createContext();

/**
 * Convenience hook to access global loading state.
 */
export const useLoading = () => useContext(LoadingContext); // Convenience hook

/**
 * Provider that exposes a simple `loading` flag and `setLoading` action.
 */
export const LoadingProvider = ({ children }) => {
  // Keep state colocated here so any component can toggle global loading
  const [loading, setLoading] = useState(false);

  // Expose both the flag and setter for maximum flexibility
  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};