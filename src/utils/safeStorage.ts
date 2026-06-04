export const safeSet = (key: string, value: string): void => {
  try { localStorage.setItem(key, value); } catch {}
};

export const safeGet = (key: string): string | null => {
  try { return localStorage.getItem(key); } catch { return null; }
};

export const safeRemove = (key: string): void => {
  try { localStorage.removeItem(key); } catch {}
};
