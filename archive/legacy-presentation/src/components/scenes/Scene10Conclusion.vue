<template>
  <section class="scene-grid">
    <div class="theory-card">
      <div class="card-head">
        <p class="scene-step">SCENE 10 · 總結與選型</p>
        <h2>線性 (LDO) vs. 開關式穩壓器 (Switcher)</h2>
      </div>
      
      <div class="theory-body">
        <p>
          在最後的決策中，我們必須在<strong>線性穩壓器 (如 LDO)</strong> 與<strong>開關式穩壓器 (如 Buck 降壓器)</strong> 之間做出權衡。兩者的工作原理截然不同：
        </p>
        
        <table class="comparison-table">
          <thead>
            <tr>
              <th>特性</th>
              <th>線性穩壓器 (LDO)</th>
              <th>開關式穩壓器 (Buck)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>轉換效率</strong></td>
              <td class="bad">低 (隨壓差增大而衰退)</td>
              <td class="good">高 (一般可達 85% ~ 98%)</td>
            </tr>
            <tr>
              <td><strong>輸出雜訊</strong></td>
              <td class="good">極低 (漣波通常 &lt; 10 µV)</td>
              <td class="bad">中至高 (有開關高頻紋波)</td>
            </tr>
            <tr>
              <td><strong>電路複雜度</strong></td>
              <td class="good">極低 (只需幾個小電容)</td>
              <td class="bad">高 (需要電感、二極體)</td>
            </tr>
            <tr>
              <td><strong>成本與體積</strong></td>
              <td class="good">便宜、極小</td>
              <td class="bad">昂貴、體積較大</td>
            </tr>
            <tr>
              <td><strong>暫態響應</strong></td>
              <td class="good">極快</td>
              <td class="bad">較慢 (受限於電感儲能)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="visual-card">
      <div class="visual-header">
        <span class="badge">智慧型選型雷達</span>
        <h3>應用場景與選型推薦</h3>
      </div>

      <div class="simulator-view">
        <!-- Interactive Scenarios Selection -->
        <div class="scenario-selector">
          <label class="section-title">選擇您的產品應用場景：</label>
          <div class="scenarios-list">
            <button v-for="sc in scenarios" :key="sc.id" :class="{ active: activeScenario === sc.id }" @click="activeScenario = sc.id">
              {{ sc.name }}
            </button>
          </div>
        </div>

        <!-- SVG Radar Chart + Recommendation -->
        <div class="row-layout">
          <!-- Radar Chart -->
          <div class="radar-container">
            <svg viewBox="0 0 200 200" class="radar-svg">
              <!-- Web circles -->
              <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />

              <!-- Axis lines -->
              <!-- Axes: Efficiency, Low Noise, Low Cost, Simplicity, Transient Response -->
              <path v-for="(axis, idx) in axes" :key="idx" :d="`M 100 100 L ${axis.x} ${axis.y}`" stroke="rgba(255,255,255,0.1)" stroke-width="1" />

              <!-- Axis labels -->
              <text v-for="(axis, idx) in axes" :key="'l-'+idx" :x="axis.lx" :y="axis.ly" fill="#94a3b8" font-size="8" font-weight="700" :text-anchor="axis.align" :alignment-baseline="axis.baseline">
                {{ axis.name }}
              </text>

              <!-- Radar Polygons -->
              <!-- LDO Polygon (steady blue) -->
              <polygon :points="ldoPointsStr" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="2" />
              <!-- Buck Polygon (steady green) -->
              <polygon :points="buckPointsStr" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="2" />
            </svg>
            <div class="radar-legend">
              <span class="legend-ldo">線性 (LDO)</span>
              <span class="legend-buck">開關式 (Buck)</span>
            </div>
          </div>

          <!-- Recommendation display -->
          <div class="rec-display-box">
            <div class="rec-title">🎯 官方選型推薦</div>
            <div class="rec-solution" :class="currentRec.solutionType">
              {{ currentRec.solution }}
            </div>
            <p class="rec-reason">
              {{ currentRec.reason }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeScenario = ref('audio')

const scenarios = [
  {
    id: 'audio',
    name: '🎸 高保真音響前級',
    solution: '首選線性穩壓器 (LDO)',
    solutionType: 'ldo',
    reason: '音響前級放大器對微小雜訊極度敏感。開關穩壓器的開關雜訊會滲透進音訊通路，產生刺耳的背景雜音。LDO 漣波抑制比 (PSRR) 極高，且完全沒有切換波紋，是音頻電路的不二之選。'
  },
  {
    id: 'iot',
    name: '⌚ 穿戴智慧手錶',
    solution: '混合使用 LDO + Buck',
    solutionType: 'hybrid',
    reason: '手錶日常處於超低功耗待機狀態（LDO 靜態電流極低最省電），但在啟動螢幕或 GPS 時功耗大增（Buck 效率最高防止發熱）。現代智慧硬體多採用 PMIC 晶片，內部同時封裝了多路 Buck 與 LDO。'
  },
  {
    id: 'server',
    name: '🖥️ 伺服器 CPU 供電',
    solution: '必須選用多相開關式穩壓器',
    solutionType: 'buck',
    reason: '伺服器處理器核心電壓僅有 1.0 V，但電流高達 100 A 以上。如果使用線性穩壓器將 12V 降壓到 1.0V，發熱損耗功率將達到驚人的 1100 瓦！這足以燒毀整台伺服器。開關穩壓器的高效率是必選項。'
  }
]

const currentRec = computed(() => {
  return scenarios.find(s => s.id === activeScenario.value)
})

// Radar configuration
// 5 axes: Efficiency (0), Low Noise (1), Low Cost (2), Simplicity (3), Transient Response (4)
const numAxes = 5
const radius = 90
const centerX = 100
const centerY = 100

const axesNames = ['高效率', '極低雜訊', '低成本', '簡易度', '快速暫態']

const axes = computed(() => {
  return axesNames.map((name, i) => {
    const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    
    // Position labels slightly further out
    const lx = centerX + (radius + 12) * Math.cos(angle)
    const ly = centerY + (radius + 12) * Math.sin(angle)
    
    // Label alignment
    let align = 'middle'
    if (Math.cos(angle) > 0.1) align = 'start'
    if (Math.cos(angle) < -0.1) align = 'end'
    
    let baseline = 'middle'
    if (Math.sin(angle) > 0.5) baseline = 'hanging'
    if (Math.sin(angle) < -0.5) baseline = 'alphabetic'

    return { name, x, y, lx, ly, align, baseline, angle }
  })
})

// Metrics for both types (scaled 0 to 1)
// Axis index: [Efficiency, Low Noise, Low Cost, Simplicity, Transient]
const ldoMetrics = [0.3, 0.95, 0.9, 0.95, 0.9]
const buckMetrics = [0.95, 0.35, 0.4, 0.35, 0.5]

function getPolygonPoints(metrics) {
  return axes.value.map((axis, i) => {
    const val = metrics[i]
    const x = centerX + radius * val * Math.cos(axis.angle)
    const y = centerY + radius * val * Math.sin(axis.angle)
    return `${x},${y}`
  }).join(' ')
}

const ldoPointsStr = computed(() => getPolygonPoints(ldoMetrics))
const buckPointsStr = computed(() => getPolygonPoints(buckMetrics))
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

/* Comparison Table */
.comparison-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 14px;
  font-size: 0.85rem;
}

