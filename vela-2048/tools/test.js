// Verifica la logica del 2048 fuera del dispositivo: reglas de fusion,
// movimientos invalidos, deteccion de fin de partida y coherencia general.
const fs = require('fs')
const src = fs.readFileSync(process.argv[2], 'utf8')
let body = src.split('<script>')[1].split('</script>')[0]
  .replace(/^import .*$/gm, '').replace('export default', 'module.exports =')
body += '\nmodule.exports.__slide = slide; module.exports.__grid = () => grid; module.exports.__setGrid = g => { grid = g.slice(); mirror = g.map(() => -1) };'

const stub = { get(){}, set(){}, vibrate(){}, setKeepScreenOn(){}, terminate(){}, back(){}, instance(){ return null } }
const mod = { exports: {} }
const def = new Function('module','storage','vibrator','brightness','app','router','interconnect','setTimeout','clearTimeout','console',
  body + '\nreturn module.exports')(mod, stub, stub, stub, stub, stub, stub, (f,t)=>0, ()=>{}, { log(){} })

const vm = Object.assign({}, def.private, def)
for (const k of Object.keys(def)) if (typeof def[k] === 'function') vm[k] = def[k].bind(vm)

let fails = 0
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  if (!ok) { fails++; console.log('FALLO', name, 'obtuvo', JSON.stringify(got), 'esperaba', JSON.stringify(want)) }
  else console.log('ok  ', name)
}

// Reglas de fusion
check('[2,2,2,2] -> [4,4,0,0] +8', def.__slide([2,2,2,2]), { line:[4,4,0,0], gained:8 })
check('[2,2,4,0] -> [4,4,0,0] +4', def.__slide([2,2,4,0]), { line:[4,4,0,0], gained:4 })
check('[4,4,4,0] -> [8,4,0,0] +8', def.__slide([4,4,4,0]), { line:[8,4,0,0], gained:8 })
check('[2,0,2,4] -> [4,4,0,0] +4', def.__slide([2,0,2,4]), { line:[4,4,0,0], gained:4 })
check('[0,0,0,2] -> [2,0,0,0] +0', def.__slide([0,0,0,2]), { line:[2,0,0,0], gained:0 })
check('sin doble fusion [4,4,8,0]', def.__slide([4,4,8,0]), { line:[8,8,0,0], gained:8 })
check('[8,8,8,8] -> [16,16,0,0] +32', def.__slide([8,8,8,8]), { line:[16,16,0,0], gained:32 })

// Movimiento invalido: no debe aparecer ficha nueva
def.__setGrid([2,4,8,16, 4,8,16,32, 8,16,32,64, 16,32,64,128])
vm.score = 0; vm.over = false
const antes = def.__grid().join(',')
vm.move('left')
check('movimiento invalido no cambia el tablero', def.__grid().join(','), antes)

// Fin de partida detectado en tablero bloqueado
def.__setGrid([2,4,8,16, 4,8,16,32, 8,16,32,64, 16,32,64,128])
check('tablero bloqueado = fin', vm.isOver(), true)
def.__setGrid([2,2,8,16, 4,8,16,32, 8,16,32,64, 16,32,64,128])
check('con fusion posible no es fin', vm.isOver(), false)

// Partida aleatoria larga: invariantes
vm.reset()
let moves = 0, maxTile = 0
const dirs = ['left','right','up','down']
while (!vm.over && moves < 3000) {
  vm.move(dirs[Math.floor(Math.random()*4)])
  moves++
  const g = def.__grid()
  if (g.length !== 16) { console.log('FALLO tamano de tablero'); fails++; break }
  for (const v of g) {
    if (v && (v & (v-1)) !== 0) { console.log('FALLO ficha no potencia de 2:', v); fails++; break }
    if (v > maxTile) maxTile = v
  }
}
console.log('partida: ' + moves + ' movimientos, puntuacion ' + vm.score + ', ficha maxima ' + maxTile + ', fin=' + vm.over)
console.log(fails ? fails + ' FALLOS' : 'todo correcto')
process.exit(fails ? 1 : 0)
