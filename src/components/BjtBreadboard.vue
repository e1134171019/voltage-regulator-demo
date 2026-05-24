<template>
  <section class="board-card">
    <div class="board-head">
      <div>
        <p class="board-kicker">實體麵包板視圖</p>
        <h2>腳位插接、90° 繞線與粒子流動</h2>
      </div>

      <div class="region-pill" :data-region="model.region">
        <span class="region-dot"></span>
        {{ model.regionLabel }}
      </div>
    </div>

    <div ref="stageRef" class="board-stage">
      <svg
        class="board-svg"
        :viewBox="`0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`"
        preserveAspectRatio="none"
        aria-label="BJT breadboard diagram"
      >
        <defs>
          <linearGradient id="boardSurface" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f1f5f9" />
            <stop offset="100%" stop-color="#e2e8f0" />
          </linearGradient>
          <linearGradient id="panelSurface" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="100%" stop-color="#e2e8f0" />
          </linearGradient>
          <linearGradient id="batterySurface" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#cbd5e1" />
            <stop offset="100%" stop-color="#e2e8f0" />
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#34d399" flood-opacity="0.38" />
          </filter>
        </defs>

        <rect x="40" y="40" width="1120" height="680" rx="34" fill="url(#boardSurface)" />
        <rect x="490" y="140" width="220" height="470" rx="24" fill="#cbd5e1" opacity="0.88" />
        <rect x="66" y="76" width="1068" height="44" rx="18" fill="#cbd5e1" opacity="0.92" />
        <rect x="66" y="640" width="1068" height="44" rx="18" fill="#cbd5e1" opacity="0.92" />

        <g class="rail-labels">
          <text x="88" y="102">+VCC</text>
          <text x="88" y="666">GND</text>
        </g>

        <g class="holes">
          <circle v-for="x in railXs" :key="`top-a-${x}`" :cx="x" :cy="95" r="6" />
          <circle v-for="x in railXs" :key="`top-b-${x}`" :cx="x" :cy="105" r="6" />
          <circle v-for="x in railXs" :key="`top-c-${x}`" :cx="x" :cy="115" r="6" />
          <circle v-for="x in railXs" :key="`top-d-${x}`" :cx="x" :cy="125" r="6" />

          <circle v-for="x in railXs" :key="`bot-a-${x}`" :cx="x" :cy="645" r="6" />
          <circle v-for="x in railXs" :key="`bot-b-${x}`" :cx="x" :cy="655" r="6" />
          <circle v-for="x in railXs" :key="`bot-c-${x}`" :cx="x" :cy="665" r="6" />
          <circle v-for="x in railXs" :key="`bot-d-${x}`" :cx="x" :cy="675" r="6" />

          <template v-for="y in holeRows" :key="`row-${y}`">
            <circle v-for="x in leftCols" :key="`l-${y}-${x}`" :cx="x" :cy="y" r="6" />
            <circle v-for="x in rightCols" :key="`r-${y}-${x}`" :cx="x" :cy="y" r="6" />
          </template>
        </g>

        <g class="wires">
          <path v-for="wire in staticWires" :key="wire.key" :d="wire.d" :stroke="wire.color" :stroke-width="wire.width" />
          <path v-for="wire in staticWires" :key="`${wire.key}-shadow`" :d="wire.d" :stroke="wire.glow" :stroke-width="wire.width + 6" opacity="0.12" />
          <path
            v-for="wire in flowOverlay"
            :key="wire.key"
            :d="wire.d"
            :stroke="wire.color"
            stroke-width="3"
            stroke-dasharray="10 12"
            opacity="0.26"
            fill="none"
          />
        </g>

        <g class="battery" transform="translate(60 498)">
          <rect x="0" y="0" width="170" height="160" rx="24" fill="url(#batterySurface)" />
          <rect x="16" y="16" width="138" height="128" rx="18" fill="#f0f4f8" opacity="0.9" />
          <text x="22" y="36" class="component-title">Battery</text>
          <text x="22" y="66" class="battery-plus">+</text>
          <text x="22" y="110" class="battery-minus">-</text>
          <text x="58" y="62" class="terminal-label">+VCC</text>
          <text x="58" y="106" class="terminal-label">GND</text>
          <rect x="148" y="50" width="12" height="18" rx="4" fill="#f43f5e" />
          <rect x="148" y="94" width="12" height="18" rx="4" fill="#94a3b8" />
        </g>

        <g class="resistor rc" transform="translate(760 145)">
          <rect x="0" y="0" width="110" height="170" rx="24" fill="url(#panelSurface)" stroke="#94a3b8" stroke-width="2" />
          <path d="M55 0 L55 18 M55 152 L55 170" stroke="#64748b" stroke-width="8" stroke-linecap="round" />
          <path d="M28 30 L82 30 M28 58 L82 58 M28 86 L82 86 M28 114 L82 114 M28 142 L82 142" stroke="#c2410c" stroke-width="5" stroke-linecap="round" />
          <text x="18" y="24" class="res-label">RC</text>
          <text x="20" y="170" class="res-value">{{ formatResistance(model.rc) }}</text>
        </g>

        <g class="resistor rb" transform="translate(310 175)">
          <rect x="0" y="0" width="110" height="150" rx="24" fill="url(#panelSurface)" stroke="#94a3b8" stroke-width="2" />
          <path d="M55 0 L55 18 M55 132 L55 150" stroke="#64748b" stroke-width="8" stroke-linecap="round" />
          <path d="M28 26 L82 26 M28 50 L82 50 M28 74 L82 74 M28 98 L82 98 M28 122 L82 122" stroke="#0f766e" stroke-width="5" stroke-linecap="round" />
          <text x="18" y="22" class="res-label">RB</text>
          <text x="18" y="148" class="res-value">{{ formatResistance(model.rb) }}</text>
        </g>

        <g class="transistor" transform="translate(500 214)">
          <rect x="0" y="0" width="190" height="120" rx="30" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2" />
          <rect x="14" y="14" width="162" height="92" rx="24" fill="#e2e8f0" />
          <text x="24" y="34" class="component-title">2SC1384 NPN</text>
          <text x="24" y="58" class="component-subtitle">bjt emitter node / KCL</text>

          <circle cx="58" cy="118" r="7" fill="#38bdf8" />
          <circle cx="95" cy="118" r="7" fill="#fbbf24" />
          <circle cx="132" cy="118" r="7" fill="#34d399" />

          <path d="M58 118 L58 178" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
          <path d="M95 118 L95 178" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
          <path d="M132 118 L132 178" stroke="#64748b" stroke-width="6" stroke-linecap="round" />

          <text x="48" y="200" class="pin-label">C</text>
          <text x="88" y="200" class="pin-label">B</text>
          <text x="126" y="200" class="pin-label">E</text>
          <text x="20" y="100" class="node-readout">{{ formatVoltage(model.vc) }}</text>
          <text x="82" y="100" class="node-readout">{{ formatVoltage(model.vb) }}</text>
          <text x="142" y="100" class="node-readout">{{ formatVoltage(model.ve) }}</text>
        </g>

        <g class="wire-labels">
          <text x="742" y="332">IC</text>
          <text x="350" y="336">IB</text>
          <text x="646" y="446">IE</text>
        </g>

        <circle cx="132" cy="105" r="10" fill="#fb7185" />
        <circle cx="132" cy="655" r="10" fill="#22d3ee" />
        <circle cx="645" cy="360" r="12" fill="#34d399" filter="url(#softGlow)" />
        <circle cx="645" cy="360" r="28" fill="none" stroke="#34d399" stroke-width="2" opacity="0.4" />
      </svg>

      <canvas ref="canvasRef" class="board-canvas"></canvas>
    </div>

    <div class="board-foot">
      <article>
        <span>射極節點</span>
        <strong>{{ formatCurrent(model.ieA) }}</strong>
        <small>IE = IC + IB，KCL 匯流點。</small>
      </article>
      <article>
        <span>電池極性</span>
        <strong>+VCC / GND</strong>
        <small>正負極固定，導線走直角路徑。</small>
      </article>
      <article>
        <span>工作狀態</span>
        <strong>{{ model.regionLabel }}</strong>
        <small>{{ model.regionNote }}</small>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  model: {
    type: Object,
    required: true,
  },
})

