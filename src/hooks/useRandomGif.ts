import { useCallback } from 'react';

const GIF_APIS = [
  // The Cat API - free, no key needed
  async () => {
    const res = await fetch('https://api.thecatapi.com/v1/images/search?mime_types=gif&limit=1');
    const data = await res.json();
    return data?.[0]?.url ?? null;
  },
  // Dog API - free, no key needed
  async () => {
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    const data = await res.json();
    return data?.status === 'success' ? data.message : null;
  },
];

export function useRandomGif() {
  const fetchRandomGif = useCallback(async (): Promise<string | null> => {
    const api = GIF_APIS[Math.floor(Math.random() * GIF_APIS.length)];
    try {
      return await api();
    } catch {
      // If random pick fails, try the other one
      for (const fallback of GIF_APIS) {
        try {
          return await fallback();
        } catch {
          continue;
        }
      }
      return null;
    }
  }, []);

  return { fetchRandomGif };
}
