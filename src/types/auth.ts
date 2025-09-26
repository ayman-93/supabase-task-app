export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  // Normalized fields for consistent access
  firstName: string;
  lastName: string;
  displayName: string;
  country?: string;
  avatar_url?: string;
  // Provider information
  providers: string[];
  // Raw metadata preserved for reference
  user_metadata: Record<string, any>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  country?: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" };