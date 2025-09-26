import { useState } from "react";
import { Login } from "./Login";
import { Signup } from "./Signup";
import type { LoginCredentials, SignupCredentials } from "../../types/auth";

interface AuthFormProps {
  readonly onLogin: (credentials: LoginCredentials) => Promise<void>;
  readonly onSignup: (credentials: SignupCredentials) => Promise<void>;
  readonly onGoogleLogin: () => Promise<void>;
  readonly error?: string | null;
}

export function AuthForm({ onLogin, onSignup, onGoogleLogin, error }: AuthFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return isLoginMode ? (
    <Login
      onSubmit={onLogin}
      onGoogleLogin={onGoogleLogin}
      onSwitchToSignup={() => setIsLoginMode(false)}
      error={error}
    />
  ) : (
    <Signup
      onSubmit={onSignup}
      onGoogleLogin={onGoogleLogin}
      onSwitchToLogin={() => setIsLoginMode(true)}
      error={error}
    />
  );
}