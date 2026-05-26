<template>
  <section class="scene-grid">
    <div class="theory-card">
      <div class="card-head">
        <p class="scene-step">SCENE 04 · 等效電路</p>
        <h2>可變分壓模型與 Dropout Margin</h2>
      </div>
      
      <div class="theory-body">
        <p>
          線性穩壓器的核心物理本質，可以被簡化為一個<strong>主動調節的可變電阻 ($R_{\text{reg}}$)</strong>，它與負載電阻 ($R_{\text{load}}$) 串聯形成一個分壓器：
        </p>

        <div class="math-block">
          $$V_{\text{out}} = V_{\text{in}} \times \frac{R_{\text{load}}}{R_{\text{reg}} + R_{\text{load}}}$$
        </div>

        <p>穩壓器的控制機制：</p>
        <ul>
          <li><strong>當負載變重 ($R_{\text{load}}$ 變小)：</strong> 為了維持 $V_{\text{out}}$ 不變，穩壓器會主動<strong>降低 $R_{\text{reg}}$</strong> 的阻值。</li>
          <li><strong>當輸入 $V_{\text{in}}$ 升高：</strong> 為了防止輸出過壓，穩壓器會主動<strong>提高 $R_{\text{reg}}$</strong> 的阻值，將多餘的電壓轉化為熱能吸收。</li>
          <li><strong>極限（飽和與 Dropout）：</strong> 當 $V_{\text{in}}$ 太低，即使穩壓器把 $R_{\text{reg}}$ 降到極限（接近 $0\ \Omega$），輸出依然無法達到目標值。此時電路進入<strong> Dropout 區</strong>。</li>
        </ul>
      </div>
    </div>

    <div class="visual-card">
      <div class="visual-header">
        <span class="badge">分壓器動態模擬</span>
        <h3>等效串聯調節電路</h3>
      </div>

      <div class="simulator-view">
        <!-- SVG Interactive Divider Circuit -->
        <div class="circuit-container">
          <svg viewBox="0 0 500 240" class="circuit-svg">
            <defs>
              <pattern id="grid-04" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.05)" stroke-width="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-04)" rx="16" />

            <!-- Wires -->
            <!-- Vin to Rreg -->
            <path d="M 50 120 L 150 120" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Rreg to Vout node -->
            <path d="M 210 120 L 350 120" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Vout node to Rload -->
            <path d="M 350 120 L 350 150" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Rload to GND -->
            <path d="M 350 210 L 350 220" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- GND symbol -->
            <path d="M 330 220 L 370 220 M 340 225 L 360 225 M 346 230 L 354 230" stroke="#cbd5e1" stroke-width="2" fill="none" />

            <!-- DC Source Vin Symbol -->
            <circle cx="50" cy="120" r="16" fill="#1e293b" stroke="#f43f5e" stroke-width="2" />
            <text x="50" y="124" fill="#f43f5e" font-size="12" font-weight="700" text-anchor="middle">Vin</text>

            <!-- Rreg (Variable Resistor) -->
            <g transform="translate(180, 120)">
              <!-- Resistor Box symbol with arrow representing variable -->
              <rect x="-30" y="-12" width="60" height="24" fill="#1e293b" :stroke="isDropout ? '#f43f5e' : '#38bdf8'" stroke-width="2" />
              <text x="0" y="4" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">R_reg</text>
              <!-- Arrow -->
              <path d="M -25 18 L 25 -18 M 18 -18 L 25 -18 L 25 -11" stroke="#e11d48" stroke-width="2" fill="none" />
            </g>
            <text x="180" y="90" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">
              阻值: {{ rRegValue.toFixed(1) }} Ω
            </text>

            <!-- Rload (Load Resistor) -->
            <g transform="translate(350, 180) rotate(90)">
              <rect x="-30" y="-12" width="60" height="24" fill="#1e293b" stroke="#10b981" stroke-width="2" />
              <text x="0" y="4" fill="#fff" font-size="10" font-weight="700" text-anchor="middle" transform="rotate(-90)">R_load</text>
            </g>
            <text x="405" y="184" fill="#10b981" font-size="11" font-weight="700" text-anchor="start">
              負載: {{ rLoad.toFixed(0) }} Ω
            </text>

            <!-- Node Vout -->
            <circle cx="350" cy="120" r="6" :fill="isDropout ? '#f43f5e' : '#10b981'" class="glow-node" />
            <text x="350" y="100" :fill="isDropout ? '#f43f5e' : '#10b981'" font-size="12" font-weight="800" text-anchor="middle">
              Vout = {{ vOut.toFixed(2) }} V
            </text>

            <!-- Particle flow (adjusting speed and path) -->
            <circle v-for="(p, idx) in particles" :key="idx" :cx="p[0]" :cy="p[1]" r="3.5" fill="#f59e0b" />
          </svg>
        </div>

        <!-- Dropout Alert -->
        <div class="alert-box" :class="{ show: isDropout }">
          <strong>⚠️ 進入 Dropout 區 (電壓飽和)</strong>
          <span>輸入電壓過低，即使可變電阻 R_reg 降為 0，輸出依然無法穩定在 5V！</span>
        </div>

        <!-- Sliders -->
        <div class="controls-panel">
          <div class="control-row">
            <div class="control-label">
              <span>輸入電壓 (Vin)</span>
              <strong>{{ vIn.toFixed(1) }} V</strong>
            </div>
            <input type="range" v-model.number="vIn" min="3.0" max="10.0" step="0.1" class="range-cyan" />
          </div>

          <div class="control-row">
            <div class="control-label">
              <span>負載電阻 (Rload)</span>
              <strong>{{ rLoad.toFixed(0) }} Ω</strong>
            </div>
            <input type="range" v-model.number="rLoad" min="5" max="100" step="1" class="range-cyan" />
          </div>
        </div>

        <!-- Dashboard metrics -->
        <div class="metrics-grid">
          <div class="metric-card">
            <span>負載電流 (Iout)</span>
            <strong>{{ (iLoad * 1000).toFixed(0) }} mA</strong>
          </div>
          <div class="metric-card">
            <span>穩壓器耗散功率 (Preg)</span>
            <strong>{{ pReg.toFixed(2) }} W</strong>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getParticlesOnPath } from '../utils/CircuitDrawer.js'

