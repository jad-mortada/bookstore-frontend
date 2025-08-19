import axiosInstance from './axiosInstance';

const API = '/api/books';

const getBooks = () => axiosInstance.get(API);
const searchBooks = (query) => axiosInstance.get(`${API}?query=${encodeURIComponent(query)}`);
const createBook = (data) => axiosInstance.post(API, data);
const updateBook = (id, data) => axiosInstance.put(`${API}/${id}`, data);
const deleteBook = (id) => axiosInstance.delete(`${API}/${id}`);

const bookService = { getBooks, searchBooks, createBook, updateBook, deleteBook };
export default bookService;