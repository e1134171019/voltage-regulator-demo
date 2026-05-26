<template>
  <section class="scene-grid">
    <div class="theory-card">
      <div class="card-head">
        <p class="scene-step">SCENE 04 · 參考電壓</p>
        <h2>ZD 6.2V：建立參考電壓</h2>
      </div>
      
      <div class="theory-body">
        <p>
          最簡單的實用穩壓電路是利用<strong>齊納二極體 (Zener Diode)</strong> 的反向崩潰特性：
        </p>

        <div class="math-block">Iz = ((Vin - Vz) / Rs) - Iload</div>

        <p>工作原理：</p>
        <ul>
          <li><strong>反向崩潰電壓 Vz：</strong> 當二極體承受反向電壓達到 Vz 時，此處使用 6.2 V 作為參考點，即使電流上升，兩端電壓仍大致固定。</li>
          <li><strong>限流電阻 Rs：</strong> 用來限制總電流，吸收 Vin 與 Vz 之間的壓差。</li>
          <li><strong>分流機制：</strong> 當負載電流 Iload 下降時，多餘電流會分流進入齊納二極體；反之若負載加重，Iz 會下降以維持輸出。</li>
          <li><strong>調節失效：</strong> 當負載重到把所有電流都吸走，使 Iz 降為 0 時，齊納二極體退出崩潰區，輸出電壓開始下跌。</li>
        </ul>
      </div>
    </div>

    <div class="visual-card">
      <div class="visual-header">
        <span class="badge">並聯穩壓電路與 I-V 曲線</span>
        <h3>齊納並聯穩壓器與運作點</h3>
      </div>

      <div class="simulator-view">
        <!-- SVG Circuit Diagram -->
        <div class="circuit-container">
          <svg viewBox="0 0 500 180" class="circuit-svg">
            <defs>
              <pattern id="grid-05" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.05)" stroke-width="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-05)" rx="16" />

            <!-- Wires -->
            <!-- Vin to Rs -->
            <path d="M 40 90 L 110 90" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Rs to split node -->
            <path d="M 170 90 L 260 90" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Node to Zener -->
            <path d="M 260 90 L 260 110" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Zener to GND -->
            <path d="M 260 140 L 260 155" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Node to Rload -->
            <path d="M 260 90 L 370 90 M 370 90 L 370 110" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Rload to GND -->
            <path d="M 370 140 L 370 155" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Ground Line -->
            <path d="M 260 155 L 370 155 M 315 155 L 315 162" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- GND symbol -->
            <path d="M 300 162 L 330 162 M 308 167 L 322 167 M 314 172 L 320 172" stroke="#cbd5e1" stroke-width="2" fill="none" />

            <!-- DC Source Vin Symbol -->
            <circle cx="40" cy="90" r="14" fill="#1e293b" stroke="#f43f5e" stroke-width="2" />
            <text x="40" y="94" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">Vin</text>

            <!-- Rs (Series Resistor) -->
            <g transform="translate(140, 90)">
              <rect x="-30" y="-10" width="60" height="20" fill="#1e293b" stroke="#cbd5e1" stroke-width="2" />
              <text x="0" y="3" fill="#fff" font-size="9" text-anchor="middle">Rs = 100Ω</text>
            </g>

            <!-- Zener Diode Symbol -->
            <g transform="translate(260, 125)">
              <!-- Triangle pointing down (Anode at bottom) -->
              <path d="-8 -8 L 8 -8 L 0 6 Z" fill="#1e293b" :stroke="izmA > 0.5 ? '#22d3ee' : '#64748b'" stroke-width="2" />
              <!-- Cathode bar with Zener bent tips -->
              <path d="M -8 6 L 0 6 L 0 8 M 0 6 L 8 6 L 8 4" :stroke="izmA > 0.5 ? '#22d3ee' : '#64748b'" stroke-width="2" fill="none" />
            </g>
            <text x="215" y="130" fill="#22d3ee" font-size="10" font-weight="700">Iz: {{ izmA.toFixed(1) }}mA</text>

            <!-- Rload Resistor -->
            <g transform="translate(370, 125)">
              <rect x="-24" y="-10" width="48" height="20" fill="#1e293b" stroke="#10b981" stroke-width="2" />
              <text x="0" y="3" fill="#fff" font-size="9" text-anchor="middle">R_load</text>
            </g>
            <text x="400" y="130" fill="#10b981" font-size="10" font-weight="700">Il: {{ iloadmA.toFixed(1) }}mA</text>

            <!-- Node Vout -->
            <circle cx="260" cy="90" r="5" :fill="izmA > 0.5 ? '#10b981' : '#f43f5e'" />
            <text x="315" y="80" :fill="izmA > 0.5 ? '#10b981' : '#f43f5e'" font-size="11" font-weight="800" text-anchor="middle">
              Vout = {{ vOut.toFixed(2) }} V
            </text>

            <!-- Particle flow -->
            <circle v-for="(p, idx) in totalParticles" :key="'t-'+idx" :cx="p[0]" :cy="p[1]" r="3" fill="#f59e0b" />
            <circle v-for="(p, idx) in zenerParticles" :key="'z-'+idx" :cx="p[0]" :cy="p[1]" r="3" fill="#22d3ee" />
            <circle v-for="(p, idx) in loadParticles" :key="'l-'+idx" :cx="p[0]" :cy="p[1]" r="3" fill="#10b981" />
          </svg>
        </div>

        <!-- Layout showing the Zener I-V graph and sliders -->
        <div class="row-layout">
          <!-- Canvas Plotter for I-V Curve -->
          <div class="canvas-wrapper flex-canvas">
            <canvas ref="canvasRef" class="iv-canvas"></canvas>
            <div class="chart-title">齊納二極體 I-V 特性曲線</div>
          </div>

          <!-- Sliders and Data -->
          <div class="controls-panel flex-controls">
            <div class="control-row">
              <div class="control-label">
                <span>輸入電壓 (Vin)</span>
                <strong>{{ vIn.toFixed(1) }} V</strong>
              </div>
              <input type="range" v-model.number="vIn" min="4.0" max="12.0" step="0.1" class="range-cyan" />
            </div>

            <div class="control-row">
              <div class="control-label">
                <span>負載電阻 (Rload)</span>
                <strong>{{ rLoad.toFixed(0) }} Ω</strong>
              </div>
              <input type="range" v-model.number="rLoad" min="30" max="500" step="5" class="range-cyan" />
            </div>
            
            <div class="alert-box" :class="{ show: izmA <= 0.5 }">
              <strong>穩壓失效 (Regulation Lost)</strong>
              <span>負載太重或 Vin 太低，齊納分流降為 0，電壓被拉下至 6.2V 以下。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { WaveformPlotter } from '../utils/WaveformAnimation.js'
