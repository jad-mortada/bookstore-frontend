import api from './axiosInstance';

const BASE = '/api/temp-orders';

const getMyDraft = () => api.get(`${BASE}/me`);
const addItems = (items) => api.post(`${BASE}/items`, items);
const addItemsTo = (tempOrderId, items) => api.post(`${BASE}/${tempOrderId}/items`, items);
const updateItem = (itemId, item) => api.put(`${BASE}/items/${itemId}`, item);
const removeItem = (itemId) => api.delete(`${BASE}/items/${itemId}`);
const cancel = (tempOrderId) => api.delete(`${BASE}/${tempOrderId}`);
const submit = (tempOrderId) => api.post(`${BASE}/${tempOrderId}/submit`);

// Admin
const listSubmitted = () => api.get(`${BASE}`);
const approve = (tempOrderId) => api.post(`${BASE}/${tempOrderId}/approve`);

// Extra
const listMyDrafts = () => api.get(`${BASE}/me/list`);
// Admin view draft details by ID
const getById = (tempOrderId) => api.get(`${BASE}/${tempOrderId}`);

const tempOrderService = {
  getMyDraft,
  addItems,
  addItemsTo,
  updateItem,
  removeItem,
  cancel,
  submit,
  listSubmitted,
  approve,
  listMyDrafts,
  getById,
};

export default tempOrderService;
