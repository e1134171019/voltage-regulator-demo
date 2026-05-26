<template>
  <section class="scene-grid">
    <div class="summary-card">
      <div class="card-head">
        <p class="scene-step">SLIDE 09 · 實驗數據</p>
        <h2>把負載、壓降、效率與熱耗散放回同一張表</h2>
      </div>

      <div class="metric-strip">
        <article v-for="metric in metrics" :key="metric.label" class="metric-card">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.note }}</small>
        </article>
      </div>

      <p class="note">
        下表使用目前簡報中的代表性展示數據，目的在於讓觀眾快速抓住
        「負載越重、輸出越下滑、熱耗散越嚴重」這三件事。
      </p>
    </div>

    <div class="table-card">
      <div class="table-head">
        <span class="badge">Load Test Snapshot</span>
        <h3>展示用量測摘要</h3>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>情境</th>
            <th>負載電流</th>
            <th>輸出電壓</th>
            <th>觀察重點</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in loadRows" :key="row.label">
            <td>{{ row.label }}</td>
            <td>{{ row.current }}</td>
            <td>{{ row.voltage }}</td>
            <td>{{ row.note }}</td>
          </tr>
        </tbody>
      </table>

      <div class="line-grid">
        <article v-for="line in lineRows" :key="line.label" class="line-card">
          <span>{{ line.label }}</span>
          <strong>{{ line.value }}</strong>
          <p>{{ line.detail }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
const metrics = [
  {
    label: '最大輸出波動',
    value: '0.41 V',
    note: '從輕載到重載的可見下沉幅度',
  },
  {
    label: '展示效率',
    value: '55.6%',
    note: '以 9V -> 5V 的線性穩壓示意估算',
  },
  {
    label: '熱耗散重點',
    value: 'High',
    note: '壓差乘上負載電流後直接變成熱',
  },
]

const loadRows = [
  {
    label: '輕載',
    current: '120 mA',
    voltage: '5.02 V',
    note: '幾乎維持在目標電壓附近。',
  },
  {
    label: '中載',
    current: '480 mA',
    voltage: '4.89 V',
    note: '開始看見負載造成的明顯壓降。',
  },
  {
    label: '重載',
    current: '860 mA',
    voltage: '4.61 V',
    note: '已接近功率級與散熱能力的邊界。',
  },
]

const lineRows = [
  {
    label: 'Line Regulation',
    value: 'Small Drift',
    detail: '輸入電壓變動時，輸出仍能維持在 5V 附近，但不可能零誤差。',
  },
  {
    label: 'Load Regulation',
    value: 'Visible Sag',
    detail: '負載一加重，輸出就會先下陷，再靠閉迴路拉回。',
  },
  {
    label: 'Thermal Budget',
    value: 'Needs Heatsink',
    detail: '壓差越大、電流越高，2SC1384 需要承受的熱就越多。',
  },
]
</script>

<style scoped>
.scene-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 24px;
  align-items: start;
}

.summary-card,
.table-card {
  padding: 24px;
  border-radius: 28px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(18px);
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.08);
}

.scene-step {
  margin: 0 0 10px;
  color: #0f766e;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #10233a;
  font-size: 1.8rem;
  line-height: 1.12;
}

.metric-strip {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.metric-card {
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #eef7f6);
  border: 1px solid rgba(15, 118, 110, 0.14);
}

.metric-card span {
  display: block;
  color: #0f766e;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.metric-card strong {
  display: block;
  margin-top: 8px;
  color: #10233a;
  font-size: 1.45rem;
}

.metric-card small {
  display: block;
  margin-top: 8px;
  color: #475569;
  line-height: 1.55;
}

.note {
  margin: 18px 0 0;
  color: #475569;
  line-height: 1.7;
}

.table-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.badge {
  padding: 5px 12px;
  border-radius: 999px;
  background: #10233a;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.table-head h3 {
  margin: 0;
  color: #10233a;
  font-size: 1.08rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
  overflow: hidden;
  border-radius: 18px;
}

.data-table th,
.data-table td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  text-align: left;
}

.data-table thead th {
  background: rgba(15, 23, 42, 0.06);
  color: #10233a;
  font-weight: 800;
}

.data-table tbody td {
  color: #334155;
}

.line-grid {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.line-card {
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #eef3fb);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.line-card span {
  display: block;
  color: #0f766e;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.line-card strong {
  display: block;
  margin-top: 8px;
  color: #10233a;
  font-size: 1.08rem;
}

.line-card p {
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 1080px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
}
</style>
