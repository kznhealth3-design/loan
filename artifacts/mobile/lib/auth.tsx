import React, { createContext, useContext, useMemo } from "react";
import { useGetCurrentAuthUser } from "@workspace/api-client-react";

type AuthUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const query = useGetCurrentAuthUser();

  const value = useMemo<AuthContextValue>(
    () => ({
      user: query.data?.user ?? null,
      isLoading: query.isLoading,
      isAuthenticated: !!query.data?.user,
      refetch: () => query.refetch(),
    }),
    [query.data, query.isLoading, query.refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
