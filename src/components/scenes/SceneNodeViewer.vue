<template>
  <section ref="runtimeShellRef" class="runtime-shell node-viewer">
    <!-- 控制面板 -->
    <aside class="control-column">
      <div class="panel-card info-card">
        <div class="card-head">
          <span class="badge">{{ nodeConfig.title }}</span>
        </div>
        <div class="info-content">
          <p class="explanation">{{ nodeConfig.explanation }}</p>
          <div class="expected-value">
            <strong>預期值:</strong>
            {{ nodeConfig.expectedValue.voltage }} {{ nodeConfig.expectedValue.unit }}
          </div>
          <div class="electron-flow">
            <strong>電子流向:</strong>
            {{ nodeConfig.electronFlow.join(' • ') }}
          </div>
        </div>
      </div>

      <div class="panel-card meter-readout-card">
        <div class="card-head">
          <span class="badge">DMM</span>
          <strong>三用電表</strong>
        </div>

        <div class="meter-mode-buttons">
          <button
            class="tool-btn"
            :class="{ active: meterReadMode === 'voltage' }"
            @click="setMeterReadMode('voltage')"
          >
            量電壓
          </button>
        </div>

        <div class="meter-readout-screen">
          <span>{{ meterReadoutStatus }}</span>
          <strong>{{ meterReadoutValue }}</strong>
        </div>

        <div class="meter-comparison">
          <div class="comparison-row">
            <span>預期:</span>
            <strong>{{ nodeConfig.expectedValue.voltage }} V</strong>
          </div>
          <div class="comparison-row">
            <span>實測:</span>
            <strong :class="{ match: isValueMatching }">{{ meterReadoutValue }}</strong>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主要渲染区域 -->
    <main class="runtime-main">
      <div ref="breadboardContainerRef" class="breadboard-container">
        <!-- 麻布板 SVG -->
        <svg v-if="boardSvgMarkup" class="breadboard-svg" v-html="boardSvgMarkup"></svg>

        <!-- Fritzing parts overlay -->
        <div class="parts-overlay">
          <div v-for="part in filteredParts" :key="part.id" class="part-instance" :class="part.className">
            <component
              :is="FritzingPartViewer"
              :partId="part.id"
              :partPackage="part.package"
              :position="part.position"
              :rotation="part.rotation"
              :highlighted="isPartHighlighted(part.id)"
              :visible="isPartVisible(part.id)"
            />
          </div>
        </div>

        <!-- Wires -->
        <svg class="wires-canvas" :viewBox="overlayViewBox">
          <g v-for="wire in filteredWires" :key="wire.id" class="wire-group" :class="wire.className">
            <path :d="wire.pathData" :stroke="wire.color" :stroke-width="wire.width" fill="none" />
            <!-- 电子流淌动画 -->
            <circle
              v-if="isWireHighlighted(wire.id)"
              class="electron-particle"
              r="4"
              :fill="wire.color"
              opacity="0.8"
            >
              <animateMotion :dur="`${wire.animationDuration}s`" repeatCount="indefinite">
                <mpath :href="`#wire-${wire.id}`" />
              </animateMotion>
            </circle>
          </g>

          <!-- DMM 连接线 -->
          <line
            v-if="dmmPosition && meterProbePositions.red"
            :x1="meterProbePositions.red.x"
            :y1="meterProbePositions.red.y"
            :x2="dmmPosition.x"
            :y2="dmmPosition.y"
            stroke="#dc2626"
            stroke-width="2"
            opacity="0.6"
            class="dmm-probe-line"
          />
          <line
            v-if="dmmPosition && meterProbePositions.black"
            :x1="meterProbePositions.black.x"
            :y1="meterProbePositions.black.y"
            :x2="dmmPosition.x"
            :y2="dmmPosition.y"
            stroke="#1f2937"
            stroke-width="2"
            opacity="0.6"
            class="dmm-probe-line"
          />
        </svg>

        <!-- DMM 仪表 -->
        <div v-if="dmmPosition" class="dmm-instrument" :style="dmmStyle">
          <div class="dmm-body">
            <span class="dmm-label">DMM</span>
          </div>
        </div>
      </div>

      <!-- 右侧电路图 (简化版) -->
      <aside class="schematic-panel">
        <h3>电路示意</h3>
        <div class="schematic-info">
          <p v-if="nodeConfig.description" class="description">
            {{ nodeConfig.description }}
          </p>
        </div>
      </aside>
    </main>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { SCENE_CONFIGS } from './nodeViewerConfigs.js'
