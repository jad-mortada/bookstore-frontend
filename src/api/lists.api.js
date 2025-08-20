/**
 * @file lists.api.js
 * @description Service for managing Yearly Book Lists and their book associations.
 * Provides CRUD operations for book lists and methods to manage book-list relationships.
 * Uses axiosInstance for authenticated requests with JWT tokens.
 */

import axiosInstance from './axiosInstance';

// Base path for Yearly Book Lists endpoints
const BASE_URL = '/api/lists';

/**
 * Fetches all yearly book lists from the system.
 * 
 * @returns {Promise<import('axios').AxiosResponse>} Response containing an array of book list objects
 * @throws {Error} If the request fails or user lacks permission
 */
const getLists = () => axiosInstance.get(BASE_URL);

/**
 * Creates a new yearly book list for a class.
 * 
 * @param {Object} data - The book list data
 * @param {number|string} data.classId - The ID of the class this list is for
 * @param {number|string} data.year - The academic year (e.g., 2023)
 * @param {string} [data.description] - Optional description of the book list
 * @returns {Promise<import('axios').AxiosResponse>} Response with the created book list
 * @throws {Error} If validation fails or a list already exists for the class/year
 */
const createList = (data) => axiosInstance.post(BASE_URL, data);

/**
 * Updates an existing yearly book list.
 * 
 * @param {number|string} id - The ID of the book list to update
 * @param {Object} data - The updated book list data (partial updates supported)
 * @param {number|string} [data.classId] - Updated class ID
 * @param {number|string} [data.year] - Updated academic year
 * @param {string} [data.description] - Updated description
 * @returns {Promise<import('axios').AxiosResponse>} Response with the updated book list
 * @throws {Error} If the list is not found or validation fails
 */
const updateList = (id, data) => axiosInstance.put(`${BASE_URL}/${id}`, data);

/**
 * Deletes a yearly book list.
 * 
 * @param {number|string} id - The ID of the book list to delete
 * @returns {Promise<import('axios').AxiosResponse>} Empty response on success
 * @throws {Error} If the list is not found or deletion fails
 */
const deleteList = (id) => axiosInstance.delete(`${BASE_URL}/${id}`);

/**
 * Retrieves all books linked to a specific yearly book list.
 * 
 * @param {number|string} listId - The ID of the book list
 * @returns {Promise<import('axios').AxiosResponse>} Response containing an array of book objects with list-specific data
 * @throws {Error} If the list is not found or the request fails
 */
const getListBooks = (listId) => axiosInstance.get(`${BASE_URL}/${listId}/books`);

/**
 * Links a book to a yearly book list.
 * 
 * @param {number|string} listId - The ID of the book list
 * @param {number|string} bookId - The ID of the book to link
 * @param {Object} [options] - Additional options for the book-list association
 * @param {boolean} [options.required] - Whether the book is required
 * @param {string} [options.notes] - Additional notes about this book in the list
 * @returns {Promise<import('axios').AxiosResponse>} Response with the created book-list association
 * @throws {Error} If the list or book is not found, or if the book is already in the list
 */
const linkBookToList = (listId, bookId, options = {}) => 
  axiosInstance.post(`${BASE_URL}/books`, { 
    listId, 
    bookId,
    ...options 
  });

/**
 * Unlinks a book from a yearly book list.
 * 
 * @param {number|string} listBookId - The ID of the book-list association to remove
 * @returns {Promise<import('axios').AxiosResponse>} Empty response on success
 * @throws {Error} If the association is not found or the request fails
 */
const unlinkBookFromList = (listBookId) => 
  axiosInstance.delete(`${BASE_URL}/books/${listBookId}`);

/**
 * Service object containing all book list-related API methods.
 * @namespace listService
 */
const listService = {
  /** @see getLists */
  getLists,
  
  /** @see createList */
  createList,
  
  /** @see updateList */
  updateList,
  
  /** @see deleteList */
  deleteList,
  
  /** @see getListBooks */
  getListBooks,
  
  /** @see linkBookToList */
  linkBookToList,
  
  /** @see unlinkBookFromList */
  unlinkBookFromList,
};

export default listService;
