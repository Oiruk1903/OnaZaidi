export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  countryCode?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}
