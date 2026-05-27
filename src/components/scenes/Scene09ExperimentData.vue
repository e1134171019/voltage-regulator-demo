<template>
  <section class="scene-grid">
    <div class="theory-card">
      <div class="card-head">
        <p class="scene-step">SCENE 09 · 量測實驗</p>
        <h2>線性穩壓器的關鍵性能指標</h2>
      </div>
      
      <div class="theory-body">
        <p>
          在工業界與學術界，我們會使用三個核心指標來評估一個穩壓器的優劣：
        </p>
        
        <ul>
          <li><strong>線性調整率 (Line Regulation)：</strong>
            當輸入電壓 Vin 變化時，輸出電壓 Vout 的波動程度。越小代表對電網雜訊的抵禦力越強。
            <div class="formula-line">Line Reg = (ΔVout / ΔVin) x 100%</div>
          </li>
          <li><strong>負載調整率 (Load Regulation)：</strong>
            當負載電流從無載到滿載變化時，輸出電壓 Vout 的下沉比例。越小代表負載抽載時越穩定。
            <div class="formula-line">Load Reg = ((VNL - VFL) / VNL) x 100%</div>
          </li>
          <li><strong>轉換效率與廢熱：</strong>
            線性穩壓器的輸入電流幾乎等於輸出電流，因此其效率直接取決於輸入輸出電壓比：
            <div class="formula-line">Efficiency ≈ (Vout / Vin) x 100%</div>
            <strong>巨大代價：</strong> 剩餘能量 Pheat = (Vin - Vout) x Iout 會完全轉化為<strong>廢熱</strong>，因此必須考慮散熱。
          </li>
        </ul>
      </div>
    </div>

    <div class="visual-card">
      <div class="visual-header">
        <span class="badge">沙盒量測儀表板</span>
        <h3>實驗室量測與熱能發散模擬</h3>
      </div>

      <div class="simulator-view">
        <!-- Laboratory Instrument Display -->
        <div class="instrument-panel">
          <div class="readout-instrument">
            <span class="label">OUTPUT VOLTAGE</span>
            <strong class="digital-text">{{ vOut.toFixed(3) }} V</strong>
          </div>
          
          <div class="instrument-grid">
            <div class="readout-sub">
              <span>轉換效率 (η)</span>
              <strong :class="efficiencyColorClass">{{ efficiency.toFixed(1) }} %</strong>
            </div>
            
            <div class="readout-sub">
              <span>晶片發熱功率 (P_heat)</span>
              <strong :class="{ 'text-red': pHeat > 3 }">{{ pHeat.toFixed(2) }} W</strong>
            </div>

            <div class="readout-sub">
              <span>負載電流 (Iout)</span>
              <strong>{{ (iOut * 1000).toFixed(0) }} mA</strong>
            </div>
          </div>
        </div>

        <div class="row-layout">
          <!-- Thermal visualization of TO-220 IC package -->
          <div class="thermal-visual">
            <div class="ic-package" :style="icThermalStyle">
              <div class="tab-metal"></div>
              <div class="body-plastic">
                <strong>TO-220</strong>
                <span>LDO REG</span>
              </div>
              <div class="pins">
                <div class="pin"></div>
                <div class="pin"></div>
                <div class="pin"></div>
              </div>
            </div>
            <div class="thermal-temp">
              晶片估計溫度: <strong>{{ chipTemperature.toFixed(0) }} °C</strong>
            </div>
          </div>

          <!-- Controls Sliders -->
          <div class="controls-panel">
            <div class="control-row">
              <div class="control-label">
                <span>輸入電壓 (Vin)</span>
                <strong>{{ vIn.toFixed(1) }} V</strong>
              </div>
              <input type="range" v-model.number="vIn" min="5.5" max="12.0" step="0.1" class="range-cyan" />
            </div>

            <div class="control-row">
              <div class="control-label">
                <span>負載阻值 (Rload)</span>
                <strong>{{ rLoad.toFixed(0) }} Ω</strong>
              </div>
              <input type="range" v-model.number="rLoad" min="10" max="200" step="5" class="range-cyan" />
            </div>

            <div class="control-row">
              <div class="control-label">
                <span>環境溫度 (Tambient)</span>
                <strong>{{ tAmbient.toFixed(0) }} °C</strong>
              </div>
              <input type="range" v-model.number="tAmbient" min="15" max="60" step="1" class="range-cyan" />
            </div>
          </div>
        </div>

        <!-- Metric evaluation reports -->
        <div class="alert-box" :class="{ show: chipTemperature > 85 }">
          <strong>⚠️ 晶片過熱警告 (Over-Temperature Risk)</strong>
          <span>當前發熱功率過高，晶片結溫已接近 90°C！在實際電路中，必須增加更大面積的鋁製散熱片或強制風冷。</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const vIn = ref(9.0)
const rLoad = ref(50)
const tAmbient = ref(25)

const V_TARGET = 5.0

