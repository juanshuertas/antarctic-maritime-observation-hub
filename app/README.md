# OLEA Observatory

Frontend React, Vite y TypeScript. Usa Node.js 24, Git y tar.

## Desarrollo local

Desde la raíz del repositorio:

```sh
git fetch origin pb124-pages
cd app
npm ci
npm run assets:public
npm run dev
```

Vite escucha en http://localhost:5174 y reenvía `/api` a FastAPI en `127.0.0.1:8000`
durante el desarrollo. Para un despliegue con backend, ejecuta `npm run build`
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

Para construir el Observatorio para Pages, configura
`VITE_PUBLIC_BASE=/antarctic-maritime-observation-hub/olea/` y ejecuta
`npm run build:pages`. El resultado queda en `dist-pages-olea/`. Compleméntalo
con los recursos públicos aprobados y las entradas de rutas estáticas del
sitio existente antes de reemplazar `olea/`. El build de PB124 se genera por
separado con `npm run build:pb124`.

`VITE_TRAFFIC_API_URL` permite configurar el proveedor de tráfico para la
versión de Pages. Las variables `VITE_*` son visibles en el navegador.
Conserva las credenciales de proveedores y las claves de revisión en el
backend o en el entorno privado.
