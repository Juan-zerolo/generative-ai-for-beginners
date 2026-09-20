# Luz — nivel de luz para Xiaomi Smart Band 8 Pro (Vela / quick app)

App mínima en formato `.rpk` (quick app de Xiaomi Vela) que muestra el nivel de
luz como porcentaje, en texto plano, actualizándose en vivo.

## Hallazgo importante: no hay sensor de luz accesible

Verificado en el propio dispositivo con la build de diagnóstico 1.1.0
(Smart Band 8 Pro + Gadgetbridge):

```
ok: brightness, device
no: sensor, sensors, light, ambientlight, health, wear
LUZ: ninguna
```

El módulo `@system.sensor` **no se resuelve** en ese firmware, ni declarándolo
en `features` del manifest, ni resolviéndolo dinámicamente con
`$app_require$`. Es decir: las quick apps de esa banda no tienen acceso a los
lux del sensor de luz ambiental. Lo único relacionado con luz que expone la
plataforma es `@system.brightness` (brillo de pantalla).

Por eso la app usa, en este orden:

1. Sensor de luz real (`subscribeLight` / `subscribeAmbientLight` /
   `subscribeLightSensor`) si algún firmware lo expone → porcentaje a partir de
   los lux, escala logarítmica.
2. Si no existe: **brillo de pantalla en modo automático** como aproximación
   indirecta de la luz ambiental. No son lux: es el valor al que el propio
   firmware ajusta la pantalla según la luz que mide. Sube en un entorno
   luminoso y baja al taparla.

Con la fuente 2, tocar la pantalla activa el brillo automático
(`brightness.setMode({mode: 1})`); sin ese modo el valor es fijo y el
porcentaje no cambia.

## Archivos listos para instalar

- `dist/com.claude.lightmeter.release.1.2.0.rpk` — firmado con certificado propio.
- `dist/com.claude.lightmeter.debug.1.2.0.rpk` — firmado con el certificado de
  desarrollo del toolkit oficial.

Ambos instalan y arrancan en una Smart Band 8 Pro (verificado).

Instalación con Gadgetbridge: abrir el `.rpk` desde el gestor de archivos y
elegir Gadgetbridge (activity `FileInstallerActivity`), o dentro de
Gadgetbridge usar la instalación de ficheros con la banda conectada.

## Cómo funciona

- `src/pages/index/index.ux` intenta primero `@system.sensor` (probando varios
  nombres de método, todos dentro de `try/catch` porque el módulo puede llegar
  como `undefined`) y, si no hay ninguno, cae al sondeo de
  `brightness.getValue()` cada 700 ms.
- El brillo se escala a porcentaje deduciendo el rango del firmware (0-100 o
  0-255) a partir del máximo observado.
- Conversión lux → porcentaje (escala logarítmica, 0 lx = 0 %, ≥10 000 lx = 100 %):

  ```
  pct = round(100 * ln(1 + lux) / ln(1 + 10000))
  ```

  Se usa escala logarítmica porque la luz ambiental va de ~0 lx (oscuridad) a
  decenas de miles de lx (sol directo); en escala lineal casi todo en interior
  daría 0 %.
- La suscripción se cancela en `onHide` / `onDestroy` (`unsubscribe…`).
- Si ningún método existe, la pantalla muestra `sin API de luz`.
- Diagnóstico en pantalla (1.1.0): marcadores de ciclo de vida (`lc:IRS`), qué
  módulos `@system.*` resuelven y cuáles no (`ok:` / `no:`), las claves del
  módulo de sensores que contienen `light|lux|ambient|illum|als`, y el último
  error capturado. Los módulos se resuelven dinámicamente con
  `$app_require$('@app-module/<nombre>')` dentro de `try/catch`, además de los
  `import` estáticos.

## Compilar desde el código

```bash
npm install                     # instala aiot-toolkit (toolkit oficial de Xiaomi)

# certificado propio para el modo release (no se incluye en el repo)
mkdir -p sign/release
openssl req -x509 -newkey rsa:2048 -keyout /tmp/k.pem -out sign/release/certificate.pem \
  -days 7300 -nodes -sha256 -subj "/C=ES/O=Vela Light Meter/CN=com.claude.lightmeter"
openssl pkcs8 -topk8 -nocrypt -in /tmp/k.pem -out sign/release/private.pem

npx aiot release                # -> dist/com.claude.lightmeter.release.1.0.0.rpk
npx aiot build                  # -> dist/com.claude.lightmeter.debug.1.0.0.rpk (cert de desarrollo)
```

## Manifest

`deviceTypeList: ["watch"]` (las bandas Vela usan el tipo `watch`),
`designWidth: 336` (ancho físico de la Smart Band 8 Pro, 336×480),
`minPlatformVersion: 1000` y features `system.sensor` + `system.brightness`
(esta última solo para mantener la pantalla encendida mientras se mide).

## Referencias

- Documentación oficial Vela JS: https://iot.mi.com/vela/quickapp/en/
- API sensor quick app estándar: https://doc.quickapp.cn/features/system/sensor.html
- Toolkit oficial: https://www.npmjs.com/package/aiot-toolkit
- Gadgetbridge / Xiaomi: https://gadgetbridge.org/gadgets/wearables/xiaomi/
