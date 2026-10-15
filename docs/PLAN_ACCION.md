# Plan de Acción #04: WordPress Corporativo & Suite de Migración (Headless / Firebase)

- **Componente actual en Portafolio:** `src/pages/projects/components/WordPressSite.vue`
- **Subdominio objetivo:** `cms.rcrdevelop.com` (o `wp-corporate-rcr.web.app`)
- **Stack Original Declarado:** WordPress + PHP + Custom Theme + Migration Plugin
- **Stack Real en Firebase:** Frontend Corporativo + Visual Builder/CMS sobre Firebase (Firestore + Storage) + Simulador Interactivo del Plugin de Migración/Respaldo + Conector WP REST API (`wp-json`)

---

## 1. Análisis de Limitantes Técnicas en Firebase y Solución Arquitectónica

| Limitante Técnica | Impacto Real | Solución para Firebase + Subdominio |
|---|---|---|
| **WordPress (PHP + MySQL) NO se puede instalar en Firebase Hosting** | Firebase Hosting solo sirve archivos estáticos y rewrites a Cloud Functions/Cloud Run; no ejecuta `wp-admin` tradicional sobre MySQL sin pagar Cloud SQL (que cuesta >$10-$30/mes). | **Hay 2 caminos complementarios sin costo mensual:** <br>1. **Headless WordPress + CMS Demo Nativo en Firebase:** En `cms.rcrdevelop.com` alojas el sitio corporativo con un **Panel `/wp-admin` interactivo construido en Vue + Firestore** que replica la edición de páginas, artículos de blog, personalizador de tema en vivo y el **Plugin de Respaldo/Migración funcional** (generando y restaurando paquetes `.zip` / `.json`).<br>2. **Si deseas un WordPress PHP real sin costo:** Desplegar el contenedor WordPress con **SQLite** (plugin oficial *SQLite Database Integration*) en **Cloud Run** (capa gratuita de 2 millones de peticiones/mes) o conectar el frontend de Firebase a la API REST `/wp-json/wp/v2/posts` de una instancia gratuita. |
| **Demostrar habilidades de Custom Theme y Plugin de Migración** | En un sitio corporativo estático el visitante solo ve el resultado final, pero no ve cómo funciona tu plugin de respaldos o tu personalizador de temas. | Incluir en `cms.rcrdevelop.com` una barra superior estilo **WordPress Admin Bar** con acceso directo a: <br>• **Personalizador de Tema en Vivo (Theme Customizer)**<br>• **Gestor de Blog & Páginas (CMS)**<br>• **Plugin "RCR Backup & GitHub Sync"**: interfaz donde el usuario hace clic en *"Crear Snapshot"*, ve el progreso real, descarga el manifiesto de migración y puede restaurar versiones anteriores. |

---

## 2. Arquitectura Funcional en Firebase (`cms.rcrdevelop.com`)

```text
sites/{siteId}
  ├── themeConfig: { brandName, primaryColor, heroLayout, typography, headerStyle, showTopBar }
  ├── pages/{pageId}: { title, slug, blocks: [...], seoMeta: { title, description } }
  ├── posts/{postId}: { title, slug, excerpt, contentHtml, coverImage, category, publishedAt }
  └── backups/{backupId}: { createdAt, sizeBytes, checksum, environment: "production"|"staging", snapshotData }
```

---

## 3. Plan de Implementación Paso a Paso

### Fase 1: Sitio Corporativo + Personalizador de Tema en Vivo (Semana 1)
1. **Sitio Corporativo Completo**:
   - Secciones de Inicio, Servicios Corporativos, Casos de Éxito, Equipo Directivo, Blog con lectura de artículos completos y Formulario de Contacto Empresarial.
2. **Drawer "Theme Customizer" en Tiempo Real**:
   - Panel lateral que permite cambiar al instante el estilo de encabezado (Corporativo, Minimalista, Ejecutivo), paleta de colores, tipografía y orden de bloques de la página de inicio.

### Fase 2: CMS de Contenidos & Plugin de Migración/Backup (Semana 2)
1. **Editor de Artículos y Páginas**:
   - Creación y edición de posts con editor enriquecido (`<q-editor>`), etiquetas, categorías e imágenes WebP.
2. **Interfaz del Plugin de Respaldo y Migración**:
   - Generador de backups en un clic que empaqueta toda la configuración del sitio, páginas y artículos en un archivo descargable `.json`/`.zip`, con comparador de diferencias (*diff*) e historial de restauración.
3. **Repositorio Descargable del Tema y Plugin PHP Real**:
   - Botón en la demo para inspeccionar el código fuente PHP real (`functions.php`, `style.css`, `rcr-migrator.php`) en un visor de código con resaltado de sintaxis.

### Fase 3: Despliegue en Subdominio (`cms.rcrdevelop.com`)
1. Asignar el target `cms` en `firebase.json` apuntando al subdominio `cms.rcrdevelop.com`.
2. Configurar caché inmutable para imágenes WebP y carga instantánea.

---

## 4. Estrategia de Monetización (Template vs SaaS)

### Opción A: Venta de Tema Corporativo + Plugin WordPress ($39 - $99 USD)
- **Producto 1:** Tema WordPress Corporativo ligero optimizado para Core Web Vitals.
- **Producto 2:** Plugin de Migración y Sincronización con GitHub / Cloud Storage bajo modelo Freemium.

### Opción B: SaaS "Constructor de Sitios Corporativos Ultra-Rápidos" ($15 - $35 USD/mes)
- Muchas empresas sufren con WordPress lento, hackeado por plugins desactualizados o caídas de servidor.
- Puedes ofrecer tu motor sobre **Firebase Hosting + Firestore** como un **"CMS Corporativo Indestructible en CDN Global"**: el cliente edita textos, colores y blog desde un panel limpio, y el sitio carga en `<300ms` con SSL y cero mantenimiento de servidores PHP.
