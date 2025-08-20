/**
 * @file books.api.js
 * @description Service functions for managing the book catalog.
 * Provides CRUD operations for books and image upload functionality.
 * All requests are authenticated via the shared axios instance.
 */

import axiosInstance from './axiosInstance';

// Base resource path for book endpoints
const API = '/api/books';

/**
 * Retrieves all books from the catalog.
 * 
 * @returns {Promise<import('axios').AxiosResponse>} Response containing an array of book objects
 * @throws {Error} If the request fails or user lacks permission
 */
const getBooks = () => axiosInstance.get(API);

/**
 * Searches books by a query string.
 * Performs a case-insensitive search across book titles, authors, and ISBNs.
 * 
 * @param {string} query - The search term to match against book properties
 * @returns {Promise<import('axios').AxiosResponse>} Response containing matching books
 * @throws {Error} If the request fails or the query is invalid
 */
const searchBooks = (query) => 
  axiosInstance.get(`${API}?query=${encodeURIComponent(query)}`);

/**
 * Creates a new book in the catalog.
 * 
 * @param {Object} data - The book data to create
 * @param {string} data.title - The title of the book (required)
 * @param {string} data.author - The author's name (required)
 * @param {string} data.isbn - The ISBN-13 or ISBN-10 (required)
 * @param {string} [data.publisher] - The publisher's name
 * @param {number} [data.publicationYear] - The year of publication
 * @param {string} [data.description] - A description of the book
 * @param {number} [data.pageCount] - The number of pages
 * @param {string} [data.language] - The language of the book (e.g., 'English')
 * @returns {Promise<import('axios').AxiosResponse>} Response with the created book
 * @throws {Error} If validation fails or a book with the same ISBN exists
 */
const createBook = (data) => axiosInstance.post(API, data);

/**
 * Updates an existing book in the catalog.
 * 
 * @param {number|string} id - The ID of the book to update
 * @param {Object} data - The updated book data (partial updates supported)
 * @param {string} [data.title] - Updated title
 * @param {string} [data.author] - Updated author
 * @param {string} [data.isbn] - Updated ISBN (must be unique)
 * @param {string} [data.publisher] - Updated publisher
 * @param {number} [data.publicationYear] - Updated publication year
 * @param {string} [data.description] - Updated description
 * @param {number} [data.pageCount] - Updated page count
 * @param {string} [data.language] - Updated language
 * @param {string} [data.imageUrl] - URL to the book's cover image
 * @returns {Promise<import('axios').AxiosResponse>} Response with the updated book
 * @throws {Error} If the book is not found or validation fails
 */
const updateBook = (id, data) => axiosInstance.put(`${API}/${id}`, data);

/**
 * Deletes a book from the catalog.
 * 
 * @param {number|string} id - The ID of the book to delete
 * @returns {Promise<import('axios').AxiosResponse>} Empty response on success
 * @throws {Error} If the book is not found or deletion fails
 */
const deleteBook = (id) => axiosInstance.delete(`${API}/${id}`);

/**
 * Uploads or replaces a book's cover image.
 * 
 * @param {number|string} id - The ID of the book to update
 * @param {File|Blob} file - The image file to upload (JPG, PNG, or GIF)
 * @param {Object} [options] - Additional options
 * @param {string} [options.fieldName='file'] - The form field name for the file
 * @returns {Promise<import('axios').AxiosResponse>} Response with the updated book including the new image URL
 * @throws {Error} If the upload fails or the book is not found
 */
const uploadBookImage = (id, file, options = {}) => {
  const formData = new FormData();
  const fieldName = options.fieldName || 'file';
  
  // Append the file to the form data
  formData.append(fieldName, file);
  
  // Let Axios automatically set the correct Content-Type with boundary
  return axiosInstance.post(`${API}/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * Service object containing all book-related API methods.
 * @namespace bookService
 */
const bookService = {
  /** @see getBooks */
  getBooks,
  
  /** @see searchBooks */
  searchBooks,
  
  /** @see createBook */
  createBook,
  
  /** @see updateBook */
  updateBook,
  
  /** @see deleteBook */
  deleteBook,
  
  /** @see uploadBookImage */
  uploadBookImage
};

export default bookService;