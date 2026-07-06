'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchUser,
  getToken,
  removeToken,
  setCachedUser,
  getCachedUser,
  type UserProfile,
} from '@/lib/user-auth';

interface UserContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  refetch: () => Promise<void>;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const fetched = await fetchUser();
    setUser(fetched);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const cached = getCachedUser();
    if (cached) setUser(cached);
    setIsReady(true);

    if (getToken()) {
      setIsLoading(true);
      fetchUser()
        .then((fetched) => setUser(fetched))
        .finally(() => setIsLoading(false));
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user: isReady ? user : null,
      isLoading: !isReady || isLoading,
      isLoggedIn: isReady && Boolean(user),
      refetch,
      logout,
      setUser: (next) => {
        if (next) setCachedUser(next);
        setUser(next);
      },
    }),
    [user, isReady, isLoading, refetch, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return ctx;
}
