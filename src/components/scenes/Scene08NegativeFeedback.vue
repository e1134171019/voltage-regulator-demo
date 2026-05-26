<template>
  <section class="scene-grid">
    <div class="theory-card">
      <div class="card-head">
        <p class="scene-step">SCENE 08 · 閉迴路</p>
        <h2>閉迴路動作流程 (Negative Feedback)</h2>
      </div>
      
      <div class="theory-body">
        <p>
          現在，我們將所有積木組合在一起，完成一個經典的<strong>線性穩壓器 (BJT Linear Regulator)</strong>。這是一個基於負回授的動態平衡系統：
        </p>
        
        <div class="feedback-loop">
          <div class="loop-node">Vout 稍微下滑</div>
          <div class="loop-arrow">→</div>
          <div class="loop-node">Vfb 同步下降</div>
          <div class="loop-arrow">→</div>
          <div class="loop-node">Op-Amp 輸出 Ib 增加</div>
          <div class="loop-arrow">→</div>
          <div class="loop-node">BJT 導通度上升</div>
          <div class="loop-arrow">→</div>
          <div class="loop-node">Vout 被拉回基準</div>
        </div>

        <p>系統各部件職責：</p>
        <ul>
          <li><strong>回授分壓 (R1, R2)：</strong> 對 Vout 進行採樣，比例可寫成 <code>beta_fb = R2 / (R1 + R2)</code>，輸出為 Vfb。</li>
          <li><strong>誤差比較 (Op-Amp)：</strong> 只要 Vfb 低於基準，便立即輸出更多電流給電晶體。</li>
          <li><strong>射極隨耦管 (BJT)：</strong> 接收控制，將輸出電壓推回原位。</li>
        </ul>
        <p class="highlight-box">
          試著切換「暫態擾動測試」，這會瞬間抽載，您將在下方波形圖看見穩壓電路如何在幾微秒內完成<strong>「下陷 → 偵測 → 修正 → 平衡」</strong>的超快速自適應過程！
        </p>
      </div>
    </div>

    <div class="visual-card">
      <div class="visual-header">
        <span class="badge font-bold">全系統閉迴路模擬</span>
        <h3>經典線性回授穩壓器 schematic</h3>
      </div>

      <div class="simulator-view">
        <!-- SVG Full Integrated Circuit -->
        <div class="circuit-container">
          <svg viewBox="0 0 500 240" class="circuit-svg">
            <defs>
              <pattern id="grid-08" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.05)" stroke-width="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-08)" rx="16" />

            <!-- Wires -->
            <!-- Vin to BJT Collector -->
            <path d="M 30 70 L 220 70 M 220 70 L 220 95" stroke="#f43f5e" stroke-width="3" fill="none" />
            <!-- BJT Emitter to Vout Node -->
            <path d="M 220 145 L 220 190 M 220 190 L 420 190" stroke="#10b981" stroke-width="4.5" fill="none" />
            
            <!-- Vout node splitting to feedback divider -->
            <path d="M 350 190 L 350 110" stroke="#cbd5e1" stroke-width="2.5" fill="none" />
            <!-- Feedback resistors (R1, R2) -->
            <!-- R1 to feedback node -->
            <path d="M 350 110 L 350 120" stroke="#cbd5e1" stroke-width="2.5" fill="none" />
            <!-- Feedback Node back to OpAmp (-) pin -->
            <path d="M 350 140 L 350 150 M 350 140 L 140 140 M 140 140 L 140 110 L 170 110" stroke="#38bdf8" stroke-width="2" fill="none" />
            <!-- R2 to GND -->
            <path d="M 350 150 L 350 160 M 350 180 L 350 190" stroke="#cbd5e1" stroke-width="2.5" fill="none" />
            <!-- Ground node for divider -->
            <path d="M 350 190 L 350 210" stroke="#cbd5e1" stroke-width="2.5" fill="none" />
            <path d="M 335 210 L 365 210 M 342 214 L 358 214 M 347 218 L 353 218" stroke="#cbd5e1" stroke-width="2" fill="none" />

            <!-- Load resistor branch -->
            <path d="M 420 190 L 420 200 M 420 220 L 420 225" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <path d="M 405 225 L 435 225 M 412 229 L 428 229 M 417 233 L 423 233" stroke="#cbd5e1" stroke-width="2" fill="none" />

            <!-- Op-Amp Symbol (Centered around 190, 120) -->
            <g transform="translate(190, 120)">
              <path d="M -20 -20 L 20 0 L -20 20 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
              <text x="-14" y="-8" fill="#e11d48" font-size="11" font-weight="700">-</text>
              <text x="-14" y="12" fill="#10b981" font-size="9" font-weight="700">+</text>
            </g>
            <!-- Op-Amp output to BJT Base -->
            <path d="M 210 120 L 220 120" stroke="#cbd5e1" stroke-width="2.5" fill="none" />

            <!-- Vref to + pin -->
            <path d="M 120 130 L 170 130" stroke="#cbd5e1" stroke-width="2" fill="none" />
            <!-- Vref box symbol -->
            <circle cx="120" cy="130" r="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
            <text x="120" y="133" fill="#10b981" font-size="8" font-weight="700" text-anchor="middle">Vref</text>

            <!-- BJT NPN (Centered at 220, 120) -->
            <g transform="translate(220, 120)">
              <circle cx="0" cy="0" r="18" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
              <path d="M -9 -9 L -9 9" stroke="#fff" stroke-width="2" />
              <path d="M -9 -4 L 8 -15 L 8 -20" stroke="#fff" stroke-width="1.5" fill="none" />
              <path d="M -9 4 L 8 15 L 8 20" stroke="#fff" stroke-width="1.5" fill="none" />
            </g>

            <!-- Divider Resistors boxes -->
            <g transform="translate(350, 130)">
              <rect x="-10" y="-8" width="20" height="16" fill="#1e293b" stroke="#cbd5e1" stroke-width="1.5" />
              <text x="0" y="3" fill="#fff" font-size="8" text-anchor="middle">R1</text>
            </g>
            <g transform="translate(350, 170)">
              <rect x="-10" y="-8" width="20" height="16" fill="#1e293b" stroke="#cbd5e1" stroke-width="1.5" />
              <text x="0" y="3" fill="#fff" font-size="8" text-anchor="middle">R2</text>
            </g>

            <!-- Load Resistor box -->
            <g transform="translate(420, 210)">
              <rect x="-14" y="-8" width="28" height="16" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
              <text x="0" y="3" fill="#fff" font-size="8" text-anchor="middle">R_L</text>
            </g>

            <!-- Node markers -->
            <circle cx="220" cy="190" r="4.5" fill="#10b981" />
            <text x="220" y="208" fill="#10b981" font-size="9" font-weight="700" text-anchor="middle">Vout: {{ vOutReal.toFixed(2) }}V</text>
            <circle cx="350" cy="140" r="3.5" fill="#38bdf8" />
            <text x="360" y="143" fill="#38bdf8" font-size="8" font-weight="700" text-anchor="start">Vfb: {{ vFb.toFixed(2) }}V</text>

            <!-- Electron flow particles -->
            <circle v-for="(p, idx) in inFlow" :key="'in-'+idx" :cx="p[0]" :cy="p[1]" r="2.5" fill="#f43f5e" />
            <circle v-for="(p, idx) in outFlow" :key="'out-'+idx" :cx="p[0]" :cy="p[1]" r="3" fill="#10b981" />
          </svg>
        </div>

        <!-- transient trigger button and sliders -->
        <div class="interactive-controls">
          <button class="transient-btn" @click="triggerTransient">
            ⚡ 觸發暫態擾動 (加載瞬間)
          </button>
          
          <div class="sliders-sub">
            <div class="control-row">
              <div class="control-label">
                <span>輸入電壓 (Vin)</span>
                <strong>{{ vIn.toFixed(1) }} V</strong>
              </div>
              <input type="range" v-model.number="vIn" min="6.0" max="10.0" step="0.1" class="range-cyan" />
            </div>
          </div>
        </div>

        <!-- Oscilloscope Waveform Plot -->
        <div class="canvas-wrapper">
          <canvas ref="canvasRef" class="waveform-canvas"></canvas>
          <div class="canvas-legend">
            <span class="legend-vout">輸出電壓 Vout (反應速度)</span>
            <span class="legend-vfb">回授採樣 Vfb</span>
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

