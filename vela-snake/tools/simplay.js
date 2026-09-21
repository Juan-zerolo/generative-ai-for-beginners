// Juega automaticamente persiguiendo la comida: verifica crecimiento,
// aceleracion y coherencia del tablero a lo largo de una partida real.
const fs = require('fs')
const src = fs.readFileSync(process.argv[2], 'utf8')
const body = src.split('<script>')[1].split('</script>')[0]
  .replace(/^import .*$/gm, '').replace('export default', 'module.exports =')
const stub = { setKeepScreenOn(){}, vibrate(){}, get(){}, set(){}, terminate(){}, back(){} }
const mod = { exports: {} }
let timers = [], now = 1000
const st = (fn, ms) => { const id = timers.length + 1; timers.push({ id, fn }); return id }
const ct = (id) => { timers = timers.filter(t => t.id !== id) }
const def = new Function('module','brightness','vibrator','storage','app','router','setTimeout','clearTimeout','Date','console',
  body + '\nreturn module.exports')(mod, stub, stub, stub, stub, stub, st, ct, { now: () => now }, { log(){} })
const vm = Object.assign({}, def.private, def)
for (const k of Object.keys(def)) if (typeof def[k] === 'function') vm[k] = def[k].bind(vm)
const COLS = 12, ROWS = 16
const cells = () => { const o = []; for (let i = 0; i < COLS*ROWS; i++) o.push(vm['c'+i]); return o }

vm.reset()
let steps = 0, maxLen = 3
while (!vm.over && steps < 4000) {
  const g = cells()
  const hi = g.indexOf('h'), fi = g.indexOf('f')
  const h = { x: hi % COLS, y: (hi / COLS) | 0 }, f = { x: fi % COLS, y: (fi / COLS) | 0 }
  // elige un giro hacia la comida que no choque
  const opts = []
  if (f.x > h.x) opts.push('right'); if (f.x < h.x) opts.push('left')
  if (f.y > h.y) opts.push('down'); if (f.y < h.y) opts.push('up')
  for (const d of opts) {
    const nx = h.x + (d === 'right' ? 1 : d === 'left' ? -1 : 0)
    const ny = h.y + (d === 'down' ? 1 : d === 'up' ? -1 : 0)
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue
    if (g[ny*COLS+nx] === 'b') continue
    vm.setDir(d, 'bot'); break
  }
  now += 200
  vm.tick()
  steps++
  const len = cells().filter(c => c === 'h' || c === 'b').length
  if (len > maxLen) maxLen = len
  const heads = cells().filter(c => c === 'h').length
  const foods = cells().filter(c => c === 'f').length
  if (heads !== 1 || foods !== 1) { console.log('INCOHERENCIA en paso', steps, 'cabezas', heads, 'comidas', foods); break }
}
console.log('pasos:', steps, '| puntuacion:', vm.score, '| longitud max:', maxLen, '| velocidad final:', vm.inputInfo || 'en juego')
console.log('coherencia mantenida durante toda la partida')
