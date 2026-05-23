<template>
  <section class="scene-grid">
    <div class="diagram-card">
      <div class="card-head">
        <p>穩壓電路</p>
        <strong>把輸入、濾波、穩壓與輸出串成一條路</strong>
      </div>

      <div class="circuit-flow">
        <article v-for="stage in stages" :key="stage.step" class="stage">
          <span>{{ stage.step }}</span>
          <strong>{{ stage.title }}</strong>
          <p>{{ stage.description }}</p>
        </article>
      </div>
    </div>

    <aside class="notes-card">
      <h3>設計重點</h3>
      <ul>
        <li>輸入電容可抑制突波與瞬間下陷。</li>
        <li>穩壓器需要保留 dropout margin。</li>
        <li>輸出電容會影響暫態響應。</li>
      </ul>
    </aside>
  </section>
</template>

<script setup>
const stages = [
  {
    step: 'A',
    title: '輸入電源',
    description: '提供原始電壓，通常先會有雜訊與波動。',
  },
  {
    step: 'B',
    title: '濾波電容',
    description: '吸收短時間脈動，讓穩壓器更容易工作。',
  },
  {
    step: 'C',
    title: '穩壓器',
    description: '根據回授回路調整輸出，盡量固定電壓。',
  },
  {
    step: 'D',
    title: '負載輸出',
    description: '把穩定後的電壓送給實際電路使用。',
  },
]
</script>

<style scoped>
.scene-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.9fr);
  gap: 18px;
  align-items: start;
}

.diagram-card,
.notes-card {
  border: 1px solid rgba(29, 78, 216, 0.18);
  border-radius: 22px;
  background: linear-gradient(180deg, #f5fbff, #eaf6ef);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.1);
  padding: 18px;
}

.card-head p,
.notes-card h3 {
  margin: 0;
}

.card-head p {
  color: #1d4ed8;
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

.circuit-flow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.stage {
  position: relative;
  min-height: 220px;
  border: 1px solid rgba(29, 78, 216, 0.14);
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #f4f8ff);
  padding: 14px;
}

.stage:not(:last-child)::after {
  content: '→';
  position: absolute;
  top: 50%;
  right: -14px;
  transform: translate(50%, -50%);
  color: #1d4ed8;
  font-size: 1.2rem;
  font-weight: 700;
}

.stage span {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  color: #1d4ed8;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(191, 219, 254, 1), rgba(219, 234, 254, 0.98));
}

.stage strong {
  display: block;
  margin: 12px 0 8px;
  color: #0f172a;
}

.stage p {
  margin: 0;
  color: #475569;
  line-height: 1.55;
}

.notes-card {
  display: grid;
  gap: 12px;
}

.notes-card h3 {
  color: #0f172a;
  font-size: 1.1rem;
}

.notes-card ul {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }

  .circuit-flow {
    grid-template-columns: 1fr;
  }

  .stage {
    min-height: auto;
  }

  .stage:not(:last-child)::after {
    content: '↓';
    top: auto;
    right: 50%;
    bottom: -18px;
    transform: translate(50%, 50%);
  }
}
</style>