const vIn = ref(7.0)
const rLoad = ref(20)

// Target output voltage
const V_TARGET = 5.0

// Simulator logic
// Vout = Vin * Rload / (Rreg + Rload)
// To keep Vout = V_TARGET, we need:
// Rreg = Rload * (Vin - Vout) / Vout
const rRegValue = computed(() => {
  if (vIn.value <= V_TARGET) return 0.001 // minimum resistance limit
  return rLoad.value * (vIn.value - V_TARGET) / V_TARGET
})

const isDropout = computed(() => {
  return vIn.value <= V_TARGET
})

const vOut = computed(() => {
  if (isDropout.value) {
    // When in dropout, Rreg is fully saturated to its minimum limit (0.001)
    return vIn.value * rLoad.value / (0.001 + rLoad.value)
  }
  return V_TARGET
})

const iLoad = computed(() => {
  return vOut.value / rLoad.value
})

const pReg = computed(() => {
  const vDropReg = Math.max(0, vIn.value - vOut.value)
  return vDropReg * iLoad.value
})

// Particle flow simulation
const particles = ref([])
let animationFrameId = null
let t = 0

// Define wire coordinates
const wirePoints = [
  [50, 120],  // DC Vin
  [150, 120], // to Rreg start
  [210, 120], // to Rreg end
  [350, 120], // to Vout node
  [350, 150], // to Rload start
  [350, 210], // to Rload end
  [350, 220], // to GND
]

function animateParticles() {
  t += 0.016
  // Particle flow speed is proportional to Current
  const currentSpeed = iLoad.value * 120 // speed in pixels per second
  particles.value = getParticlesOnPath(wirePoints, t, currentSpeed, 35)
  animationFrameId = requestAnimationFrame(animateParticles)
}

onMounted(() => {
  animateParticles()
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
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

.glow-node {
  filter: drop-shadow(0 0 6px currentColor);
  transition: fill 0.3s ease;
}

.alert-box {
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.3);
  padding: 12px 16px;
  border-radius: 12px;
  color: #e11d48;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.alert-box.show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 20px;
}

.metric-card {
  background: #f1f5f9;
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 12px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-card span {
  font-size: 0.75rem;
  color: #64748b;
}

.metric-card strong {
  font-size: 1.25rem;
  margin-top: 4px;
  color: #0f172a;
}

@media (max-width: 960px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
}
</style>
