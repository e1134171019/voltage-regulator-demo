<template>
  <main class="shell">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">BJT NPN · Vue Canvas Lab</p>
        <h1>麵包板式 BJT 互動展示站</h1>
        <p class="intro">
          這個模組把 BJT 的腳位、偏壓、電流路徑與工作區域拆成可操作的可視化教具。
          所有導線維持直角繞線，粒子動畫專門對應 IB、IC、IE 的實際分流。
        </p>

        <div class="topology">
          <pre>VCC -> RC -> C
RB  -> B
E   -> GND

IE = IC + IB</pre>
        </div>
      </div>

      <div class="hero-stats">
        <article v-for="chip in chips" :key="chip.label">
          <span>{{ chip.label }}</span>
          <strong>{{ chip.value }}</strong>
          <small>{{ chip.note }}</small>
        </article>
      </div>
    </section>

    <section class="workspace">
      <BjtBreadboard :model="model" />

      <aside class="sidebar">
        <section class="panel formula-panel">
          <div class="panel-head">
            <p class="panel-kicker">關鍵方程</p>
            <h2>活性區與飽和區</h2>
          </div>

          <div class="equation-main">IE = IC + IB</div>

          <div class="equation-list">
            <div><strong>IB</strong> = max((VCC - VBE) / RB, 0)</div>
            <div><strong>IC</strong> = min(hFE x IB, (VCC - VCE(sat)) / RC)</div>
            <div><strong>VCE</strong> = VCC - IC x RC</div>
            <div><strong>VRB</strong> = IB x RB</div>
            <div><strong>VRC</strong> = IC x RC</div>
          </div>

          <p class="formula-note">{{ model.regionNote }}</p>
        </section>

        <section class="panel controls-panel">
          <div class="panel-head">
            <p class="panel-kicker">控制項</p>
            <h2>供應與增益</h2>
          </div>

          <div v-for="control in controls" :key="control.key" class="control">
            <div class="control-head">
              <div>
                <span>{{ control.label }}</span>
                <strong>{{ control.format(state[control.key]) }}</strong>
              </div>
              <small>{{ control.hint }}</small>
            </div>

            <input
              v-model.number="state[control.key]"
              class="range"
              type="range"
              :min="control.min"
              :max="control.max"
              :step="control.step"
            />
          </div>
        </section>

        <section class="panel readout-panel">
          <div class="panel-head">
            <p class="panel-kicker">即時讀數</p>
            <h2>節點與電壓降</h2>
          </div>

          <div class="readout-group">
            <h3>節點電壓</h3>
            <div class="readout-grid compact">
              <article v-for="item in nodeReadouts" :key="item.label">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
                <small>{{ item.note }}</small>
              </article>
            </div>
          </div>

          <div class="readout-group">
            <h3>元件與電流</h3>
            <div class="readout-grid">
              <article v-for="item in deviceReadouts" :key="item.label">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
                <small>{{ item.note }}</small>
              </article>
            </div>
          </div>
        </section>

        <section class="panel meter-panel">
          <div class="panel-head">
            <p class="panel-kicker">電流比例</p>
            <h2>IB / IC / IE</h2>
          </div>

          <div class="meter-stack">
            <div v-for="bar in currentBars" :key="bar.label" class="meter-row">
              <div class="meter-topline">
                <span>{{ bar.label }}</span>
                <strong>{{ bar.value }}</strong>
              </div>
              <div class="meter-track">
                <div class="meter-fill" :style="{ width: `${bar.percent}%`, background: bar.color }"></div>
              </div>
              <small>{{ bar.share }}</small>
            </div>
          </div>
        </section>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive } from 'vue'
import BjtBreadboard from '../BjtBreadboard.vue'

const VBE = 0.72
const VCE_SAT = 0.2

const state = reactive({
  vcc: 9,
  rb: 220000,
  rc: 680,
  hfe: 120,
})

