<template>
  <div class="lab-shell">
    <header class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Vue Showcase Site</p>
        <h1>線性穩壓器 Vue 互動展示站</h1>
        <p class="intro">
          這個網站把簡報中的動畫、量測與麵包板模組拆成可單獨操作的 Vue 元件，
          讓你可以直接切換觀察重點，而不是被固定頁次推著走。
        </p>
      </div>

      <div class="hero-panels">
        <article>
          <span>模組數量</span>
          <strong>{{ modules.length }}</strong>
          <small>概念、控制、功率、回授與麵包板全部拆開展示。</small>
        </article>
        <article>
          <span>當前焦點</span>
          <strong>{{ activeModule.label }}</strong>
          <small>{{ activeModule.summary }}</small>
        </article>
      </div>
    </header>

    <main class="workspace">
      <aside class="module-rail">
        <div class="rail-head">
          <p>Module Directory</p>
          <strong>選擇一個 Vue 模組單獨檢視</strong>
        </div>

        <button
          v-for="module in modules"
          :key="module.id"
          class="module-button"
          :class="{ active: activeModuleId === module.id }"
          @click="activeModuleId = module.id"
        >
          <span>{{ module.kicker }}</span>
          <strong>{{ module.label }}</strong>
          <small>{{ module.short }}</small>
        </button>
      </aside>

      <section class="module-stage">
        <div class="stage-head">
          <div>
            <p class="stage-kicker">{{ activeModule.kicker }} · {{ activeModule.category }}</p>
            <h2>{{ activeModule.label }}</h2>
          </div>
          <p class="stage-summary">{{ activeModule.summary }}</p>
        </div>

        <component :is="activeModule.component" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, markRaw, ref } from 'vue'
import Scene01Concept from '@shared/components/scenes/Scene01Concept.vue'
import Scene02PhoneLoad from '@shared/components/scenes/Scene02PhoneLoad.vue'
import Scene05ZenerDiode from '@shared/components/scenes/Scene05ZenerDiode.vue'
import Scene06OpAmp from '@shared/components/scenes/Scene06OpAmp.vue'
import Scene07PowerTransistor from '@shared/components/scenes/Scene07PowerTransistor.vue'
import Scene08NegativeFeedback from '@shared/components/scenes/Scene08NegativeFeedback.vue'
import Scene09ExperimentData from '@shared/components/scenes/Scene09ExperimentData.vue'
import BjtLabExperience from '@shared/components/lab/BjtLabExperience.vue'
import FritzingPartViewer from '@shared/components/lab/FritzingPartViewer.vue'

const modules = [
  {
    id: 'fritzing',
    kicker: 'Lab 00',
    label: 'Fritzing Part Viewer',
    short: '直接讀 public 裡的 `.fzpz`，還原 breadboard SVG 與 connector。',
    summary: '這是把 Fritzing 元件正式拉進 Vue runtime 的第一步，後面才能接 placement、wire 與動畫。',
    category: 'Asset Pipeline',
    component: markRaw(FritzingPartViewer),
  },
  {
    id: 'phone',
    kicker: 'Scene 02',
    label: '手機錄影負載',
    short: '用動態情境看手機抽載造成的電壓挑戰。',
    summary: '把「手機開始錄影」這件事轉成負載驟增的可視化動畫。',
    category: 'Dynamic Load',
    component: markRaw(Scene02PhoneLoad),
  },
  {
    id: 'zener',
    kicker: 'Scene 04',
    label: 'ZD 6.2V 參考電壓',
    short: '觀察齊納二極體如何建立穩定基準點。',
    summary: '這個模組專注在 Zener 並聯穩壓與運作點的關係。',
    category: 'Reference',
    component: markRaw(Scene05ZenerDiode),
  },
  {
    id: 'opamp',
    kicker: 'Scene 05',
    label: 'μA741 比較控制',
    short: '用滑桿直接比較 Vref 與 Vfb 的差值。',
    summary: '看 741 如何把極小誤差放大成足以驅動功率級的控制輸出。',
    category: 'Error Amplifier',
    component: markRaw(Scene06OpAmp),
  },
  {
    id: 'power',
    kicker: 'Scene 06',
    label: '2SC1384 功率級',
    short: '把小電流控制放大成主輸出電流。',
    summary: '觀察 Ib、Ic、Ie 的比例關係，以及功率電晶體為何必要。',
    category: 'Power Stage',
    component: markRaw(Scene07PowerTransistor),
  },
  {
    id: 'feedback',
    kicker: 'Scene 08',
    label: '閉迴路負回授',
    short: '從暫態擾動看 Vout 被拉回目標值的過程。',
    summary: '這一頁把參考、比較、功率與回授合在同一個動態閉迴路裡。',
    category: 'Closed Loop',
    component: markRaw(Scene08NegativeFeedback),
  },
  {
    id: 'experiment',
    kicker: 'Scene 09',
    label: '量測與熱耗散',
    short: '直接拉動 Vin、Rload、溫度，觀察效率與發熱。',
    summary: '這個模組讓展示站保留實驗感，不只停留在概念圖。',
    category: 'Measurement',
    component: markRaw(Scene09ExperimentData),
  },
  {
    id: 'breadboard',
    kicker: 'Lab 01',
    label: 'BJT 麵包板主模組',
    short: '完整麵包板、粒子流與工作區域判斷。',
    summary: '把 BJT 導線、偏壓與工作區域整合成可操作的展示主舞台。',
    category: 'Breadboard',
    component: markRaw(BjtLabExperience),
  },
  {
    id: 'concept',
    kicker: 'Scene 01',
    label: '穩壓任務與雜訊抑制',
    short: '保留原本的概念動畫，專看輸入雜訊與乾淨輸出。',
    summary: '如果想先回到最抽象的「為什麼需要穩壓」，可以從這個模組重看。',
    category: 'Concept',
    component: markRaw(Scene01Concept),
  },
]