const vIn = ref(8.0)
const loadStep = ref(0) // dynamic current load multiplier
const targetVout = 5.0
const V_REF = 2.5 // Vfb divider maps 5.0V out to 2.5V feedback (R1=R2)

const canvasRef = ref(null)
let plotter = null
let animationFrameId = null
let t = 0

// Simulated transient state variables
let currentVout = 5.0
let voutTargetWithTransient = 5.0

const vOutReal = computed(() => {
  // If Vin is below Dropout margin (approx Vout + 1.2V due to BJT Vbe and Opamp output limits)
  const dropoutVoltage = targetVout + 1.2
  if (vIn.value < dropoutVoltage) {
    return Math.max(0, vIn.value - 1.2) - loadStep.value * 0.1
  }
  return currentVout
})

const vFb = computed(() => {
  return vOutReal.value * 0.5 // R1=R2, so 50%
})

function triggerTransient() {
  // Simulate sudden heavy load current spike
  loadStep.value = 2.5
  
  // Vout drops instantly, then the feedback loop pulls it back in ~15-20 frames
  currentVout = 4.2
  setTimeout(() => {
    loadStep.value = 0
  }, 1000)
}

function updateSimulation() {
  t += 0.05
  
  // Feedback loop correction simulator:
  // Vout slowly moves back to 5.0V (target)
  const correctionSpeed = 0.16
  const noise = (Math.sin(t * 15) + Math.cos(t * 33)) * 0.005
  
  currentVout += (targetVout - currentVout) * correctionSpeed
  currentVout += noise

  // Save history
  if (!plotter.historyVout) plotter.historyVout = []
  if (!plotter.historyVfb) plotter.historyVfb = []
  
  plotter.historyVout.push(vOutReal.value)
  plotter.historyVfb.push(vFb.value)
  
  if (plotter.historyVout.length > 150) {
    plotter.historyVout.shift()
    plotter.historyVfb.shift()
  }

  // Draw plot
  plotter.clear()
  plotter.drawGrid(
    [0, 150], [0, 6], 25, 1,
    () => '', (v) => `${v.toFixed(0)}V`
  )
  
  // Plot curves
  plotter.plotScrollingSignal(plotter.historyVout, [0, 6], '#10b981', 3, 'rgba(16, 185, 129, 0.3)')
  plotter.plotScrollingSignal(plotter.historyVfb, [0, 6], '#38bdf8', 1.5)
}

