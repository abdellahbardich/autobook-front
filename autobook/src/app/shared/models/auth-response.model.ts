import { User } from "./user.model";

export interface AuthResponse {
    token: string;
    tokenType: string;
    refreshToken?: string;
    user: User;
  }