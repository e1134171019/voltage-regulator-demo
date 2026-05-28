<template>
  <div class="presentation-container" :class="{ immersive: isImmersiveSlide }">
    <!-- Main Workspace -->
    <main ref="workspaceRef" class="presentation-workspace" :class="{ immersive: isImmersiveSlide }">
      <!-- Transition wrapper for slides -->
      <transition name="slide-fade" mode="out-in">
        <div class="slide-frame" :key="currentSlide" :style="slideFrameStyle">
          <div class="slide-surface">
            <component :is="activeSlideComponent" v-bind="activeSlide.props || {}" />
          </div>
        </div>
      </transition>
    </main>

    <!-- Footer Controls -->
    <footer class="presentation-footer" :class="{ immersive: isImmersiveSlide }">
      <!-- Left: Slide Outline Drawer/Selector Toggle -->
      <div class="footer-left">
        <div class="selector-wrapper">
          <select v-model="currentSlide" class="slide-dropdown">
            <option v-for="(slide, idx) in slideList" :key="idx" :value="idx">
              {{ String(idx + 1).padStart(2, '0') }}. {{ slide.title }}
            </option>
          </select>
        </div>
      </div>

      <!-- Center: Bullet Progress Indicator -->
      <div class="footer-center">
        <div class="progress-dots">
          <button
            v-for="(slide, idx) in slideList"
            :key="idx"
            class="dot-btn"
            :class="{ active: currentSlide === idx }"
            @click="currentSlide = idx"
            :title="slide.title"
          ></button>
        </div>
      </div>

      <!-- Right: Prev / Next buttons -->
      <div class="footer-right">
        <button class="nav-btn" :disabled="currentSlide === 0" @click="prevSlide">
          ← 上一頁
        </button>
        <button class="nav-btn next" :disabled="currentSlide === totalSlides - 1" @click="nextSlide">
          下一頁 →
        </button>
      </div>
    </footer>

    <!-- Progress line -->
    <div v-if="!isImmersiveSlide" class="progress-bar-track">
      <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

import Slide01Opening from '../components/presentation/slides/Slide01Opening.vue'
import Slide02PhoneLoad from '../components/presentation/slides/Slide02PhoneLoad.vue'
import Slide03VoltageDrop from '../components/presentation/slides/Slide03VoltageDrop.vue'
import Slide04ZenerReference from '../components/presentation/slides/Slide04ZenerReference.vue'
import Slide05OpAmpControl from '../components/presentation/slides/Slide05OpAmpControl.vue'
import Slide06PowerTransistor from '../components/presentation/slides/Slide06PowerTransistor.vue'
import Slide07CircuitOverview from '../components/presentation/slides/Slide07CircuitOverview.vue'
import Slide08ClosedLoop from '../components/presentation/slides/Slide08ClosedLoop.vue'
import Slide09ExperimentSummary from '../components/presentation/slides/Slide09ExperimentSummary.vue'
import Slide10LaunchLinks from '../components/presentation/slides/Slide10LaunchLinks.vue'
import BlankSlide from '../components/presentation/slides/BlankSlide.vue'
import SceneNodeViewer from '../components/scenes/SceneNodeViewer.vue'

const currentSlide = ref(0)
const workspaceRef = ref(null)
const workspaceSize = ref({
  width: 1440,
  height: 810,
})

const SLIDE_WIDTH = 1440
const SLIDE_HEIGHT = 810
let workspaceObserver = null

const slideList = [
  { title: '日常生活應用', component: Slide01Opening },
  { title: '手機錄影場景', component: Slide02PhoneLoad, immersive: true },
  { title: '完整定電壓電路總覽', component: Slide07CircuitOverview },
  { title: 'Vref：電壓參考', component: SceneNodeViewer, props: { nodeId: 'node1_vref' } },
  { title: 'V+：UA741 同相輸入', component: BlankSlide },
  { title: 'V−：UA741 反相輸入', component: BlankSlide },
  { title: 'UA741 OUT：修正訊號', component: BlankSlide },
  { title: 'NPN Base：控制端與輸出調整', component: BlankSlide },
  { title: 'VL：輸出電壓量測', component: BlankSlide },
  { title: 'RL：負載變化與電流', component: BlankSlide },
  { title: '結語', component: Slide10LaunchLinks },
]

const totalSlides = slideList.length

const activeSlide = computed(() => {
  return slideList[currentSlide.value]
})

const activeSlideComponent = computed(() => {
  return activeSlide.value.component
})

const progressPercent = computed(() => {
  return ((currentSlide.value + 1) / totalSlides) * 100
})

const isImmersiveSlide = computed(() => {
  return Boolean(activeSlide.value.immersive)
})

const slideFrameStyle = computed(() => {
  const widthScale = workspaceSize.value.width / SLIDE_WIDTH
  const heightScale = workspaceSize.value.height / SLIDE_HEIGHT
  const scale = Math.max(0.16, Math.min(widthScale, heightScale, 1))

  return {
    '--slide-scale': scale,
    width: `${SLIDE_WIDTH * scale}px`,
    height: `${SLIDE_HEIGHT * scale}px`,
  }
})

