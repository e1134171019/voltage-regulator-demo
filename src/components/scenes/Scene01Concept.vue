<template>
  <section class="scene-grid">
    <div class="theory-card">
      <div class="card-head">
        <p class="scene-step">SCENE 01 · 核心概念</p>
        <h2>為什麼我們需要穩壓器？</h2>
      </div>
      
      <div class="theory-body">
        <p>
          在現實世界中，電源從來都不是理想的。不論是電池還是市電整流器，輸出都會受到各種外部干擾的影響：
        </p>
        <ul>
          <li><strong>電池衰減：</strong> 電池隨著電量消耗，電壓會逐漸下滑（例如 9V 衰退至 6V）。</li>
          <li><strong>電網雜訊：</strong> 市電的交流漣波（50/60 Hz Ripple）與突波（Surges）會滲透進系統。</li>
          <li><strong>負載干擾：</strong> 當下游晶片開始全速運算或馬達啟動時，瞬間抽取的大電流會導致電壓下陷。</li>
        </ul>
        <p class="highlight-box">
          <strong>穩壓器的任務：</strong> 無論輸入電壓如何劇烈波動、或負載電流如何忽大忽小，穩壓器都能將電壓維持在一個<strong>恆定且乾淨的值</strong>（例如穩定的 5.0 V）。
        </p>
      </div>
    </div>

    <div class="visual-card">
      <div class="visual-header">
        <span class="badge">即時模擬</span>
        <h3>雜訊抑制與漣波濾除</h3>
      </div>

      <div class="simulator-view">
        <!-- SVG schematic concept -->
        <div class="schematic-container">
          <svg viewBox="0 0 500 120" class="concept-svg">
            <!-- Grid pattern background -->
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.05)" stroke-width="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" rx="16" />

            <!-- Input Wire -->
            <path d="M 20 60 L 170 60" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Output Wire -->
            <path d="M 330 60 L 480 60" stroke="#cbd5e1" stroke-width="3" fill="none" />

            <!-- Regulator Block -->
            <rect x="170" y="30" width="160" height="60" rx="12" fill="url(#regulator-grad)" stroke="#22d3ee" stroke-width="2" class="pulse-border" />
            <text x="250" y="66" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle" letter-spacing="1">REGULATOR</text>

            <!-- Node Indicators -->
            <circle cx="95" cy="60" r="5" fill="#f43f5e" class="glow-node" />
            <text x="95" y="45" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">Unregulated Vin</text>

            <circle cx="405" cy="60" r="5" fill="#10b981" class="glow-node-green" />
            <text x="405" y="45" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">Regulated Vout</text>

            <!-- Animated flowing particles -->
            <!-- Fluctuating particles (Vin) -->
            <circle v-for="(pt, idx) in inParticles" :key="'in-'+idx" :cx="pt.x" :cy="pt.y" r="4" fill="#f43f5e" />
            <!-- Steady particles (Vout) -->
            <circle v-for="(pt, idx) in outParticles" :key="'out-'+idx" :cx="pt.x" :cy="pt.y" r="4" fill="#10b981" />
          </svg>
          
          <linearGradient id="regulator-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#0891b2" />
          </linearGradient>
        </div>

        <!-- Waveform canvas -->
        <div class="canvas-wrapper">
          <canvas ref="canvasRef" class="waveform-canvas"></canvas>
          <div class="canvas-legend">
            <span class="legend-in">輸入電壓 Vin (波動)</span>
            <span class="legend-out">輸出電壓 Vout (穩定)</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="controls-panel">
          <div class="control-row">
            <div class="control-label">
              <span>輸入雜訊幅度 (Noise)</span>
              <strong>{{ noiseAmp.toFixed(1) }} V</strong>
            </div>
            <input type="range" v-model.number="noiseAmp" min="0" max="3" step="0.1" class="range-cyan" />
          </div>

          <div class="control-row">
            <div class="control-label">
              <span>市電漣波幅度 (Ripple)</span>
              <strong>{{ rippleAmp.toFixed(1) }} V</strong>
            </div>
            <input type="range" v-model.number="rippleAmp" min="0" max="2" step="0.1" class="range-cyan" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { WaveformPlotter } from '../utils/WaveformAnimation.js'

const noiseAmp = ref(1.2)
const rippleAmp = ref(0.6)

const canvasRef = ref(null)
let plotter = null
let animationFrameId = null
let t = 0

// Particles animation state
const inParticles = ref([])
const outParticles = ref([])