import FritzingPartViewer from '../lab/FritzingPartViewer.vue'

// Props
const props = defineProps({
  nodeId: {
    type: String,
    required: true,
    validator: (val) => Object.keys(SCENE_CONFIGS).includes(val),
  },
})

// Refs
const runtimeShellRef = ref(null)
const breadboardContainerRef = ref(null)

// State
const meterReadMode = ref('voltage')
const packages = ref([])
const boardSvgMarkup = ref('')
const overlayViewBox = ref('0 0 800 600')

// 获取配置
const nodeConfig = computed(() => SCENE_CONFIGS[props.nodeId])

// 从 Scene03 导入初始状态数据
const allParts = ref({})
const allWires = ref([])

// 加载 Fritzing 包和初始化状态
onMounted(async () => {
  try {
    // 这里可以从 Scene03 导入 loadPublicFritzingPackages
    // 暂时跳过，假设数据已经加载
    
    // 初始化部分状态（从 buildDefaultRuntimeState）
    initializeState()
    
    // 生成麻布板 SVG
    generateBoardSvg()
  } catch (error) {
    console.error('Failed to initialize SceneNodeViewer:', error)
  }
})

// 初始化状态 - 复用 Scene03 的数据结构
function initializeState() {
  // 从 Scene03 的 buildDefaultRuntimeState 复用
  const defaultParts = {
    'zener-1': {
      templateId: 'zener',
      holes: { connector0: '10S', connector1: '10M' },
      freePosition: null,
      rotation: 270,
    },
    'ua741-9': {
      templateId: 'ua741',
      holes: {
        connector0: '21L',
        connector1: '23L',
        connector2: '25L',
        connector3: '27L',
        connector4: '27H',
        connector5: '25H',
        connector6: '23H',
        connector7: '21H',
      },
      freePosition: null,
      rotation: 0,
    },
    'rb-10': {
      templateId: 'rb',
      holes: { connector0: '10K', connector1: '10H' },
      freePosition: null,
      rotation: 270,
    },
    'npn-11': {
      templateId: 'npn',
      holes: { connector0: '40G', connector1: '42G', connector2: '44G' },
      freePosition: null,
      rotation: 0,
    },
    'r2-13': {
      templateId: 'r2',
      holes: { connector0: '32R', connector1: '32O' },
      freePosition: null,
      rotation: 270,
    },
    'supply-14': {
      templateId: 'supply',
      holes: {},
      freePosition: { x: -98.6158109213909, y: 244.17395485061576 },
      rotation: 270,
    },
    'supply-15': {
      templateId: 'supply',
      holes: {},
      freePosition: { x: 416.4088592036236, y: 309.51232590519754 },
      rotation: 180,
    },
    'meter-16': {
      templateId: 'meter',
      holes: {},
      freePosition: { x: 620.4771861944973, y: 306.72290486419803 },
      rotation: 270,
    },
    'rb-17': {
      templateId: 'rb',
      holes: { connector0: '40P', connector1: '40M' },
      freePosition: null,
      rotation: 270,
    },
  }

  allParts.value = defaultParts

  // 获取所有 wires（从 Scene03）
  const defaultWires = [
    { id: 'user-1', from: '', to: '1topRed', color: '#2563eb', width: 3.1 },
    { id: 'user-2', from: '', to: '1bottomBlue', color: '#2563eb', width: 3.1 },
    { id: 'user-3', from: '', to: '6bottomBlue', color: '#2563eb', width: 3.1 },
    { id: 'user-4', from: '', to: '55topBlue', color: '#2563eb', width: 3.1 },
    { id: 'user-22', from: '10topRed', to: '10H', color: '#2563eb', width: 3.1 },
    { id: 'user-23', from: '10bottomBlue', to: '10M', color: '#2563eb', width: 3.1 },
    { id: 'user-41', from: '21H', to: '10S', color: '#2563eb', width: 3.1 },
    { id: 'user-42', from: '27L', to: '10M', color: '#2563eb', width: 3.1 },
  ]

  allWires.value = defaultWires
}

