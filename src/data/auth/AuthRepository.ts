import { IAuthRepository, SignupInput, AuthSession } from '@/domain/auth/IAuthRepository';
import { AuthResult, AuthError } from '@/domain/auth/AuthError';
import { authApi } from '@/lib/api/auth.api';
import { User } from '@/types';

function mapError(err: unknown): AuthError {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  if (msg.includes('sudah terdaftar') || msg.includes('email taken'))
    return { code: 'EMAIL_TAKEN', message: 'Email sudah terdaftar' };
  if (msg.includes('password salah') || msg.includes('invalid'))
    return { code: 'INVALID_CREDENTIALS', message: 'Email atau password salah' };
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch'))
    return { code: 'NETWORK_ERROR', message: 'Tidak ada koneksi internet' };
  if (msg.includes('401') || msg.includes('unauthorized'))
    return { code: 'UNAUTHORIZED', message: 'Sesi habis, silakan login kembali' };
  return { code: 'UNKNOWN', message: 'Terjadi kesalahan, coba lagi' };
}

function mapUser(res: {
  id: string; name: string; email: string;
  phone?: string; role: string; avatar?: string;
  userType?: 'CUSTOMER' | 'WORKER'; latitude?: number; longitude?: number;
}): User {
  return {
    id: res.id, name: res.name, email: res.email,
    phone: res.phone, role: res.role, avatar: res.avatar,
    userType: res.userType, latitude: res.latitude, longitude: res.longitude,
  };
}

export class AuthRepository implements IAuthRepository {
  async signup(input: SignupInput): Promise<AuthResult<AuthSession>> {
    try {
      const res = await authApi.register(
        input.name, input.email, input.password,
        input.phone, input.userType as 'CUSTOMER' | 'WORKER',
        input.birthDate, input.ktpFile,
        input.latitude, input.longitude,
      );
      return { success: true, data: { user: mapUser(res), token: res.token! } };
    } catch (err) {
      return { success: false, error: mapError(err) };
    }
  }

  async login(email: string, password: string): Promise<AuthResult<AuthSession>> {
    try {
      const res = await authApi.login(email, password);
      return { success: true, data: { user: mapUser(res), token: res.token! } };
    } catch (err) {
      return { success: false, error: mapError(err) };
    }
  }

  async updateProfile(token: string, data: { name?: string; phone?: string }): Promise<AuthResult<User>> {
    try {
      const res = await authApi.updateMe(data, token);
      return { success: true, data: mapUser(res) };
    } catch (err) {
      return { success: false, error: mapError(err) };
    }
  }

  async uploadAvatar(token: string, file: File): Promise<AuthResult<User>> {
    try {
      const res = await authApi.uploadAvatar(file, token);
      return { success: true, data: mapUser(res) };
    } catch (err) {
      return { success: false, error: mapError(err) };
    }
  }
}
