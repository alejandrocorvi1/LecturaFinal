# Project Conventions

## Versión 1 - mayo 11, 2026
Esta es la versión guardada el 11 de mayo de 2026. Si el usuario pide volver a la "Versión 1", aplicar estos parámetros:

### Tipografía y Escalado
- **Área de Trazado**: `targetWidth = width * 0.90`, `targetHeight = height * 0.80`.
- **Factor de Carácter**: `charFactor = 0.65` (con margen de seguridad).
- **Estilo**: `font-black`, `uppercase`, `tracking-tighter`, `leading-[0.8]`, `whitespace-nowrap`.
- **Animaciones**: Transiciones lineales rápidas (`duration: 0.1`).

### Elementos de UI y Estilo
- **Borde Global**: `border-2 border-green-200` aplicado a todo el contenedor principal.
- **Estado del Micrófono**: Indicador de texto "MICRÓFONO ACTIVO" o "MICRÓFONO INACTIVO".
- **Responsive**: Optimizado para Móvil, Tablet y Escritorio con rejilla adaptativa en el pie de página.
- **Score**: Panel de puntuación prominente que aparece al sumar puntos.

### Comportamiento UX
- **Reconocimiento de Voz**: Manejo silencioso de errores `no-speech` para reinicio automático.
- **Reseteo de Score**: El puntaje vuelve a 0 al presionar "Comenzar".

## Versión 2 (Últimas Optimizaciones) - mayo 11, 2026
Esta es la versión guardada el 11 de mayo de 2026 con optimización de layout para móvil y firma centrada.

### Tipografía y Escalado
- **Área de Trazado**: `targetWidth = width * 0.90`, `targetHeight = height * 0.80`.
- **Factor de Carácter**: `charFactor = 0.65` (con margen de seguridad).
- **Estilo**: `font-black`, `uppercase`, `tracking-tighter`, `leading-[0.8]`, `whitespace-nowrap`.
- **Animaciones**: Transiciones lineales rápidas (`duration: 0.1`).

### Elementos de UI y Estilo
- **Borde Global**: `border-2 border-green-200` aplicado a todo el contenedor principal.
- **Estado del Micrófono**: Indicador de texto "MICRÓFONO ACTIVO" o "MICRÓFONO INACTIVO" en el header.
- **Firma**: Leyenda "by Ale Corvi" centrada en la parte inferior del footer (`italic font-medium`).
- **Score**: Panel de puntuación prominente en el header (izq) que aparece al sumar puntos.
- **Responsive (Mobile)**: Controles (slider, botones, barra de progreso) desplazados hacia arriba para permitir la firma abajo sin solapamientos.

### Comportamiento UX
- **Reconocimiento de Voz**: Manejo silencioso de errores `no-speech` para reinicio automático.
- **Reseteo de Score**: El puntaje vuelve a 0 al presionar "Comenzar".

## Versión 3 (Identidad & Marcador) - mayo 11, 2026 (19:40)
Esta versión refina la identidad visual y el marcador de progreso.

### Tipografía y Escalado
- Mantiene los parámetros de la **Versión 2**.

### Elementos de UI y Estilo
- **Marcador**: La etiqueta "SCORE" ha sido reemplazada por "**CORRECTAS**".
- **Iconografía**: Se ha **eliminado el icono del trofeo** para una estética más limpia y técnica.
- **Firma**: Mantiene la firma "**by Ale Corvi**" centrada en la parte inferior.
- **Layout**: Mantiene la optimización de espacio para móvil de la Versión 2.

### Comportamiento UX
- Mantiene la lógica de reseteo y reconocimiento de voz de las versiones anteriores.

## Versión 4 (PPS & Simetría) - mayo 11, 2026 (19:51)
Esta versión introduce el marcador de Palabras Por Segundo (PPS) y un layout simétrico en el header.

### Elementos de UI y Estilo
- **Marcadores**: Se ha añadido una caja de "**PPS**" (Palabras Por Segundo) a la derecha.
- **Sincronización Visual**: PPS utiliza la misma tipografía, tamaño y bordes que "CORRECTAS".
- **Simetría**: "CORRECTAS" se alinea al extremo izquierdo y "PPS" al extremo derecho. En móvil, ambos mantienen una distancia equidistante de los bordes.
- **Header**: Layout optimizado (grid en móvil) para mantener ambos marcadores a la misma altura horizontal.

### Comportamiento UX
- **PPS**: Se calcula en tiempo real tras cada acierto (`Palabras / Segundos transcurridos`).
- **Reseteo**: El contador de tiempo y el valor PPS se reinician al presionar "Comenzar".

## Versión 5 (Pack de Control & Espaciado) - mayo 13, 2026
Esta versión agrupa los controles y ajusta su posición vertical.

### Elementos de UI y Estilo
- **Pack de Control**: Definido por el slider, el micrófono, el botón "Comenzar" y la barra de progreso.
- **Ajuste de Altura**: El Pack de Control y la firma se han desplazado 10px hacia arriba para optimizar el espacio inferior.
- **Consistencia Visual**: Las cajas de "CORRECTAS" y "PPS" mantienen la configuración de `text-lg`, `py-2` y `border-2`.

## La MEJOR Versión (Version Definitiva) - May 2, 2026
This version is considered the definitive "Best Version" of the app. If the user asks for "la MEJOR versión" or just "version2", revert all layout and font scaling to these parameters:

### Typography & Scaling
- **Aggressive Auto-scaling**: The word must occupy almost the entire width of the screen.
- **ResponsiveWord Component**: Uses `ResizeObserver` for immediate, accurate measurement.
- **Scaling Factors**: `targetWidth = width * 0.95`, `targetHeight = height * 0.85`, `charFactor = 0.6`.
- **Styling**: `font-black`, `uppercase`, `tracking-tighter`, `leading-[0.8]`, `whitespace-nowrap`.

### UI Elements
- **Score Panel**: Large, prominent panel with `text-3xl font-black`, `px-8 py-5`, and `shadow-2xl`.
- **Layout**: Full-width `main` container (`px-0`), centered content.
- **Animations**: Fast, linear transitions (`duration: 0.1`) to avoid progressive resizing effects.
- **Microphone**: Large toggle button with red/green state signaling and error tooltips.

### UX Behavior
- **Score Reset**: The score must reset to 0 every time the "Comenzar" (Start) button is pressed.
- **No Manual Next**: The "Siguiente" (Next) button is removed; progression is handled solely via Voice Recognition or Automatic Timer.
