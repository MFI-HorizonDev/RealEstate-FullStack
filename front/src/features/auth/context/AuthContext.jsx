import React, { createContext, useContext, useCallback } from "react";
import { useGetCurrentUser, useLogin, useLogout } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router";

const AuthContext = createContext(null);

/**
 * AuthProvider - Wraps the entire app to manage authentication state
 * Provides user data, login/logout functions, and auth status
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useGetCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const isAuthenticated = !!user && !userError;

  const login = useCallback(
    async (email, password) => {
      try {
        await loginMutation.mutateAsync({
          email,
          password,
        });
        navigate("/dashboard");
      } catch (error) {
        throw error;
      }
    },
    [loginMutation, navigate]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  }, [logoutMutation, navigate]);

  const value = {
    user,
    isAuthenticated,
    isLoading: userLoading,
    login,
    logout,
    loginMutation,
    logoutMutation,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

/**
 * useAuth - Hook to access auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
