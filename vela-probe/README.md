# Sonda — inventario de capacidades de una banda Xiaomi Vela

Declara 62 módulos `@system.*` en el manifest y dice, en el propio
dispositivo, cuáles existen de verdad, qué métodos tiene cada uno, y si las
operaciones básicas funcionan.

## Resultado en la Smart Band 8 Pro (Gadgetbridge)

**11 de 62 módulos existen:**

```
app  router  device  configuration  prompt
storage  file  cipher  interconnect  brightness  vibrator
```

**51 no existen**, entre ellos todos los de estas familias:

| Familia | Ausentes |
| --- | --- |
| Red | `fetch`, `request`, `network`, `wifi`, `websocketfactory`, `bluetooth`, `ble` |
| Sensores y salud | `sensor`, `geolocation`, `health`, `fitness`, `sport`, `stepcounter`, `heartrate`, `sleep`, `motion`, `compass` |
| Multimedia | `audio`, `media`, `video`, `record`, `camera`, `image`, `barcode` |
| Tiempo y avisos | `alarm`, `timer`, `notification`, `calendar` |
| Teléfono | `share`, `contact`, `sms`, `telecom`, `webview` |
| Hardware | `volume`, `battery`, `power`, `screen`, `display`, `keyguard`, `watchface`, `theme` |
| Sistema | `shortcut`, `package`, `update`, `event`, `resident`, `debug`, `log`, `clipboard`, `ai`, `voice` |

### Identidad del dispositivo (`device.getInfo`)

```
brand            Vela
manufacturer     XiaoMi Vela Team
product          Xiaomi Smart Band 8 Pro
model            ap
osType           NuttX
osVersionName    10.3.0     (osVersionCode 656128)
platformVersionName  1.0.0-alpha
platformVersionCode  1
language / region    zh / CN
```

`platformVersionCode: 1` explica la escasez: es la primera versión de la
plataforma de quick apps. Y ojo, los `.rpk` de este repo declaran
`minPlatformVersion: 1000` y se instalan igual, así que **ese campo no se está
comprobando** en este firmware.

### Métodos de cada módulo presente

| Módulo | Métodos |
| --- | --- |
| `app` (3) | `getInfo`, `terminate`, `loadLibrary` |
| `router` (7) | `push`, `replace`, `back`, `clear`, `getLength`, `getState`, `getPages` |
| `device` (5) | `getInfo`, `getDeviceId`, `getSerial`, `getTotalStorage`, `getAvailableStorage` |
| `configuration` (1) | `getLocale` |
| `prompt` (2) | `showToast`, `showDialog` |
| `storage` (4) | `get`, `set`, `clear`, `delete` |
| `file` (12) | `move`, `copy`, `list`, `get`, `delete`, `writeText`, `writeArrayBuffer`, `readText`, `readArrayBuffer`, `access`, `mkdir`, `rmdir` |
| `cipher` (6) | `rsa`, `sign`, `verify`, `digest`, `md5`, `aes` |
| `interconnect` (1) | `instance` |
| `brightness` (5) | `getValue`, `setValue`, `getMode`, `setMode`, `setKeepScreenOn` |
| `vibrator` (1) | `vibrate` |

Eso es **47 métodos en total**: toda la superficie de programación disponible
en este dispositivo.

Notas:

- `configuration.getLocale` salió como «sin respuesta» porque la sonda lo llamó
  con callbacks: es **síncrono**, devuelve el valor directamente.
- `interconnect` expone solo `instance`, una fábrica. Habría que llamarla e
  inspeccionar el objeto devuelto para saber qué permite; es el único módulo
  presente cuyo alcance sigue sin conocerse.
- `file` es sorprendentemente completo (incluye binario y directorios), y
  `cipher` trae RSA, AES, firma y hashes.

### Pruebas en vivo

- `file`: escribe y relee `internal://files/probe.txt` correctamente.
- `device.getDeviceId`: devuelve el mismo identificador que el IMEI de
  `getInfo`.
- `storage`: escribe y relee `v42` correctamente.
- `battery` y `network` no se prueban: los módulos no existen.

### Qué implica

Se pueden hacer **aplicaciones autónomas y en primer plano**: juegos, temporizadores
mientras la app esté abierta, contadores, notas, herramientas, linterna
(`brightness`), vibración.

No se puede: nada conectado (sin red), nada de sensores ni datos de salud,
nada de audio, y **nada en segundo plano ni avisos programados** (sin `alarm`,
`timer` ni `notification`): la app solo corre mientras está en pantalla.

`interconnect` está presente y es el canal con el teléfono; queda por ver si
sirve de algo con Gadgetbridge en lugar de la app de Xiaomi.

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
