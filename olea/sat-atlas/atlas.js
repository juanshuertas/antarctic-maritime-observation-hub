const el = id => document.getElementById(id)
const map = el('map'), sensor = el('sensor'), day = el('day'), compare = el('compare')
const projection = el('projection'), save = el('save'), split = el('split')
const status = document.querySelector('output')
const today = new Date().toISOString().slice(0, 10)
let catalog, center = [0, 0], span, frames = [], revision = 0, start

function extent() {
  const half = span / 2, height = half * 9 / 16
  return [center[0]-half, center[1]-height, center[0]+half, center[1]+height]
}

async function image(date, width, height) {
  const params = new URLSearchParams({SERVICE:'WMS', VERSION:'1.3.0', REQUEST:'GetMap',
    CRS:'EPSG:'+projection.value, BBOX:extent().join(','), WIDTH:width, HEIGHT:height,
    FORMAT:'image/png', LAYERS:sensor.value, STYLES:''})
  if (date) params.set('TIME', date)
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = 'https://gibs.earthdata.nasa.gov/wms/epsg'+projection.value+'/best/wms.cgi?'+params
  await img.decode()
  return img
}

function paint(canvas, images) {
  const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(images[0], 0, 0, w, h)
  if (images[1]) {
    const edge = Math.round(w * Number(split.value) / 100)
    ctx.save()
    ctx.beginPath()
    ctx.rect(edge, 0, w-edge, h)
    ctx.clip()
    ctx.drawImage(images[1], 0, 0, w, h)
    ctx.restore()
    ctx.fillStyle = 'white'
    ctx.fillRect(edge, 0, 2, h)
  }
}

function loadImages(w, h) {
  const dates = [day.disabled ? '' : day.value]
  if (!compare.disabled && compare.value) dates.push(compare.value)
  return Promise.all(dates.map(date => image(date, w, h)))
}

async function draw() {
  const token = ++revision
  save.disabled = true
  frames = []
  map.getContext('2d').clearRect(0, 0, map.width, map.height)
  status.textContent = 'Consultando NASA GIBS…'
  const width = Math.max(16, Math.min(3840, Math.round(map.clientWidth * devicePixelRatio / 16) * 16))
  try {
    const images = await loadImages(width, width * 9 / 16)
    if (token !== revision) return
    map.width = width
    map.height = width * 9 / 16
    frames = images
    paint(map, images)
    save.disabled = false
    split.disabled = images.length !== 2
    status.textContent = 'NASA GIBS · EPSG:'+projection.value+' · '+(day.disabled ? 'Mosaico' : day.value+' UTC')
  } catch {
    if (token === revision) status.textContent = 'Imagen no disponible para esta consulta.'
  }
}

function selectSensor() {
  const item = catalog[projection.value].find(layer => layer.id === sensor.value)
  day.disabled = compare.disabled = !item.date
  compare.value = ''
  day.max = compare.max = today
  day.value = item.date ? [item.date.slice(0,10), today].sort()[0] : ''
  draw()
}

let grid
async function inspectCell(event) {
  const output = el('sample')
  output.replaceChildren()
  const rect = map.getBoundingClientRect()
  const [left, , , top] = extent()
  const x = left + (event.clientX-rect.left)*span/rect.width
  const y = top - (event.clientY-rect.top)*span/rect.width
  try {
    grid ??= await (await fetch('../data/science/ku_geophysics_3d.json')).json()
    const col = Math.floor((x-grid.upper_left_corner_m[0])/grid.cell_m)
    const row = Math.floor((grid.upper_left_corner_m[1]-y)/grid.cell_m)
    const index = row*grid.width+col
    const labels = {bed_m:'Lecho (m)',tid:'Tipo de sondeo (TID)',gravity_mgal:'Gravedad (mGal)',bouguer_mgal:'Bouguer (mGal)',magnetic_b_nt:'ADMAP-2B (nT)',magnetic_s_nt:'ADMAP-2S (nT)',ice_speed_m_year:'Velocidad del hielo (m/año)'}
    if (col < 0 || row < 0 || col >= grid.width || row >= grid.height) {
      output.textContent = 'Fuera de la grilla.'
      return
    }
    for (const [key, label] of Object.entries(labels)) {
      const term = document.createElement('dt'), value = document.createElement('dd')
      term.textContent = label
      value.textContent = grid.columns[key][index] ?? 'Sin datos'
      value.title = grid.sources[key].file
      output.append(term, value)
    }
  } catch {output.textContent = 'Grilla no disponible.'}
}

