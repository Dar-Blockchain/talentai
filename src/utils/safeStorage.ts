export const safeSet = (key: string, value: string): void => {
  try { localStorage.setItem(key, value); } catch {}
};

export const safeRemove = (key: string): void => {
  try { localStorage.removeItem(key); } catch {}
};