function nextSlide() {
  if (currentSlide.value < totalSlides - 1) {
    currentSlide.value++
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

// Keyboard navigation
function handleKeyDown(e) {
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault()
    nextSlide()
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault()
    prevSlide()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', updateWorkspaceSize)
  updateWorkspaceSize()

  if (typeof ResizeObserver !== 'undefined' && workspaceRef.value) {
    workspaceObserver = new ResizeObserver(updateWorkspaceSize)
    workspaceObserver.observe(workspaceRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', updateWorkspaceSize)
  workspaceObserver?.disconnect()
})

function updateWorkspaceSize() {
  nextTick(() => {
    const workspace = workspaceRef.value
    if (!workspace) {
      return
    }

    const rect = workspace.getBoundingClientRect()
    workspaceSize.value = {
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
    }
  })
}
</script>

<style scoped>
.presentation-container {
  position: relative;
  width: min(1500px, calc(100% - 32px));
  margin: 0 auto;
  min-height: 100dvh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 0;
  gap: 20px;
  z-index: 1;
}

.presentation-container.immersive {
  width: 100%;
  margin: 0;
  padding: 0 0 16px;
  gap: 12px;
}

.presentation-container::before {
  content: '';
  position: absolute;
  inset: 14px 10px;
  border: 1px solid rgba(0, 240, 255, 0.08);
  border-radius: 28px;
  pointer-events: none;
  box-shadow:
    inset 0 0 0 1px rgba(255, 79, 163, 0.04),
    0 0 80px rgba(0, 240, 255, 0.05);
}

.presentation-container.immersive::before {
  display: none;
}

/* Header */
/* Main Workspace */
.presentation-workspace {
  flex-grow: 1;
  min-height: 0;
  display: grid;
  place-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.presentation-workspace.immersive {
  --slide-nav-offset: 96px;
  min-height: calc(100dvh - 112px);
  min-height: calc(100vh - 112px);
  height: auto;
}

.slide-frame {
  position: relative;
  overflow: hidden;
  flex: 0 0 auto;
}

.slide-surface {
  width: 1440px;
  height: 810px;
  overflow: hidden;
  transform: scale(var(--slide-scale));
  transform-origin: top left;
}

.slide-surface :deep(> *) {
  width: 100%;
  height: 100%;
}

/* Footer Controls */
.presentation-footer {
  display: grid;
  grid-template-columns: 1.2fr 2fr 1.2fr;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(4, 12, 30, 0.76), rgba(9, 19, 48, 0.68));
  backdrop-filter: blur(20px);
  border: 1px solid var(--nova-border);
  border-radius: 20px;
  box-shadow: 0 -12px 30px rgba(1, 8, 22, 0.28);
}

.presentation-footer.immersive {
  width: min(1500px, calc(100% - 32px));
  margin: 0 auto;
  flex-shrink: 0;
}

.slide-dropdown {
  background: rgba(4, 16, 40, 0.92);
  border: 1px solid rgba(0, 240, 255, 0.18);
  color: var(--nova-text);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 8px 12px;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  max-width: 280px;
  width: 100%;
  box-shadow: inset 0 0 0 1px rgba(255, 79, 163, 0.08);
}

.slide-dropdown:focus {
  border-color: var(--nova-cyan);
  box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.14);
}

/* Progress Dots */
.progress-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dot-btn {
  width: 10px;
  height: 10px;
  border-radius: 99px;
  border: none;
  background: rgba(132, 171, 196, 0.45);
  cursor: pointer;
  padding: 0;
  transition: all 0.25s ease;
}

.dot-btn:hover {
  background: rgba(0, 240, 255, 0.65);
  transform: scale(1.2);
}

.dot-btn.active {
  width: 32px;
  background: linear-gradient(90deg, var(--nova-cyan), var(--nova-pink));
  box-shadow: 0 4px 14px rgba(0, 240, 255, 0.35);
}

/* Navigation Buttons */
.footer-right {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.nav-btn {
  border: 1px solid rgba(0, 240, 255, 0.18);
  background: rgba(4, 16, 40, 0.92);
  color: var(--nova-text);
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.25s ease;
  box-shadow: inset 0 0 0 1px rgba(255, 79, 163, 0.08);
}

.nav-btn:not(:disabled):hover {
  border-color: var(--nova-cyan);
  color: var(--nova-cyan);
  transform: translateY(-1px);
}

.nav-btn.next {
  background: linear-gradient(135deg, var(--nova-cyan) 0%, var(--nova-pink) 52%, var(--nova-violet) 100%);
  color: #04101f;
  border: none;
  box-shadow: 0 8px 24px rgba(0, 240, 255, 0.24);
}

.nav-btn.next:not(:disabled):hover {
  box-shadow: 0 12px 28px rgba(255, 79, 163, 0.3);
  transform: translateY(-2px);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Top Progress bar fill */
.progress-bar-track {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(132, 171, 196, 0.12);
  z-index: 1000;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--nova-cyan), var(--nova-pink), var(--nova-violet));
  transition: width 0.3s ease;
  box-shadow: 0 1px 10px rgba(0, 240, 255, 0.42);
}

/* Transitions: Slide Fade */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

@media (max-width: 800px) {
  .presentation-container {
    width: min(1500px, calc(100% - 20px));
    padding: 16px 0 20px;
    gap: 16px;
  }

  .presentation-container.immersive {
    padding-bottom: 12px;
  }

  .presentation-workspace {
    min-height: 0;
  }

  .presentation-workspace.immersive {
    --slide-nav-offset: 174px;
    min-height: 0;
    height: auto;
  }

  .presentation-footer {
    grid-template-columns: 1fr;
    gap: 16px;
    justify-items: center;
    padding: 14px 16px;
  }

  .footer-left,
  .footer-center,
  .footer-right {
    width: 100%;
  }
  
  .slide-dropdown {
    max-width: 100%;
  }

  .progress-dots {
    flex-wrap: wrap;
  }

  .footer-right {
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
  }
}

@media (max-width: 560px) {
  .presentation-container {
    width: min(1500px, calc(100% - 12px));
    padding: 12px 0 16px;
  }

  .presentation-container::before {
    inset: 8px 4px;
    border-radius: 20px;
  }

  .presentation-footer.immersive {
    width: calc(100% - 16px);
  }

  .nav-btn {
    flex: 1 1 140px;
  }
}
</style>
