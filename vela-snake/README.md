# Snake — Xiaomi Smart Band 8 Pro (Vela / quick app)

Snake clásico con control por deslizamiento (arriba / abajo / izquierda /
derecha), como el de Google en el móvil.

## Archivos listos para instalar

- `dist/com.claude.snake.release.1.1.0.rpk` — se instala como **«REL Snake»**.
- `dist/com.claude.snake.debug.1.1.0.rpk` — se instala como **«DBG Snake»**.

En la pantalla de game over aparece abajo, en gris pequeño, la variante y la
última entrada recibida (`RELEASE · swipe:up`, `DEBUG · touch:left`, o
`sin entrada`), para saber qué build se está probando y si los gestos llegan.

## Controles y juego

- Desliza en las cuatro direcciones para girar. No se permite el giro de 180º.
- La flecha de la cabecera muestra la dirección actual: sirve de confirmación
  visual de que el gesto ha llegado.
- Comer acelera el juego: 260 ms por paso al empezar, −7 ms por pieza, con
  suelo de 110 ms.
- Chocar con la pared o con el propio cuerpo termina la partida. En game over
  hay dos botones, JUGAR y SALIR.
- **Salir en cualquier momento: mantén pulsada la pantalla** (`onlongpress` →
  `app.terminate()`, con `router.back()` de respaldo). Hacía falta porque el
  manejador de gestos de la app se come el gesto de retroceso del sistema.
- Vibración corta al comer y larga al morir (si `system.vibrator` existe).
- Récord guardado con `system.storage`, mostrado como `max N`.
- La pantalla se mantiene encendida con `brightness.setKeepScreenOn`.

## Cómo está hecho

- Tablero de 12 × 16 celdas de 28 px (336 × 448), cabecera de 32 px: encaja
  exactamente en los 336 × 480 de la pantalla, con `designWidth: 336`.

### El runtime no propaga mutaciones anidadas

La versión 1.0.0 dibujaba con un *pool* de celdas posicionadas por
`margin-left`/`margin-top` dinámicos, mutando las propiedades de los objetos
del array en cada paso. En el dispositivo **la flecha de dirección sí se
actualizaba pero el tablero no se veía**: el juego corría, pero las celdas
seguían con su estado inicial (`off`, de ancho 0). Es decir, este runtime
reacciona a los cambios de propiedades de primer nivel, pero no a la mutación
de objetos anidados dentro de un array.

El dibujo actual no depende de eso:

- Cada fila es una propiedad de primer nivel (`r0`…`r15`) que se **reasigna
  entera** en cada paso, con un array nuevo de 12 cadenas (`e`, `h`, `b`, `f`).
- Las celdas se pintan solo con clases (`class="c {{$item}}"`, que compila a
  `"c " + $item`): sin estilos inline, sin posicionamiento absoluto, sin `for`
  anidados. Solo layout flex, que es lo más básico del framework.
- Nada de `canvas`: el compilador de Vela lo acepta, pero el firmware de esta
  banda expone muy poco (ver `../vela-light-meter/README.md`).
- Doble captura de gestos: el evento `swipe` (con `e.direction`) y, como
  respaldo, `touchstart` + `touchend` deduciendo la dirección del
  desplazamiento con umbral de 18 px. Si una de las dos vías no existe en el
  firmware, la otra cubre el control.

## Compilar

```bash
npm install
mkdir -p sign/release   # certificado propio, igual que en vela-light-meter
./build-both.sh         # genera las dos variantes etiquetadas en out/
```
