export type AuthErrorCode =
  | 'EMAIL_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'UNKNOWN';

export interface AuthError {
  code:    AuthErrorCode;
  message: string;
}

export type AuthResult<T> =
  | { success: true;  data: T }
  | { success: false; error: AuthError };
