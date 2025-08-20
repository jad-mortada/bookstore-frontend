/**
 * tempOrders.api.js
 * Service functions for managing temporary (draft) orders.
 * Handles the complete lifecycle of draft orders including creation, modification,
 * submission, and approval workflows.
 * Uses the shared axiosInstance for authenticated requests.
 */
import api from './axiosInstance';

// Base API endpoint for temporary orders
const BASE = '/api/temp-orders';

/**
 * Retrieves the current user's active draft order.
 * @returns {Promise<Object>} Promise resolving to the current draft order
 */
const getMyDraft = () => api.get(`${BASE}/me`);

/**
 * Adds multiple items to the current user's draft order.
 * @param {Array<Object>} items - Array of items to add
 * @returns {Promise<Object>} Promise resolving to the updated draft order
 */
const addItems = (items) => api.post(`${BASE}/items`, items);

/**
 * Adds items to a specific draft order by ID (admin function).
 * @param {string} tempOrderId - ID of the target draft order
 * @param {Array<Object>} items - Array of items to add
 * @returns {Promise<Object>} Promise resolving to the updated draft order
 */
const addItemsTo = (tempOrderId, items) => api.post(`${BASE}/${tempOrderId}/items`, items);

/**
 * Updates a specific item within a draft order.
 * @param {string} itemId - ID of the item to update
 * @param {Object} item - Updated item data
 * @returns {Promise<Object>} Promise resolving to the updated item
 */
const updateItem = (itemId, item) => api.put(`${BASE}/items/${itemId}`, item);

/**
 * Removes an item from the draft order.
 * @param {string} itemId - ID of the item to remove
 * @returns {Promise<Object>} Promise resolving to the operation result
 */
const removeItem = (itemId) => api.delete(`${BASE}/items/${itemId}`);

/**
 * Cancels and deletes a draft order.
 * @param {string} tempOrderId - ID of the draft to cancel
 * @returns {Promise<Object>} Promise resolving to the operation result
 */
const cancel = (tempOrderId) => api.delete(`${BASE}/${tempOrderId}`);

/**
 * Submits a draft order for approval/processing.
 * @param {string} tempOrderId - ID of the draft to submit
 * @returns {Promise<Object>} Promise resolving to the submission result
 */
const submit = (tempOrderId) => api.post(`${BASE}/${tempOrderId}/submit`);

// ===== ADMIN FUNCTIONS =====

/**
 * Lists all submitted draft orders awaiting approval (admin only).
 * @returns {Promise<Array>} Promise resolving to array of submitted drafts
 */
const listSubmitted = () => api.get(`${BASE}`);

/**
 * Approves a submitted draft order (admin only).
 * @param {string} tempOrderId - ID of the draft to approve
 * @returns {Promise<Object>} Promise resolving to the approved order
 */
const approve = (tempOrderId) => api.post(`${BASE}/${tempOrderId}/approve`);

// ===== EXTRA FUNCTIONS =====

/**
 * Lists all draft orders for the current user, including history.
 * @returns {Promise<Array>} Promise resolving to array of user's draft orders
 */
const listMyDrafts = () => api.get(`${BASE}/me/list`);

/**
 * Retrieves detailed information about a specific draft order (admin only).
 * @param {string} tempOrderId - ID of the draft to retrieve
 * @returns {Promise<Object>} Promise resolving to the draft order details
 */
const getById = (tempOrderId) => api.get(`${BASE}/${tempOrderId}`);

// Aggregated service object for all temporary order API functions
const tempOrderService = {
  // Core draft management
  getMyDraft,
  addItems,
  addItemsTo,
  updateItem,
  removeItem,
  cancel,
  submit,
  
  // Admin functions
  listSubmitted,
  approve,
  getById,
  
  // User functions
  listMyDrafts,
};

export default tempOrderService;
