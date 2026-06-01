import { IAuthRepository } from '../IAuthRepository';
import { AuthResult } from '../AuthError';

export class ChangePasswordUseCase {
  constructor(private repo: IAuthRepository) {}

  async execute(token: string, currentPassword: string, newPassword: string): Promise<AuthResult<void>> {
    if (!currentPassword) return { success: false, error: { code: 'UNKNOWN', message: 'Password saat ini wajib diisi' } };
    if (!newPassword)     return { success: false, error: { code: 'UNKNOWN', message: 'Password baru wajib diisi' } };
    if (newPassword.length < 8) return { success: false, error: { code: 'UNKNOWN', message: 'Password baru minimal 8 karakter' } };
    return this.repo.changePassword(token, currentPassword, newPassword);
  }
}
