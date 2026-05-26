<template>
  <section class="scene-grid">
    <div class="theory-card">
      <div class="card-head">
        <p class="scene-step">SCENE 05 · 誤差比較</p>
        <h2>μA741 運算放大器的比較機制</h2>
      </div>
      
      <div class="theory-body">
        <p>
          齊納穩壓器雖然簡單，但當負載電流變大或輸入電壓變化時，輸出電壓依然會有微幅偏移。為了解決此問題，我們引入了具有極高增益的<strong>μA741 運算放大器</strong> 作為誤差放大器：
        </p>

        <div class="math-block">Vout_op = A x (Vref - Vfb)</div>

        <p>比較放大核心：</p>
        <ul>
          <li><strong>非反相輸入端 Vref (+)：</strong> 連接到穩定的參考電壓，通常由齊納二極體提供。</li>
          <li><strong>反相輸入端 Vfb (-)：</strong> 讀取輸出端回授回來的採樣電壓。</li>
          <li><strong>虛擬短路效果：</strong> 741 會利用高增益把誤差放大，逼使 Vfb 最終逼近 Vref。</li>
        </ul>
        
        <p class="highlight-box font-medium">
          手動調整下方的滑桿，體驗運算放大器如何偵測兩端極小的電壓差 ΔV，並產生劇烈反應的控制輸出。
        </p>
      </div>
    </div>

    <div class="visual-card">
      <div class="visual-header">
        <span class="badge">比較器狀態動態觀察</span>
        <h3>運算放大器誤差比較單元</h3>
      </div>

      <div class="simulator-view">
        <!-- SVG diagram of Op-Amp Comparator -->
        <div class="circuit-container">
          <svg viewBox="0 0 500 220" class="circuit-svg">
            <defs>
              <pattern id="grid-06" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.05)" stroke-width="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-06)" rx="16" />

            <!-- Op-Amp Symbol in Center (offset and scaled) -->
            <!-- Triangle body -->
            <g transform="translate(250, 110)">
              <path d="M -40 -40 L 40 0 L -40 40 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" />
              
              <!-- Input terminals inside -->
              <text x="-30" y="-18" fill="#e11d48" font-size="16" font-weight="700" text-anchor="middle">-</text>
              <text x="-30" y="20" fill="#10b981" font-size="14" font-weight="700" text-anchor="middle">+</text>
              
              <!-- Label -->
              <text x="-12" y="4" fill="#38bdf8" font-size="10" font-weight="700">ERROR</text>
              <text x="-12" y="14" fill="#38bdf8" font-size="9" font-weight="700">AMP</text>
            </g>

            <!-- Wires -->
            <!-- Vfb wire to - terminal -->
            <path d="M 80 70 L 210 70" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Vref wire to + terminal -->
            <path d="M 80 130 L 210 130" stroke="#cbd5e1" stroke-width="3" fill="none" />
            <!-- Op-Amp Output wire -->
            <path d="M 290 110 L 420 110" :stroke="outputWireColor" stroke-width="4.5" fill="none" class="transition-color" />

            <!-- Labels & Nodes -->
            <!-- Vfb node -->
            <circle cx="80" cy="70" r="5" fill="#e11d48" />
            <text x="70" y="55" fill="#e11d48" font-size="11" font-weight="700" text-anchor="start">
              回授電壓 Vfb: {{ vFb.toFixed(3) }} V
            </text>

            <!-- Vref node -->
            <circle cx="80" cy="130" r="5" fill="#10b981" />
            <text x="70" y="150" fill="#10b981" font-size="11" font-weight="700" text-anchor="start">
              參考基準 Vref: {{ vRef.toFixed(2) }} V
            </text>

            <!-- Op-Amp Output Node -->
            <circle cx="420" cy="110" r="6" :fill="outputWireColor" />
            <text x="430" y="95" :fill="outputWireColor" font-size="12" font-weight="800" text-anchor="start">
              放大輸出 Vout_op: {{ vOutOpAmp.toFixed(2) }} V
            </text>

            <!-- Differential glow light -->
            <text x="250" y="45" :fill="diffColor" font-size="12" font-weight="800" text-anchor="middle">
              輸入差值 (ΔV): {{ (vRef - vFb).toFixed(3) }} V
            </text>
          </svg>
        </div>

        <!-- Sliders -->
        <div class="controls-panel">
          <div class="control-row">
            <div class="control-label">
              <span>參考電壓基準 (Vref)</span>
              <strong>{{ vRef.toFixed(2) }} V</strong>
            </div>
            <input type="range" v-model.number="vRef" min="2.0" max="3.0" step="0.05" class="range-green" />
          </div>

          <div class="control-row">
            <div class="control-label">
              <span>採樣回授電壓 (Vfb)</span>
              <strong>{{ vFb.toFixed(3) }} V</strong>
            </div>
            <input type="range" v-model.number="vFb" min="1.9" max="3.1" step="0.005" class="range-red" />
          </div>
        </div>

        <!-- Differential Meter -->
        <div class="status-summary">
          <div class="meter-bar">
            <span class="meter-label">誤差放大器輸出飽和度:</span>
            <div class="meter-track">
              <div class="meter-fill" :style="{ width: saturationPercent + '%', background: outputWireColor }"></div>
            </div>
          </div>
          <p class="behavior-desc">
            {{ behaviorText }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const vRef = ref(2.5)
const vFb = ref(2.5)

// Op-Amp open-loop gain simulation (e.g. 500 for visualization purposes, so small differences saturate it)
const GAIN = 100
// Rails are 0V and 10V (single supply model)
const V_MIN = 0.1
const V_MAX = 8.5

const vOutOpAmp = computed(() => {
  const diff = vRef.value - vFb.value
  const idealOut = 4.25 + diff * GAIN // centered around 4.25V when diff is 0
  return Math.max(V_MIN, Math.min(idealOut, V_MAX))
})

const diffColor = computed(() => {
  const diff = vRef.value - vFb.value
  if (Math.abs(diff) < 0.01) return '#38bdf8' // balanced (blue)
  return diff > 0 ? '#10b981' : '#ef4444' // green if positive, red if negative
})

const outputWireColor = computed(() => {
  // map 0.1V to red/low-glow and 8.5V to cyan/high-glow
  const fraction = (vOutOpAmp.value - V_MIN) / (V_MAX - V_MIN)
  if (fraction < 0.3) return '#ef4444' // low (red)
  if (fraction > 0.7) return '#10b981' // high (green)
  return '#38bdf8' // balanced (cyan)
})

const saturationPercent = computed(() => {
  return ((vOutOpAmp.value - V_MIN) / (V_MAX - V_MIN)) * 100
})

const behaviorText = computed(() => {
  const diff = vRef.value - vFb.value
  if (Math.abs(diff) < 0.005) {
    return '平衡狀態：輸入端非常接近（虛擬短路），輸出落在中間值，穩定控制下游元件。'
  }
  if (diff > 0) {
    return '偵測到輸出電壓偏低（Vfb < Vref）：放大器輸出大幅衝高，以驅動外部元件來拉高電壓。'
  }
  return '偵測到輸出電壓偏高（Vfb > Vref）：放大器輸出迅速下跌，抑制下游電路以防止過壓。'
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

.highlight-box {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(16, 185, 129, 0.05));
  border-left: 4px solid #38bdf8;
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

.circuit-container {
  margin-bottom: 20px;
}

.circuit-svg {
  width: 100%;
  height: 220px;
  background: #0f172a;
  border-radius: 18px;
  box-shadow: inset 0 4px 20px rgba(0, 0, 0, 0.3);
}

.transition-color {
  transition: stroke 0.25s ease, fill 0.25s ease;
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

.range-green {
  width: 100%;
  accent-color: #10b981;
}

.range-red {
  width: 100%;
  accent-color: #ef4444;
}

/* Status summary bar */
.status-summary {
  background: #f1f5f9;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 16px;
  border-radius: 16px;
}

.meter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.meter-label {
  font-size: 0.8rem;
  color: #475569;
  white-space: nowrap;
}

.meter-track {
  height: 10px;
  flex-grow: 1;
  background: #cbd5e1;
  border-radius: 99px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.2s ease, background-color 0.2s ease;
}

.behavior-desc {
  margin: 0;
  font-size: 0.82rem;
  color: #334155;
  line-height: 1.55;
}

@media (max-width: 960px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
}
</style>
