const USER_TOKEN_KEY = 'user_token';
const USER_DATA_KEY = 'user_data';

export interface UserProfile {
  id: number;
  phone: string;
  name: string | null;
  email: string | null;
  createdAt: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(USER_TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

export function isLoggedIn(): boolean {
  return Boolean(getToken());
}

export function getCachedUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function setCachedUser(user: UserProfile): void {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchUser(): Promise<UserProfile | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      if (res.status === 401) removeToken();
      return null;
    }
    const user: UserProfile = await res.json();
    setCachedUser(user);
    return user;
  } catch {
    return null;
  }
}
