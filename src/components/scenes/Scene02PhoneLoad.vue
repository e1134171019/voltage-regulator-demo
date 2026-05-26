<template>
  <section class="scene-grid">
    <div class="theory-card">
      <div class="card-head">
        <p class="scene-step">SCENE 02 · 實際案例</p>
        <h2>智慧型手機的動態負載</h2>
      </div>
      
      <div class="theory-body">
        <p>
          在實際應用中，用電元件（我們稱為「負載」）的電流需求是隨時在改變的。以手機充電為例：
        </p>
        <ul>
          <li><strong>待機狀態 (Idle)：</strong> 螢幕熄滅、處理器低頻運作，此時電流需求極低（約 10~50 mA）。</li>
          <li><strong>標準充電 (Normal)：</strong> 螢幕開啟、背景程式運行，電流升至中等水準（約 500~800 mA）。</li>
          <li><strong>快速充電 (Fast)：</strong> 當啟動高功率快充協定時，電流會大幅飆升（可達 2000 mA 以上）。</li>
        </ul>
        <p>
          若是使用<strong>未穩壓</strong>的廉價適配器，當電流急劇增加時，適配器內部的損耗與導線阻抗會導致輸出電壓大幅<strong>下滑（Sag）</strong>，可能導致手機重啟或充電晶片損壞。
        </p>
        <p class="highlight-box">
          試著切換下方的穩壓器狀態，觀察在高負載（快充）時，輸出電壓的差異！
        </p>
      </div>
    </div>

    <div class="visual-card">
      <div class="visual-header">
        <span class="badge">負載場景模擬</span>
        <h3>手機充電狀態監測</h3>
      </div>

      <div class="simulator-view">
        <!-- Phone Status Display -->
        <div class="phone-display-card">
          <div class="phone-device" :class="phoneState">
            <div class="phone-screen">
              <div class="battery-icon">
                <div class="battery-level" :style="{ width: batteryWidth + '%' }" :class="phoneState"></div>
                <span class="battery-text">{{ batteryWidth }}%</span>
              </div>
              <div class="status-indicator">
                <strong>{{ stateLabel }}</strong>
                <span>電流: {{ currentmA }} mA</span>
              </div>
            </div>
          </div>

          <div class="cable-connector">
            <svg class="cable-svg" viewBox="0 0 200 40">
              <path d="M 0 20 L 200 20" stroke="#64748b" stroke-width="6" fill="none" />
              <!-- Particle flow inside cable -->
              <circle v-for="(p, idx) in cableParticles" :key="idx" :cx="p" cy="20" r="3" fill="#38bdf8" class="pulse-particle" />
            </svg>
          </div>

          <div class="adapter-block">
            <strong>充電適配器</strong>
            <span>{{ isRegulated ? '主動穩壓型' : '未穩壓廉價型' }}</span>
          </div>
        </div>

        <!-- Mode Toggle & State Selector -->
        <div class="interactive-controls">
          <div class="control-group">
            <label>穩壓模式：</label>
            <div class="segmented-control">
              <button :class="{ active: isRegulated }" @click="isRegulated = true">開啟穩壓</button>
              <button :class="{ active: !isRegulated }" @click="isRegulated = false">未穩壓 (僅電容)</button>
            </div>
          </div>

          <div class="control-group">
            <label>手機充電狀態：</label>
            <div class="segmented-control">
              <button :class="{ active: phoneState === 'idle' }" @click="setPhoneState('idle', 10)">待機 (10mA)</button>
              <button :class="{ active: phoneState === 'normal' }" @click="setPhoneState('normal', 500)">標準 (500mA)</button>
              <button :class="{ active: phoneState === 'fast' }" @click="setPhoneState('fast', 2000)">快充 (2000mA)</button>
            </div>
          </div>
        </div>

        <!-- Chart -->
        <div class="canvas-wrapper">
          <canvas ref="canvasRef" class="waveform-canvas"></canvas>
          <div class="canvas-legend">
            <span class="legend-out">輸出電壓 Vout</span>
            <span class="legend-target">理想標準電壓 (5.0V)</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { WaveformPlotter } from '../utils/WaveformAnimation.js'

const phoneState = ref('normal')
const currentmA = ref(500)
const isRegulated = ref(true)
const batteryWidth = ref(42)

const canvasRef = ref(null)
let plotter = null
let animationFrameId = null
let t = 0

// Particles in the charging cable
const cableParticles = ref([])

const stateLabel = computed(() => {
  if (phoneState.value === 'idle') return '待機中 (低耗能)'
  if (phoneState.value === 'normal') return '一般充電中'
  return '極速閃充中 (高熱能)'
})

function setPhoneState(state, val) {
  phoneState.value = state
  currentmA.value = val
}

// Battery percentage ticking
let batteryInterval = null
onMounted(() => {
  batteryInterval = setInterval(() => {
    if (batteryWidth.value < 100) {
      batteryWidth.value += 1
    } else {
      batteryWidth.value = 10
    }
  }, 8000)
})

