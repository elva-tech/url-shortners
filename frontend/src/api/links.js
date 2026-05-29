const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const createShortLink = async (originalUrl) => {
  const response = await fetch(`${API_URL}/api/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalUrl }),
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Invalid server response',
  }));

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to generate short link');
  }

  return data;
};
