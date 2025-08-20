/**
 * @file orders.api.js
 * @description Client for interacting with the Customer Book Orders API.
 * Handles all CRUD operations for customer orders and official book lists.
 * Uses axiosInstance for authenticated requests with JWT tokens.
 */

import axiosInstance from './axiosInstance';

// API endpoint constants
const API = '/api/customer-orders';       // Base path for order operations
const LIST_API = '/api/lists';           // Base path for list operations

/**
 * Fetches the official book list for a specific class and academic year.
 * Optionally filters by school if schoolId is provided.
 * 
 * @param {number|string} classId - The ID of the class to get the list for
 * @param {number|string} year - The academic year (e.g., 2023)
 * @param {number|string} [schoolId] - Optional school ID for filtering
 * @returns {Promise<import('axios').AxiosResponse>} Response containing the official list data
 * @throws {Error} If the request fails or returns an error status
 */
const getOfficialList = (classId, year, schoolId) => {
  // Ensure numeric values for the API
  const cid = Number(classId);
  const yr = Number(year);
  // Only include schoolId in the query if provided
  const sid = schoolId != null ? `&schoolId=${Number(schoolId)}` : '';
  
  return axiosInstance.get(`${LIST_API}?classId=${cid}&year=${yr}${sid}`);
};

/**
 * Creates a new personalized order from the provided order data.
 * 
 * @param {Object} orderDTO - The order data transfer object containing:
 *   @param {Array<Object>} orderDTO.items - Array of order items
 *   @param {string} orderDTO.customerId - ID of the customer placing the order
 *   @param {string} [orderDTO.notes] - Optional order notes
 * @returns {Promise<import('axios').AxiosResponse>} Response with the created order
 * @throws {Error} If the request fails or returns an error status
 */
const createOrder = (orderDTO) =>
  axiosInstance.post(`${API}/generate-personalized-order`, orderDTO);

/**
 * Retrieves all orders (admin only).
 * 
 * @returns {Promise<import('axios').AxiosResponse>} Response containing all orders
 */
const getAllOrders = () => axiosInstance.get(API);

/**
 * Retrieves a specific order by its ID.
 * 
 * @param {string|number} id - The ID of the order to retrieve
 * @returns {Promise<import('axios').AxiosResponse>} Response containing the order data
 */
const getOrderById = (id) => axiosInstance.get(`${API}/${id}`);

/**
 * Retrieves all orders for a specific customer.
 * 
 * @param {string|number} customerId - The ID of the customer
 * @returns {Promise<import('axios').AxiosResponse>} Response containing the customer's orders
 */
const getOrdersByCustomer = (customerId) => 
  axiosInstance.get(`${API}/by-customer/${customerId}`);

/**
 * Updates an existing order.
 * 
 * @param {string|number} id - The ID of the order to update
 * @param {Object} data - The updated order data
 * @returns {Promise<import('axios').AxiosResponse>} Response with the updated order
 */
const updateOrder = (id, data) => axiosInstance.put(`${API}/${id}`, data);

/**
 * Deletes an order.
 * 
 * @param {string|number} id - The ID of the order to delete
 * @returns {Promise<import('axios').AxiosResponse>} Empty response on success
 */
const deleteOrder = (id) => axiosInstance.delete(`${API}/${id}`);

/**
 * Service object containing all order-related API methods.
 * @namespace customerBookOrderService
 */
const customerBookOrderService = {
  /** @see getOfficialList */
  getOfficialList,
  
  /** @see createOrder */
  createOrder,
  
  /** @see getAllOrders */
  getAllOrders,
  
  /** @see getOrderById */
  getOrderById,
  
  /** @see getOrdersByCustomer */
  getOrdersByCustomer,
  
  /** @see updateOrder */
  updateOrder,
  
  /** @see deleteOrder */
  deleteOrder,
};

export default customerBookOrderService;