# Snake — Xiaomi Smart Band 8 Pro (Vela / quick app)

Snake clásico con control por deslizamiento (arriba / abajo / izquierda /
derecha), como el de Google en el móvil.

## Archivos listos para instalar

- `dist/com.claude.snake.release.1.4.0.rpk` — se instala como **«REL Snake»**.
- `dist/com.claude.snake.debug.1.4.0.rpk` — se instala como **«DBG Snake»**.

En la pantalla de game over aparece abajo, en gris pequeño, la variante y la
última entrada recibida (`RELEASE · swipe:up`, `DEBUG · touch:left`, o
`sin entrada`), para saber qué build se está probando y si los gestos llegan.

## Controles y juego

- Desliza en las cuatro direcciones para girar. No se permite el giro de 180º.
- La flecha de la cabecera muestra la dirección actual: sirve de confirmación
  visual de que el gesto ha llegado.
- Comer acelera el juego: 220 ms por paso al empezar, −6 ms por pieza, con
  suelo de 100 ms.
- El giro se aplica al instante si ya ha pasado medio paso, en vez de esperar
  al siguiente: quita casi toda la latencia percibida.
- Chocar con la pared o con el propio cuerpo termina la partida. En game over
  hay dos botones, JUGAR y SALIR; hay que pulsar JUGAR para otra partida (un
  toque en cualquier sitio ya no reinicia, que provocaba partidas sin querer).
- **Salir en cualquier momento: mantén pulsada la pantalla** (`onlongpress` →
  `app.terminate()`, con `router.back()` de respaldo). Hacía falta porque el
  manejador de gestos de la app se come el gesto de retroceso del sistema.
- Vibración corta al comer y larga al morir (si `system.vibrator` existe).
- Récord guardado con `system.storage`, mostrado como `max N`.
- La pantalla se mantiene encendida con `brightness.setKeepScreenOn`.

## Cómo está hecho

- Tablero de 12 × 16 celdas de 28 px (336 × 448), cabecera de 32 px: encaja
  exactamente en los 336 × 480 de la pantalla, con `designWidth: 336`.

### Una celda, un binding

La 1.2.0 ya solo tocaba 2-3 filas por paso, pero reasignar el array de una
fila hace que el framework rehaga sus 12 nodos. Seguía habiendo demasiado
trabajo: el juego iba a tirones, con parones y acelerones, y los gestos
llegaban tarde.

En la 1.3.0 la plantilla es estática y **cada celda es su propio binding de
primer nivel** (`c0`…`c191`, plantilla generada). Un paso solo escribe tres de
esas propiedades — cabeza nueva, cabeza vieja que pasa a cuerpo y cola que se
libera —, así que el framework actualiza exactamente 3 nodos. Verificado en
simulación fuera del dispositivo (`tools/simplay.js`): máximo 3 celdas
cambiadas por paso, y el tablero mantiene 1 cabeza y 1 comida durante toda la
partida.

El bucle lleva además un testigo de generación: si dos bucles llegaran a
solaparse (reinicio, `onShow` repetido — en esta banda llega a dispararse
varias veces), el viejo muere en el acto en vez de duplicar la velocidad.

### Historial: solo se repintan las filas que cambian

La 1.1.0 ya se veía, pero reasignaba las 16 filas en cada paso: 192 nodos
repintados 4 veces por segundo saturaban la CPU de la banda. El resultado era
un juego lentísimo y, peor, los gestos se quedaban sin atender (ni la flecha
respondía).

En la 1.2.0 el tablero es un estado persistente (`board`) y cada paso solo
toca tres celdas — cabeza nueva, cabeza vieja que pasa a cuerpo, y cola que se
libera (o comida nueva) —, marcando como sucias las 2-3 filas afectadas. Solo
esas se reasignan. Además:

- El bucle es una cadena de `setTimeout` en vez de `setInterval`, para que un
  paso lento no acumule callbacks pendientes que ahoguen la entrada.
- La flecha se actualiza en el propio gesto, sin esperar al siguiente paso.
- En game over se muestra el tiempo real medio por paso (`paso 245ms`), para
  comparar con la velocidad nominal.

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
  entera**, con un array nuevo de 12 cadenas (`e`, `h`, `b`, `f`).
- Las celdas se pintan solo con clases (`class="c {{$item}}"`, que compila a
  `"c " + $item`): sin estilos inline, sin posicionamiento absoluto, sin `for`
  anidados. Solo layout flex, que es lo más básico del framework.
- Nada de `canvas`: el compilador de Vela lo acepta, pero el firmware de esta
  banda expone muy poco (ver `../vela-light-meter/README.md`).
- Doble captura de gestos: el evento `swipe` (con `e.direction`) y, como
  respaldo, `touchstart` + `touchend` deduciendo la dirección del
  desplazamiento con umbral de 18 px. Si una de las dos vías no existe en el
  firmware, la otra cubre el control.

## Icono

`python3 tools/make-icon.py` genera `src/common/icon.png`: círculo verde
oscuro con la serpiente en bloques y la manzana, dibujado a 512 px y reducido
a 128. Fuera del círculo es transparente, para que en el lanzador se vea
redondo como los iconos del sistema en vez de como un cuadrado blanco.

## Probar la lógica sin el reloj

`node tools/simplay.js src/pages/index/index.ux` extrae el `<script>` del
`.ux`, sustituye los módulos `@system.*` por stubs y juega una partida
automática, comprobando coherencia del tablero y celdas tocadas por paso.

## Compilar

```bash
npm install
mkdir -p sign/release   # certificado propio, igual que en vela-light-meter
./build-both.sh         # genera las dos variantes etiquetadas en out/
```
