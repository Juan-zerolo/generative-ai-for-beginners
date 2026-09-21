# Sonda — inventario de capacidades de una banda Xiaomi Vela

Declara 62 módulos `@system.*` en el manifest y dice, en el propio
dispositivo, cuáles existen de verdad, qué métodos tiene cada uno, y si las
operaciones básicas funcionan.

## Por qué hace falta

En esta banda (Smart Band 8 Pro con Gadgetbridge) aprendimos dos cosas a base
de pruebas:

1. **El runtime solo inyecta los módulos declarados en `features`.** Sondear
   dinámicamente un nombre no declarado siempre da `undefined`, así que no
   prueba nada. Por eso la lista del manifest y la que sondea la página son la
   misma (`features.json`).
2. **Declarar un módulo no garantiza que exista.** `system.sensor` estaba
   declarado y no se resolvió; el micrófono tampoco (ver
   `../vela-light-meter/` y `../vela-mic-test/`).

## Qué muestra

Páginas navegables con el botón **SIG**:

1. **SI estan (n/62)** — todos los módulos que existen en el dispositivo.
2. **NO estan** — los que no.
3. Una página por módulo presente con **todos sus métodos**.
4. **PRUEBAS EN VIVO** — resultados reales, no solo presencia:
   - `device.getInfo` (modelo, versión de plataforma, pantalla, idioma…)
   - `device.getDeviceId`, `configuration.getLocale`
   - `battery.getStatus`, `network.getType`
   - almacenamiento: escribe `v42` y lo vuelve a leer
   - ficheros: escribe y relee `internal://files/probe.txt`
   - lo que exista pero no conteste en 6 s sale como `sin respuesta`

El botón **RED** lanza aparte una petición HTTPS real a `example.com` con
`fetch`/`request` y muestra el código de respuesta. Es la prueba de si la
banda tiene internet a través del teléfono, que decide si son posibles apps
conectadas (el tiempo, marcadores, avisos de un servidor).

Salir: botón SALIR o mantener pulsado.

## Compilar

```bash
npm install
mkdir -p sign/release
./build-both.sh
```
