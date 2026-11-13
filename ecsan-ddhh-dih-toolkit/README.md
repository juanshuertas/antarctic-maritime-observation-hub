# ECSAN · DIDH y DIH en zonas grises

Microclase interactiva, offline-first y lista para GitHub Pages sobre la aplicación diferenciada del Derecho Internacional de los Derechos Humanos y el Derecho Internacional Humanitario en el servicio de policía contemporáneo.

## Ejecutar

```bash
npm install
npm run dev
```

## Compilar

```bash
npm run build
```

El resultado estático queda en `dist/`. La interfaz incluye navegación por teclado (`T`, `N`, `↑`, `↓`), cronómetro de 10 minutos, test de umbral CANI, simulador de tres preguntas, rúbrica ponderada y descargas locales en Markdown.

## Arquitectura pedagógica

El contenido se organiza en diez actos breves: situación problema, comparación DIDH/DIH, umbral CANI, decisión del mando, caso Río Verde, contraste internacional, simulación, rúbrica, recursos y cierre de legitimidad. Las fuentes de contenido viven en `src/data/` para facilitar actualización curricular sin reescribir la interfaz.

La aplicación es educativa y no sustituye órdenes operacionales, asesoría jurídica ni la normativa vigente aplicable al caso concreto.