export interface User {
    id?: number;
    username: string;
    email: string;
    password?: string;
  }
  
  export interface UserProfile {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
  }
  
  export interface AuthRequest {
    usernameOrEmail: string;
    password: string;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: UserProfile;
  }