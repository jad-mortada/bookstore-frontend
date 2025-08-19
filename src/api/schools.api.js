import axiosInstance from './axiosInstance';

const API = '/api/schools';

const getSchools = () => axiosInstance.get(API);
const searchSchools = (name) => axiosInstance.get(`${API}?name=${encodeURIComponent(name)}`);
const createSchool = (data) => axiosInstance.post(API, data);
const updateSchool = (id, data) => axiosInstance.put(`${API}/${id}`, data);
const deleteSchool = (id) => axiosInstance.delete(`${API}/${id}`);

const schoolService = { getSchools, searchSchools, createSchool, updateSchool, deleteSchool };
export default schoolService;