onUnmounted(() => {
  clearInterval(batteryInterval)
})

function updateCableParticles() {
  const now = performance.now() / 1000
  // Flow speed proportional to current
  const baseSpeed = currentmA.value * 0.15 + 20
  const spacing = 20
  const pts = []
  
  const offset = (now * baseSpeed) % spacing
  let currX = offset
  while (currX < 200) {
    pts.push(currX)
    currX += spacing
  }
  cableParticles.value = pts
}

function drawLoop() {
  if (!plotter) return
  t += 0.05
  
  // Calculate simulated output voltage
  // If regulated: Vout sits at 5.0V with very minor transients on change
  // If unregulated: Vout starts at 5.4V at idle (light load) and drops to 4.8V (normal) and 4.0V (fast load)
  let targetV = 5.0
  if (!isRegulated.value) {
    // Voltage drop = I * R_int, let's say R_int is 0.7 Ohms
    // V_no_load = 5.4V
    targetV = 5.4 - (currentmA.value / 1000) * 0.7
  }
  
  // Smooth transition / low pass filter on voltage sag
  if (!plotter.currentV) plotter.currentV = targetV
  plotter.currentV += (targetV - plotter.currentV) * 0.15
  
  // Add minor noise
  const noise = (Math.sin(t * 12) + Math.cos(t * 29)) * 0.01
  const finalV = plotter.currentV + noise
  
  if (!plotter.historyV) plotter.historyV = []
  plotter.historyV.push(finalV)
  if (plotter.historyV.length > 150) {
    plotter.historyV.shift()
  }
  
  plotter.clear()
  plotter.drawGrid(
    [0, 150], [3, 6], 25, 0.5,
    () => '', (v) => `${v.toFixed(1)}V`
  )
  
  // Draw ideal line (5V)
  const rect = canvasRef.value.getBoundingClientRect()
  const { padding } = plotter.options
  const plotWidth = rect.width - padding.left - padding.right
  const plotHeight = rect.height - padding.top - padding.bottom
  
  // Draw 5V target line
  const yPctTarget = (5.0 - 3.0) / 3.0 // scale [3, 6]
  const yPosTarget = padding.top + (1 - yPctTarget) * plotHeight
  plotter.ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)'
  plotter.ctx.setLineDash([5, 5])
  plotter.ctx.beginPath()
  plotter.ctx.moveTo(padding.left, yPosTarget)
  plotter.ctx.lineTo(rect.width - padding.right, yPosTarget)
  plotter.ctx.stroke()
  plotter.ctx.setLineDash([])
  
  // Plot Vout
  plotter.plotScrollingSignal(plotter.historyV, [3, 6], '#0284c7', 3, 'rgba(2, 132, 199, 0.3)')
  
  updateCableParticles()
  
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
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.1), rgba(56, 189, 248, 0.05));
  border-left: 4px solid #0284c7;
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
  background: #38bdf8;
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

/* Phone Display styles */
.phone-display-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.phone-device {
  width: 140px;
  height: 80px;
  border-radius: 12px;
  background: #334155;
  border: 3px solid #64748b;
  padding: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
}

.phone-device.fast {
  border-color: #f59e0b;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
}

.phone-screen {
  background: #0f172a;
  height: 100%;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px;
}

.battery-icon {
  border: 1.5px solid #94a3b8;
  height: 18px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.battery-level {
  height: 100%;
  background: #10b981;
  transition: width 0.5s ease;
}

.battery-level.idle {
  background: #38bdf8;
}

.battery-level.fast {
  background: #f59e0b;
}

.battery-text {
  position: absolute;
  font-size: 0.65rem;
  color: #fff;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-weight: 700;
}

.status-indicator {
  display: flex;
  justify-content: space-between;
  font-size: 0.62rem;
  color: #94a3b8;
}

.status-indicator strong {
  color: #fff;
}

.cable-connector {
  flex-grow: 1;
  padding: 0 10px;
}

.cable-svg {
  width: 100%;
  height: 25px;
}

.adapter-block {
  width: 100px;
  text-align: center;
  color: #fff;
}

.adapter-block strong {
  display: block;
  font-size: 0.8rem;
}

.adapter-block span {
  font-size: 0.65rem;
  color: #64748b;
}

/* Controls */
.interactive-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-size: 0.8rem;
  color: #475569;
  font-weight: 600;
}

.segmented-control {
  display: flex;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.segmented-control button {
  flex: 1;
  border: none;
  background: transparent;
  padding: 6px 4px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segmented-control button.active {
  background: #fff;
  color: #0f172a;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

/* Canvas plot */
.canvas-wrapper {
  position: relative;
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

.legend-out {
  color: #0284c7;
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
  background: #0284c7;
  border-radius: 99px;
}

.legend-target {
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.legend-target::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 4px;
  background: #64748b;
}

@media (max-width: 960px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
  
  .interactive-controls {
    grid-template-columns: 1fr;
  }
}
</style>
