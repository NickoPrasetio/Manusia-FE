import { IAuthRepository, AuthSession } from '../IAuthRepository';
import { AuthResult } from '../AuthError';

export class LoginUseCase {
  constructor(private repo: IAuthRepository) {}

  execute(email: string, password: string): Promise<AuthResult<AuthSession>> {
    return this.repo.login(email, password);
  }
}
