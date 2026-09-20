export interface User {
  id: number;
  login: string;
  name: string;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface RegisterData {
  login: string;
  name: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}