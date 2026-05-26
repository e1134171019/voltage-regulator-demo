<template>
  <section class="scene-grid">
    <div class="intro-card">
      <div class="card-head">
        <p class="scene-step">SLIDE 01 · 開場 + 主題</p>
        <h2>用離散元件做出可觀察的線性穩壓器</h2>
      </div>

      <div class="theory-body">
        <p>
          這份簡報不是單純介紹一顆穩壓 IC，而是把一個經典的
          <strong>BJT 線性穩壓器</strong>拆成可理解、可量測、可視覺化的十個步驟。
        </p>
        <p>
          我們會先從手機錄影造成的負載變化開始，接著一路追到參考電壓、
          誤差放大器、功率電晶體與閉迴路回授，最後再回到量測數據和正式展示網址。
        </p>

        <div class="highlight-box">
          <strong>本次主線：</strong>
          <span>現象 -> 參考 -> 比較 -> 功率 -> 閉迴路 -> 實測</span>
        </div>
      </div>
    </div>

    <div class="route-card">
      <div class="route-head">
        <span>簡報路徑</span>
        <strong>從現象一路走到可部署展示</strong>
      </div>

      <div class="route-list">
        <article v-for="item in routeMap" :key="item.step" class="route-item">
          <div class="route-step">{{ item.step }}</div>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.detail }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
const routeMap = [
  {
    step: '01',
    title: '先看負載變化',
    detail: '手機錄影、瞬時抽載與輸出電壓下滑是整份簡報的起點。',
  },
  {
    step: '02',
    title: '建立參考與比較',
    detail: 'ZD 6.2V 提供基準，μA741 觀察 Vref 與 Vfb 的誤差。',
  },
  {
    step: '03',
    title: '用 2SC1384 放大電流',
    detail: '小訊號控制大電流，讓控制器本身不承受主功率。',
  },
  {
    step: '04',
    title: '回到閉迴路與量測',
    detail: '最後用實驗數據與展示網址把設計、實作與部署串成同一條主線。',
  },
]
</script>

<style scoped>
.scene-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 24px;
  align-items: start;
}

.intro-card,
.route-card {
  padding: 26px;
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
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  line-height: 1.05;
  color: #10233a;
}

.theory-body {
  margin-top: 18px;
  color: #334155;
  font-size: 1rem;
  line-height: 1.78;
}

.highlight-box {
  margin-top: 22px;
  padding: 16px 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(8, 145, 178, 0.06));
  border: 1px solid rgba(20, 184, 166, 0.18);
  display: grid;
  gap: 6px;
}

.highlight-box strong {
  color: #0f172a;
}

.highlight-box span {
  color: #0f766e;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.route-head span {
  display: block;
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.route-head strong {
  display: block;
  margin-top: 8px;
  color: #10233a;
  font-size: 1.18rem;
}

.route-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.route-item {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #eef8f8);
  border: 1px solid rgba(15, 118, 110, 0.12);
}

.route-step {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0f766e, #0891b2);
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.route-item h3 {
  margin: 0;
  color: #10233a;
  font-size: 1rem;
}

.route-item p {
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 960px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
}
</style>
