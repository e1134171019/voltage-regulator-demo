<template>
  <section class="scene-grid">
    <div class="theory-card">
      <div class="card-head">
        <p class="scene-step">SCENE 06 · 功率級</p>
        <h2>2SC1384 功率電晶體與電流擴展</h2>
      </div>
      
      <div class="theory-body">
        <p>
          運算放大器雖然精準，但其內部晶片非常微小，通常輸出電流極限僅有 10 到 20 mA。若拿來直接為手機或馬達供電，放大器會立刻過熱燒毀。
        </p>
        <p>
          為了解決大電流驅動的需求，我們在輸出端增加了一個<strong>串聯調整管 (Series Pass Transistor)</strong>，此處使用 2SC1384 這類 NPN 型雙極性電晶體作為功率級：
        </p>

        <div class="math-block">Ie = Ib + Ic ≈ β x Ib</div>

        <p>電晶體的閥門效應：</p>
        <ul>
          <li><strong>小控制大：</strong> 運算放大器只需輸出微小的基極電流 Ib，就能控制電晶體開關。</li>
          <li><strong>電流倍增：</strong> 電晶體利用電流增益 β（常見範圍約 50 到 200），從輸入端 Vin 的集極抽取更大的 Ic 送往負載。</li>
          <li><strong>功率屏障：</strong> 所有的發熱與大功率損耗都由電晶體承擔，運算放大器得以安全工作。</li>
        </ul>
      </div>
    </div>

    <div class="visual-card">
      <div class="visual-header">
        <span class="badge">電流放大模擬</span>
        <h3>BJT 通路電流分配 (B / C / E)</h3>
      </div>

      <div class="simulator-view">
        <!-- SVG Circuit Diagram with BJT and Op-Amp driving it -->
        <div class="circuit-container">
          <svg viewBox="0 0 500 240" class="circuit-svg">
            <defs>
              <pattern id="grid-07" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.05)" stroke-width="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-07)" rx="16" />

            <!-- Wires -->
            <!-- Vin wire to BJT Collector -->
            <path d="M 40 50 L 300 50 M 300 50 L 300 95" stroke="#f43f5e" stroke-width="4" fill="none" />
            <!-- Op-Amp output to BJT Base -->
            <path d="M 120 120 L 260 120" stroke="#38bdf8" stroke-width="2" fill="none" />
            <!-- BJT Emitter to Vout node -->
            <path d="M 300 145 L 300 190 M 300 190 L 420 190" stroke="#10b981" stroke-width="4.5" fill="none" />
            <!-- Vout to Rload -->
            <path d="M 420 190 L 420 200" stroke="#10b981" stroke-width="4" fill="none" />
            <!-- Rload to GND -->
            <path d="M 420 220 L 420 225" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- GND symbol -->
            <path d="M 405 225 L 435 225 M 412 229 L 428 229 M 417 233 L 423 233" stroke="#cbd5e1" stroke-width="2" fill="none" />

            <!-- Op-Amp block (simplified) -->
            <path d="M 40 90 L 120 120 L 40 150 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
            <text x="70" y="124" fill="#38bdf8" font-size="10" font-weight="700">Op-Amp</text>

            <!-- BJT Transistor NPN (Centered at 300, 120) -->
            <g transform="translate(300, 120)">
              <!-- Circle -->
              <circle cx="0" cy="0" r="25" fill="#1e293b" stroke="#f59e0b" stroke-width="2.5" />
              <!-- Base plate -->
              <path d="M -12 -12 L -12 12" stroke="#fff" stroke-width="3.5" />
              <!-- Collector pin -->
              <path d="M -12 -6 L 10 -20 L 10 -25" stroke="#fff" stroke-width="2" fill="none" />
              <!-- Emitter pin -->
              <path d="M -12 6 L 10 20 L 10 25" stroke="#fff" stroke-width="2" fill="none" />
              <!-- Emitter Arrow -->
              <path d="M 2 15 L 10 20 L 3 22 Z" fill="#fff" />
              
              <!-- Terminals text -->
              <text x="-20" y="-4" fill="#38bdf8" font-size="9" font-weight="700">B</text>
              <text x="14" y="-14" fill="#f43f5e" font-size="9" font-weight="700">C</text>
              <text x="14" y="16" fill="#10b981" font-size="9" font-weight="700">E</text>
            </g>

            <!-- Dynamic Current text readouts -->
            <text x="180" y="110" fill="#38bdf8" font-size="10" font-weight="700">Ib = {{ ibmA.toFixed(2) }} mA</text>
            <text x="312" y="40" fill="#f43f5e" font-size="10" font-weight="700">Ic = {{ icmA.toFixed(1) }} mA</text>
            <text x="350" y="180" fill="#10b981" font-size="10" font-weight="700">Ie = {{ iemA.toFixed(1) }} mA</text>

            <!-- Particle flow (adjust density based on currents) -->
            <!-- Base thin flow -->
            <circle v-for="(p, idx) in baseParticles" :key="'b-'+idx" :cx="p[0]" :cy="p[1]" r="2.5" fill="#38bdf8" />
            <!-- Collector medium/thick flow -->
            <circle v-for="(p, idx) in collectorParticles" :key="'c-'+idx" :cx="p[0]" :cy="p[1]" r="3" fill="#f43f5e" />
            <!-- Emitter combined thick flow -->
            <circle v-for="(p, idx) in emitterParticles" :key="'e-'+idx" :cx="p[0]" :cy="p[1]" r="3.5" fill="#10b981" />
          </svg>
        </div>

        <!-- Sliders -->
        <div class="controls-panel">
          <div class="control-row">
            <div class="control-label">
              <span>電晶體放大增益 (β / hFE)</span>
              <strong>{{ beta }}</strong>
            </div>
            <input type="range" v-model.number="beta" min="30" max="200" step="5" class="range-orange" />
          </div>

          <div class="control-row">
            <div class="control-label">
              <span>負載需求電流 (Ie)</span>
              <strong>{{ iemA.toFixed(0) }} mA</strong>
            </div>
            <input type="range" v-model.number="targetIe" min="100" max="1500" step="50" class="range-orange" />
          </div>
        </div>

        <!-- Metrics display -->
        <div class="metrics-grid">
          <div class="metric-card">
            <span>放大倍率 (Ic / Ib)</span>
            <strong class="text-orange">{{ beta }} 倍</strong>
          </div>
          <div class="metric-card">
            <span>Op-Amp 輸出負擔 (Ib)</span>
            <strong class="text-cyan">{{ ibmA.toFixed(3) }} mA</strong>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getParticlesOnPath } from '../utils/CircuitDrawer.js'

