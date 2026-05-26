<template>
  <section class="scene-grid">
    <div class="theory-card">
      <div class="card-head">
        <p class="scene-step">SCENE 03 · 數學分析</p>
        <h2>電壓下陷與內阻效應</h2>
      </div>
      
      <div class="theory-body">
        <p>
          為什麼電源輸出在重載時會掉電壓？這可以用戴維寧等效電路的<strong>電源內阻 (Internal Resistance, $R_{\text{int}}$)</strong> 來解釋：
        </p>
        
        <div class="math-block">
          $$V_{\text{out}} = V_{\text{in}} - I_{\text{load}} \times R_{\text{int}}$$
        </div>

        <p>當我們從電源中抽取越多電流時：</p>
        <ul>
          <li>電流 $I_{\text{load}}$ 在內阻 $R_{\text{int}}$ 上產生壓降。</li>
          <li>內阻消耗的電壓差 $V_{\text{drop}} = I_{\text{load}} \times R_{\text{int}}$ 越大，外部實際得到的 $V_{\text{out}}$ 就越少。</li>
          <li>內阻越大（例如劣化電池、細長線材），電壓下陷（Sag）效應越嚴重。</li>
        </ul>

        <div class="readout-metrics">
          <div class="metric">
            <span>內阻壓降 (Vdrop)</span>
            <strong class="text-orange">{{ vDrop.toFixed(2) }} V</strong>
          </div>
          <div class="metric">
            <span>終端電壓 (Vout)</span>
            <strong class="text-green">{{ vOut.toFixed(2) }} V</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="visual-card">
      <div class="visual-header">
        <span class="badge">內阻效應曲線</span>
        <h3>負載調節特性曲線 (V-I Curve)</h3>
      </div>

      <div class="simulator-view">
        <!-- Interactive Canvas for V-I Curve -->
        <div class="canvas-wrapper">
          <canvas ref="canvasRef" class="curve-canvas"></canvas>
          <div class="indicator-tip">
            當前點: {{ currentmA }}mA, {{ vOut.toFixed(2) }}V
          </div>
        </div>

        <!-- Sliders -->
        <div class="controls-panel">
          <div class="control-row">
            <div class="control-label">
              <span>電源等效內阻 (Rint)</span>
              <strong>{{ rInt.toFixed(2) }} Ω</strong>
            </div>
            <input type="range" v-model.number="rInt" min="0.05" max="2.0" step="0.05" class="range-orange" />
          </div>

          <div class="control-row">
            <div class="control-label">
              <span>動態負載電流 (Iload)</span>
              <strong>{{ currentmA }} mA</strong>
            </div>
            <input type="range" v-model.number="currentmA" min="0" max="2000" step="20" class="range-orange" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { WaveformPlotter } from '../utils/WaveformAnimation.js'

const rInt = ref(0.6)
const currentmA = ref(800)

const canvasRef = ref(null)
let plotter = null

const vDrop = computed(() => {
  return (currentmA.value / 1000) * rInt.value
})

const vOut = computed(() => {
  return Math.max(0, 5.0 - vDrop.value)
})

function drawCurve() {
  if (!plotter) return
  plotter.clear()
  
  // Draw grid
  plotter.drawGrid(
    [0, 2000], [0, 6], 500, 1,
    (x) => `${x}mA`, (y) => `${y}V`
  )
  
  // Draw characteristic line for the current Rint
  const points = []
  const steps = 40
  for (let i = 0; i <= steps; i++) {
    const imA = (i / steps) * 2000
    const drop = (imA / 1000) * rInt.value
    const outV = Math.max(0, 5.0 - drop)
    
    // Normalize to xPct and yPct
    const xPct = imA / 2000
    const yPct = outV / 6.0
    points.push({ xPct, yPct })
  }
  
  // Plot line
  plotter.plotLine(points, '#f97316', 3, 'rgba(249, 115, 22, 0.2)')
  
  // Draw the current operating point
  const rect = canvasRef.value.getBoundingClientRect()
  const { padding } = plotter.options
  const plotWidth = rect.width - padding.left - padding.right
  const plotHeight = rect.height - padding.top - padding.bottom
  
  const currentXPct = currentmA.value / 2000
  const currentYPct = vOut.value / 6.0
  
  const ptX = padding.left + currentXPct * plotWidth
  const ptY = padding.top + (1 - currentYPct) * plotHeight
  
  const ctx = plotter.ctx
  
  // Dashed lines to axes
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  
  // To X axis
  ctx.beginPath()
  ctx.moveTo(ptX, ptY)
  ctx.lineTo(ptX, rect.height - padding.bottom)
  ctx.stroke()
  
  // To Y axis
  ctx.beginPath()
  ctx.moveTo(ptX, ptY)
  ctx.lineTo(padding.left, ptY)
  ctx.stroke()
  ctx.setLineDash([])
  
  // Glow point
  ctx.fillStyle = '#f97316'
  ctx.shadowBlur = 8
  ctx.shadowColor = '#f97316'
  ctx.beginPath()
  ctx.arc(ptX, ptY, 6, 0, 2 * Math.PI)
  ctx.fill()
  ctx.shadowBlur = 0
}

watch([rInt, currentmA], () => {
  drawCurve()
})

onMounted(() => {
  if (canvasRef.value) {
    plotter = new WaveformPlotter(canvasRef.value)
    plotter.resize()
    drawCurve()
  }
  window.addEventListener('resize', handleResize)
})

function handleResize() {
  if (plotter) {
    plotter.resize()
    drawCurve()
  }
}

onUnmounted(() => {
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

.readout-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 20px;
}

.metric {
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.15);
  padding: 12px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.metric span {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
}

.metric strong {
  font-size: 1.4rem;
  margin-top: 6px;
}

.text-orange {
  color: #f97316;
}

.text-green {
  color: #10b981;
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
  background: #f97316;
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

.canvas-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.curve-canvas {
  width: 100%;
  height: 220px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 18px;
  display: block;
}

.indicator-tip {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(15, 23, 42, 0.85);
  color: #fff;
  font-size: 0.75rem;
  padding: 6px 10px;
  border-radius: 8px;
  pointer-events: none;
  font-weight: 600;
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

.range-orange {
  width: 100%;
  accent-color: #f97316;
}

@media (max-width: 960px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
}
</style>
