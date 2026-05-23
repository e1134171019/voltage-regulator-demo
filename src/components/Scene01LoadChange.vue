<template>
  <section class="scene-grid">
    <div class="visual-card">
      <div class="card-head">
        <p>負載越重，輸出越容易下滑</p>
        <strong>電流增加，電壓下降</strong>
      </div>

      <div class="bars">
        <article v-for="item in loadProfile" :key="item.label" class="bar-card">
          <div class="bar-track">
            <div class="bar-fill" :style="{ height: `${item.fill}%` }"></div>
          </div>
          <h3>{{ item.label }}</h3>
          <p>{{ item.current }}</p>
          <small>{{ item.note }}</small>
        </article>
      </div>
    </div>

    <aside class="insights">
      <article v-for="item in insights" :key="item.label" class="insight-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.detail }}</p>
      </article>
    </aside>
  </section>
</template>

<script setup>
const loadProfile = [
  {
    label: '輕載',
    current: '120 mA / 5.02 V',
    fill: 92,
    note: '幾乎沒有壓降。',
  },
  {
    label: '中載',
    current: '480 mA / 4.89 V',
    fill: 74,
    note: '開始看見輸出下滑。',
  },
  {
    label: '重載',
    current: '860 mA / 4.61 V',
    fill: 52,
    note: '接近電源極限。',
  },
]

const insights = [
  {
    label: '輸出波動',
    value: '0.41 V',
    detail: '負載越重，穩壓裕量越容易被吃掉。',
  },
  {
    label: '調整時間',
    value: '18 ms',
    detail: '補償迴路需要時間恢復到新平衡。',
  },
]
</script>

<style scoped>
.scene-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.9fr);
  gap: 18px;
  align-items: start;
}

.visual-card,
.insight-card {
  border: 1px solid rgba(13, 148, 136, 0.18);
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #eafbf7);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
  padding: 18px;
}

.card-head p {
  margin: 0;
  color: #0f766e;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.card-head strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 1.15rem;
}

.bars {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.bar-card {
  border: 1px solid rgba(13, 148, 136, 0.12);
  border-radius: 18px;
  background: #ffffff;
  padding: 14px;
}

.bar-track {
  height: 180px;
  display: flex;
  align-items: flex-end;
  padding: 10px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(15, 118, 110, 0.2), rgba(15, 118, 110, 0.05));
}

.bar-fill {
  width: 100%;
  min-height: 18%;
  border-radius: 14px 14px 10px 10px;
  background: linear-gradient(180deg, #34d399, #0f766e);
  box-shadow: 0 10px 20px rgba(15, 118, 110, 0.28);
  transition: height 0.3s ease;
}

.bar-card h3 {
  margin: 14px 0 4px;
  color: #0f172a;
}

.bar-card p {
  margin: 0;
  color: #0f766e;
  font-weight: 700;
}

.bar-card small {
  display: block;
  margin-top: 8px;
  color: #475569;
  line-height: 1.5;
}

.insights {
  display: grid;
  gap: 14px;
}

.insight-card {
  min-height: 138px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.insight-card span {
  color: #0f766e;
  font-size: 0.88rem;
}

.insight-card strong {
  display: block;
  margin: 10px 0 6px;
  color: #0f172a;
  font-size: 1.6rem;
}

.insight-card p {
  margin: 0;
  color: #334155;
  line-height: 1.55;
}

@media (max-width: 900px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }

  .bars {
    grid-template-columns: 1fr;
  }
}
</style>
