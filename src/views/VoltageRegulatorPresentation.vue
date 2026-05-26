<template>
  <div class="presentation-container">
    <!-- Header -->
    <header class="presentation-header">
      <div class="header-right">
        <div class="slide-indicator">
          SLIDE <strong>{{ currentSlide + 1 }}</strong> / {{ totalSlides }}
        </div>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="presentation-workspace">
      <!-- Transition wrapper for slides -->
      <transition name="slide-fade" mode="out-in">
        <component :is="activeSlideComponent" :key="currentSlide" />
      </transition>
    </main>

    <!-- Footer Controls -->
    <footer class="presentation-footer">
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
    <div class="progress-bar-track">
      <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

const currentSlide = ref(0)

const slideList = [
  { title: '開場 + 主題', component: Slide01Opening },
  { title: '手機錄影場景', component: Slide02PhoneLoad },
  { title: '負載變重 -> 電壓降', component: Slide03VoltageDrop },
  { title: 'ZD 6.2V：建立參考電壓', component: Slide04ZenerReference },
  { title: 'μA741：比較控制', component: Slide05OpAmpControl },
  { title: '2SC1384：小訊號控制大電流', component: Slide06PowerTransistor },
  { title: '原電路圖全覽', component: Slide07CircuitOverview },
  { title: '閉迴路動作流程', component: Slide08ClosedLoop },
  { title: '實驗數據', component: Slide09ExperimentSummary },
  { title: '結論 + 展示網址', component: Slide10LaunchLinks },
]

const totalSlides = slideList.length

const activeSlideComponent = computed(() => {
  return slideList[currentSlide.value].component
})

const progressPercent = computed(() => {
  return ((currentSlide.value + 1) / totalSlides) * 100
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
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.presentation-container {
  position: relative;
  width: min(1500px, calc(100% - 32px));
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 0;
  gap: 20px;
  z-index: 1;
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

/* Header */
.presentation-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 28px;
  background: linear-gradient(135deg, rgba(4, 12, 30, 0.76), rgba(9, 19, 48, 0.68));
  backdrop-filter: blur(20px);
  border: 1px solid var(--nova-border);
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(1, 8, 22, 0.38);
}

.slide-indicator {
  font-size: 0.8rem;
  color: var(--nova-text-dim);
  font-weight: 600;
  background: rgba(5, 18, 44, 0.88);
  padding: 6px 12px;
  border-radius: 99px;
  border: 1px solid rgba(0, 240, 255, 0.14);
  box-shadow: inset 0 0 0 1px rgba(255, 79, 163, 0.08);
}

.slide-indicator strong {
  color: var(--nova-text);
  font-weight: 800;
}

/* Main Workspace */
.presentation-workspace {
  flex-grow: 1;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
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
  .presentation-footer {
    grid-template-columns: 1fr;
    gap: 16px;
    justify-items: center;
  }
  
  .slide-dropdown {
    max-width: 100%;
  }

  .footer-right {
    justify-content: center;
    width: 100%;
  }
}
</style>