// Helper to compute particle positions with noise for Vin side
function updateParticles() {
  const now = performance.now() / 1000;
  
  // Update incoming particles (Vin) - noise adds spatial jitter
  const inPts = []
  const spacing = 24
  const speed = 80 // pixels per second
  const startX = 20
  const endX = 170
  const baseOffset = (now * speed) % spacing
  
  let currX = startX + baseOffset
  while (currX < endX) {
    // Generate jitter based on noise and ripple parameters
    const phase = currX * 0.05 - now * 8
    const ripple = Math.sin(phase) * rippleAmp.value * 3
    const noise = (Math.sin(currX * 0.2 + now * 15) + Math.cos(currX * 0.5 + now * 31)) * noiseAmp.value * 2
    inPts.push({
      x: currX,
      y: 60 + ripple + noise
    })
    currX += spacing
  }
  inParticles.value = inPts

  // Update outgoing particles (Vout) - clean flow
  const outPts = []
  const outStartX = 330
  const outEndX = 480
  const outBaseOffset = (now * speed) % spacing
  let currOutX = outStartX + outBaseOffset
  while (currOutX < outEndX) {
    outPts.push({
      x: currOutX,
      y: 60
    })
    currOutX += spacing
  }
  outParticles.value = outPts
}

function drawLoop() {
  if (!plotter) return
  t += 0.05
  
  // Calculate simulated voltages
  // Vin = base 8V + ripple + random noise
  const baseVin = 8.0
  const ripple = Math.sin(t * 1.5) * rippleAmp.value
  const noise = (Math.sin(t * 10) * 0.6 + Math.sin(t * 22) * 0.4) * noiseAmp.value
  const vin = Math.max(0, baseVin + ripple + noise)
  const vout = 5.0 // perfectly regulated output
  
  // Store values for scrolling plot
  if (!plotter.historyVin) plotter.historyVin = []
  if (!plotter.historyVout) plotter.historyVout = []
  
  plotter.historyVin.push(vin)
  plotter.historyVout.push(vout)
  
  if (plotter.historyVin.length > 150) {
    plotter.historyVin.shift()
    plotter.historyVout.shift()
  }
  
  plotter.clear()
  plotter.drawGrid(
    [0, 150], [0, 12], 25, 2,
    () => '', (v) => `${v}V`
  )
  
  plotter.plotScrollingSignal(plotter.historyVin, [0, 12], '#ef4444', 2.5, 'rgba(239, 68, 68, 0.3)')
  plotter.plotScrollingSignal(plotter.historyVout, [0, 12], '#10b981', 3, 'rgba(16, 185, 129, 0.4)')
  
  updateParticles()
  
  animationFrameId = requestAnimationFrame(drawLoop)
}

onMounted(() => {
  if (canvasRef.value) {
    plotter = new WaveformPlotter(canvasRef.value)
    plotter.resize()
    drawLoop()
  }
  
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

.theory-body ul {
  padding-left: 20px;
  margin: 12px 0;
}

.theory-body li {
  margin-bottom: 8px;
}

.highlight-box {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(16, 185, 129, 0.05));
  border-left: 4px solid #0891b2;
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
  background: #22d3ee;
  color: #0f172a;
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

.schematic-container {
  margin-bottom: 20px;
}

.concept-svg {
  width: 100%;
  height: 120px;
  border-radius: 16px;
  background: #0f172a;
  box-shadow: inset 0 4px 20px rgba(0, 0, 0, 0.3);
}

.pulse-border {
  animation: pulseStroke 2s infinite ease-in-out;
}

@keyframes pulseStroke {
  0%, 100% { stroke-opacity: 0.6; }
  50% { stroke-opacity: 1; filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.6)); }
}

.glow-node {
  filter: drop-shadow(0 0 6px #f43f5e);
}

.glow-node-green {
  filter: drop-shadow(0 0 6px #10b981);
}

.canvas-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.waveform-canvas {
  width: 100%;
  height: 160px;
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

.legend-in {
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.legend-in::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #ef4444;
  border-radius: 99px;
}

.legend-out {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.legend-out::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 99px;
}

.controls-panel {
  display: grid;
  gap: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  padding-top: 18px;
}

.control-row {
  display: grid;
  gap: 8px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.control-label span {
  color: #475569;
}

.control-label strong {
  color: #0f172a;
  font-size: 0.95rem;
}

.range-cyan {
  width: 100%;
  accent-color: #0891b2;
}

@media (max-width: 960px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
}
</style>