const activeModuleId = ref('phone')

const activeModule = computed(() => {
  return modules.find((module) => module.id === activeModuleId.value) ?? modules[0]
})
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(html) {
  color-scheme: light;
}

:global(body) {
  margin: 0;
  min-height: 100vh;
  font-family: Aptos, 'Segoe UI', 'Noto Sans TC', sans-serif;
  background:
    radial-gradient(circle at top left, rgba(250, 204, 21, 0.18), transparent 26%),
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.16), transparent 28%),
    linear-gradient(180deg, #fffaf0 0%, #f4f7fb 54%, #e9eff8 100%);
  color: #12253f;
}

:global(button),
:global(input) {
  font: inherit;
}

.lab-shell {
  width: min(1520px, calc(100% - 28px));
  margin: 0 auto;
  padding: 24px 0 40px;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.9fr);
  gap: 20px;
  padding: 28px;
  border-radius: 32px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(246, 250, 255, 0.74)),
    radial-gradient(circle at right top, rgba(16, 185, 129, 0.14), transparent 34%);
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.1);
}

.eyebrow {
  margin: 0 0 12px;
  color: #b45309;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  max-width: 12ch;
  font-size: clamp(2.5rem, 5vw, 4.9rem);
  line-height: 0.92;
  color: #12253f;
}

.intro {
  max-width: 60ch;
  margin: 18px 0 0;
  color: #475569;
  font-size: 1.02rem;
  line-height: 1.72;
}

.hero-panels {
  display: grid;
  gap: 14px;
  align-content: start;
}

.hero-panels article {
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.hero-panels span {
  display: block;
  color: #0f766e;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-panels strong {
  display: block;
  margin-top: 8px;
  color: #12253f;
  font-size: 1.32rem;
}

.hero-panels small {
  display: block;
  margin-top: 8px;
  color: #475569;
  line-height: 1.5;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
  gap: 20px;
  margin-top: 20px;
  align-items: start;
}

.module-rail {
  position: sticky;
  top: 18px;
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 28px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.08);
}

.rail-head p {
  margin: 0;
  color: #b45309;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.rail-head strong {
  display: block;
  margin-top: 8px;
  color: #12253f;
  font-size: 1.1rem;
  line-height: 1.4;
}

.module-button {
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #f9fbff);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.module-button span {
  display: block;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.module-button strong {
  display: block;
  margin-top: 8px;
  color: #12253f;
  font-size: 0.98rem;
}

.module-button small {
  display: block;
  margin-top: 8px;
  color: #64748b;
  line-height: 1.45;
}

.module-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
}

.module-button.active {
  border-color: rgba(8, 145, 178, 0.42);
  background: linear-gradient(135deg, rgba(230, 247, 255, 0.96), rgba(238, 251, 246, 0.94));
  box-shadow: 0 16px 34px rgba(8, 145, 178, 0.12);
}

.module-stage {
  display: grid;
  gap: 18px;
}

.stage-head {
  display: grid;
  gap: 12px;
  padding: 22px 24px;
  border-radius: 28px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.08);
}

.stage-kicker {
  margin: 0 0 8px;
  color: #b45309;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.stage-head h2 {
  margin: 0;
  color: #12253f;
  font-size: 1.7rem;
}

.stage-summary {
  margin: 0;
  max-width: 64ch;
  color: #475569;
  line-height: 1.68;
}

@media (max-width: 1080px) {
  .hero,
  .workspace {
    grid-template-columns: 1fr;
  }

  .module-rail {
    position: static;
  }
}

@media (max-width: 720px) {
  .lab-shell {
    width: min(100% - 16px, 1520px);
    padding-top: 16px;
  }

  .hero,
  .module-rail,
  .stage-head {
    padding: 18px;
    border-radius: 24px;
  }
}
</style>
