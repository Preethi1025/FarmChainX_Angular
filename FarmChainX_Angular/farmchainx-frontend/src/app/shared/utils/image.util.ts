export function getImageUrl(path?: string): string {
  if (!path) return '/assets/placeholder.png';

  if (path.startsWith('http')) return path;

  return `http://localhost:8080${path}`;
}
