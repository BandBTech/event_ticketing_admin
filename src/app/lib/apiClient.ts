// src/lib/apiClient.ts
export async function apiClient<TResponse>(
  endpoint: string,
  options: RequestInit = {}
): Promise<TResponse> {
  // Get token from localStorage (client-side only)
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Try parsing JSON safely
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { message?: string }).message || 'API request failed');
  }

  return data as TResponse;
}