// SVG Particles
const inFlow = ref([])
const outFlow = ref([])

const pathIn = [
  [30, 70],
  [220, 70],
  [220, 95]
]

const pathOut = [
  [220, 145],
  [220, 190],
  [420, 190],
  [420, 225]
]

function drawLoop() {
  updateSimulation()
  
  // particle animation
  const speed = 70 + loadStep.value * 30
  inFlow.value = getParticlesOnPath(pathIn, t * 0.5, speed, 25)
  outFlow.value = getParticlesOnPath(pathOut, t * 0.5, speed, 25)

  animationFrameId = requestAnimationFrame(drawLoop)
}

onMounted(() => {
  if (canvasRef.value) {
    plotter = new WaveformPlotter(canvasRef.value)
    plotter.resize()
  }
  drawLoop()
  window.addEventListener('resize', handleResize)
})

function handleResize() {
  if (plotter) plotter.resize()
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

/* Feedback loop diagram style */
.feedback-loop {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.15);
  padding: 12px;
  border-radius: 16px;
  margin: 16px 0;
}

.loop-node {
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.loop-arrow {
  color: #0891b2;
  font-weight: 900;
  font-size: 0.85rem;
}

.theory-body ul {
  padding-left: 20px;
  margin: 12px 0;
}

.theory-body li {
  margin-bottom: 8px;
}

.highlight-box {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(56, 189, 248, 0.05));
  border-left: 4px solid #10b981;
  padding: 14px 18px;
  border-radius: 0 16px 16px 0;
  margin-top: 20px;
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
  background: #10b981;
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
  height: 240px;
  background: #0f172a;
  border-radius: 18px;
  box-shadow: inset 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Controls style */
.interactive-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  padding-top: 16px;
  margin-bottom: 20px;
}

.transient-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  border: none;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.25);
  font-size: 0.85rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.transient-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(16, 185, 129, 0.35);
}

.transient-btn:active {
  transform: translateY(0);
}

.sliders-sub {
  flex-grow: 1;
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
  accent-color: #10b981;
}

/* Oscilloscope plot */
.canvas-wrapper {
  position: relative;
}

.waveform-canvas {
  width: 100%;
  height: 140px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 18px;
  display: block;
}

.canvas-legend {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  justify-content: center;
  font-size: 0.8rem;
}

.legend-vout {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.legend-vout::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 99px;
}

.legend-vfb {
  color: #38bdf8;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.legend-vfb::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #38bdf8;
  border-radius: 99px;
}

@media (max-width: 960px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
  
  .interactive-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
