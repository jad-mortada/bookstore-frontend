/**
 * listService.js
 * Robust service for Yearly Book List CRUD and book-linking.
 * All methods use axiosInstance for authentication and error handling.
 */
import axiosInstance from './axiosInstance';

const BASE_URL = '/api/lists';

/**
 * Fetch all yearly book lists.
 * @returns {Promise} Axios response
 */
export const getLists = () => axiosInstance.get(BASE_URL);

/**
 * Create a new yearly book list.
 * @param {Object} data - { classId, year }
 */
export const createList = (data) => axiosInstance.post(BASE_URL, data);

/**
 * Update an existing yearly book list.
 * @param {number|string} id
 * @param {Object} data
 */
export const updateList = (id, data) => axiosInstance.put(`${BASE_URL}/${id}`, data);

/**
 * Delete a yearly book list.
 * @param {number|string} id
 */
export const deleteList = (id) => axiosInstance.delete(`${BASE_URL}/${id}`);

/**
 * Get all books linked to a yearly book list.
 * @param {number|string} listId
 */
export const getListBooks = (listId) => axiosInstance.get(`${BASE_URL}/${listId}/books`);

/**
 * Link a book to a yearly book list.
 * @param {number|string} listId
 * @param {number|string} bookId
 */
export const linkBookToList = (listId, bookId) => axiosInstance.post(`${BASE_URL}/books`, { listId, bookId });

/**
 * Unlink a book from a yearly book list.
 * @param {number|string} listId
 * @param {number|string} bookId
 */
export const unlinkBookFromList = (listBookId) => axiosInstance.delete(`${BASE_URL}/books/${listBookId}`);

const listService = {
  getLists,
  createList,
  updateList,
  deleteList,
  getListBooks,
  linkBookToList,
  unlinkBookFromList,
};
export default listService;
