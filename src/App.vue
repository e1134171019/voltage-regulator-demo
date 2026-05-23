<template>
  <main class="app-shell">
    <section class="hero">
      <p class="eyebrow">Voltage Regulator Demo</p>
      <h1>電壓穩定示範面板</h1>
      <p class="intro">
        透過三個場景，快速對照負載變化、壓降與穩壓電路的作用。
      </p>
      <div class="metrics">
        <article>
          <span>輸入</span>
          <strong>12V</strong>
        </article>
        <article>
          <span>輸出</span>
          <strong>5V</strong>
        </article>
        <article>
          <span>目標</span>
          <strong>穩定</strong>
        </article>
      </div>
    </section>

    <section class="demo">
      <div class="scene-tabs" role="tablist" aria-label="Demo scenes">
        <button
          v-for="scene in scenes"
          :key="scene.id"
          type="button"
          class="scene-tab"
          :class="{ active: scene.id === activeSceneId }"
          @click="activeSceneId = scene.id"
        >
          <span class="scene-index">{{ scene.index }}</span>
          <span>
            <strong>{{ scene.title }}</strong>
            <small>{{ scene.subtitle }}</small>
          </span>
        </button>
      </div>

      <div class="scene-panel">
        <header class="scene-header">
          <div>
            <p class="scene-kicker">{{ activeScene.phase }}</p>
            <h2>{{ activeScene.title }}</h2>
          </div>
          <p class="scene-summary">
            {{ activeScene.summary }}
          </p>
        </header>

        <component :is="activeScene.component" />
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import Scene01LoadChange from './components/Scene01LoadChange.vue'
import Scene02VoltageDrop from './components/Scene02VoltageDrop.vue'
import Scene03RegulatorCircuit from './components/Scene03RegulatorCircuit.vue'

const scenes = [
  {
    id: 'load',
    index: '01',
    title: '負載變化',
    subtitle: '電流增加時的輸出反應',
    phase: 'Scene 01',
    summary: '觀察同一顆電源在不同負載下，輸出電壓如何被拉低。',
    component: Scene01LoadChange,
  },
  {
    id: 'drop',
    index: '02',
    title: '壓降分析',
    subtitle: '導線與接點造成的能量損失',
    phase: 'Scene 02',
    summary: '從電源到負載的路徑上，找出最容易掉壓的位置。',
    component: Scene02VoltageDrop,
  },
  {
    id: 'regulator',
    index: '03',
    title: '穩壓電路',
    subtitle: '用電路把輸出固定住',
    phase: 'Scene 03',
    summary: '把輸入、濾波、穩壓與輸出階段串起來，理解穩壓器的角色。',
    component: Scene03RegulatorCircuit,
  },
]

const activeSceneId = ref(scenes[0].id)
const activeScene = computed(
  () => scenes.find((scene) => scene.id === activeSceneId.value) ?? scenes[0],
)
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
  font-family: Inter, 'Segoe UI', 'Noto Sans TC', sans-serif;
  background:
    radial-gradient(circle at 20% 12%, rgba(45, 212, 191, 0.28), transparent 28%),
    radial-gradient(circle at 85% 8%, rgba(96, 165, 250, 0.18), transparent 22%),
    linear-gradient(180deg, #030712 0%, #0f172a 34%, #f6efe6 34%, #f6efe6 100%);
  color: #0f172a;
}

:global(body)::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.5), transparent 80%);
}

:global(button) {
  font: inherit;
}

.app-shell {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 40px 0 56px;
  display: grid;
  gap: 28px;
}

.hero {
  position: relative;
  overflow: hidden;
  color: #f8fafc;
  padding: 28px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 32px;
  background:
    radial-gradient(circle at 18% 18%, rgba(45, 212, 191, 0.42), transparent 24%),
    radial-gradient(circle at 88% 12%, rgba(56, 189, 248, 0.28), transparent 18%),
    linear-gradient(135deg, #020617 0%, #0f172a 48%, #134e4a 100%);
  box-shadow: 0 28px 80px rgba(3, 7, 18, 0.36);
}

.eyebrow {
  margin: 0 0 12px;
  color: #99f6e4;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-shadow: 0 0 16px rgba(153, 246, 228, 0.18);
}

h1 {
  margin: 0;
  max-width: 9ch;
  font-size: clamp(2.6rem, 5vw, 5rem);
  line-height: 0.95;
  text-shadow: 0 10px 30px rgba(3, 7, 18, 0.32);
}

.intro {
  max-width: 56ch;
  margin: 18px 0 0;
  font-size: 1.02rem;
  color: rgba(226, 232, 240, 0.95);
}

.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 24px;
}

.metrics article {
  min-width: 128px;
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(20px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 8px 24px rgba(3, 7, 18, 0.14);
}

.metrics span {
  display: block;
  margin-bottom: 8px;
  color: rgba(226, 232, 240, 0.82);
  font-size: 0.82rem;
}

.metrics strong {
  color: #fff;
  font-size: 1.4rem;
}

.demo {
  display: grid;
  gap: 18px;
}

.scene-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.scene-tab {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.scene-tab:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 118, 110, 0.35);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.12);
}

.scene-tab.active {
  border-color: rgba(13, 148, 136, 0.78);
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.98), rgba(239, 246, 255, 0.98));
  box-shadow: 0 18px 34px rgba(15, 118, 110, 0.16);
}

.scene-index {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  flex: none;
  font-weight: 700;
  color: #0f766e;
  background: linear-gradient(135deg, rgba(153, 246, 228, 1), rgba(191, 219, 254, 0.98));
}

.scene-tab strong,
.scene-tab small {
  display: block;
}

.scene-tab strong {
  color: #0f172a;
  font-size: 1rem;
}

.scene-tab small {
  margin-top: 2px;
  color: #475569;
}

.scene-panel {
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);
}

.scene-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.scene-kicker {
  margin: 0 0 8px;
  color: #0f766e;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.scene-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.6rem, 3vw, 2.5rem);
}

.scene-summary {
  margin: 0;
  max-width: 34ch;
  color: #334155;
}

@media (max-width: 900px) {
  .scene-tabs {
    grid-template-columns: 1fr;
  }

  .scene-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .app-shell {
    width: min(100% - 20px, 1180px);
    padding-top: 24px;
  }

  .scene-panel {
    padding: 18px;
    border-radius: 24px;
  }

  h1 {
    max-width: none;
  }
}
</style>
