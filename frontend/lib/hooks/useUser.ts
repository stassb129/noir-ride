'use client';

import { useUserContext } from '@/lib/providers/UserProvider';

export type { UserProfile } from '@/lib/user-auth';

export function useUser() {
  const { user, isLoading, isLoggedIn, refetch, logout, setUser } = useUserContext();
  return { user, isLoading, isLoggedIn, refetch, logout, setUser };
}
