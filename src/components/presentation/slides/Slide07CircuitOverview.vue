<template>
  <section class="scene-grid">
    <div class="theory-card">
      <div class="card-head">
        <p class="scene-step">SLIDE 07 · 原電路圖全覽</p>
        <h2>把 ZD、μA741、2SC1384 與回授分壓接成完整電路</h2>
      </div>

      <div class="theory-body">
        <p>
          到這一頁為止，所有零件都已經各自說明完畢。現在把它們組合起來，
          就會得到一個完整的離散式線性穩壓器。
        </p>

        <div class="block-list">
          <article v-for="block in circuitBlocks" :key="block.title" class="block-card">
            <span>{{ block.kicker }}</span>
            <strong>{{ block.title }}</strong>
            <p>{{ block.detail }}</p>
          </article>
        </div>
      </div>
    </div>

    <div class="visual-card">
      <div class="visual-header">
        <span class="badge">Original Circuit Overview</span>
        <h3>參考、比較、功率、回授一次看清楚</h3>
      </div>

      <svg viewBox="0 0 760 430" class="circuit-svg" aria-label="Linear regulator full overview">
        <defs>
          <pattern id="grid-07-overview" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(148, 163, 184, 0.07)" stroke-width="1" />
          </pattern>
        </defs>

        <rect width="760" height="430" rx="28" fill="url(#grid-07-overview)" />

        <path d="M 72 82 L 590 82" stroke="#f97316" stroke-width="6" fill="none" />
        <path d="M 590 82 L 590 120" stroke="#f97316" stroke-width="6" fill="none" />
        <path d="M 590 214 L 590 304 L 664 304" stroke="#34d399" stroke-width="7" fill="none" />
        <path d="M 664 304 L 664 350" stroke="#34d399" stroke-width="7" fill="none" />

        <path d="M 154 256 L 300 256" stroke="#38bdf8" stroke-width="4" fill="none" />
        <path d="M 452 256 L 530 256 L 530 162" stroke="#38bdf8" stroke-width="4" fill="none" />

        <path d="M 664 304 L 664 170 L 708 170" stroke="#cbd5e1" stroke-width="3.5" fill="none" />
        <path d="M 708 170 L 708 224" stroke="#cbd5e1" stroke-width="3.5" fill="none" />
        <path d="M 708 224 L 708 304" stroke="#cbd5e1" stroke-width="3.5" fill="none" />

        <path d="M 92 304 L 708 304" stroke="#94a3b8" stroke-width="4" fill="none" />
        <path d="M 92 304 L 92 340" stroke="#94a3b8" stroke-width="4" fill="none" />
        <path d="M 82 340 L 102 340 M 86 348 L 98 348 M 90 356 L 94 356" stroke="#94a3b8" stroke-width="2" fill="none" />

        <circle cx="72" cy="82" r="20" fill="#0f172a" stroke="#f97316" stroke-width="3" />
        <text x="72" y="87" text-anchor="middle" class="source-label">Vin</text>

        <rect x="210" y="62" width="86" height="40" rx="14" fill="#111827" stroke="#fbbf24" stroke-width="2.5" />
        <text x="253" y="87" text-anchor="middle" class="part-label">Rs</text>

        <g transform="translate(110 256)">
          <circle cx="0" cy="0" r="20" fill="#0f172a" stroke="#22c55e" stroke-width="3" />
          <text x="0" y="5" text-anchor="middle" class="small-label">6.2V</text>
        </g>
        <text x="110" y="226" text-anchor="middle" class="callout-green">ZD 參考</text>

        <g transform="translate(376 256)">
          <path d="M -58 -48 L 58 0 L -58 48 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="3" />
          <text x="-36" y="-16" class="amp-mark">-</text>
          <text x="-36" y="22" class="amp-mark plus">+</text>
          <text x="-8" y="-2" class="part-label">μA741</text>
        </g>

        <g transform="translate(590 168)">
          <circle cx="0" cy="0" r="44" fill="#0f172a" stroke="#f59e0b" stroke-width="3" />
          <path d="M -18 -18 L -18 18" stroke="#fff" stroke-width="3.5" />
          <path d="M -18 -10 L 16 -30 L 16 -48" stroke="#fff" stroke-width="2.5" fill="none" />
          <path d="M -18 10 L 16 30 L 16 48" stroke="#fff" stroke-width="2.5" fill="none" />
          <path d="M 2 24 L 16 30 L 4 36 Z" fill="#fff" />
          <text x="0" y="80" text-anchor="middle" class="callout-amber">2SC1384</text>
        </g>

        <rect x="684" y="152" width="48" height="34" rx="10" fill="#111827" stroke="#cbd5e1" stroke-width="2" />
        <text x="708" y="174" text-anchor="middle" class="part-label">R1</text>
        <rect x="684" y="206" width="48" height="34" rx="10" fill="#111827" stroke="#cbd5e1" stroke-width="2" />
        <text x="708" y="228" text-anchor="middle" class="part-label">R2</text>

        <rect x="638" y="332" width="52" height="34" rx="10" fill="#111827" stroke="#34d399" stroke-width="2.5" />
        <text x="664" y="354" text-anchor="middle" class="part-label">Load</text>

        <text x="322" y="234" class="callout-blue">比較 Vref 與 Vfb</text>
        <text x="490" y="286" class="callout-blue">Base drive</text>
        <text x="614" y="86" class="callout-amber">功率通道</text>
        <text x="554" y="326" class="callout-green">Regulated Vout</text>
      </svg>
    </div>
  </section>
