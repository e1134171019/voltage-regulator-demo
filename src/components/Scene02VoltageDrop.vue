<template>
  <section class="scene-grid">
    <div class="timeline-card">
      <div class="card-head">
        <p>壓降分析</p>
        <strong>導線、接點與負載都會吃掉電壓</strong>
      </div>

      <div class="timeline">
        <article v-for="step in voltagePath" :key="step.label" class="step">
          <div class="step-mark"></div>
          <div class="step-body">
            <strong>{{ step.label }}</strong>
            <p>{{ step.description }}</p>
          </div>
          <span>{{ step.voltage }}</span>
        </article>
      </div>
    </div>

    <aside class="drop-card">
      <p class="drop-label">壓降估算</p>
      <strong>0.9 V</strong>
      <p class="drop-note">電線電阻、接點接觸不良與負載電流一起形成損失。</p>
      <ul>
        <li>線材越長，損失越大。</li>
        <li>接點越多，雜訊與壓降越明顯。</li>
        <li>負載電流越高，掉壓越快。</li>
      </ul>
    </aside>
  </section>
</template>

<script setup>
const voltagePath = [
  {
    label: '電源端',
    voltage: '12.0 V',
    description: '電源輸出點的理想電壓。',
  },
  {
    label: '導線末端',
    voltage: '11.5 V',
    description: '線材和接點開始出現明顯損耗。',
  },
  {
    label: '負載端',
    voltage: '11.1 V',
    description: '真正送到電路的有效電壓。',
  },
]
</script>

<style scoped>
.scene-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.85fr);
  gap: 18px;
  align-items: start;
}

.timeline-card,
.drop-card {
  border: 1px solid rgba(194, 65, 12, 0.16);
  border-radius: 22px;
  background: linear-gradient(180deg, #fffaf2, #eef4ff);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
  padding: 18px;
}

.card-head p,
.drop-label {
  margin: 0;
  color: #c2410c;
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

.timeline {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.step {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border: 1px solid rgba(194, 65, 12, 0.12);
  border-radius: 18px;
  background: #fff;
}

.step-mark {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: linear-gradient(180deg, #fb923c, #ea580c);
  box-shadow: 0 0 0 6px rgba(251, 146, 60, 0.2);
}

.step-body strong {
  display: block;
  color: #0f172a;
}

.step-body p {
  margin: 6px 0 0;
  color: #334155;
  line-height: 1.55;
}

.step span {
  color: #c2410c;
  font-weight: 700;
}

.drop-card strong {
  display: block;
  margin: 10px 0 8px;
  color: #9a3412;
  font-size: 2.4rem;
}

.drop-note {
  margin: 0 0 14px;
  color: #334155;
  line-height: 1.55;
}

.drop-card ul {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }

  .step {
    grid-template-columns: 16px minmax(0, 1fr);
  }

  .step span {
    grid-column: 2;
  }
}
</style>
