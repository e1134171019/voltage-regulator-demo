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
  width: min(1500px, calc(100% - 32px));
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 0;
  gap: 20px;
}

/* Header */
.presentation-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 28px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(30, 41, 59, 0.03);
}

.slide-indicator {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  background: #f1f5f9;
  padding: 6px 12px;
  border-radius: 99px;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.slide-indicator strong {
  color: #0f172a;
  font-weight: 800;
}

/* Main Workspace */
.presentation-workspace {
  flex-grow: 1;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Footer Controls */
.presentation-footer {
  display: grid;
  grid-template-columns: 1.2fr 2fr 1.2fr;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  box-shadow: 0 -10px 30px rgba(30, 41, 59, 0.03);
}

.slide-dropdown {
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #0f172a;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 8px 12px;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  max-width: 280px;
  width: 100%;
}

.slide-dropdown:focus {
  border-color: #0891b2;
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
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
  background: #cbd5e1;
  cursor: pointer;
  padding: 0;
  transition: all 0.25s ease;
}

.dot-btn:hover {
  background: #94a3b8;
  transform: scale(1.2);
}

.dot-btn.active {
  width: 32px;
  background: #0891b2;
  box-shadow: 0 4px 10px rgba(8, 145, 178, 0.3);
}

/* Navigation Buttons */
.footer-right {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.nav-btn {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: #fff;
  color: #0f172a;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.25s ease;
}

.nav-btn:not(:disabled):hover {
  border-color: #0891b2;
  color: #0891b2;
  transform: translateY(-1px);
}

.nav-btn.next {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  color: #fff;
  border: none;
  box-shadow: 0 8px 20px rgba(8, 145, 178, 0.2);
}

.nav-btn.next:not(:disabled):hover {
  box-shadow: 0 12px 25px rgba(8, 145, 178, 0.35);
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
  background: rgba(148, 163, 184, 0.1);
  z-index: 1000;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #22d3ee, #0891b2);
  transition: width 0.3s ease;
  box-shadow: 0 1px 8px rgba(34, 211, 238, 0.4);
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