const beta = ref(100)
const targetIe = ref(800)

// Calculations
// Ie = Ib + Ic
// Ic = beta * Ib
// Ie = (beta + 1) * Ib
// => Ib = Ie / (beta + 1)
// => Ic = beta * Ib
const iemA = computed(() => {
  return targetIe.value
})

const ibmA = computed(() => {
  return iemA.value / (beta.value + 1)
})

const icmA = computed(() => {
  return beta.value * ibmA.value
})

// Wire paths in SVG coordinates
const pathBase = [
  [120, 120], // Op-Amp out
  [260, 120], // BJT Base
]

const pathCollector = [
  [40, 50],   // Vin start
  [300, 50],  // collector corner
  [300, 95],  // BJT Collector
]

const pathEmitter = [
  [300, 145], // BJT Emitter
  [300, 190], // emitter corner
  [420, 190], // Vout node
  [420, 225], // GND
]

// Particle animations
const baseParticles = ref([])
const collectorParticles = ref([])
const emitterParticles = ref([])
let animationFrameId = null
let t = 0

function animateCircuit() {
  t += 0.016
  const scale = 0.4
  
  // Base current is small, particles sparse
  baseParticles.value = getParticlesOnPath(pathBase, t, ibmA.value * scale * 5, 45)
  // Collector current is medium
  collectorParticles.value = getParticlesOnPath(pathCollector, t, icmA.value * scale, 30)
  // Emitter current is largest
  emitterParticles.value = getParticlesOnPath(pathEmitter, t, iemA.value * scale, 20)

  animationFrameId = requestAnimationFrame(animateCircuit)
}

onMounted(() => {
  animateCircuit()
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
  font-family: var(--font-mono);
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
  background: #f59e0b;
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

.controls-panel {
  display: grid;
  gap: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  padding-top: 18px;
  margin-bottom: 20px;
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
  accent-color: #f59e0b;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
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
}

.text-orange {
  color: #f97316;
}

.text-cyan {
  color: #0891b2;
}

@media (max-width: 960px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
}
</style>
