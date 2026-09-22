# 2048 — Xiaomi Smart Band 8 Pro (Vela quick app)

2048 clásico con control por deslizamiento, en rejilla 4×4 de fichas de 78 px.

## Archivos

- `dist/com.claude.g2048.release.1.0.0.rpk` — «REL 2048».
- `dist/com.claude.g2048.debug.1.0.0.rpk` — «DBG 2048».

## Juego

- Desliza arriba / abajo / izquierda / derecha: las fichas se desplazan y las
  iguales se fusionan. Cada ficha se fusiona **una sola vez por movimiento**.
- Un movimiento que no cambia nada no cuenta: no aparece ficha nueva.
- Puntuación arriba a la izquierda, récord a la derecha (guardado con
  `storage`). Vibración corta al fusionar, larga al perder.
- Fin de partida cuando no queda hueco ni fusión posible. JUGAR reinicia,
  SALIR cierra; mantener pulsado también sale.

## Sonda de `interconnect`

El botón `interconnect` del pie abre una pantalla de diagnóstico. Es el único
módulo presente en la banda cuyo alcance no conocemos (ver
`../vela-probe/README.md`): según la documentación de Vela sirve para hablar
con una app Android compañera **con el mismo nombre de paquete y firma**, y
sería la única vía para sacar datos del teléfono (incluida internet vía el
Internet Helper de Gadgetbridge).

PROBAR hace, con todo envuelto en `try/catch`:

1. Comprueba `interconnect.instance` y lo llama, con y sin argumento.
2. Vuelca las claves del objeto devuelto.
3. Engancha `onopen`, `onclose`, `onerror`, `onmessage`.
4. Intenta `open()`, `connect()` y un `send({data:'ping'})`.
5. A los 8 s anota si no ha llegado ningún evento.

Si apareciera `ONOPEN` o un `onmessage`, el aislamiento de la banda se acaba.

## Rendimiento

Cada casilla son tres bindings de primer nivel (fondo, tamaño de letra y
valor) y solo se escriben las que cambian. Es la técnica que hizo jugable el
Snake: ver `../vela-snake/README.md`, donde está el porqué.

## Probar la lógica sin el reloj

```bash
node tools/test.js src/pages/index/index.ux
```

Comprueba las reglas de fusión (incluida la de no fusionar dos veces), que un
movimiento inválido no genera ficha, la detección de fin de partida, y juega
una partida aleatoria verificando que toda ficha es potencia de dos.

## Compilar

```bash
npm install
mkdir -p sign/release
python3 tools/make-icon.py
./build-both.sh
```