import { getParticlesOnPath } from '../utils/CircuitDrawer.js'

const vIn = ref(10.5)
const rLoad = ref(330)

const V_ZENER = 6.2
const RS = 100 // Ohms

// Calculations
// System equations:
// I_total = (Vin - Vout) / Rs
// I_load = Vout / Rload
// If Zener is in breakdown (Vout = V_ZENER):
// I_total = (Vin - V_ZENER) / Rs
// I_load = V_ZENER / Rload
// I_zener = I_total - I_load
// If I_zener < 0, Zener shuts off, and circuit is just a resistor divider:
// Vout = Vin * Rload / (Rs + Rload)
// I_zener = 0

const vOut = computed(() => {
  const vDivider = vIn.value * rLoad.value / (RS + rLoad.value)
  if (vDivider < V_ZENER) {
    return vDivider
  }
  return V_ZENER
})

const itotalmA = computed(() => {
  return ((vIn.value - vOut.value) / RS) * 1000
})

const iloadmA = computed(() => {
  return (vOut.value / rLoad.value) * 1000
})

const izmA = computed(() => {
  return Math.max(0, itotalmA.value - iloadmA.value)
})

const canvasRef = ref(null)
let plotter = null

function drawIvCurve() {
  if (!plotter) return
  plotter.clear()
  
  // Draw grid, focus on reverse breakdown (X: voltage, Y: current)
  // X: -8V to +2V, Y: -50mA to +10mA
  plotter.drawGrid(
    [-8, 2], [-50, 10], 2, 10,
    (x) => `${x}V`, (y) => `${y}mA`
  )
  
  // Plot diode curve
  const points = []
  const steps = 60
  for (let i = 0; i <= steps; i++) {
    // voltage from -8V to +1.5V
    const v = -8 + (i / steps) * 9.5
    let current = 0
    if (v < -V_ZENER) {
      // Breakdown region (steep downward curve)
      current = (v + V_ZENER) * 45 // very steep slope
    } else if (v > 0.7) {
      // Forward conduction
      current = (v - 0.7) * 35
    } else {
      current = 0 // Leakage is negligible here
    }
    
    // Normalize to xPct [-8, 2] and yPct [-50, 10]
    const xPct = (v - (-8)) / 10
    const yPct = (current - (-50)) / 60
    points.push({ xPct, yPct })
  }
  
  plotter.plotLine(points, '#475569', 2)
  
  // Plot current operating point (diode voltage vs. diode current)
  const diodeVoltage = -vOut.value
  const diodeCurrent = -izmA.value
  
  const rect = canvasRef.value.getBoundingClientRect()
  const { padding } = plotter.options
  const plotWidth = rect.width - padding.left - padding.right
  const plotHeight = rect.height - padding.top - padding.bottom
  
  const xPct = (diodeVoltage - (-8)) / 10
  const yPct = (diodeCurrent - (-50)) / 60
  
  const ptX = padding.left + xPct * plotWidth
  const ptY = padding.top + (1 - yPct) * plotHeight
  
  const ctx = plotter.ctx
  
  // Dashed projection lines
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)'
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(ptX, ptY)
  ctx.lineTo(ptX, rect.height - padding.bottom)
  ctx.moveTo(ptX, ptY)
  ctx.lineTo(padding.left, ptY)
  ctx.stroke()
  ctx.setLineDash([])
  
  // Glowing operating point
  ctx.fillStyle = '#22d3ee'
  ctx.shadowBlur = 8
  ctx.shadowColor = '#22d3ee'
  ctx.beginPath()
  ctx.arc(ptX, ptY, 6, 0, 2 * Math.PI)
  ctx.fill()
  ctx.shadowBlur = 0
}

