import { IAuthRepository, SignupInput, AuthSession } from '../IAuthRepository';
import { AuthResult } from '../AuthError';

export class SignupUseCase {
  constructor(private repo: IAuthRepository) {}

  execute(input: SignupInput): Promise<AuthResult<AuthSession>> {
    return this.repo.signup(input);
  }
}