const controls = [
  {
    key: 'vcc',
    label: 'VCC',
    hint: '同一顆電池同時驅動 RC 與 RB。',
    min: 3,
    max: 12,
    step: 0.1,
    format: formatVoltage,
  },
  {
    key: 'rb',
    label: 'RB',
    hint: '基極驅動電阻，越小 IB 越大。',
    min: 47000,
    max: 1000000,
    step: 1000,
    format: formatResistance,
  },
  {
    key: 'rc',
    label: 'RC',
    hint: '集極負載電阻，決定 IC 與 VCE。',
    min: 220,
    max: 3300,
    step: 10,
    format: formatResistance,
  },
  {
    key: 'hfe',
    label: 'hFE',
    hint: '晶體管電流增益 β。',
    min: 20,
    max: 300,
    step: 1,
    format: formatBeta,
  },
]

function formatVoltage(value) {
  return `${value.toFixed(2)} V`
}

function formatResistance(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)} MΩ`
  }

  if (value >= 1000) {
    const precision = value >= 100000 ? 0 : 1
    return `${(value / 1000).toFixed(precision)} kΩ`
  }

  return `${value.toFixed(0)} Ω`
}

function formatCurrent(value) {
  const absValue = Math.abs(value)

  if (absValue < 1e-9) {
    return '0 A'
  }

  if (absValue < 1e-3) {
    return `${(absValue * 1e6).toFixed(1)} µA`
  }

  return `${(absValue * 1e3).toFixed(absValue * 1e3 < 10 ? 2 : 1)} mA`
}

function formatBeta(value) {
  return `β = ${value}`
}

const model = computed(() => {
  const ibA = Math.max((state.vcc - VBE) / state.rb, 0)
  const icIdealA = state.hfe * ibA
  const icLimitA = Math.max((state.vcc - VCE_SAT) / state.rc, 0)
  const icA = Math.min(icIdealA, icLimitA)
  const ieA = icA + ibA
  const vrb = ibA * state.rb
  const vrc = icA * state.rc
  const vb = ibA > 0 ? VBE : state.vcc
  const vc = state.vcc - vrc
  const ve = 0
  const vbe = vb - ve
  const vce = vc - ve
  const gainEffective = ibA > 0 ? icA / ibA : 0

  let region = 'cutoff'
  let regionLabel = '截止區'
  let regionNote = 'IB 幾乎為零，晶體管不導通，粒子會停在門前。'

  if (ibA > 0 && icA < icIdealA - 1e-12) {
    region = 'saturation'
    regionLabel = '飽和區'
    regionNote = 'RC 開始限流，IC 不再等於 hFE × IB，粒子在集極側被壓住。'
  } else if (ibA > 0) {
    region = 'active'
    regionLabel = '放大區'
    regionNote = 'IC 約等於 hFE × IB，這是最典型的 BJT 放大工作區。'
  }

  return {
    vcc: state.vcc,
    rb: state.rb,
    rc: state.rc,
    hfe: state.hfe,
    ibA,
    icA,
    ieA,
    icIdealA,
    icLimitA,
    vrb,
    vrc,
    vb,
    vc,
    ve,
    vbe,
    vce,
    gainEffective,
    region,
    regionLabel,
    regionNote,
  }
})

const chips = computed(() => [
  {
    label: '工作區域',
    value: model.value.regionLabel,
    note: model.value.regionNote,
  },
  {
    label: '有效 β',
    value: model.value.ibA > 0 ? `β≈${model.value.gainEffective.toFixed(1)}` : '—',
    note: 'IC / IB',
  },
  {
    label: 'VCE',
    value: formatVoltage(model.value.vce),
    note: '集-射電壓',
  },
])

const nodeReadouts = computed(() => [
  {
    label: 'VB',
    value: formatVoltage(model.value.vb),
    note: '基極節點',
  },
  {
    label: 'VC',
    value: formatVoltage(model.value.vc),
    note: '集極節點',
  },
  {
    label: 'VE',
    value: formatVoltage(model.value.ve),
    note: '射極節點',
  },
])

const deviceReadouts = computed(() => [
  {
    label: 'VBE',
    value: formatVoltage(model.value.vbe),
    note: '基-射壓降',
  },
  {
    label: 'VCE',
    value: formatVoltage(model.value.vce),
    note: '集-射壓降',
  },
  {
    label: 'IB',
    value: formatCurrent(model.value.ibA),
    note: '基極電流',
  },
  {
    label: 'IC',
    value: formatCurrent(model.value.icA),
    note: '集極電流',
  },
  {
    label: 'IE',
    value: formatCurrent(model.value.ieA),
    note: 'IE = IC + IB',
  },
  {
    label: 'VRB',
    value: formatVoltage(model.value.vrb),
    note: 'RB 兩端壓降',
  },
  {
    label: 'VRC',
    value: formatVoltage(model.value.vrc),
    note: 'RC 兩端壓降',
  },
])

const currentBars = computed(() => {
  const total = Math.max(model.value.ieA, 1e-9)

  return [
    {
      key: 'ib',
      label: 'IB',
      value: formatCurrent(model.value.ibA),
      share: `${((model.value.ibA / total) * 100).toFixed(1)}% of IE`,
      percent: Math.max(2, (model.value.ibA / total) * 100),
      color: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    },
    {
      key: 'ic',
      label: 'IC',
      value: formatCurrent(model.value.icA),
      share: `${((model.value.icA / total) * 100).toFixed(1)}% of IE`,
      percent: Math.max(2, (model.value.icA / total) * 100),
      color: 'linear-gradient(90deg, #22d3ee, #38bdf8)',
    },
    {
      key: 'ie',
      label: 'IE',
      value: formatCurrent(model.value.ieA),
      share: '100% of IE',
      percent: 100,
      color: 'linear-gradient(90deg, #34d399, #10b981)',
    },
  ]
})
</script>

<style scoped>
.shell {
  width: min(1400px, calc(100% - 32px));
  margin: 0 auto;
  padding: 34px 0 56px;
  display: grid;
  gap: 22px;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.9fr);
  gap: 18px;
  padding: 28px;
  border: 1px solid rgba(30, 41, 59, 0.18);
  border-radius: 32px;
  background: linear-gradient(135deg, #c7d2e8 0%, #dbe4f5 50%, #d0dfe5 100%);
  box-shadow: 0 32px 90px rgba(3, 7, 18, 0.12);
}

.eyebrow {
  margin: 0 0 12px;
  color: #0891b2;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-shadow: 0 0 16px rgba(8, 145, 178, 0.1);
}

h1 {
  margin: 0;
  max-width: 12ch;
  font-size: clamp(2.4rem, 5vw, 4.8rem);
  line-height: 0.95;
  color: #1e293b;
  text-shadow: 0 10px 30px rgba(255, 255, 255, 0.4);
}

.intro {
  max-width: 58ch;
  margin: 18px 0 0;
  font-size: 1.02rem;
  color: rgba(30, 41, 59, 0.96);
}

.topology {
  margin-top: 18px;
  padding: 16px 18px;
  border: 1px solid rgba(30, 41, 59, 0.18);
  border-radius: 20px;
  background: rgba(226, 232, 240, 0.5);
  box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.04);
}

.topology pre {
  margin: 0;
  color: #334155;
  font-family: var(--font-mono);
  line-height: 1.55;
  white-space: pre-wrap;
}

.hero-stats {
  display: grid;
  gap: 14px;
  align-content: start;
}

.hero-stats article {
  padding: 16px 18px;
  border: 1px solid rgba(30, 41, 59, 0.14);
  border-radius: 20px;
  background: rgba(226, 232, 240, 0.6);
  backdrop-filter: blur(20px);
  box-shadow:
    inset 0 1px 0 rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(3, 7, 18, 0.06);
}

.hero-stats span {
  display: block;
  margin-bottom: 8px;
  color: rgba(30, 41, 59, 0.8);
  font-size: 0.82rem;
}

.hero-stats strong {
  display: block;
  color: #1e293b;
  font-size: 1.34rem;
}

.hero-stats small {
  display: block;
  margin-top: 8px;
  color: rgba(51, 65, 85, 0.88);
  line-height: 1.5;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.95fr);
  gap: 20px;
  align-items: start;
}

.sidebar {
  display: grid;
  gap: 16px;
  position: sticky;
  top: 18px;
  align-self: start;
}

.panel {
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(30, 41, 59, 0.28);
  background: rgba(248, 250, 252, 0.6);
  box-shadow:
    0 24px 60px rgba(3, 7, 18, 0.08),
    0 0 0 1px rgba(30, 41, 59, 0.04);
}

.panel-head {
  margin-bottom: 12px;
}

.panel-kicker {
  margin: 0 0 6px;
  color: #0891b2;
  font-size: 0.76rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.panel-head h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.15rem;
}

.equation-main {
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(6, 78, 59, 0.18);
  background: linear-gradient(135deg, rgba(204, 251, 241, 0.28), rgba(219, 234, 254, 0.18));
  color: #1e293b;
  font-size: 1.45rem;
  font-weight: 800;
  text-align: center;
}

.equation-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.equation-list div {
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(241, 245, 249, 0.76);
  border: 1px solid rgba(30, 41, 59, 0.12);
  color: rgba(30, 41, 59, 0.9);
}

.equation-list strong {
  color: #0891b2;
}

.formula-note {
  margin: 14px 0 0;
  color: rgba(30, 41, 59, 0.86);
  line-height: 1.6;
}

.control {
  padding: 14px 0 0;
  border-top: 1px solid rgba(30, 41, 59, 0.12);
}

.control:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.control-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.control-head span {
  display: block;
  color: rgba(30, 41, 59, 0.82);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.control-head strong {
  display: block;
  margin-top: 4px;
  color: #1e293b;
  font-size: 1.02rem;
}

.control-head small {
  color: rgba(51, 65, 85, 0.76);
  line-height: 1.45;
  max-width: 24ch;
  text-align: right;
}

.range {
  width: 100%;
  margin-top: 12px;
  accent-color: #2dd4bf;
}

.readout-group + .readout-group {
  margin-top: 16px;
}

.readout-group h3 {
  margin: 0 0 10px;
  color: #0891b2;
  font-size: 0.92rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.readout-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.readout-grid.compact {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.readout-grid article {
  padding: 12px;
  border-radius: 18px;
  background: rgba(241, 245, 249, 0.78);
  border: 1px solid rgba(30, 41, 59, 0.12);
}

.readout-grid span {
  display: block;
  color: #0891b2;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
}

.readout-grid strong {
  display: block;
  margin-top: 6px;
  color: #1e293b;
  font-size: 1.08rem;
}

.readout-grid small {
  display: block;
  margin-top: 6px;
  color: rgba(51, 65, 85, 0.8);
  line-height: 1.45;
}

.meter-stack {
  display: grid;
  gap: 14px;
}

.meter-row {
  display: grid;
  gap: 8px;
}

.meter-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.meter-topline span {
  color: #cbd5e1;
  font-size: 0.88rem;
  letter-spacing: 0.08em;
}

.meter-topline strong {
  color: #fff;
  font-size: 0.98rem;
}

.meter-track {
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.meter-fill {
  height: 100%;
  border-radius: inherit;
  box-shadow: 0 0 18px rgba(45, 212, 191, 0.22);
}

.meter-row small {
  color: rgba(203, 213, 225, 0.82);
}

@media (max-width: 1180px) {
  .hero,
  .workspace {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}

@media (max-width: 720px) {
  .shell {
    width: min(100% - 18px, 1400px);
    padding-top: 18px;
  }

  .hero,
  .panel {
    padding: 18px;
    border-radius: 22px;
  }

  .readout-grid,
  .readout-grid.compact {
    grid-template-columns: 1fr;
  }

  .control-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .control-head small {
    max-width: none;
    text-align: left;
  }
}
</style>
