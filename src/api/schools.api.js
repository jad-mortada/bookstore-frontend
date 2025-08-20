/**
 * schools.api.js
 * Service functions for School entities.
 * Handles all API interactions for school management including CRUD operations and search.
 * Uses the shared axiosInstance which includes auth headers.
 */
import axiosInstance from './axiosInstance';

// Base API endpoint for school resources
const API = '/api/schools';

/**
 * Fetches all schools from the API.
 * @returns {Promise<Array>} Promise resolving to array of school objects
 */
const getSchools = () => axiosInstance.get(API);

/**
 * Searches schools by name using server-side filtering.
 * @param {string} name - Partial or full school name to search for
 * @returns {Promise<Array>} Promise resolving to array of matching school objects
 */
const searchSchools = (name) => 
  axiosInstance.get(`${API}?name=${encodeURIComponent(name)}`);

/**
 * Creates a new school.
 * @param {Object} data - School data including name and other required fields
 * @returns {Promise<Object>} Promise resolving to the created school object
 */
const createSchool = (data) => axiosInstance.post(API, data);

/**
 * Updates an existing school.
 * @param {string} id - ID of the school to update
 * @param {Object} data - Updated school data
 * @returns {Promise<Object>} Promise resolving to the updated school object
 */
const updateSchool = (id, data) => axiosInstance.put(`${API}/${id}`, data);

/**
 * Deletes a school by ID.
 * @param {string} id - ID of the school to delete
 * @returns {Promise<Object>} Promise resolving to the deletion confirmation
 */
const deleteSchool = (id) => axiosInstance.delete(`${API}/${id}`);

// Aggregated service object for all school-related API functions
const schoolService = { 
  getSchools, 
  searchSchools, 
  createSchool, 
  updateSchool, 
  deleteSchool 
};

export default schoolService;