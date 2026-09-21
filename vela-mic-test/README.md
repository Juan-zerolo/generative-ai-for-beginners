# Micro — sonda del micrófono (Xiaomi Smart Band 8 Pro / Vela quick app)

App de prueba para averiguar si el micrófono de la banda es accesible desde
una quick app, antes de construir nada encima.

## Archivos

- `dist/com.claude.mictest.release.1.0.0.rpk` — «REL Micro», rotula `RELEASE`.
- `dist/com.claude.mictest.debug.1.0.0.rpk` — «DBG Micro», rotula `DEBUG`.

## Qué se sabe antes de probar

- La documentación de Vela **sí tiene** una página de grabación
  (`iot.mi.com/vela/quickapp/zh/features/system/record.html`), o sea que
  `system.record` existe como feature de la plataforma. La API sigue el
  estándar de quick apps: `record.start({duration, sampleRate,
  numberOfChannels, encodeBitRate, format, success})`, donde el `success`
  devuelve un `uri`, y `record.stop()`.
- Lo que **no** está documentado es qué dispositivos la implementan. En
  `open-vela/docs` hay una incidencia abierta justo sobre eso: la Mi Band 10
  aparece como sin grabación por limitación de hardware, y de las 10 Pro y
  10 NFC —que sí llevan micrófono— nadie sabe si la API está abierta, porque
  no hay entradas en las tablas. De la Band 8 Pro no hay ni mención.
- Y en esta banda ya comprobamos que **el runtime solo inyecta los módulos
  declarados en el manifest**, y que declarar uno no garantiza que exista
  (ver `../vela-light-meter/README.md`).

Por eso esto es una sonda, no una app.

## Qué hace, paso a paso

1. **Sondeo de módulos.** Declara y resuelve 12 nombres candidatos
   (`system.record`, `audio`, `media`, `file`, `microphone`, `recorder`,
   `voice`, `speech`, `asr`, `aivs`, `speechrecognition`, `ai`) y lista los
   que existen. En el primero que tenga un método tipo `start` / `startRecord`
   / `startRecording` se apoya para grabar, con su `stop` correspondiente.
2. **Grabación real de 3 s** en PCM a 8 kHz mono, con parada explícita por si
   `duration` no se respeta, y un vigilante a los 6 s para que la app no se
   quede colgada si el micro no responde.
3. **Comprobación del fichero** con `file.get`: muestra el tamaño en bytes.
   Un fichero de tamaño razonable es la prueba de que se ha capturado audio.
4. **Nivel de sonido** con `file.readArrayBuffer`: lee las primeras muestras,
   las interpreta como PCM de 16 bits y calcula media y pico. Si esos números
   suben al hablarle y bajan en silencio, el micrófono funciona de verdad y no
   está devolviendo ceros.

Cada paso escribe su propia línea en pantalla, así que un fallo a mitad sigue
diciendo exactamente dónde se rompió.

Salir: botón SALIR o mantener pulsado.

## Compilar

```bash
npm install
mkdir -p sign/release   # certificado propio, igual que en los otros proyectos
./build-both.sh
```