function reset() {
  el('geophysics').hidden = projection.value !== '3031'
  el('sample').replaceChildren()
  const layers = catalog[projection.value]
  sensor.replaceChildren(...layers.map(layer => new Option(layer.title, layer.id)))
  sensor.value = 'VIIRS_NOAA20_CorrectedReflectance_TrueColor'
  center = [0, 0]
  span = projection.value === '3031' ? 9600000 : 40075016
  selectSensor()
}

el('plus').onclick = () => {span = Math.max(10000, span / 2); draw()}
el('minus').onclick = () => {span = Math.min(40100000, span * 2); draw()}
projection.onchange = reset
sensor.onchange = selectSensor
day.onchange = compare.onchange = draw
split.oninput = () => {if (frames.length) paint(map, frames)}
map.onpointerdown = event => {start = [event.clientX, event.clientY]; map.setPointerCapture(event.pointerId)}
map.onpointercancel = () => {start = null}
map.onpointerup = event => {
  if (!start) return
  if (Math.hypot(event.clientX-start[0], event.clientY-start[1]) < 4) {
    start = null
    if (projection.value === '3031') {
      el('geophysics').open = true
      inspectCell(event)
    }
    return
  }
  const unit = span / map.clientWidth
  center = [center[0]-(event.clientX-start[0])*unit, center[1]+(event.clientY-start[1])*unit]
  start = null
  draw()
}
save.onclick = async () => {
  const token = revision
  save.disabled = true
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 3840
    canvas.height = 2160
    const images = await loadImages(3840, 2160)
    if (token !== revision) return
    paint(canvas, images)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#06141d'
    ctx.fillRect(0, 2030, 3840, 130)
    ctx.fillStyle = 'white'
    ctx.font = '32px sans-serif'
    ctx.fillText('OLEA · NASA EOSDIS GIBS · '+sensor.value+' · '+[day.value,compare.value].filter(Boolean).join(' | ')+' UTC', 36, 2080)
    ctx.fillText('EPSG:'+projection.value+' · BBox (m): '+extent().map(Math.round).join(', '), 36, 2130)
    ctx.fillRect(3000, 2090, 500, 5)
    ctx.fillText((span*500/3840/1000).toFixed(1)+' km proyectados', 3000, 2070)
    const blob = await new Promise(resolve => canvas.toBlob(resolve))
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'OLEA-'+sensor.value+'-'+(day.value || 'mosaic')+'.png'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
  } catch {status.textContent = 'Error al descargar la imagen 4K.'}
  finally {if (token === revision) save.disabled = false}
}
try {
  catalog = await (await fetch('../data/science/gibs_sensors.json')).json()
  reset()
} catch {status.textContent = 'Catálogo de sensores no disponible.'}
el('atlas-list').ontoggle = async event => {
  const panel = event.currentTarget, list = panel.querySelector('ul')
  if (!panel.open || list.children.length) return
  try {
    const sources = await (await fetch('../data/science/natgeo_atlas_layers.json')).json()
    list.replaceChildren(...sources.map(source => {
      const row = document.createElement('li'), link = document.createElement('a')
      link.href = source.item
      link.textContent = source.title
      row.append(link)
      return row
    }))
  } catch {list.textContent = 'Catálogo no disponible.'}
}
let resourceRequest = 0
async function showResources() {
  const collection = el('collection').value, list = el('resources')
  const request = ++resourceRequest
  try {
    const data = await (await fetch('../data/science/'+collection+'.json')).json()
    if (request !== resourceRequest) return
    if (collection === 'gfs_wind_currents') {
      list.replaceChildren(...data.points.map(point => {
        const li = document.createElement('li'), hours = point.hourly
        const index = hours.wind_speed_10m.findIndex(Number.isFinite)
        li.textContent = point.latitude+'°, '+point.longitude+'° · '+(index < 0 ? 'Sin datos' :
          hours.time[index]+' UTC · '+hours.wind_speed_10m[index]+' m/s · '+hours.wind_direction_10m[index]+'°')
        return li
      }))
    } else {
      list.replaceChildren(...data.map(item => {
        const li = document.createElement('li'), link = document.createElement('a')
        link.href = item.source
        link.target = '_blank'
        link.rel = 'noreferrer'
        link.textContent = item.title
        li.append(link)
        if (item.route) li.append(' · '+item.route)
        return li
      }))
    }
  } catch {if (request === resourceRequest) list.textContent = 'Fuente no disponible.'}
}
el('collection').onchange = showResources
el('sources').ontoggle = event => {if (event.currentTarget.open) showResources()}
