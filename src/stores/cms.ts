import { defineStore, acceptHMRUpdate } from "pinia";
import {
  checksum,
  siteSnapshot,
  type Backup,
  type Page,
  type Post,
  type ThemeConfig
} from "@/lib/cms";

const KEY = "rcr-cms-v1";

const defaultTheme = (): ThemeConfig => ({
  brandName: "RCR Consulting Group",
  primaryColor: "#1d4ed8",
  heroLayout: "centrado",
  headerStyle: "corporativo",
  fontFamily: "Roboto",
  showTopBar: true
});

const defaultPages = (): Page[] => [
  {
    id: "pg-home",
    title: "Inicio",
    slug: "inicio",
    blocks: [
      {
        heading: "Transformamos empresas",
        text: "Consultoría estratégica, tecnología y operaciones para compañías en crecimiento."
      },
      {
        heading: "Presencia internacional",
        text: "Oficinas en Madrid, Ciudad de México y Bogotá. Más de 140 proyectos entregados."
      }
    ],
    seoMeta: {
      title: "RCR Consulting — Inicio",
      description: "Consultoría corporativa"
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: "pg-servicios",
    title: "Servicios",
    slug: "servicios",
    blocks: [
      {
        heading: "Estrategia",
        text: "Planes de negocio, expansión y transformación digital."
      },
      {
        heading: "Tecnología",
        text: "Arquitectura cloud, datos y automatización de procesos."
      },
      {
        heading: "Operaciones",
        text: "Optimización de cadena de suministro y excelencia operativa."
      }
    ],
    seoMeta: { title: "Servicios", description: "Nuestros servicios" },
    updatedAt: new Date().toISOString()
  }
];

const defaultPosts = (): Post[] => [
  {
    id: "post-1",
    title: "5 claves para una migración a la nube sin fricción",
    slug: "migracion-nube",
    excerpt:
      "La mayoría de proyectos cloud fallan por gobernanza, no por tecnología. Estas son las palancas que funcionan.",
    contentHtml:
      "<p>La mayoría de proyectos cloud fallan por <b>gobernanza</b>, no por tecnología.</p><h3>1. Inventario real</h3><p>Mapea dependencias antes de mover una sola carga de trabajo.</p><h3>2. FinOps desde el día 1</h3><p>Etiqueta recursos y define presupuestos por equipo.</p><h3>3. Landing zone mínima</h3><p>Identidad, redes y logging centralizados antes que nada.</p>",
    category: "Tecnología",
    coverHue: 210,
    publishedAt: "2025-09-28T10:00:00.000Z"
  },
  {
    id: "post-2",
    title: "Cómo estructurar un comité de transformación digital",
    slug: "comite-transformacion",
    excerpt:
      "Sin un comité con mandato real, la transformación se convierte en una lista de deseos.",
    contentHtml:
      "<p>Sin un comité con <b>mandato real</b>, la transformación se convierte en una lista de deseos.</p><p>Recomendamos un formato quincenal con CEO, COO y líderes de plataforma, con 3 KPIs máximo por iniciativa.</p>",
    category: "Estrategia",
    coverHue: 160,
    publishedAt: "2025-10-05T10:00:00.000Z"
  },
  {
    id: "post-3",
    title: "WordPress headless: cuándo sí y cuándo no",
    slug: "wordpress-headless",
    excerpt:
      "Headless no es gratis: evalúa el coste de previsualización, SEO y complejidad antes de decidir.",
    contentHtml:
      "<p>Headless no es gratis: evalúa el coste de <i>previsualización</i>, SEO y complejidad.</p><p>Para sitios corporativos con equipo pequeño de contenidos, un monolito bien cacheado suele ganar.</p>",
    category: "Tecnología",
    coverHue: 280,
    publishedAt: "2025-10-11T10:00:00.000Z"
  }
];

interface Persisted {
  theme: ThemeConfig;
  pages: Page[];
  posts: Post[];
  backups: Backup[];
}

export const useCmsStore = defineStore("cms", {
  state: () => {
    const s = load();
    return {
      theme: s.theme,
      pages: s.pages,
      posts: s.posts,
      backups: s.backups,
      customizerOpen: false,
      adminBar: true
    };
  },

  getters: {
    snapshotSize(state): number {
      return siteSnapshot(state.theme, state.pages, state.posts).length;
    }
  },

  actions: {
    persist() {
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({
            theme: this.theme,
            pages: this.pages,
            posts: this.posts,
            backups: this.backups
          } satisfies Persisted)
        );
      } catch {
        /* ignore */
      }
    },
    savePost(p: Post) {
      const i = this.posts.findIndex(x => x.id === p.id);
      if (i >= 0) this.posts[i] = p;
      else this.posts.unshift(p);
      this.persist();
    },
    removePost(id: string) {
      this.posts = this.posts.filter(p => p.id !== id);
      this.persist();
    },
    savePage(p: Page) {
      const i = this.pages.findIndex(x => x.id === p.id);
      if (i >= 0) this.pages[i] = p;
      else this.pages.unshift(p);
      this.persist();
    },
    createBackup(env: "production" | "staging"): Backup {
      const snap = siteSnapshot(this.theme, this.pages, this.posts);
      const b: Backup = {
        id: `bk-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        sizeBytes: snap.length,
        checksum: checksum(snap),
        environment: env,
        snapshot: snap
      };
      this.backups.unshift(b);
      this.persist();
      return b;
    },
    restoreBackup(id: string): boolean {
      const b = this.backups.find(x => x.id === id);
      if (!b) return false;
      try {
        const d = JSON.parse(b.snapshot) as {
          theme: ThemeConfig;
          pages: Page[];
          posts: Post[];
        };
        this.theme = d.theme;
        this.pages = d.pages;
        this.posts = d.posts;
        this.persist();
        return true;
      } catch {
        return false;
      }
    },
    importSnapshot(json: string): boolean {
      try {
        const d = JSON.parse(json);
        if (!d.theme || !d.pages || !d.posts) return false;
        this.theme = d.theme;
        this.pages = d.pages;
        this.posts = d.posts;
        this.persist();
        return true;
      } catch {
        return false;
      }
    },
    resetDemo() {
      this.theme = defaultTheme();
      this.pages = defaultPages();
      this.posts = defaultPosts();
      this.backups = [];
      this.persist();
    }
  }
});

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Persisted;
      if (d.theme && Array.isArray(d.pages)) return d;
    }
  } catch {
    /* ignore */
  }
  return {
    theme: defaultTheme(),
    pages: defaultPages(),
    posts: defaultPosts(),
    backups: []
  };
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCmsStore, import.meta.hot));
}