const BASE_WIDTH = 1200
const BASE_HEIGHT = 760
const stageRef = ref(null)
const canvasRef = ref(null)

const railXs = Array.from({ length: 22 }, (_, index) => 95 + index * 50)
const leftCols = [110, 160, 210, 260, 310, 360, 410, 460]
const rightCols = [740, 790, 840, 890, 940, 990, 1040, 1090]
const holeRows = [170, 205, 240, 275, 310, 345, 380, 415, 450, 485, 520, 555, 590]

function formatResistance(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)} MΩ`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 100000 ? 0 : 1)} kΩ`
  }

  return `${value.toFixed(0)} Ω`
}

function formatVoltage(value) {
  return `${value.toFixed(2)} V`
}

function formatCurrent(value) {
  const absolute = Math.abs(value)

  if (absolute < 1e-9) {
    return '0 A'
  }

  if (absolute < 1e-3) {
    return `${(absolute * 1e6).toFixed(1)} µA`
  }

  return `${(absolute * 1e3).toFixed(absolute * 1e3 < 10 ? 2 : 1)} mA`
}

function pathToD(points) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
}

function buildPolyline(points) {
  const segments = []
  let totalLength = 0

  for (let index = 1; index < points.length; index += 1) {
    const [x1, y1] = points[index - 1]
    const [x2, y2] = points[index]
    const length = Math.hypot(x2 - x1, y2 - y1)

    if (length === 0) {
      continue
    }

    segments.push({
      x1,
      y1,
      x2,
      y2,
      length,
      start: totalLength,
      end: totalLength + length,
    })

    totalLength += length
  }

  const sample = (progress) => {
    if (segments.length === 0) {
      return points[0] ?? [0, 0]
    }

    const normalized = ((progress % 1) + 1) % 1
    const distance = normalized * totalLength

    for (const segment of segments) {
      if (distance <= segment.end) {
        const local = (distance - segment.start) / segment.length
        return [
          segment.x1 + (segment.x2 - segment.x1) * local,
          segment.y1 + (segment.y2 - segment.y1) * local,
        ]
      }
    }

    const lastSegment = segments[segments.length - 1]
    return [lastSegment.x2, lastSegment.y2]
  }

  return {
    points,
    d: pathToD(points),
    totalLength,
    sample,
  }
}

