/**
 * @file classes.api.js
 * @description Service functions for managing School Classes.
 * Provides CRUD operations for class entities and school-class relationships.
 * Uses axiosInstance for authenticated requests with JWT tokens.
 */

import axiosInstance from './axiosInstance';

// Base endpoint for class resources
const API = '/api/classes';

/**
 * Fetches all classes from the system.
 * 
 * @returns {Promise<import('axios').AxiosResponse>} Response containing an array of class objects
 * @throws {Error} If the request fails or returns an error status
 */
const getClasses = () => axiosInstance.get(API);

/**
 * Fetches classes associated with a specific school.
 * 
 * @param {number|string} schoolId - The ID of the school to filter classes by
 * @returns {Promise<import('axios').AxiosResponse>} Response containing an array of class objects
 * @throws {Error} If the request fails or the school is not found
 */
const getClassesBySchool = (schoolId) => 
  axiosInstance.get(`${API}/by-school/${schoolId}`);

/**
 * Creates a new class in the system.
 * 
 * @param {Object} data - The class data to create
 * @param {string} data.name - The name of the class
 * @param {string} data.description - Optional description of the class
 * @param {number|string} data.schoolId - The ID of the school this class belongs to
 * @param {string} [data.gradeLevel] - Optional grade level (e.g., '1', '2', 'K')
 * @returns {Promise<import('axios').AxiosResponse>} Response with the created class
 * @throws {Error} If the request fails or validation fails
 */
const createClass = (data) => axiosInstance.post(API, data);

/**
 * Updates an existing class.
 * 
 * @param {number|string} id - The ID of the class to update
 * @param {Object} data - The updated class data (partial updates supported)
 * @param {string} [data.name] - Updated name of the class
 * @param {string} [data.description] - Updated description
 * @param {string} [data.gradeLevel] - Updated grade level
 * @returns {Promise<import('axios').AxiosResponse>} Response with the updated class
 * @throws {Error} If the request fails or the class is not found
 */
const updateClass = (id, data) => axiosInstance.put(`${API}/${id}`, data);

/**
 * Deletes a class from the system.
 * 
 * @param {number|string} id - The ID of the class to delete
 * @returns {Promise<import('axios').AxiosResponse>} Empty response on success
 * @throws {Error} If the request fails or the class is not found
 */
const deleteClass = (id) => axiosInstance.delete(`${API}/${id}`);

/**
 * Service object containing all class-related API methods.
 * @namespace classService
 */
const classService = { 
  /** @see getClasses */
  getClasses, 
  
  /** @see getClassesBySchool */
  getClassesBySchool, 
  
  /** @see createClass */
  createClass, 
  
  /** @see updateClass */
  updateClass, 
  
  /** @see deleteClass */
  deleteClass 
};

export default classService;