<template>
  <div class="scene-node-viewer" :class="`view-${nodeId}`">
    <!-- 上層信息面板 -->
    <div class="node-info-overlay">
      <div class="info-panel">
        <h2>{{ nodeConfig?.title }}</h2>
        <p class="explanation">{{ nodeConfig?.explanation }}</p>
        
        <div class="values-row">
          <div class="value-item">
            <span class="label">預期值:</span>
            <strong>{{ nodeConfig?.expectedValue.voltage }} {{ nodeConfig?.expectedValue.unit }}</strong>
          </div>
          <div class="value-item">
            <span class="label">電子流向:</span>
            <strong>{{ nodeConfig?.electronFlow.join(' → ') }}</strong>
          </div>
        </div>
        
        <div class="meter-display">
          <div class="meter-label">DMM 量測值</div>
          <div class="meter-value" :class="{ matched: isValueMatching }">
            {{ meterValue }} V
          </div>
          <div class="meter-status" :class="{ match: isValueMatching, mismatch: !isValueMatching }">
            {{ isValueMatching ? '✓ 符合預期' : '差異偏大' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Scene03 完整電路視圖 (帶過濾) -->
    <div class="scene-wrapper">
      <component :is="scene03" :filter-config="nodeConfig" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { SCENE_CONFIGS } from './nodeViewerConfigs.js'
import { calculateCircuitModel, getMeasurementValue } from './scene03SharedState.js'
import Scene03InteractiveBreadboard from './Scene03InteractiveBreadboard.vue'

const props = defineProps({
  nodeId: {
    type: String,
    required: true,
    validator: (val) => Object.keys(SCENE_CONFIGS).includes(val),
  },
  scene03: {
    type: Object,
    default: () => Scene03InteractiveBreadboard,
  },
})

const vin = ref(12)
const loadCurrent = ref(0.3)

const nodeConfig = computed(() => SCENE_CONFIGS[props.nodeId])

const circuitModel = computed(() => {
  return calculateCircuitModel(vin.value, loadCurrent.value)
})

// 獲取當前節點的測量值
const meterValue = computed(() => {
  if (!nodeConfig.value?.meterTarget?.nodeId) {
    return nodeConfig.value?.expectedValue?.voltage || '0.00'
  }
  const val = getMeasurementValue(nodeConfig.value.meterTarget.nodeId, circuitModel.value)
  return val.toFixed(2)
})

// 檢查值是否匹配
const isValueMatching = computed(() => {
  if (!nodeConfig.value?.expectedValue) return false
  const expected = parseFloat(nodeConfig.value.expectedValue.voltage)
  const measured = parseFloat(meterValue.value)
  const tolerance = 0.1 // 0.1V 容差
  return Math.abs(measured - expected) < tolerance
})
</script>

<style scoped>
.scene-node-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  gap: 0;
  position: relative;
  background: #0f172a;
  overflow: hidden;
}

.node-info-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  pointer-events: none;
  width: 100%;
  padding: 16px;
}

.info-panel {
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.1);
  border-radius: 8px;
  padding: 16px;
  max-width: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.info-panel h2 {
  margin: 0 0 8px 0;
  color: #e2e8f0;
  font-size: 18px;
  font-weight: 600;
}

.explanation {
  margin: 0 0 12px 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.4;
}

.values-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.1);
}

.value-item {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.value-item .label {
  color: #cbd5e1;
}

.value-item strong {
  color: #f1f5f9;
  font-family: 'Courier New', monospace;
  background: rgba(51, 65, 85, 0.5);
  padding: 2px 6px;
  border-radius: 3px;
}

.meter-display {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 6px;
  padding: 12px;
  text-align: center;
}

.meter-label {
  color: #94a3b8;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.meter-value {
  font-size: 24px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  color: #fbbf24;
  margin-bottom: 6px;
  transition: color 0.3s;
}

.meter-value.matched {
  color: #4ade80;
}

.meter-status {
  font-size: 11px;
  font-weight: 500;
  color: #f87171;
  transition: color 0.3s;
}

.meter-status.match {
  color: #4ade80;
}

.scene-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.scene-wrapper :deep(.runtime-shell) {
  height: 100%;
  padding: 0 !important;
  gap: 0 !important;
}

.scene-wrapper :deep(.control-column) {
  display: none !important;
}

.scene-wrapper :deep(.board-column) {
  width: 100%;
  flex: 1;
}

.scene-wrapper :deep(.board-frame) {
  height: 100% !important;
}
</style>

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