function rgbaFromHex(hex, alpha) {
  const normalized = hex.replace('#', '')
  const fullHex = normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized
  const intValue = Number.parseInt(fullHex, 16)
  const red = (intValue >> 16) & 255
  const green = (intValue >> 8) & 255
  const blue = intValue & 255
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

const staticWires = computed(() => [
  {
    key: 'vcc-rail',
    d: pathToD([
      [132, 105],
      [1110, 105],
    ]),
    color: '#fb7185',
    glow: '#fb7185',
    width: 5,
  },
  {
    key: 'gnd-rail',
    d: pathToD([
      [132, 655],
      [1110, 655],
    ]),
    color: '#22d3ee',
    glow: '#22d3ee',
    width: 5,
  },
  {
    key: 'battery-plus',
    d: pathToD([
      [132, 560],
      [132, 105],
    ]),
    color: '#f87171',
    glow: '#f87171',
    width: 4,
  },
  {
    key: 'battery-minus',
    d: pathToD([
      [132, 640],
      [132, 655],
    ]),
    color: '#38bdf8',
    glow: '#38bdf8',
    width: 4,
  },
  {
    key: 'rc-top',
    d: pathToD([
      [815, 105],
      [815, 180],
    ]),
    color: '#f59e0b',
    glow: '#f59e0b',
    width: 4,
  },
  {
    key: 'rb-top',
    d: pathToD([
      [365, 105],
      [365, 210],
    ]),
    color: '#fbbf24',
    glow: '#fbbf24',
    width: 4,
  },
  {
    key: 'rc-down',
    d: pathToD([
      [815, 290],
      [815, 360],
      [560, 360],
    ]),
    color: '#f97316',
    glow: '#f97316',
    width: 4,
  },
  {
    key: 'rb-down',
    d: pathToD([
      [365, 300],
      [365, 360],
      [600, 360],
    ]),
    color: '#f59e0b',
    glow: '#f59e0b',
    width: 4,
  },
  {
    key: 'emitter-down',
    d: pathToD([
      [645, 360],
      [645, 655],
    ]),
    color: '#34d399',
    glow: '#34d399',
    width: 4,
  },
])

const flowOverlay = computed(() => [
  {
    key: 'ic-flow',
    d: pathToD([
      [132, 560],
      [132, 105],
      [815, 105],
      [815, 290],
      [815, 360],
      [560, 360],
      [610, 334],
      [645, 360],
      [645, 655],
      [132, 655],
    ]),
    color: '#67e8f9',
  },
  {
    key: 'ib-flow',
    d: pathToD([
      [132, 560],
      [132, 105],
      [365, 105],
      [365, 300],
      [365, 360],
      [600, 360],
      [610, 334],
      [645, 360],
      [645, 655],
    ]),
    color: '#fbbf24',
  },
  {
    key: 'ie-flow',
    d: pathToD([
      [645, 360],
      [645, 655],
      [132, 655],
    ]),
    color: '#34d399',
  },
])

const flowRoutes = computed(() => [
  {
    key: 'ic',
    color: '#67e8f9',
    current: props.model.icA,
    speedBase: 0.05,
    path: buildPolyline([
      [132, 560],
      [132, 105],
      [815, 105],
      [815, 290],
      [815, 360],
      [560, 360],
      [610, 334],
      [645, 360],
      [645, 655],
      [132, 655],
    ]),
  },
  {
    key: 'ib',
    color: '#fbbf24',
    current: props.model.ibA,
    speedBase: 0.04,
    path: buildPolyline([
      [132, 560],
      [132, 105],
      [365, 105],
      [365, 300],
      [365, 360],
      [600, 360],
      [610, 334],
      [645, 360],
      [645, 655],
    ]),
  },
  {
    key: 'ie',
    color: '#34d399',
    current: props.model.ieA,
    speedBase: 0.045,
    path: buildPolyline([
      [645, 360],
      [645, 655],
      [132, 655],
    ]),
  },
])

let resizeObserver = null
let animationFrame = 0
let context = null
let devicePixelRatio = 1
let lastWidth = BASE_WIDTH
let lastHeight = BASE_HEIGHT

function resizeCanvas() {
  const canvas = canvasRef.value
  const stage = stageRef.value

  if (!canvas || !stage) {
    return
  }

  const bounds = stage.getBoundingClientRect()
  devicePixelRatio = window.devicePixelRatio || 1
  lastWidth = Math.max(bounds.width, 1)
  lastHeight = Math.max(bounds.height, 1)

  canvas.width = Math.round(lastWidth * devicePixelRatio)
  canvas.height = Math.round(lastHeight * devicePixelRatio)
  canvas.style.width = `${lastWidth}px`
  canvas.style.height = `${lastHeight}px`

  context = canvas.getContext('2d')
}

function drawFrame(time) {
  const ctx = context

  if (!ctx) {
    animationFrame = window.requestAnimationFrame(drawFrame)
    return
  }

  const scaleX = (lastWidth * devicePixelRatio) / BASE_WIDTH
  const scaleY = (lastHeight * devicePixelRatio) / BASE_HEIGHT

  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0)
  ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT)

  const pulse = 0.5 + 0.5 * Math.sin(time / 250)

  flowRoutes.value.forEach((route) => {
    const activity = Math.min(1, route.current * 250)
    const particleCount = Math.min(16, Math.max(1, Math.round(1 + route.current * 2500)))
    const speed = route.speedBase + route.current * 22
    const alpha = 0.22 + activity * 0.52

    ctx.save()
    ctx.globalAlpha = 0.2 + activity * 0.2
    ctx.lineWidth = route.key === 'ie' ? 5 : 4
    ctx.strokeStyle = rgbaFromHex(route.color, 0.34)
    ctx.shadowBlur = 14
    ctx.shadowColor = rgbaFromHex(route.color, 0.24)
    ctx.beginPath()
    route.path.points.forEach(([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    for (let index = 0; index < particleCount; index += 1) {
      const progress = (time * 0.001 * speed + index / particleCount) % 1
      const [x, y] = route.path.sample(progress)
      const radius = 2.3 + activity * 1.5

      ctx.beginPath()
      ctx.fillStyle = rgbaFromHex(route.color, alpha)
      ctx.shadowBlur = 12
      ctx.shadowColor = rgbaFromHex(route.color, 0.38)
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    if (route.key === 'ie') {
      ctx.beginPath()
      ctx.strokeStyle = rgbaFromHex(route.color, 0.18 + pulse * 0.2)
      ctx.lineWidth = 2 + pulse * 3
      ctx.arc(645, 360, 18 + pulse * 10, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.restore()
  })

  animationFrame = window.requestAnimationFrame(drawFrame)
}

onMounted(() => {
  resizeCanvas()

  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
  })

  if (stageRef.value) {
    resizeObserver.observe(stageRef.value)
  }

  animationFrame = window.requestAnimationFrame(drawFrame)
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.board-card {
  padding: 18px;
  border-radius: 28px;
  border: 1px solid rgba(30, 41, 59, 0.28);
  background: rgba(248, 250, 252, 0.6);
  box-shadow: 0 28px 68px rgba(3, 7, 18, 0.08);
}

.board-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.board-kicker {
  margin: 0 0 6px;
  color: #0891b2;
  font-size: 0.76rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.board-head h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.2rem;
}

.region-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(30, 41, 59, 0.14);
  background: rgba(241, 245, 249, 0.4);
  color: #1e293b;
  white-space: nowrap;
}

.region-dot {
  width: 11px;
  height: 11px;
  border-radius: 999px;
  background: #34d399;
  box-shadow: 0 0 0 6px rgba(52, 211, 153, 0.14);
}

.region-pill[data-region='cutoff'] .region-dot {
  background: #94a3b8;
  box-shadow: 0 0 0 6px rgba(148, 163, 184, 0.12);
}

.region-pill[data-region='saturation'] .region-dot {
  background: #f97316;
  box-shadow: 0 0 0 6px rgba(249, 115, 22, 0.14);
}

.board-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: linear-gradient(180deg, #1e293b, #0f172a);
}

.board-svg,
.board-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.board-canvas {
  pointer-events: none;
}

.holes circle {
  fill: #0f172a;
  opacity: 0.72;
  stroke: rgba(226, 232, 240, 0.12);
  stroke-width: 1.5;
}

.wire-labels text,
.rail-labels text,
.component-title,
.component-subtitle,
.res-label,
.res-value,
.terminal-label,
.pin-label,
.node-readout {
  font-family: Inter, 'Segoe UI', 'Noto Sans TC', sans-serif;
}

.rail-labels text {
  fill: #1e293b;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.wire-labels text {
  fill: #1e293b;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.08);
}

.wires path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.component-title {
  fill: #1e293b;
  font-size: 14px;
  font-weight: 700;
}

.component-subtitle {
  fill: #64748b;
  font-size: 11px;
}

.res-label {
  fill: #1e293b;
  font-size: 15px;
  font-weight: 800;
}

.res-value {
  fill: #64748b;
  font-size: 11px;
}

.terminal-label,
.pin-label,
.node-readout {
  fill: #1e293b;
  font-size: 12px;
  font-weight: 700;
}

.battery-plus,
.battery-minus {
  fill: #1e293b;
  font-size: 24px;
  font-weight: 800;
}

.board-foot {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.board-foot article {
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(30, 41, 59, 0.12);
  background: rgba(241, 245, 249, 0.76);
}

.board-foot span {
  display: block;
  color: #0891b2;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.board-foot strong {
  display: block;
  margin-top: 8px;
  color: #1e293b;
  font-size: 1.08rem;
}

.board-foot small {
  display: block;
  margin-top: 6px;
  color: rgba(30, 41, 59, 0.82);
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .board-head,
  .board-foot {
    grid-template-columns: 1fr;
  }

  .board-head {
    display: grid;
  }

  .region-pill {
    width: fit-content;
  }

  .board-foot {
    grid-template-columns: 1fr;
  }
}
</style>