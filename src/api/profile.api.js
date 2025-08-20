/**
 * profile.api.js
 * Profile-related endpoints for the current authenticated user.
 */
import axiosInstance from './axiosInstance';

// Service methods for user profile operations
const profileService = {
  /**
   * Get the current user's profile.
   * @returns {Promise<any>} profile data
   */
  getMe: async () => {
    // Returns full profile including roles, preferences, etc.
    const res = await axiosInstance.get('/api/profile/me');
    return res.data;
  },

  /**
   * Change the current user's password.
   * @param {{currentPassword: string, newPassword: string}} payload
   * @returns {Promise<any>}
   */
  changePassword: async ({ currentPassword, newPassword }) => {
    // Server validates current password and updates to new one
    const res = await axiosInstance.put('/api/profile/password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  /**
   * Upload or replace the user's avatar.
   * @param {File|Blob} file
   * @returns {Promise<{ avatarUrl: string }>} new avatar url
   */
  uploadAvatar: async (file) => {
    // Uses FormData for file upload with proper content-type
    const formData = new FormData();
    formData.append('file', file);
    // Server resizes and stores the image, returns public URL
    const res = await axiosInstance.post('/api/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data; // expect { avatarUrl }
  },

  /**
   * Delete the current user's avatar.
   * @returns {Promise<any>}
   */
  deleteAvatar: async () => {
    // Removes the current avatar, falling back to default/initials
    const res = await axiosInstance.delete('/api/profile/avatar');
    return res.data;
  },
};

export default profileService;
