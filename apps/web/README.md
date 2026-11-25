# OLEA Observatory

Frontend React, Vite y TypeScript. Usa Node.js 24, Git y tar.

## Desarrollo local

Desde la raíz del monorepo (usando `pnpm`):

```sh
git fetch origin pb124-pages
pnpm install
pnpm assets:web
pnpm dev:web
```

Para construir la versión de GitHub Pages localmente, ejecuta `pnpm build:pages` desde la raíz (ver [docs/MONOREPO.md](../../docs/MONOREPO.md)).

Vite escucha en http://localhost:5174 y reenvía `/api` a FastAPI en `127.0.0.1:8000`
durante el desarrollo. El backend público de este repositorio ofrece un
subconjunto de los endpoints que usa OLEA. Revisa su esquema en
`http://localhost:8000/docs` antes de configurar proveedores adicionales. Para un despliegue con backend, ejecuta `npm run build`
y sirve `dist/` con un proxy para `/api`, o configura `VITE_API_URL` con la URL
pública del backend. Si usas Docker, importa los recursos públicos antes de
construir la imagen. El nginx incluido espera un servicio llamado `backend`
en el puerto 8000.

`npm run assets:public` recupera las capas GeoJSON, recursos del globo y otros
archivos públicos desde una revisión fija de `pb124-pages`. Los rásteres grandes,
las teselas, los archivos locales y los snapshots de API quedan fuera de esa
importación. Las capas que dependan de ellos requieren suministrar los productos
correspondientes con permiso de redistribución.

## GitHub Pages

La rama `pb124-pages` contiene el sitio compilado. OLEA se sirve bajo
`/antarctic-maritime-observation-hub/olea/`. La raíz del sitio y `peaceboat/`
corresponden a PB124.

Desde `app/`, genera el Observatorio para la subruta de Pages.

En PowerShell:

```powershell
$env:VITE_PUBLIC_BASE = '/antarctic-maritime-observation-hub/olea/'
npm run build:pages
```

En Bash:

```sh
VITE_PUBLIC_BASE=/antarctic-maritime-observation-hub/olea/ npm run build:pages
```

El resultado queda en `dist-pages-olea/`. Para publicar, integra ese resultado
en `olea/` de la rama `pb124-pages` junto con los recursos públicos aprobados.
Actualiza también las entradas HTML de rutas directas, como `olea/observatory/`,
para que referencien los nuevos archivos compilados. El workflow de Pages realiza
esta publicación de forma automática, reemplazando solo `pb124-pages/olea/` y
manteniendo la raíz de PB124 y `/peaceboat/`. El build de PB124 se
genera por separado con `npm run build:pb124` en `dist-pb124-public/`.

`npm run typecheck` verifica el frontend y las configuraciones de Vite.
`npm run build` ejecuta esa verificación y genera el build estándar en `dist/`.

`VITE_TRAFFIC_API_URL` permite configurar el proveedor de tráfico para la
versión de Pages. Las variables `VITE_*` son visibles en el navegador.
Conserva las credenciales de proveedores y las claves de revisión en el
backend o en el entorno privado.

## World Oceans Day & Month Colombia 2027

El programa tiene un [repositorio operativo independiente](https://github.com/juanshuertas/world-oceans-day-colombia-2027), enlazado desde la navegación de OLEA. El programa utiliza OLEA como referencia científica y geoespacial; el sitio no sincroniza actualmente su presupuesto, gobernanza ni estados operativos con el repositorio. Revisa el alcance de integración documentado en el README del repositorio del programa antes de proponer una fuente de datos compartida.