.comparison-table th, 
.comparison-table td {
  padding: 10px 8px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  text-align: left;
}

.comparison-table th {
  color: #0f172a;
  font-weight: 700;
  background: rgba(148, 163, 184, 0.05);
}

.comparison-table td.good {
  color: #10b981;
  font-weight: 700;
}

.comparison-table td.bad {
  color: #e11d48;
  font-weight: 700;
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
  background: #1e293b;
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

/* Scenario Selector */
.scenario-selector {
  margin-bottom: 24px;
}

.section-title {
  font-size: 0.82rem;
  color: #475569;
  font-weight: 700;
  display: block;
  margin-bottom: 8px;
}

.scenarios-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.scenarios-list button {
  background: #f1f5f9;
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #475569;
  padding: 8px 6px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scenarios-list button.active {
  background: #1e293b;
  color: #fff;
  border-color: #1e293b;
  box-shadow: 0 8px 20px rgba(30, 41, 59, 0.15);
}

/* Row Layout split radar and rec */
.row-layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 20px;
}

/* Radar Container */
.radar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #0f172a;
  border-radius: 18px;
  padding: 16px;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
}

.radar-svg {
  width: 100%;
  max-width: 170px;
  height: auto;
}

.radar-legend {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  font-size: 0.68rem;
}

.legend-ldo {
  color: #38bdf8;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-ldo::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #38bdf8;
  border-radius: 99px;
}

.legend-buck {
  color: #10b981;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-buck::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 99px;
}

/* Rec Box */
.rec-display-box {
  background: #f1f5f9;
  border: 1px solid rgba(148, 163, 184, 0.25);
  padding: 18px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.rec-title {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.rec-solution {
  font-size: 1.15rem;
  font-weight: 900;
  margin-bottom: 12px;
}

.rec-solution.ldo {
  color: #0284c7;
}

.rec-solution.buck {
  color: #059669;
}

.rec-solution.hybrid {
  color: #7c3aed;
}

.rec-reason {
  margin: 0;
  font-size: 0.8rem;
  color: #334155;
  line-height: 1.6;
}

@media (max-width: 960px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .scenarios-list {
    grid-template-columns: 1fr;
  }
  
  .row-layout {
    grid-template-columns: 1fr;
  }
}
</style>
