/**
 * @file admin.api.js
 * @description Service functions for Admin user management.
 * Provides CRUD operations for administrator accounts in the system.
 * Uses axiosInstance for authenticated requests with JWT tokens.
 */

import axiosInstance from './axiosInstance';

// Base endpoint for admin management
const API = '/api/admins';

/**
 * Fetches all administrator accounts from the system.
 * 
 * @returns {Promise<import('axios').AxiosResponse>} Response containing an array of admin user objects
 * @throws {Error} If the request fails or user lacks permission
 */
const getAdmins = () => axiosInstance.get(API);

/**
 * Creates a new administrator account.
 * 
 * @param {Object} data - The admin user data
 * @param {string} data.email - The email address for the admin (also used as username)
 * @param {string} data.password - The password for the admin account
 * @param {string} data.firstName - Admin's first name
 * @param {string} data.lastName - Admin's last name
 * @param {string} [data.phone] - Optional phone number
 * @param {string[]} [data.roles] - Array of role names (e.g., ['ROLE_ADMIN'])
 * @returns {Promise<import('axios').AxiosResponse>} Response with the created admin user
 * @throws {Error} If validation fails or email already exists
 */
const createAdmin = (data) => axiosInstance.post(API, data);

/**
 * Updates an existing administrator account.
 * 
 * @param {number|string} id - The ID of the admin to update
 * @param {Object} data - The updated admin data (partial updates supported)
 * @param {string} [data.email] - Updated email address
 * @param {string} [data.password] - New password (if changing)
 * @param {string} [data.firstName] - Updated first name
 * @param {string} [data.lastName] - Updated last name
 * @param {string} [data.phone] - Updated phone number
 * @param {string[]} [data.roles] - Updated roles array
 * @returns {Promise<import('axios').AxiosResponse>} Response with the updated admin user
 * @throws {Error} If the admin is not found or validation fails
 */
const updateAdmin = (id, data) => axiosInstance.put(`${API}/${id}`, data);

/**
 * Deletes an administrator account.
 * 
 * @param {number|string} id - The ID of the admin to delete
 * @returns {Promise<import('axios').AxiosResponse>} Empty response on success
 * @throws {Error} If the admin is not found or deletion fails
 */
const deleteAdmin = (id) => axiosInstance.delete(`${API}/${id}`);

/**
 * Service object containing all admin-related API methods.
 * @namespace adminService
 */
const adminService = { 
  /** @see getAdmins */
  getAdmins, 
  
  /** @see createAdmin */
  createAdmin, 
  
  /** @see updateAdmin */
  updateAdmin, 
  
  /** @see deleteAdmin */
  deleteAdmin 
};

export default adminService;
