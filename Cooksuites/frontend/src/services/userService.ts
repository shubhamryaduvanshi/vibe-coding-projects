import api from '../lib/api';
import { User } from '../store/slices/authSlice';

export interface ProfileUpdateData {
  fullName: string;
}

export const userService = {
  getProfile: async () => {
    const response = await api.get<{ success: boolean; data: User }>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: ProfileUpdateData) => {
    const response = await api.put<{ success: boolean; data: User; message: string }>('/users/profile', data);
    return response.data;
  },
};
