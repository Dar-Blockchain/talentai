export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export const getImageUrl = (type: 'Users' | 'Companies', filename: string): string =>
  `${API_BASE_URL}images/${type}/${filename}`;
