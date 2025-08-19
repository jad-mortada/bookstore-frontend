import axiosInstance from './axiosInstance';

const profileService = {
  getMe: async () => {
    const res = await axiosInstance.get('/api/profile/me');
    return res.data;
  },
};

export default profileService;
