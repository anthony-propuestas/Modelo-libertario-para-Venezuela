# Modelo Liberal para Venezuela

Blog político estático construido con Astro, desplegado en Cloudflare Pages, con base de datos D1 (SQLite) y almacenamiento de imágenes en R2.si.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Astro |
| Deploy | Cloudflare Pages |
| Base de datos | Cloudflare D1 (SQLite) |
| Imágenes | Cloudflare R2 |
| Runtime local | Wrangler |

## Estructura del proyecto

```
src/
  components/
    Block.astro        # Renderiza bloques de contenido (heading, text, image, video, table)
    SectionNav.astro   # Navegación entre secciones
  layouts/
    AdminLayout.astro  # Layout del panel admin
  lib/
    auth.ts            # Validación de sesión admin
    db.ts              # Helpers de acceso a D1
  pages/
    admin/             # Panel de administración
      pages/[slug].astro   # Editor de páginas (secciones y bloques)
    api/admin/         # Endpoints REST del admin
      blocks.ts        # POST: crear bloque
      blocks/[id].ts   # PUT/DELETE: editar/eliminar bloque
      sections.ts      # POST: crear sección
      sections/[id].ts # PUT/DELETE: editar/eliminar sección
      upload.ts        # POST: subir imagen a R2
migrations/
  0001_initial.sql     # Esquema inicial (pages, sections, blocks)
  0002_add_table_block.sql  # Agrega tipo 'table' a bloques
```

## Tipos de bloque

| Tipo | Descripción |
|---|---|
| `heading` | Encabezado (título de sección) |
| `text` | Texto con soporte Markdown |
| `image` | Imagen subida a R2 |
| `video` | Video embebido (YouTube / Vimeo) |
| `table` | Tabla estilo Excel (filas y columnas editables, guardada como JSON) |

## Desarrollo local

```powershell
# Instalar dependencias
npm install

# Iniciar servidor local
wrangler pages dev

# Aplicar migraciones a la DB local
wrangler d1 migrations apply liberal-venezuela-db --local
```

## Variables de entorno

Crear un archivo `.dev.vars` en la raíz para desarrollo local:

```
ADMIN_SECRET=tu_clave_secreta
```

En producción, usar:

```powershell
wrangler secret put ADMIN_SECRET
```

## Deploy

```powershell
# Build y deploy a Cloudflare Pages
npm run build
wrangler pages deploy dist

# Aplicar migraciones en producción
wrangler d1 migrations apply liberal-venezuela-db --remote
```

## Acceso al admin

La ruta `/admin` requiere autenticación mediante `ADMIN_SECRET`.
