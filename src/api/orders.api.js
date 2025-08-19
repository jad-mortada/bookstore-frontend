import axiosInstance from './axiosInstance';

const API = '/api/customer-orders';
const LIST_API = '/api/lists';

const getOfficialList = (classId, year, schoolId) => {
  const cid = Number(classId);
  const yr = Number(year);
  const sid = schoolId != null ? `&schoolId=${Number(schoolId)}` : '';
  return axiosInstance.get(`${LIST_API}?classId=${cid}&year=${yr}${sid}`);
};

const createOrder = (orderDTO) =>
  axiosInstance.post(`${API}/generate-personalized-order`, orderDTO);

const getAllOrders = () => axiosInstance.get(`${API}`);
const getOrderById = (id) => axiosInstance.get(`${API}/${id}`);
const getOrdersByCustomer = (customerId) => axiosInstance.get(`${API}/by-customer/${customerId}`);
const updateOrder = (id, data) => axiosInstance.put(`${API}/${id}`, data);
const deleteOrder = (id) => axiosInstance.delete(`${API}/${id}`);

const customerBookOrderService = {
  getOfficialList,
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByCustomer,
  updateOrder,
  deleteOrder,
};
export default customerBookOrderService;