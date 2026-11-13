# Escuela de Cadetes · Derechos humanos y derecho humanitario en zonas grises

Microclase interactiva, disponible sin conexión y lista para GitHub Pages sobre la aplicación diferenciada de los derechos humanos y del derecho humanitario en el servicio de policía contemporáneo.

## Ejecutar

```bash
npm install
npm run dev
```

## Compilar

```bash
npm run build
```

El resultado estático queda en `dist/`. La interfaz incluye navegación por teclado (`T`, `N`, `↑`, `↓`), cronómetro de 10 minutos, prueba del umbral de conflicto armado interno, simulador de tres preguntas, rúbrica ponderada y descargas locales en texto.

## Arquitectura pedagógica

El contenido se organiza en diez actos breves: situación problema, comparación entre derechos humanos y derecho humanitario, umbral de conflicto armado interno, decisión del mando, caso Río Verde, contraste internacional, simulación, rúbrica, recursos y cierre de legitimidad. Las fuentes de contenido viven en `src/data/` para facilitar la actualización curricular sin reescribir la interfaz.

La aplicación es educativa y no sustituye órdenes operacionales, asesoría jurídica ni la normativa vigente aplicable al caso concreto.