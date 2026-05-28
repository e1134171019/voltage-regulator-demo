<template>
  <div class="presentation-container" :class="[{ immersive: isImmersiveSlide }, activeSlide.layoutClass]">
    <!-- Main Workspace -->
    <main ref="workspaceRef" class="presentation-workspace" :class="{ immersive: isImmersiveSlide }">
      <!-- Transition wrapper for slides -->
      <transition name="slide-fade" mode="out-in">
        <div
          class="slide-frame"
          :class="{ immersive: isImmersiveSlide }"
          :key="currentSlide"
          :style="slideFrameStyle"
        >
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
import Slide07CircuitOverview from '../components/presentation/slides/Slide07CircuitOverview.vue'
import BlankSlide from '../components/presentation/slides/BlankSlide.vue'
import Scene03InteractiveBreadboard from '../components/scenes/Scene03InteractiveBreadboard.vue'
import Scene04VrefBreadboard from '../components/scenes/Scene04VrefBreadboard.vue'
import { SCENE_CONFIGS } from '../components/scenes/nodeViewerConfigs.js'

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
  {
    title: 'Vref：電壓參考',
    component: Scene04VrefBreadboard,
    props: {
      nodeFilter: 'node1_vref',
      nodeInfoConfig: SCENE_CONFIGS.node1_vref,
      showNodeInfo: true,
    },
  },
  {
    title: 'UA741 第 3 腳 V+：接收 Vref',
    component: Scene03InteractiveBreadboard,
    props: {
      nodeFilter: 'node2_vplus',
      nodeInfoConfig: SCENE_CONFIGS.node2_vplus,
      showNodeInfo: true,
    },
  },
  {
    title: 'UA741 第 2 腳 V−：10kΩ 負回授比較點',
    component: Scene03InteractiveBreadboard,
    layoutClass: 'hide-static-schematic',
    props: {
      nodeFilter: 'node3_vminus',
      nodeInfoConfig: SCENE_CONFIGS.node3_vminus,
      showNodeInfo: true,
    },
  },
  {
    title: 'NPN Base：UA741 OUT 驅動控制端',
    component: Scene03InteractiveBreadboard,
    props: {
      nodeFilter: 'node4_out',
      nodeInfoConfig: SCENE_CONFIGS.node4_out,
      showNodeInfo: true,
    },
  },
  { title: '回第三篇量測：VL 輸出電壓', component: BlankSlide },
  { title: '回第三篇量測：RL 負載變化與電流', component: BlankSlide },
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

  if (isImmersiveSlide.value) {
    const scale = Math.max(0.16, Math.min(widthScale, heightScale))
    const scaledWidth = SLIDE_WIDTH * scale
    const scaledHeight = SLIDE_HEIGHT * scale

    return {
      '--slide-scale': scale,
      '--slide-offset-x': `${(workspaceSize.value.width - scaledWidth) / 2}px`,
      '--slide-offset-y': `${(workspaceSize.value.height - scaledHeight) / 2}px`,
      width: `${workspaceSize.value.width}px`,
      height: `${workspaceSize.value.height}px`,
    }
  }

  const scale = Math.max(0.16, Math.min(widthScale, heightScale, 1))

  return {
    '--slide-scale': scale,
    '--slide-offset-x': '0px',
    '--slide-offset-y': '0px',
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
}
</style>
