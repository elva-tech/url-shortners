const API_BASE = import.meta.env.VITE_API_URL || '';

export const createShortLink = async ({ originalUrl, useDlt, dltHeader }) => {
  const body = { originalUrl };

  if (useDlt) {
    body.useDlt = true;
    body.dltHeader = dltHeader;
  }

  const response = await fetch(`${API_BASE}/api/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
