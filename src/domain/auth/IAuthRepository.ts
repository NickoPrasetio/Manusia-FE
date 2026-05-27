import { User } from '@/types';
import { AuthResult } from './AuthError';

export interface SignupInput {
  name:       string;
  email:      string;
  password:   string;
  phone:      string;
  userType:   string;
  nik:        string;
  birthDate:  string;
  gender:     string;
  ktpFile?:   File;
  latitude?:  number;
  longitude?: number;
}

export interface AuthSession {
  user:  User;
  token: string;
}

export interface IAuthRepository {
  signup(input: SignupInput): Promise<AuthResult<AuthSession>>;
  login(email: string, password: string): Promise<AuthResult<AuthSession>>;
  updateProfile(token: string, data: { name?: string; phone?: string }): Promise<AuthResult<User>>;
  uploadAvatar(token: string, file: File): Promise<AuthResult<User>>;
}
