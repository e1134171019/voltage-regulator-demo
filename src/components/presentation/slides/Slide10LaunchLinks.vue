<template>
  <section class="scene-grid">
    <div class="summary-card">
      <div class="card-head">
        <p class="scene-step">SLIDE 10 · 結論 + 展示網址</p>
        <h2>這個專案現在正式分成兩條展示路徑</h2>
      </div>

      <div class="summary-body">
        <p>
          第一條是<strong>簡報站</strong>，負責用敘事順序帶觀眾理解整個線性穩壓器。
          第二條是<strong>Vue 互動展示站</strong>，把各個動畫與可視化模組拆開來單獨操作。
        </p>
        <p>
          這樣做的好處是：簡報不再被互動控制打斷，互動站也不必被頁次綁死，
          兩邊都能維持更乾淨的資訊結構。
        </p>

        <div class="takeaway-list">
          <article v-for="item in takeaways" :key="item.title" class="takeaway-card">
            <strong>{{ item.title }}</strong>
            <p>{{ item.detail }}</p>
          </article>
        </div>
      </div>
    </div>

    <div class="links-card">
      <div class="links-head">
        <span class="badge">Deployment Map</span>
        <h3>展示網址與正式交付位置</h3>
      </div>

      <div class="link-list">
        <article v-for="item in links" :key="item.label" class="link-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <a v-if="item.href" :href="item.href" target="_blank" rel="noreferrer">{{ item.href }}</a>
          <p>{{ item.note }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
const takeaways = [
  {
    title: '簡報站負責敘事',
    detail: '頁次固定，依照現象、元件、閉迴路與量測一路講完。',
  },
  {
    title: 'Vue 展示站負責互動',
    detail: '動畫與模組單獨操作，不必被投影片切換節奏綁住。',
  },
  {
    title: 'GitHub 繼續當正式來源',
    detail: '兩個站都從同一個 repo 拆出，但對應不同的入口與部署設定。',
  },
]

const links = [
  {
    label: '簡報站',
    value: 'voltage-regulator-demo.vercel.app',
    href: 'https://voltage-regulator-demo.vercel.app',
    note: '既有 Vercel production，這次更新會直接覆蓋到同一個正式網址。',
  },
  {
    label: '既有 Vercel 專案',
    value: 'voltage-regulator-demo',
    href: 'https://vercel.com',
    note: '目前 `.vercel/project.json` 已綁定 root project，presentation 站沿用這個部署來源。',
  },
  {
    label: 'Vue 互動展示站',
    value: 'lab/ 尚未接上獨立 Vercel',
    href: '',
    note: '目前已拆出獨立入口與 build，但還沒有第二個正式 Vercel 網址。',
  },
  {
    label: 'GitHub Repo',
    value: 'e1134171019/voltage-regulator-demo',
    href: 'https://github.com/e1134171019/voltage-regulator-demo',
    note: '兩個站共用同一份原始碼，分別走各自入口與 build。',
  },
]
</script>

<style scoped>
.scene-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 24px;
  align-items: start;
}

.summary-card,
.links-card {
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
  font-size: 1.84rem;
  line-height: 1.12;
}

.summary-body {
  margin-top: 18px;
  color: #334155;
  line-height: 1.74;
}

.takeaway-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.takeaway-card {
  padding: 15px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #eef8f6);
  border: 1px solid rgba(15, 118, 110, 0.14);
}

.takeaway-card strong {
  color: #10233a;
}

.takeaway-card p {
  margin: 8px 0 0;
  color: #475569;
}

.links-head {
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

.links-head h3 {
  margin: 0;
  color: #10233a;
  font-size: 1.08rem;
}

.link-list {
  display: grid;
  gap: 14px;
}

.link-card {
  padding: 16px 18px;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff, #eef3fb);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.link-card span {
  display: block;
  color: #0f766e;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.link-card strong {
  display: block;
  margin-top: 8px;
  color: #10233a;
  font-size: 1.06rem;
}

.link-card a {
  display: inline-block;
  margin-top: 8px;
  color: #0369a1;
  font-weight: 700;
  text-decoration: none;
  word-break: break-all;
}

.link-card p {
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