</template>

<script setup>
const circuitBlocks = [
  {
    kicker: 'Reference',
    title: 'ZD 6.2V 建立基準',
    detail: '先用齊納二極體把一個穩定的參考點立起來，讓後面的比較器有固定目標可追。',
  },
  {
    kicker: 'Compare',
    title: 'μA741 放大誤差',
    detail: '741 不直接供電給負載，它的工作是把 Vref 與 Vfb 的細小差值放大成控制信號。',
  },
  {
    kicker: 'Power',
    title: '2SC1384 承擔主電流',
    detail: '功率電晶體替控制器扛住輸入與輸出之間的壓差與發熱，讓大電流能安全通過。',
  },
  {
    kicker: 'Feedback',
    title: 'R1 / R2 把輸出送回比較端',
    detail: '回授分壓決定目標輸出與誤差方向，整個閉迴路就是靠這條線維持平衡。',
  },
]
</script>

<style scoped>
.scene-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.15fr);
  gap: 24px;
  align-items: start;
}

.theory-card,
.visual-card {
  padding: 24px;
  border-radius: 28px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(18px);
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.08);
}

.scene-step {
  margin: 0 0 10px;
  color: #b45309;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #10233a;
  font-size: 1.9rem;
  line-height: 1.12;
}

.theory-body {
  margin-top: 18px;
  color: #334155;
  line-height: 1.75;
}

.block-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.block-card {
  padding: 15px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fffdf9, #eef4f8);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.block-card span {
  display: block;
  color: #0f766e;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.block-card strong {
  display: block;
  margin-top: 8px;
  color: #10233a;
}

.block-card p {
  margin: 8px 0 0;
  color: #475569;
}

.visual-header {
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

.visual-header h3 {
  margin: 0;
  color: #10233a;
  font-size: 1.08rem;
}

.circuit-svg {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 24px;
  background: radial-gradient(circle at top, #172554 0%, #0f172a 56%, #111827 100%);
  box-shadow: inset 0 8px 24px rgba(0, 0, 0, 0.35);
}

.source-label,
.part-label,
.small-label,
.amp-mark,
.callout-green,
.callout-blue,
.callout-amber {
  font-family: Aptos, 'Segoe UI', sans-serif;
}

.source-label {
  fill: #f97316;
  font-size: 14px;
  font-weight: 800;
}

.part-label {
  fill: #fff;
  font-size: 13px;
  font-weight: 700;
}

.small-label {
  fill: #22c55e;
  font-size: 12px;
  font-weight: 800;
}

.amp-mark {
  fill: #f43f5e;
  font-size: 18px;
  font-weight: 800;
}

.amp-mark.plus {
  fill: #34d399;
}

.callout-green {
  fill: #34d399;
  font-size: 16px;
  font-weight: 800;
}

.callout-blue {
  fill: #38bdf8;
  font-size: 14px;
  font-weight: 800;
}

.callout-amber {
  fill: #f59e0b;
  font-size: 15px;
  font-weight: 800;
}

@media (max-width: 1080px) {
  .scene-grid {
    grid-template-columns: 1fr;
  }
}
</style>
