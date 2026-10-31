export interface ThemeConfig {
  brandName: string;
  primaryColor: string;
  heroLayout: "centrado" | "izquierda" | "imagen-fondo";
  headerStyle: "corporativo" | "minimalista" | "ejecutivo";
  fontFamily: "Roboto" | "serif" | "mono";
  showTopBar: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  blocks: { heading: string; text: string }[];
  seoMeta: { title: string; description: string };
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  category: string;
  coverHue: number;
  publishedAt: string;
}

export interface Backup {
  id: string;
  createdAt: string;
  sizeBytes: number;
  checksum: string;
  environment: "production" | "staging";
  snapshot: string; // JSON string
}

export function coverImage(hue: number, title: string): string {
  const h1 = hue % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${h1},55%,35%)"/><stop offset="100%" stop-color="hsl(${(h1 + 50) % 360},60%,55%)"/></linearGradient></defs><rect width="640" height="300" fill="url(#g)"/><circle cx="80" cy="70" r="90" fill="#ffffff14"/><circle cx="570" cy="240" r="120" fill="#ffffff10"/><text x="40" y="265" font-family="sans-serif" font-size="30" font-weight="700" fill="#ffffffd9">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function siteSnapshot(
  theme: ThemeConfig,
  pages: Page[],
  posts: Post[]
): string {
  return JSON.stringify(
    { theme, pages, posts, exportedAt: new Date().toISOString() },
    null,
    2
  );
}

export function checksum(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function downloadText(
  text: string,
  filename: string,
  mime = "application/json"
) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
