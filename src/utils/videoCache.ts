const blobCache = new Map<string, string>();
const pendingFetches = new Map<string, Promise<string>>();

export async function getCachedVideoUrl(url: string): Promise<string> {
  if (blobCache.has(url)) return blobCache.get(url)!;
  if (pendingFetches.has(url)) return pendingFetches.get(url)!;

  const promise = fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to fetch video: ${res.status}`);
      return res.blob();
    })
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      blobCache.set(url, blobUrl);
      pendingFetches.delete(url);
      return blobUrl;
    })
    .catch(err => {
      pendingFetches.delete(url);
      throw err;
    });

  pendingFetches.set(url, promise);
  return promise;
}
