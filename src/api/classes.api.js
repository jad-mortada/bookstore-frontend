import axiosInstance from './axiosInstance';

const API = '/api/classes';

const getClasses = () => axiosInstance.get(API);
const getClassesBySchool = (schoolId) => axiosInstance.get(`${API}/by-school/${schoolId}`);
const createClass = (data) => axiosInstance.post(API, data);
const updateClass = (id, data) => axiosInstance.put(`${API}/${id}`, data);
const deleteClass = (id) => axiosInstance.delete(`${API}/${id}`);

const classService = { getClasses, getClassesBySchool, createClass, updateClass, deleteClass };
export default classService;