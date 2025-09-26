import { useState, useEffect, useCallback } from "react";
import supabase from "../supabase-client";
import type { AuthUser, LoginCredentials, SignupCredentials } from "../types/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Helper function to normalize user data from different auth providers
function normalizeUserData(user: SupabaseUser): AuthUser {
  const metadata = user.user_metadata || {};
  const appMetadata = user.app_metadata || {};

  // Priority 1: Use firstName/lastName if available (email users or users who updated profile)
  let firstName = metadata.firstName || '';
  let lastName = metadata.lastName || '';

  // Priority 2: Parse from Google's full_name or name
  if (!firstName && !lastName) {
    const fullName = metadata.full_name || metadata.name || '';
    if (fullName) {
      const parts = fullName.trim().split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
  }

  // Create display name from available data
  const displayName = firstName || lastName
    ? `${firstName} ${lastName}`.trim()
    : user.email?.split('@')[0] || 'User';

  return {
    id: user.id,
    email: user.email!,
    created_at: user.created_at,
    firstName,
    lastName,
    displayName,
    country: metadata.country,
    avatar_url: metadata.avatar_url || metadata.picture,
    providers: appMetadata.providers || ['email'],
    user_metadata: metadata
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session?.user) {
          console.log("User logged in:", session.user);
          setUser(normalizeUserData(session.user));
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(normalizeUserData(session.user));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.user) {
        console.log("User logged in:", data.user);
        setUser(normalizeUserData(data.user));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to login";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            country: credentials.country,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          setUser(normalizeUserData(data.user));
        } else {
          // Set a specific message for email confirmation
          setError("Please check your email to confirm your account");
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to logout";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to login with Google";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: {
    firstName?: string;
    lastName?: string;
    country?: string;
  }) => {
    try {
      setError(null);
      setIsLoading(true);

      // Get current user to merge metadata
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("No authenticated user");

      // Merge updates with existing metadata (preserves Google data)
      const mergedMetadata = {
        ...currentUser.user_metadata,
        ...updates
      };

      const { data, error } = await supabase.auth.updateUser({
        data: mergedMetadata
      });

      if (error) throw error;

      if (data.user) {
        setUser(normalizeUserData(data.user));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loginWithGoogle,
    updateProfile,
  };
}