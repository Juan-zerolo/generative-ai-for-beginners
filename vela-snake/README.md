# Snake — Xiaomi Smart Band 8 Pro (Vela / quick app)

Snake clásico con control por deslizamiento (arriba / abajo / izquierda /
derecha), como el de Google en el móvil.

## Archivos listos para instalar

- `dist/com.claude.snake.release.1.0.0.rpk` — se instala como **«REL Snake»**.
- `dist/com.claude.snake.debug.1.0.0.rpk` — se instala como **«DBG Snake»**.

En la pantalla de game over aparece abajo, en gris pequeño, la variante y la
última entrada recibida (`RELEASE · swipe:up`, `DEBUG · touch:left`, o
`sin entrada`), para saber qué build se está probando y si los gestos llegan.

## Controles y juego

- Desliza en las cuatro direcciones para girar. No se permite el giro de 180º.
- La flecha de la cabecera muestra la dirección actual: sirve de confirmación
  visual de que el gesto ha llegado.
- Comer acelera el juego: 260 ms por paso al empezar, −7 ms por pieza, con
  suelo de 110 ms.
- Chocar con la pared o con el propio cuerpo termina la partida. Toca la
  pantalla para volver a jugar.
- Vibración corta al comer y larga al morir (si `system.vibrator` existe).
- Récord guardado con `system.storage`, mostrado como `max N`.
- La pantalla se mantiene encendida con `brightness.setKeepScreenOn`.

## Cómo está hecho

- Tablero de 14 × 18 celdas de 24 px (336 × 432), cabecera de 40 px: encaja
  exactamente en los 336 × 480 de la pantalla, con `designWidth: 336`.
- Nada de `canvas`: el compilador de Vela lo acepta, pero el firmware de esta
  banda expone muy poco (ver `../vela-light-meter/README.md`), así que el
  tablero son `div`s dentro de un `stack`, posicionados con
  `margin-left` / `margin-top` dinámicos. Eso compila a `$translateStyle$`,
  que sí aparece en el `global` del runtime de la banda.
- Las 80 celdas del tablero son un *pool* fijo: cada paso se mutan sus
  propiedades (reactivas) en vez de recrear la lista, para no crear y destruir
  nodos 5 veces por segundo.
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
