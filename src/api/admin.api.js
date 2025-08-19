import axiosInstance from './axiosInstance';

const API = '/api/admins';

const getAdmins = () => axiosInstance.get(API);
const createAdmin = (data) => axiosInstance.post(API, data);
const updateAdmin = (id, data) => axiosInstance.put(`${API}/${id}`, data);
const deleteAdmin = (id) => axiosInstance.delete(`${API}/${id}`);

const adminService = { getAdmins, createAdmin, updateAdmin, deleteAdmin };
export default adminService;