// Simulated realistic LDO non-idealities:
// 1. Line Reg: Vout drops slightly as Vin increases (or oscillates slightly)
// 2. Load Reg: Vout drops slightly as load resistance decreases (current increases)
// 3. Temp coefficient: Vout drifts slightly with temp
const vOut = computed(() => {
  const lineRegFactor = 0.003 * (vIn.value - 7)
  const loadRegFactor = 0.004 * (100 / rLoad.value)
  const tempFactor = 0.0002 * (chipTemperature.value - 25)
  return V_TARGET + lineRegFactor - loadRegFactor + tempFactor
})

const iOut = computed(() => {
  return vOut.value / rLoad.value
})

const efficiency = computed(() => {
  // Pout / Pin = (Vout * Iout) / (Vin * Iin). Since Iq (quiescent current) is tiny, Iin ≈ Iout
  // eta = Vout / Vin
  return (vOut.value / vIn.value) * 100
})

const pHeat = computed(() => {
  return (vIn.value - vOut.value) * iOut.value
})

// Thermal calculation: T_junction = T_ambient + P_heat * R_theta_ja
// TO-220 R_theta_ja is about 65 °C/W without heatsink
const chipTemperature = computed(() => {
  const thermalResistance = 18 // assuming a modest heatsink is present
  return tAmbient.value + pHeat.value * thermalResistance
})

// Dynamic IC color style based on junction temperature
const icThermalStyle = computed(() => {
  // Map 25°C to rgb(30, 41, 59) and 100°C to rgb(239, 68, 68) or orange
  const temp = chipTemperature.value
  const ratio = Math.max(0, Math.min(1, (temp - 25) / 75)) // 25C to 100C
  
  // Blend colors: start (30,41,59) -> middle (230,120,40) -> hot (239,68,68)
  let r, g, b
  if (ratio < 0.5) {
    const t = ratio * 2
    r = Math.round(30 + t * (230 - 30))
    g = Math.round(41 + t * (120 - 41))
    b = Math.round(59 + t * (40 - 59))
  } else {
    const t = (ratio - 0.5) * 2
    r = Math.round(230 + t * (244 - 230))
    g = Math.round(120 + t * (63 - 120))
    b = Math.round(40 + t * (94 - 40))
  }
  
  const glow = ratio > 0.3 ? `0 0 ${ratio * 25}px rgba(${r}, ${g}, ${b}, ${0.2 + ratio * 0.6})` : 'none'
  
  return {
    backgroundColor: `rgb(${r}, ${g}, ${b})`,
    boxShadow: glow
  }
})

const efficiencyColorClass = computed(() => {
  if (efficiency.value > 80) return 'text-green'
  if (efficiency.value > 50) return 'text-orange'
  return 'text-red'
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
  margin-bottom: 12px;
}

.formula-line {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.06);
  color: #0f172a;
  font-family: var(--font-mono);
  font-size: 0.88rem;
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
  background: #0891b2;
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

/* Instrument design styles */
.instrument-panel {
  background: radial-gradient(100% 100% at 50% 0%, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15), inset 0 2px 10px rgba(0,0,0,0.4);
}

.readout-instrument {
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 14px;
  margin-bottom: 14px;
}

.readout-instrument .label {
  font-size: 0.7rem;
  color: #64748b;
  letter-spacing: 0.1em;
  font-weight: 700;
}

.digital-text {
  display: block;
  font-family: var(--font-mono);
  font-size: 2.2rem;
  color: #10b981;
  text-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
  letter-spacing: 1px;
  margin-top: 4px;
}

.instrument-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.readout-sub {
  text-align: center;
}

.readout-sub span {
  display: block;
  font-size: 0.62rem;
  color: #64748b;
  margin-bottom: 4px;
}

.readout-sub strong {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: #fff;
}

.readout-sub strong.text-green {
  color: #10b981;
}

.readout-sub strong.text-orange {
  color: #f59e0b;
}

.readout-sub strong.text-red {
  color: #f43f5e;
}

/* Row Layout */
.row-layout {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

/* Thermal animation styles */
.thermal-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f1f5f9;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 18px;
  padding: 16px;
}

.ic-package {
  width: 70px;
  height: 90px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px;
  transition: background-color 0.5s ease, box-shadow 0.5s ease;
  position: relative;
}

.tab-metal {
  width: 50px;
  height: 15px;
  background: #cbd5e1;
  border-radius: 3px 3px 0 0;
  position: absolute;
  top: -10px;
  z-index: 1;
  border: 1px solid rgba(0,0,0,0.1);
}

.body-plastic {
  text-align: center;
  color: #fff;
  z-index: 2;
  margin-top: 10px;
}

.body-plastic strong {
  display: block;
  font-size: 0.72rem;
}

.body-plastic span {
  font-size: 0.55rem;
  opacity: 0.7;
}

.pins {
  display: flex;
  gap: 8px;
  margin-bottom: -15px;
  z-index: 0;
}

.pin {
  width: 4px;
  height: 20px;
  background: #94a3b8;
}

.thermal-temp {
  margin-top: 24px;
  font-size: 0.78rem;
  color: #475569;
}

.thermal-temp strong {
  color: #0f172a;
}

/* Controls */
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
  accent-color: #0891b2;
}

.alert-box {
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.3);
  padding: 12px 16px;
  border-radius: 12px;
  color: #e11d48;
  font-size: 0.82rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