// 生成麻布板 SVG - 使用简化的占位符
function generateBoardSvg() {
  // 占位符：完整的 SVG 将由浏览器中的 Scene03 提供
  boardSvgMarkup.value = '<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#f0f0f0"/><text x="400" y="300" text-anchor="middle" dy=".3em" font-size="16" fill="#666">麻布板...</text></svg>'
}

// 计算电路模型（简化版）
const circuitModel = computed(() => {
  const vin = 12 // 示意值，应该从 Scene03 传入
  const loadCurrent = 0.3 // 示意值
  const positiveRail = vin
  const negativeRail = 0
  const vref = vin > 6.7 ? 6.2 : Math.max(0, vin - 0.45)
  const vout = vref * 0.6 // 简化，实际应该更复杂
  const vminus = vout * 0.6
  const vplus = vref
  const error = vplus - vminus
  const opAmpOut = vout + 0.62 + (error * 3.6)
  const baseCurrent = loadCurrent / 55
  const feedbackCurrent = vout / 10000 // 假设 10k 反馈
  const zenerCurrent = Math.max((vin - vref) / 1000 - feedbackCurrent - baseCurrent * 0.18, 0)

  return {
    positiveRail,
    negativeRail,
    vref,
    vplus,
    vminus,
    opAmpOut,
    vout,
    baseCurrent,
    feedbackCurrent,
    zenerCurrent,
  }
})

// 过滤后的 parts
const filteredParts = computed(() => {
  if (!nodeConfig.value.visibleParts) return []
  
  return nodeConfig.value.visibleParts.map((partId) => {
    const partData = allParts.value[partId]
    return {
      id: partId,
      templateId: partData?.templateId || '',
      package: {},
      position: { x: 100, y: 100 },
      rotation: partData?.rotation || 0,
      className: isPartHighlighted(partId) ? 'highlight' : '',
      visible: isPartVisible(partId),
      highlighted: isPartHighlighted(partId),
    }
  })
})

// 过滤后的 wires
const filteredWires = computed(() => {
  if (!nodeConfig.value.visibleWires) return []

  return nodeConfig.value.visibleWires.map((wireId) => {
    const wireData = allWires.value.find((w) => w.id === wireId)
    return {
      id: wireId,
      pathData: 'M 100 100 L 200 200', // 占位符，应该从配置计算
      color: wireData?.color || '#2563eb',
      width: wireData?.width || 3.1,
      animationDuration: 3,
      className: isWireHighlighted(wireId) ? 'highlight' : '',
      visible: true,
      highlighted: isWireHighlighted(wireId),
    }
  })
})

// 检查元件是否应该高亮
function isPartHighlighted(partId) {
  return nodeConfig.value.highlightParts?.includes(partId) || false
}

// 检查元件是否应该显示
function isPartVisible(partId) {
  return nodeConfig.value.visibleParts?.includes(partId) || false
}

// 检查线路是否应该高亮
function isWireHighlighted(wireId) {
  return nodeConfig.value.highlightWires?.includes(wireId) || false
}

// DMM 位置
const dmmPosition = computed(() => {
  return nodeConfig.value.meterTarget?.position || { x: 600, y: 300 }
})

const dmmStyle = computed(() => ({
  left: `${dmmPosition.value.x}px`,
  top: `${dmmPosition.value.y}px`,
}))

// DMM 探针位置
const meterProbePositions = reactive({
  red: { x: 0, y: 0 },
  black: { x: 0, y: 0 },
})

