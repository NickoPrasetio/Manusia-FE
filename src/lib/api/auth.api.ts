import { apiClient } from './client';
import { UserType } from '@/types';

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  userType?: UserType;
  avatar?: string;
  latitude?: number;
  longitude?: number;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/auth/login', { email, password }),

  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
    userType: UserType,
    birthDate: string,
    ktpFile?: File,
    latitude?: number,
    longitude?: number,
  ) => {
    const form = new FormData();
    form.append('name', name);
    form.append('email', email);
    form.append('password', password);
    form.append('phone', phone);
    form.append('userType', userType);
    form.append('birthDate', birthDate);
    if (ktpFile) form.append('ktp', ktpFile);
    if (latitude  !== undefined) form.append('latitude',  String(latitude));
    if (longitude !== undefined) form.append('longitude', String(longitude));
    return apiClient.upload<AuthResponse>('/api/auth/register', form);
  },

  getMe: (token: string) =>
    apiClient.get<AuthResponse>('/api/auth/me', token),

  updateMe: (data: { name?: string; phone?: string }, token: string) =>
    apiClient.put<AuthResponse>('/api/auth/me', data, token),

  uploadAvatar: (file: File, token: string) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.upload<AuthResponse>('/api/auth/me/photo', form, token);
  },
};