watch([vIn, rLoad], () => {
  drawIvCurve()
})

// Wire particle loops
const totalParticles = ref([])
const zenerParticles = ref([])
const loadParticles = ref([])
let animationFrameId = null
let t = 0

// Paths in SVG coordinates
const pathTotal = [
  [40, 90],   // Vin source
  [110, 90],  // to Rs start
  [170, 90],  // to Rs end
  [260, 90],  // split node
]

const pathZener = [
  [260, 90],  // split node
  [260, 110], // Zener start
  [260, 140], // Zener end
  [260, 155], // Ground line
]

const pathLoad = [
  [260, 90],  // split node
  [370, 90],  // load corner
  [370, 110], // load resistor top
  [370, 140], // load resistor bottom
  [370, 155], // ground connection
]

function animateCircuit() {
  t += 0.016
  const scale = 0.5 // animation speed multiplier
  totalParticles.value = getParticlesOnPath(pathTotal, t, itotalmA.value * scale, 30)
  zenerParticles.value = getParticlesOnPath(pathZener, t, izmA.value * scale, 30)
  loadParticles.value = getParticlesOnPath(pathLoad, t, iloadmA.value * scale, 30)
  
  animationFrameId = requestAnimationFrame(animateCircuit)
}

onMounted(() => {
  if (canvasRef.value) {
    plotter = new WaveformPlotter(canvasRef.value)
    plotter.resize()
    drawIvCurve()
  }
  animateCircuit()
  window.addEventListener('resize', handleResize)
})

function handleResize() {
  if (plotter) {
    plotter.resize()
    drawIvCurve()
  }
}

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.scene-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 24px;
  align-items: start;
}

.theory-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 28px;
  box-shadow: 0 20px 50px rgba(30, 41, 59, 0.05);
}

.scene-step {
  margin: 0 0 8px;
  color: #0891b2;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
}

h2 {
  margin: 0 0 16px;
  font-size: 1.6rem;
  color: #0f172a;
}

.theory-body {
  color: #334155;
  font-size: 0.98rem;
  line-height: 1.7;
}

.theory-body ul {
  padding-left: 20px;
  margin: 12px 0;
}

.theory-body li {
  margin-bottom: 8px;
}

.math-block {
  background: #0f172a;
  color: #38bdf8;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 1.15rem;
  text-align: center;
  padding: 14px;
  border-radius: 14px;
  margin: 16px 0;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
}

.visual-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 28px;
  box-shadow: 0 30px 70px rgba(3, 7, 18, 0.08);
}

.visual-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.badge {
  background: #06b6d4;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.visual-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.circuit-container {
  margin-bottom: 20px;
}

.circuit-svg {
  width: 100%;
  height: 180px;
  background: #0f172a;
  border-radius: 18px;
  box-shadow: inset 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Row layout for split curve and controls */
.row-layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 16px;
}

.canvas-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

.iv-canvas {
  width: 100%;
  height: 200px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 18px;
  display: block;
}

.chart-title {
  text-align: center;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 6px;
  font-weight: 600;
}

.controls-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.control-row {
  display: grid;
  gap: 6px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.control-label span {
  color: #475569;
}

.control-label strong {
  color: #0f172a;
  font-size: 0.9rem;
}

.range-cyan {
  width: 100%;
  accent-color: #06b6d4;
}

.alert-box {
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.3);
  padding: 10px 12px;
  border-radius: 10px;
  color: #e11d48;
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transform: translateY(6px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.alert-box.show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

@media (max-width: 960px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .row-layout {
    grid-template-columns: 1fr;
  }
}
</style>