// DMM 读数
const getMeterValue = () => {
  if (!nodeConfig.value.meterTarget) {
    return '0.00'
  }

  const meterNode = nodeConfig.value.meterTarget.nodeId
  
  switch (meterNode) {
    case 'vref':
      return circuitModel.value.vref.toFixed(2)
    case 'vplus':
      return circuitModel.value.vplus.toFixed(2)
    case 'vminus':
      return circuitModel.value.vminus.toFixed(2)
    case 'opAmpOut':
      return circuitModel.value.opAmpOut.toFixed(2)
    case 'vout':
      return circuitModel.value.vout.toFixed(2)
    default:
      return nodeConfig.value.expectedValue?.voltage?.toFixed(2) || '0.00'
  }
}

const meterReadoutValue = computed(() => {
  if (meterReadMode.value === 'voltage') {
    return `${getMeterValue()} V`
  }
  return '0.00 A'
})

const meterReadoutStatus = computed(() => {
  return '量測中...'
})

// 检查值是否匹配
const isValueMatching = computed(() => {
  // 这里可以添加容差判断逻辑
  return true
})

// 设置 DMM 模式
function setMeterReadMode(mode) {
  meterReadMode.value = mode
}
</script>

<style scoped>
.runtime-shell {
  display: flex;
  height: 100%;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 12px;
  overflow: hidden;
}

.control-column {
  display: flex;
  flex-direction: column;
  width: 280px;
  gap: 12px;
  overflow-y: auto;
}

.panel-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  backdrop-filter: blur(10px);
}

.card-head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
}

.badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #a3e635;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: #e2e8f0;
}

.explanation {
  line-height: 1.4;
  color: #cbd5e1;
}

.expected-value,
.electron-flow {
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 2px solid #a3e635;
  border-radius: 4px;
  font-size: 11px;
}

.meter-readout-card {
  flex-shrink: 0;
}

.meter-mode-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tool-btn {
  flex: 1;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #94a3b8;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.tool-btn.active {
  background: #a3e635;
  color: #000;
  border-color: #a3e635;
}

.meter-readout-screen {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  text-align: center;
  margin-bottom: 12px;
}

.meter-readout-screen span {
  display: block;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
}

.meter-readout-screen strong {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #a3e635;
  font-family: 'Monaco', 'Courier New', monospace;
}

.meter-comparison {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.comparison-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #cbd5e1;
}

.comparison-row strong {
  color: #a3e635;
  font-family: 'Monaco', 'Courier New', monospace;
}

.comparison-row strong.match {
  color: #10b981;
}

.runtime-main {
  flex: 1;
  display: flex;
  gap: 12px;
  min-height: 0;
}

.breadboard-container {
  flex: 1;
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.breadboard-svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.parts-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.part-instance {
  position: absolute;
  transition: all 0.3s ease;
}

.part-instance.highlight {
  filter: drop-shadow(0 0 8px rgba(163, 230, 53, 0.5)) brightness(1.1);
}

.wires-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.wire-group {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.wire-group.highlight {
  opacity: 1;
  filter: drop-shadow(0 0 4px rgba(163, 230, 53, 0.4));
}

.electron-particle {
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.dmm-probe-line {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.dmm-instrument {
  position: absolute;
  width: 60px;
  height: 80px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #666;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.dmm-body {
  text-align: center;
}

.dmm-label {
  display: block;
  font-size: 10px;
  color: #fff;
  font-weight: 600;
}

.schematic-panel {
  width: 240px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow-y: auto;
  color: #cbd5e1;
}

.schematic-panel h3 {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #e2e8f0;
}

.schematic-info {
  font-size: 11px;
  line-height: 1.5;
}

.description {
  color: #a3e635;
  margin-bottom: 8px;
}

/* 高亮样式 */
:deep(.highlight) {
  opacity: 1 !important;
  filter: brightness(1.2) drop-shadow(0 0 8px rgba(163, 230, 53, 0.6));
}

/* 隐藏样式 */
:deep(.hidden) {
  display: none !important;
}
</style>
