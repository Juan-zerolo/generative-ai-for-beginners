# Luz — medidor de luz ambiental para Xiaomi Smart Band 8 Pro (Vela / quick app)

App mínima en formato `.rpk` (quick app de Xiaomi Vela) que muestra el nivel de
luz ambiental como porcentaje, en texto plano, actualizándose en vivo.

```
   47%
  318 lx
```

## Archivos listos para instalar

- `dist/com.claude.lightmeter.release.1.0.0.rpk` — firmado con un certificado
  propio (modo release). Probar este primero.
- `dist/com.claude.lightmeter.debug.1.0.0.rpk` — firmado con el certificado de
  desarrollo que trae el toolkit oficial (modo debug). Alternativa si el
  anterior es rechazado por el dispositivo.

Instalación con Gadgetbridge: abrir el `.rpk` desde el gestor de archivos y
elegir Gadgetbridge (activity `FileInstallerActivity`), o dentro de
Gadgetbridge usar la instalación de ficheros con la banda conectada.

## Cómo funciona

- `src/pages/index/index.ux` se suscribe al sensor de luz vía `@system.sensor`.
  Vela no documenta públicamente (o no de forma accesible) el nombre exacto del
  método en cada versión de firmware, así que el código prueba en orden
  `subscribeLight`, `subscribeAmbientLight` y `subscribeLightSensor`, y usa el
  primero que exista. Del objeto del callback lee la primera clave numérica
  entre `intensity`, `value`, `lux`, `light`, `illuminance`.
- Conversión lux → porcentaje (escala logarítmica, 0 lx = 0 %, ≥10 000 lx = 100 %):

  ```
  pct = round(100 * ln(1 + lux) / ln(1 + 10000))
  ```

  Se usa escala logarítmica porque la luz ambiental va de ~0 lx (oscuridad) a
  decenas de miles de lx (sol directo); en escala lineal casi todo en interior
  daría 0 %.
- La suscripción se cancela en `onHide` / `onDestroy` (`unsubscribe…`).
- Si ningún método existe, la pantalla muestra `sensor de luz no disponible`;
  si existe pero no llega ningún dato en 4 s, muestra `sin datos del sensor`.

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
