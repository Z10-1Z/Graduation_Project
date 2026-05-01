const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function getStorage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    if (typeof localStorage.getItem !== 'function') return null;
    if (typeof localStorage.setItem !== 'function') return null;
    if (typeof localStorage.removeItem !== 'function') return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function setAuthData({ token, user }) {
  const storage = getStorage();
  if (!storage) return;

  if (token) storage.setItem(TOKEN_KEY, token);
  if (user) storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthData() {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
}

export function getToken() {
  const storage = getStorage();
  return storage?.getItem(TOKEN_KEY) || null;
}

export function getStoredUser() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    clearAuthData();
    return null;
  }
}
