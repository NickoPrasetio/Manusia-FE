import { AuthRepository }       from './AuthRepository';
import { LoginUseCase }         from '@/domain/auth/usecases/LoginUseCase';
import { SignupUseCase }        from '@/domain/auth/usecases/SignupUseCase';
import { UpdateProfileUseCase } from '@/domain/auth/usecases/UpdateProfileUseCase';
import { UploadAvatarUseCase }  from '@/domain/auth/usecases/UploadAvatarUseCase';

const authRepository = new AuthRepository();

export const loginUseCase         = new LoginUseCase(authRepository);
export const signupUseCase        = new SignupUseCase(authRepository);
export const updateProfileUseCase = new UpdateProfileUseCase(authRepository);
export const uploadAvatarUseCase  = new UploadAvatarUseCase(authRepository);
