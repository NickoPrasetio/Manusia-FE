import { IAuthRepository } from '../IAuthRepository';
import { AuthResult } from '../AuthError';
import { User } from '@/types';

export class UploadAvatarUseCase {
  constructor(private repo: IAuthRepository) {}

  execute(token: string, file: File): Promise<AuthResult<User>> {
    return this.repo.uploadAvatar(token, file);
  }
}
