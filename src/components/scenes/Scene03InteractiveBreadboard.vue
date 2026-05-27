<template>
  <section class="runtime-shell">
    <aside class="control-column">
      <div class="panel-card control-card">
        <div class="card-head">
          <span class="badge">Input</span>
          <strong>調節</strong>
        </div>

        <label class="control-field">
          <span>Vin</span>
          <strong>{{ vin.toFixed(1) }} V</strong>
          <input v-model.number="vin" type="range" min="7" max="16" step="0.1" />
        </label>

        <label class="control-field">
          <span>Load Current</span>
          <strong>{{ formatCurrent(loadCurrent) }}</strong>
          <input v-model.number="loadCurrent" type="range" min="0.05" max="0.8" step="0.01" />
        </label>
      </div>
    </aside>

    <div class="board-column">
      <div class="board-frame" :style="boardFrameStyle">
        <div v-if="loadingAssets" class="board-empty">載入 `.fzpz` 資產中...</div>
        <div v-else-if="loadError" class="board-empty board-error">{{ loadError }}</div>

        <template v-else>
          <div class="board-base" v-html="boardSvgBase"></div>

          <svg
            ref="overlaySvgRef"
            class="board-overlay"
            :class="{ placing: Boolean(pendingPlacementPartId), wiring: wireMode || Boolean(wireDragState), panning: isPanning }"
            :viewBox="overlayViewBox"
            preserveAspectRatio="xMidYMid meet"
            @pointerdown="handleBoardPointerDown"
            @pointermove="handleBoardPointerMove"
            @pointerup="handleBoardPointerUp"
            @pointerleave="clearHoverPreview"
            @click="handleBoardClick"
            @wheel.prevent="handleWheel"
          >
            <g class="wire-layer">
              <path
                v-for="wire in renderedWires"
                :key="wire.id"
                class="runtime-wire"
                :class="{ selected: selectedWireId === wire.id }"
                :d="wire.path"
                :stroke="wire.color"
                :stroke-width="wire.width"
                @click.stop="selectWire(wire.id)"
              />

              <path
                v-if="wirePreviewPath"
                class="runtime-wire wire-preview"
                :d="wirePreviewPath"
                stroke="#2563eb"
                stroke-width="3.2"
              />
            </g>

            <g v-if="placementPreview" class="preview-layer">
              <g class="part-preview" :transform="matrixToString(placementPreview.transform)">
                <rect
                  v-if="placementPreview.bounds"
                  class="part-hitbox"
                  :x="placementPreview.bounds.minX"
                  :y="placementPreview.bounds.minY"
                  :width="placementPreview.bounds.width"
                  :height="placementPreview.bounds.height"
                  rx="2"
                  ry="2"
                />
                <g v-html="placementPreview.innerSvg"></g>
              </g>

              <g class="placement-glow-layer">
                <g v-for="anchor in placementPreview.targetAnchors" :key="anchor.key">
                  <circle class="placement-glow-outer" :cx="anchor.x" :cy="anchor.y" r="8.2" />
                  <circle class="placement-glow-inner" :cx="anchor.x" :cy="anchor.y" r="4.8" />
                </g>
              </g>
            </g>

            <g class="part-layer">
              <g
                v-for="part in renderedParts"
                :key="part.id"
                class="part-group"
                :class="{ selected: selectedPartId === part.id, dragging: dragState?.partId === part.id }"
                :transform="matrixToString(part.displayTransform)"
                @pointerdown="startPartDrag($event, part.id)"
              >
                <rect
                  v-if="part.bounds"
                  class="part-hitbox"
                  :x="part.bounds.minX"
                  :y="part.bounds.minY"
                  :width="part.bounds.width"
                  :height="part.bounds.height"
                  rx="2"
                  ry="2"
                />
                <g v-html="part.innerSvg"></g>
              </g>
            </g>

            <g class="connector-status-layer">
              <g v-for="part in renderedParts" :key="`status-${part.id}`" :transform="matrixToString(part.displayTransform)">
                <circle
                  v-for="status in part.connectorStatus"
                  :key="`${part.id}-${status.connector.id}`"
                  v-show="status.connector.anchor"
                  class="connector-indicator"
                  :class="{ connected: status.isConnected, disconnected: !status.isConnected }"
                  :cx="status.connector.anchor?.x || 0"
                  :cy="status.connector.anchor?.y || 0"
                  r="3.2"
                />
              </g>
            </g>

            <!-- Measure layer removed per user request -->
            <circle
              v-if="pendingWireAnchor"
              class="pending-hole"
              :cx="pendingWireAnchor.x"
              :cy="pendingWireAnchor.y"
              :r="7"
            />
          </svg>
        </template>
      </div>
    </div>

    <aside class="tool-column">
      <div class="panel-card parts-card">
        <div class="card-head">
          <span class="badge">Parts</span>
          <strong>元件窗口</strong>
        </div>

        <p class="panel-note">
          {{ paletteDragState ? '拖到麵包板洞位後放開。' : pendingPlacementPartId ? '先點麵包板孔位放置元件。' : '從這裡拖元件到麵包板。' }}
        </p>

        <div class="part-list">
          <button
            v-for="part in partCatalog"
            :key="part.id"
            class="part-row"
            :class="{ active: activePalettePartId === part.id, placed: Boolean(partPlacements[part.id]) }"
            @pointerdown.prevent="startPaletteDrag($event, part.id)"
            @click="selectPalettePart(part.id)"
          >
            <div class="part-thumb" v-html="part.previewSvg"></div>
            <div class="part-copy">
              <span>{{ part.kind }}</span>
              <strong>{{ part.label }}</strong>
              <small>{{ partStatusLabel(part.id) }}</small>
            </div>
          </button>
        </div>

        <div class="rotation-tools">
          <button class="tool-btn" :disabled="!currentTargetPartId" @click="rotateTargetPart(-90)">↺ 90°</button>
          <button class="tool-btn" :disabled="!currentTargetPartId" @click="rotateTargetPart(90)">↻ 90°</button>
        </div>

        <div class="board-toolbar">
          <!-- Wire mode toggle removed - universal wire start from any connector -->
          <button class="tool-btn" @click="resetPlacements">重設</button>
          <button class="tool-btn" @click="clearWires">清線</button>
        </div>
      </div>

      <div class="panel-card meter-shell">
        <div class="card-head">
          <span class="badge badge-slate">Inspector</span>
          <strong>{{ activeSelectionLabel }}</strong>
        </div>

        <div class="inspector-meta">
          <span>Mode</span>
          <strong>{{ inspectorModeLabel }}</strong>
          <small>{{ inspectorHint }}</small>
        </div>

        <div class="inspector-meta">
          <span>Rotation</span>
          <strong>{{ currentTargetPartId ? `${partStatusRotation(currentTargetPartId)}°` : '--' }}</strong>
          <small>{{ selectedPartSummary }}</small>
        </div>

        <div class="inspector-meta">
          <span>Continuity</span>
          <strong>{{ continuitySummary.title }}</strong>
          <small>{{ continuitySummary.detail }}</small>
        </div>

        <div v-if="selectedWireId" class="inspector-meta">
          <span>Wire Color</span>
          <div class="wire-color-picker">
            <button
              v-for="color in wireColorOptions"
              :key="color.value"
              class="color-dot"
              :style="{ backgroundColor: color.value }"
              :class="{ selected: getSelectedWireColor() === color.value }"
              :title="color.label"
              @click="setSelectedWireColor(color.value)"
            />
          </div>
        </div>

        <div class="inspector-actions">
          <button class="tool-btn" :disabled="!selectedPartId" @click="removeSelectedPart">刪除元件</button>
          <button class="tool-btn" :disabled="!selectedWireId" @click="removeSelectedWire">刪除導線</button>
          <button class="tool-btn" :disabled="!hasCancelableAction" @click="clearSelectionState">取消</button>
        </div>

        <div class="meter-divider"></div>

        <div class="card-head card-head-secondary">
          <span class="badge badge-slate">Probe Screen</span>
          <strong>{{ selectedMeasurement?.label ?? '--' }}</strong>
        </div>

        <div class="meter-hole">{{ selectedMeasurement?.hole ?? '--' }}</div>
        <div class="meter-voltage">
          {{ selectedMeasurement ? formatVoltage(selectedMeasurement.voltage) : '--' }}
        </div>
        <div class="meter-row">
          <article>
            <span>Current</span>
            <strong>{{ selectedMeasurement ? formatCurrent(selectedMeasurement.current) : '--' }}</strong>
          </article>
          <article>
            <span>Power</span>
            <strong>{{ selectedMeasurement ? formatPower(selectedMeasurement.power) : '--' }}</strong>
          </article>
        </div>
      </div>
    </aside>

    <div v-if="paletteDragState" class="palette-drag-ghost" :style="paletteGhostStyle">
      <div class="part-thumb" v-html="paletteDragPart?.previewSvg || ''"></div>
      <div class="drag-ghost-label">{{ paletteDragPart?.label || 'PART' }}</div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { loadPublicFritzingPackages } from '../utils/fritzingRuntime.js'

const loadingAssets = ref(true)
const loadError = ref('')
const packages = ref([])
const selectedNodeId = ref('vl')
const selectedPartId = ref('')
const selectedWireId = ref('')
const pendingPlacementPartId = ref('')
const vin = ref(12)
const loadCurrent = ref(0.28)
const wireMode = ref(false)
const pendingWireStart = ref('')
const dragState = ref(null)
const hoverBoardPoint = ref(null)
const wireDragState = ref(null)
const paletteDragState = ref(null)
const overlaySvgRef = ref(null)
const partPlacements = reactive({})
const partRotations = reactive({})
const wires = ref([])

// Zoom and pan state
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const panStartX = ref(0)
const panStartY = ref(0)

let nextWireId = 1
let suppressPaletteClick = false

// History management for Undo/Redo
const history = {
  stack: [],
  currentIndex: -1,
  canUndo: () => history.currentIndex > 0,
  canRedo: () => history.currentIndex < history.stack.length - 1,
}

function captureState() {
  const state = {
    partPlacements: JSON.parse(JSON.stringify(partPlacements)),
    partRotations: JSON.parse(JSON.stringify(partRotations)),
    wires: JSON.parse(JSON.stringify(wires.value)),
    nextWireId,
  }
  
  // 移除未來的狀態（當用戶執行新操作後）
  if (history.currentIndex < history.stack.length - 1) {
    history.stack = history.stack.slice(0, history.currentIndex + 1)
  }
  
  history.stack.push(state)
  history.currentIndex = history.stack.length - 1
}

function undo() {
  if (!history.canUndo()) return
  
  history.currentIndex -= 1
  restoreState(history.stack[history.currentIndex])
}

function redo() {
  if (!history.canRedo()) return
  
  history.currentIndex += 1
  restoreState(history.stack[history.currentIndex])
}

function restoreState(state) {
  Object.keys(partPlacements).forEach((key) => delete partPlacements[key])
  Object.assign(partPlacements, JSON.parse(JSON.stringify(state.partPlacements)))
  
  Object.keys(partRotations).forEach((key) => delete partRotations[key])
  Object.assign(partRotations, JSON.parse(JSON.stringify(state.partRotations)))
  
  wires.value = JSON.parse(JSON.stringify(state.wires))
  nextWireId = state.nextWireId
}

const wireColorOptions = [
  { label: 'Blue (Signal)', value: '#2563eb' },
  { label: 'Red (Vcc)', value: '#ef4444' },
  { label: 'Black (GND)', value: '#1f2937' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'White', value: '#f5f5f5' },
]

const PART_LAYOUTS = [
  { id: 'ua741', match: 'custom_ua741_labeled_2x_tight', kind: 'IC', label: 'UA741' },
  { id: 'npn', match: 'custom_npn_to92_cbe_2x_cbe_inside_fixed', kind: 'Transistor', label: 'NPN 2SC1384' },
  { id: 'zener', match: 'custom_zener_u_6v2_2x_ultrashort', kind: 'Reference', label: 'ZD 6.2V' },
  { id: 'rz', match: 'custom_resistor_470r_u_2x_ultrashort_center_label', kind: 'Resistor', label: '470R' },
  { id: 'rb', match: 'custom_resistor_1k_u_2x_ultrashort_center_label', kind: 'Resistor', label: '1k' },
  { id: 'r1', match: 'custom_resistor_4k7_u_2x_ultrashort_center_label', kind: 'Resistor', label: '4.7k' },
  { id: 'r2', match: 'custom_resistor_10k_u_2x_ultrashort_center_label', kind: 'Resistor', label: '10k' },
]

const svgMarkupCache = new Map()
const svgPreviewCache = new Map()

const boardPackage = computed(() => findPackage('custom_broad_breadboard_20row_clear'))

const boardHoleList = computed(() => {
  return (boardPackage.value?.connectors || []).filter((connector) => connector.anchor)
})

const boardHoleLookup = computed(() => {
  return new Map(boardHoleList.value.map((connector) => [connector.name.toUpperCase(), connector]))
})

// Unified connector model - merges board holes + part pins
const allConnectors = computed(() => {
  const connectors = []

  // Add board holes
  boardHoleList.value.forEach((hole) => {
    connectors.push({
      id: `board-${hole.name}`,
      type: 'boardHole',
      position: hole.anchor,
      parent: { type: 'board', id: 'board' },
      holeName: hole.name,
      continuityKey: getHoleContinuityKey(hole.name),
      hitRadius: getConnectorHitRadius(hole.name, 'boardHole'),
    })
  })

  // Add part pins
  renderedParts.value.forEach((part) => {
    part.package.connectors.forEach((pin) => {
      if (!pin.anchor) return
      const transformedPos = applyMatrix(part.displayTransform, pin.anchor)
      connectors.push({
        id: `pin-${part.id}-${pin.id}`,
        type: 'partPin',
        position: transformedPos,
        parent: { type: 'part', id: part.id },
        partId: part.id,
        pinId: pin.id,
        pinName: pin.name,
        hitRadius: getConnectorHitRadius(pin.name, 'partPin'),
      })
    })
  })

  return connectors
})

const occupiedHoleOwners = computed(() => {
  const owners = new Map()

  Object.entries(partPlacements).forEach(([partId, mapping]) => {
    Object.values(mapping || {}).forEach((holeName) => {
      if (!holeName) {
        return
      }

      owners.set(holeName.toUpperCase(), partId)
    })
  })

  return owners
})

const conductiveGroups = computed(() => {
  const groups = new Map()

  boardHoleList.value.forEach((hole) => {
    const key = getHoleContinuityKey(hole.name)
    if (!key) {
      return
    }

    if (!groups.has(key)) {
      groups.set(key, [])
    }

    groups.get(key).push(hole)
  })

  return groups
})

const boardViewBox = computed(() => parseViewBox(boardPackage.value?.svgText || ''))

const runtimeViewBox = computed(() => {
  const baseViewBox = boardViewBox.value
  if (!baseViewBox) {
    return {
      minX: 0,
      minY: 0,
      width: 100,
      height: 100,
    }
  }

  const zoomedWidth = baseViewBox.width / zoomLevel.value
  const zoomedHeight = baseViewBox.height / zoomLevel.value
  return {
    minX: baseViewBox.minX + panX.value - (zoomedWidth - baseViewBox.width) / 2,
    minY: baseViewBox.minY + panY.value - (zoomedHeight - baseViewBox.height) / 2,
    width: zoomedWidth,
    height: zoomedHeight,
  }
})

const overlayViewBox = computed(() => {
  const { minX, minY, width, height } = runtimeViewBox.value
  return `${minX} ${minY} ${width} ${height}`
})

const boardFrameStyle = computed(() => {
  if (!boardViewBox.value) {
    return {}
  }

  return {
    aspectRatio: `${boardViewBox.value.width} / ${boardViewBox.value.height}`,
  }
})

const boardSvgBase = computed(() => {
  if (!boardPackage.value?.svgText) {
    return ''
  }

  const svgDoc = new DOMParser().parseFromString(boardPackage.value.svgText, 'image/svg+xml')
  svgDoc.documentElement.setAttribute('viewBox', overlayViewBox.value)
  svgDoc.documentElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  return new XMLSerializer().serializeToString(svgDoc)
})

const holePitch = computed(() => estimateHolePitch(boardHoleList.value))

const partCatalog = computed(() => {
  return PART_LAYOUTS
    .map((layout) => ({
      ...layout,
      package: findPackage(layout.match),
      previewSvg: findPackage(layout.match) ? getPreviewMarkup(findPackage(layout.match)) : '',
    }))
    .filter((item) => item.package)
})

const placedParts = computed(() => {
  return partCatalog.value
    .filter((item) => Boolean(partPlacements[item.id]))
    .map((item) => ({
      ...item,
      holes: partPlacements[item.id],
      rotation: partRotations[item.id] ?? 0,
    }))
})

const renderedParts = computed(() => {
  return placedParts.value.map((part) => {
    const { innerSvg, bounds } = getSvgMarkupInfo(part.package)
    const baseTransform = buildPartTransform(part, boardHoleLookup.value)
    const displayTransform = applyDragOffset(
      baseTransform,
      dragState.value?.partId === part.id ? dragState.value.dx : 0,
      dragState.value?.partId === part.id ? dragState.value.dy : 0,
    )

    // Calculate connector wiring status
    const connectorStatus = part.package.connectors.map((connector) => {
      const holeName = part.holes?.[connector.id]
      if (!holeName || !connector.anchor) {
        return { connector, holeName, isConnected: false }
      }

      const connectedHoles = continuityState.value.holesFor(holeName)
      const isConnected = connectedHoles.length > 1 || wires.value.some(
        (wire) =>
          (wire.from.toUpperCase() === holeName.toUpperCase() ||
            wire.to.toUpperCase() === holeName.toUpperCase()) &&
          wires.value.filter(
            (w) =>
              (w.from.toUpperCase() === holeName.toUpperCase() ||
                w.to.toUpperCase() === holeName.toUpperCase()),
          ).length > 0,
      )

      return { connector, holeName, isConnected }
    })

    return {
      ...part,
      innerSvg,
      bounds,
      baseTransform,
      displayTransform,
      connectorStatus,
    }
  })
})

const placementPreview = computed(() => {
  if (!pendingPlacementPartId.value || !hoverBoardPoint.value) {
    return null
  }

  const targetHole = findNearestHole(hoverBoardPoint.value, holePitch.value * 0.9)
  if (!targetHole) {
    return null
  }

  const part = partCatalog.value.find((item) => item.id === pendingPlacementPartId.value)
  if (!part) {
    return null
  }

  const rotation = partRotations[part.id] ?? 0
  const mapping = computePlacementFromAnchor(part, targetHole.name, rotation)
  if (!mapping) {
    return null
  }

  const { innerSvg, bounds } = getSvgMarkupInfo(part.package)
  const targetAnchors = Object.entries(mapping)
    .map(([connectorId, holeName]) => {
      const connector = part.package.connectors.find((item) => item.id === connectorId)
      const targetHole = boardHoleLookup.value.get(holeName.toUpperCase())
      if (!connector?.anchor || !targetHole?.anchor) {
        return null
      }

      return {
        key: connectorId,
        x: targetHole.anchor.x,
        y: targetHole.anchor.y,
      }
    })
    .filter(Boolean)

  return {
    innerSvg,
    bounds,
    transform: buildPartTransform({ ...part, holes: mapping, rotation }, boardHoleLookup.value),
    targetAnchors,
  }
})

const currentTargetPartId = computed(() => {
  return pendingPlacementPartId.value || selectedPartId.value || ''
})

const activePalettePartId = computed(() => {
  return pendingPlacementPartId.value || selectedPartId.value || ''
})

const paletteDragPart = computed(() => {
  return paletteDragState.value ? partCatalog.value.find((item) => item.id === paletteDragState.value.partId) || null : null
})

const paletteGhostStyle = computed(() => {
  if (!paletteDragState.value) {
    return {}
  }

  return {
    left: `${paletteDragState.value.clientX + 16}px`,
    top: `${paletteDragState.value.clientY + 16}px`,
  }
})

const regulatorModel = computed(() => {
  const vref = vin.value > 6.7 ? 6.2 : Math.max(0, vin.value - 0.45)
  const nominalVout = 6.2 * (1 + 4.7 / 10)
  const achievableVout = Math.max(0, vin.value - 1.45 - loadCurrent.value * 0.58)
  const regulationSag = loadCurrent.value * 0.32
  const vout = clamp(Math.min(nominalVout - regulationSag, achievableVout), 0, vin.value - 0.18)
  const vminus = vout * (10 / 14.7)
  const vplus = vref
  const error = vplus - vminus
  const opAmpOut = clamp(4.2 + error * 3.6, 0.8, Math.max(0.8, vin.value - 1.05))
  const baseVoltage = clamp(Math.min(vout + 0.72, opAmpOut), 0, vin.value - 0.35)
  const beta = 55
  const baseCurrent = loadCurrent.value / beta
  const feedbackCurrent = vout / 14700
  const zenerCurrent = Math.max((vin.value - vref) / 470 - feedbackCurrent - baseCurrent * 0.18, 0)
  const supplyCurrent = loadCurrent.value + baseCurrent + feedbackCurrent + zenerCurrent
  const mode = achievableVout < nominalVout - 0.18 ? 'dropout' : Math.abs(error) < 0.08 ? 'regulated' : 'correcting'

  return {
    vref,
    vplus,
    vminus,
    opAmpOut,
    baseVoltage,
    vout,
    baseCurrent,
    feedbackCurrent,
    zenerCurrent,
    supplyCurrent,
    modeLabel: mode === 'dropout' ? 'DROP OUT' : mode === 'regulated' ? 'REGULATING' : 'CORRECTING',
  }
})

const boardNodes = computed(() => {
  const nodes = [
    {
      id: 'vin',
      label: 'VIN',
      shortLabel: 'VIN',
      hole: '32topRed',
      voltage: vin.value,
      current: regulatorModel.value.supplyCurrent,
      power: vin.value * regulatorModel.value.supplyCurrent,
      color: '#ff5f7a',
    },
    {
      id: 'vref',
      label: 'Vref',
      shortLabel: 'REF',
      hole: '28K',
      voltage: regulatorModel.value.vref,
      current: regulatorModel.value.zenerCurrent,
      power: regulatorModel.value.vref * regulatorModel.value.zenerCurrent,
      color: '#34d399',
    },
    {
      id: 'vp',
      label: 'V+',
      shortLabel: 'V+',
      hole: '33I',
      voltage: regulatorModel.value.vplus,
      current: regulatorModel.value.feedbackCurrent * 0.1,
      power: regulatorModel.value.vplus * regulatorModel.value.feedbackCurrent * 0.1,
      color: '#67e8f9',
    },
    {
      id: 'vm',
      label: 'V−',
      shortLabel: 'V-',
      hole: '32I',
      voltage: regulatorModel.value.vminus,
      current: regulatorModel.value.feedbackCurrent,
      power: regulatorModel.value.vminus * regulatorModel.value.feedbackCurrent,
      color: '#fbbf24',
    },
    {
      id: 'out741',
      label: '741 OUT',
      shortLabel: 'OUT',
      hole: '33L',
      voltage: regulatorModel.value.opAmpOut,
      current: regulatorModel.value.baseCurrent,
      power: regulatorModel.value.opAmpOut * regulatorModel.value.baseCurrent,
      color: '#f472b6',
    },
    {
      id: 'base',
      label: 'NPN Base',
      shortLabel: 'B',
      hole: '41N',
      voltage: regulatorModel.value.baseVoltage,
      current: regulatorModel.value.baseCurrent,
      power: regulatorModel.value.baseVoltage * regulatorModel.value.baseCurrent,
      color: '#a78bfa',
    },
    {
      id: 'vl',
      label: 'VL',
      shortLabel: 'VL',
      hole: '42N',
      voltage: regulatorModel.value.vout,
      current: loadCurrent.value,
      power: regulatorModel.value.vout * loadCurrent.value,
      color: '#38bdf8',
    },
    {
      id: 'rl',
      label: 'RL',
      shortLabel: 'RL',
      hole: '42Q',
      voltage: regulatorModel.value.vout,
      current: loadCurrent.value,
      power: regulatorModel.value.vout * loadCurrent.value,
      color: '#fb923c',
    },
  ]

  return nodes
    .map((node) => ({
      ...node,
      anchor: boardHoleLookup.value.get(node.hole.toUpperCase())?.anchor || null,
    }))
    .filter((node) => node.anchor)
})

const selectedMeasurement = computed(() => {
  return boardNodes.value.find((node) => node.id === selectedNodeId.value) || boardNodes.value[0] || null
})

const continuityState = computed(() => {
  const keys = [...conductiveGroups.value.keys()]
  const dsu = createDisjointSet(keys)

  wires.value.forEach((wire) => {
    const left = getHoleContinuityKey(wire.from)
    const right = getHoleContinuityKey(wire.to)
    if (left && right) {
      dsu.union(left, right)
    }
  })

  const rootToHoles = new Map()
  conductiveGroups.value.forEach((holes, key) => {
    const root = dsu.find(key)
    if (!rootToHoles.has(root)) {
      rootToHoles.set(root, [])
    }

    rootToHoles.get(root).push(...holes)
  })

  return {
    findRoot(holeName) {
      const key = getHoleContinuityKey(holeName)
      return key ? dsu.find(key) : ''
    },
    holesFor(holeName) {
      const root = this.findRoot(holeName)
      return root ? rootToHoles.get(root) || [] : []
    },
  }
})

const continuitySummary = computed(() => {
  const focusHole = resolveConnectorToHole(wireDragState.value?.startConnector)?.name || selectedMeasurement.value?.hole || ''
  if (!focusHole) {
    return {
      title: '--',
      detail: '選擇量測點或開始插線後，顯示目前導通群組。',
    }
  }

  const holes = continuityState.value.holesFor(focusHole)
  return {
    title: focusHole,
    detail: `目前導通 ${holes.length} 個孔位。`,
  }
})

const pendingWireAnchor = computed(() => {
  if (!wireDragState.value?.startConnector) {
    return null
  }

  return wireDragState.value.startConnector.position || null
})

const renderedWires = computed(() => {
  return wires.value
    .map((wire) => {
      const start = boardHoleLookup.value.get(wire.from.toUpperCase())?.anchor
      const end = boardHoleLookup.value.get(wire.to.toUpperCase())?.anchor
      if (!start || !end) {
        return null
      }

      return {
        ...wire,
        path: routedWirePath(start, end, wire.via),
      }
    })
    .filter(Boolean)
})

const wirePreviewPath = computed(() => {
  if (!wireDragState.value) {
    return ''
  }

  const startConnector = wireDragState.value.startConnector
  const start = startConnector?.position

  if (!start) {
    return ''
  }

  // Use currentConnector if available (hit a target), otherwise use currentPoint
  const end = wireDragState.value.currentConnector?.position || wireDragState.value.currentPoint

  if (!end) {
    return ''
  }

  return routedWirePath(start, end, wireDragState.value.currentPoint)
})


const activeSelectionLabel = computed(() => {
  if (pendingPlacementPartId.value) {
    const part = partCatalog.value.find((item) => item.id === pendingPlacementPartId.value)
    return part ? `待放置 ${part.label}` : '待放置元件'
  }

  if (selectedWireId.value) {
    return '已選擇導線'
  }

  if (selectedPartId.value) {
    const part = partCatalog.value.find((item) => item.id === selectedPartId.value)
    return part ? `已選擇 ${part.label}` : '已選擇元件'
  }

  return '未選擇元件'
})

const inspectorHint = computed(() => {
  if (paletteDragState.value) {
    return '拖到合法洞位後放開，綠光會標示吸附點。'
  }

  if (pendingPlacementPartId.value) {
    return '點麵包板孔位完成放置。'
  }

  if (selectedWireId.value) {
    return 'Delete 可刪除目前導線。'
  }

  if (selectedPartId.value) {
    return '元件只允許 0° / 90° / 180° / 270°，尺寸固定。'
  }

  return '先選元件，再點麵包板放置。'
})

const inspectorModeLabel = computed(() => {
  if (paletteDragState.value) {
    return 'DRAGGING PART'
  }

  if (pendingPlacementPartId.value) {
    return 'PLACING PART'
  }

  if (wireDragState.value || pendingWireStart.value) {
    return 'WIRING'
  }

  if (wireMode.value) {
    return pendingWireStart.value ? 'WIRING END' : 'WIRING START'
  }

  if (selectedWireId.value) {
    return 'WIRE SELECTED'
  }

  if (selectedPartId.value) {
    return 'PART SELECTED'
  }

  return 'IDLE'
})

const selectedPartSummary = computed(() => {
  if (paletteDragState.value) {
    return '從元件窗口拖曳到麵包板，放開即放置。'
  }

  if (pendingPlacementPartId.value) {
    return '旋轉後會同步更新放置預覽。'
  }

  if (!selectedPartId.value || !partPlacements[selectedPartId.value]) {
    return '元件尺寸固定，不允許縮放。'
  }

  const holes = Object.values(partPlacements[selectedPartId.value])
  return holes.length ? `腳位：${holes.join(', ')}` : '元件尺寸固定，不允許縮放。'
})

const hasCancelableAction = computed(() => {
  return Boolean(
    pendingPlacementPartId.value || pendingWireStart.value || selectedPartId.value || selectedWireId.value || paletteDragState.value,
  )
})

onMounted(async () => {
  try {
    loadingAssets.value = true
    packages.value = await loadPublicFritzingPackages()
    resetPlacements()
    window.addEventListener('keydown', handleKeyDown)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error)
  } finally {
    loadingAssets.value = false
  }
})

onUnmounted(() => {
  stopDrag()
  stopPaletteDrag()
  isPanning.value = false
  window.removeEventListener('keydown', handleKeyDown)
})

function handleKeyDown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    clearSelectionState()
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault()
    undo()
    return
  }

  if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.shiftKey && event.key === 'z'))) {
    event.preventDefault()
    redo()
    return
  }

  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (isEditableKeyTarget(event.target)) {
      return
    }

    event.preventDefault()

    if (wireDragState.value) {
      pendingWireStart.value = ''
      wireDragState.value = null
      return
    }

    if (pendingWireStart.value) {
      pendingWireStart.value = ''
      return
    }

    if (selectedWireId.value) {
      removeSelectedWire()
      return
    }

    if (selectedPartId.value) {
      removeSelectedPart()
      return
    }
  }

  if ((event.key === 'r' || event.key === 'R') && currentTargetPartId.value) {
    event.preventDefault()
    rotateTargetPart(90)
  }
}

function resetPlacements() {
  PART_LAYOUTS.forEach((layout) => {
    delete partPlacements[layout.id]
    partRotations[layout.id] = 0
  })

  selectedPartId.value = ''
  selectedWireId.value = ''
  pendingPlacementPartId.value = ''
  dragState.value = null
  hoverBoardPoint.value = null
  wireDragState.value = null
  paletteDragState.value = null
  pendingWireStart.value = ''
  wireMode.value = false
  wires.value = []
  nextWireId = 1
  
  // Reset history
  history.stack = []
  history.currentIndex = -1
  
  // Reset zoom and pan
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
  isPanning.value = false
}

function clearWires() {
  wires.value = []
  pendingWireStart.value = ''
  selectedWireId.value = ''
}

function clearSelectionState() {
  pendingPlacementPartId.value = ''
  pendingWireStart.value = ''
  selectedPartId.value = ''
  selectedWireId.value = ''
  hoverBoardPoint.value = null
  wireDragState.value = null
  paletteDragState.value = null
  if (wireMode.value) {
    wireMode.value = false
  }
  stopDrag()
  stopPaletteDrag()
}

function toggleWireMode() {
  wireMode.value = !wireMode.value
  pendingWireStart.value = ''
  pendingPlacementPartId.value = ''
  selectedWireId.value = ''
  hoverBoardPoint.value = null
  wireDragState.value = null
  stopDrag()
  stopPaletteDrag()
}

function startPaletteDrag(event, partId) {
  if (loadingAssets.value || partPlacements[partId]) {
    return
  }

  suppressPaletteClick = true
  pendingPlacementPartId.value = partId
  selectedPartId.value = ''
  selectedWireId.value = ''
  wireMode.value = false
  hoverBoardPoint.value = null
  paletteDragState.value = {
    partId,
    clientX: event.clientX,
    clientY: event.clientY,
  }

  window.addEventListener('pointermove', handlePalettePointerMove)
  window.addEventListener('pointerup', handlePalettePointerUp)
}

function handlePalettePointerMove(event) {
  if (!paletteDragState.value) {
    return
  }

  paletteDragState.value = {
    ...paletteDragState.value,
    clientX: event.clientX,
    clientY: event.clientY,
  }

  const pointer = pointerToBoard(event)
  hoverBoardPoint.value = pointer
}

function handlePalettePointerUp(event) {
  if (!paletteDragState.value) {
    stopPaletteDrag()
    return
  }

  const pointer = pointerToBoard(event)
  if (pointer && pendingPlacementPartId.value) {
    placePendingPart(pointer)
  } else {
    pendingPlacementPartId.value = ''
    hoverBoardPoint.value = null
  }

  stopPaletteDrag()
  window.setTimeout(() => {
    suppressPaletteClick = false
  }, 0)
}

function stopPaletteDrag() {
  paletteDragState.value = null
  hoverBoardPoint.value = null
  window.removeEventListener('pointermove', handlePalettePointerMove)
  window.removeEventListener('pointerup', handlePalettePointerUp)
}

function selectPalettePart(partId) {
  if (suppressPaletteClick) {
    suppressPaletteClick = false
    return
  }

  selectedWireId.value = ''
  wireMode.value = false

  if (partPlacements[partId]) {
    selectedPartId.value = partId
    pendingPlacementPartId.value = ''
    return
  }

  pendingPlacementPartId.value = partId
  selectedPartId.value = ''
}

function partStatusLabel(partId) {
  if (pendingPlacementPartId.value === partId) {
    return `待放置 · ${partStatusRotation(partId)}°`
  }

  if (partPlacements[partId]) {
    return `已放置 · ${partStatusRotation(partId)}°`
  }

  return `未放置 · ${partStatusRotation(partId)}°`
}

function partStatusRotation(partId) {
  return normalizeRotation(partRotations[partId] ?? 0)
}

function rotateTargetPart(delta) {
  const targetPartId = currentTargetPartId.value
  if (!targetPartId) {
    return
  }

  const nextRotation = normalizeRotation((partRotations[targetPartId] ?? 0) + delta)
  partRotations[targetPartId] = nextRotation

  if (!partPlacements[targetPartId]) {
    return
  }

  const part = partCatalog.value.find((item) => item.id === targetPartId)
  if (!part) {
    return
  }

  const baseConnector = getBaseConnector(part)
  if (!baseConnector) {
    return
  }

  const anchorHoleName = partPlacements[targetPartId][baseConnector.id]
  const mapping = computePlacementFromAnchor(part, anchorHoleName, nextRotation)
  if (mapping) {
    partPlacements[targetPartId] = mapping
    captureState()
  }
}

function selectWire(wireId) {
  selectedWireId.value = wireId
  selectedPartId.value = ''
  pendingPlacementPartId.value = ''
}

function getSelectedWireColor() {
  if (!selectedWireId.value) return ''
  const wire = wires.value.find((w) => w.id === selectedWireId.value)
  return wire?.color || '#2563eb'
}

function setSelectedWireColor(color) {
  if (!selectedWireId.value) return
  const wire = wires.value.find((w) => w.id === selectedWireId.value)
  if (wire) {
    wire.color = color
    captureState()
  }
}

function removeSelectedWire() {
  if (!selectedWireId.value) {
    return
  }

  wires.value = wires.value.filter((wire) => wire.id !== selectedWireId.value)
  selectedWireId.value = ''
  
  captureState()
}

function removeSelectedPart() {
  if (!selectedPartId.value) {
    return
  }

  const removedPartId = selectedPartId.value
  const connectedHoles = getPartConnectedHoleNames(removedPartId)

  delete partPlacements[removedPartId]
  selectedPartId.value = ''
  wires.value = wires.value.filter((wire) => {
    return !connectedHoles.has(wire.from.toUpperCase()) && !connectedHoles.has(wire.to.toUpperCase())
  })
  
  captureState()
}

function getPartConnectedHoleNames(partId) {
  const mapping = partPlacements[partId] || {}
  return new Set(Object.values(mapping).filter(Boolean).map((holeName) => holeName.toUpperCase()))
}

function isEditableKeyTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

function selectNode(nodeId) {
  selectedNodeId.value = nodeId
  selectedWireId.value = ''
}

function findPackage(fragment) {
  return packages.value.find((item) => item.moduleId.toLowerCase().includes(fragment.toLowerCase())) || null
}

function parseViewBox(svgText) {
  if (!svgText) {
    return null
  }

  const svgDoc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const viewBox = svgDoc.documentElement.getAttribute('viewBox')
  if (!viewBox) {
    return null
  }

  const parts = viewBox.trim().split(/\s+/).map((value) => Number.parseFloat(value) || 0)
  if (parts.length !== 4) {
    return null
  }

  return {
    minX: parts[0],
    minY: parts[1],
    width: parts[2],
    height: parts[3],
  }
}

function getSvgMarkupInfo(partPackage) {
  if (svgMarkupCache.has(partPackage.key)) {
    return svgMarkupCache.get(partPackage.key)
  }

  const svgDoc = new DOMParser().parseFromString(partPackage.svgText, 'image/svg+xml')
  const svgRoot = svgDoc.documentElement
  svgRoot.removeAttribute('width')
  svgRoot.removeAttribute('height')

  const bounds = parseViewBox(partPackage.svgText) || { minX: 0, minY: 0, width: 12, height: 12 }
  const info = {
    innerSvg: svgRoot.innerHTML,
    bounds,
  }

  svgMarkupCache.set(partPackage.key, info)
  return info
}

function getPreviewMarkup(partPackage) {
  if (svgPreviewCache.has(partPackage.key)) {
    return svgPreviewCache.get(partPackage.key)
  }

  const svgDoc = new DOMParser().parseFromString(partPackage.svgText, 'image/svg+xml')
  const svgRoot = svgDoc.documentElement
  svgRoot.removeAttribute('width')
  svgRoot.removeAttribute('height')
  svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet')

  const markup = new XMLSerializer().serializeToString(svgRoot)
  svgPreviewCache.set(partPackage.key, markup)
  return markup
}

function getBaseConnector(part) {
  return part.package.connectors.find((connector) => connector.anchor) || null
}

function buildPartTransform(part, holeLookup) {
  const baseConnector = getBaseConnector(part)
  if (!baseConnector) {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  }

  const holeName = part.holes?.[baseConnector.id]
  const target = holeName ? holeLookup.get(holeName.toUpperCase())?.anchor : null
  if (!target) {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  }

  const angle = degreesToRadians(part.rotation ?? 0)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  return {
    a: cos,
    b: sin,
    c: -sin,
    d: cos,
    e: target.x - (cos * baseConnector.anchor.x - sin * baseConnector.anchor.y),
    f: target.y - (sin * baseConnector.anchor.x + cos * baseConnector.anchor.y),
  }
}

function matrixToString(transform) {
  return `matrix(${transform.a} ${transform.b} ${transform.c} ${transform.d} ${transform.e} ${transform.f})`
}

function applyDragOffset(transform, dx, dy) {
  return {
    ...transform,
    e: transform.e + dx,
    f: transform.f + dy,
  }
}

function applyMatrix(transform, point) {
  return {
    x: transform.a * point.x + transform.c * point.y + transform.e,
    y: transform.b * point.x + transform.d * point.y + transform.f,
  }
}

function startPartDrag(event, partId) {
  if (wireMode.value || pendingPlacementPartId.value || loadingAssets.value) {
    return
  }

  const pointer = pointerToBoard(event)
  if (!pointer) {
    return
  }

  const hitResult = hitTestAtPointer(pointer)
  if (hitResult.type === 'connector' && hitResult.connector?.type === 'partPin' && hitResult.connector.partId === partId) {
    return
  }

  event.stopPropagation()
  selectedPartId.value = partId
  selectedWireId.value = ''
  dragState.value = {
    partId,
    startX: pointer.x,
    startY: pointer.y,
    dx: 0,
    dy: 0,
  }

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
}

function handlePointerMove(event) {
  if (!dragState.value) {
    return
  }

  const pointer = pointerToBoard(event)
  if (!pointer) {
    return
  }

  dragState.value = {
    ...dragState.value,
    dx: pointer.x - dragState.value.startX,
    dy: pointer.y - dragState.value.startY,
  }
}

function handlePointerUp() {
  if (!dragState.value) {
    stopDrag()
    return
  }

  const renderedPart = renderedParts.value.find((part) => part.id === dragState.value.partId)
  if (renderedPart) {
    const snapped = snapPartToBoard(renderedPart)
    if (snapped) {
      partPlacements[renderedPart.id] = snapped
      captureState()
    }
  }

  stopDrag()
}

function stopDrag() {
  dragState.value = null
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
}

function snapPartToBoard(part) {
  const holes = boardHoleList.value
  if (holes.length === 0) {
    return null
  }

  const transform = applyDragOffset(part.baseTransform, dragState.value?.dx || 0, dragState.value?.dy || 0)
  const threshold = holePitch.value * 0.92
  const used = new Set()
  const mapping = {}

  for (const connector of part.package.connectors) {
    if (!connector.anchor) {
      continue
    }

    const transformedAnchor = applyMatrix(transform, connector.anchor)
    let bestHole = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (const hole of holes) {
      if (used.has(hole.name)) {
        continue
      }

      const owner = occupiedHoleOwners.value.get(hole.name.toUpperCase())
      if (owner && owner !== part.id) {
        continue
      }

      const distance = Math.hypot(hole.anchor.x - transformedAnchor.x, hole.anchor.y - transformedAnchor.y)
      if (distance < bestDistance) {
        bestDistance = distance
        bestHole = hole
      }
    }

    if (!bestHole || bestDistance > threshold) {
      return null
    }

    used.add(bestHole.name)
    mapping[connector.id] = bestHole.name
  }

  return mapping
}

function handleBoardClick(event) {
  const pointer = pointerToBoard(event)
  if (!pointer) {
    return
  }

  if (pendingPlacementPartId.value) {
    placePendingPart(pointer)
    return
  }

  if (wireMode.value) {
    return
  }

  selectedPartId.value = ''
  selectedWireId.value = ''
}

function handleBoardPointerMove(event) {
  // Handle panning
  if (isPanning.value) {
    const deltaX = event.clientX - panStartX.value
    const deltaY = event.clientY - panStartY.value
    
    // Scale delta by zoom level
    panX.value -= deltaX / (zoomLevel.value * 50)
    panY.value -= deltaY / (zoomLevel.value * 50)
    
    panStartX.value = event.clientX
    panStartY.value = event.clientY
    return
  }

  const pointer = pointerToBoard(event)
  if (!pointer) {
    return
  }

  hoverBoardPoint.value = pointer

  if (wireDragState.value) {
    // Use priority hit-test to find target connector
    const hitResult = hitTestAtPointer(pointer)
    let targetConnector = null
    
    if (hitResult.type === 'connector') {
      targetConnector = hitResult.connector
    }

    wireDragState.value = {
      ...wireDragState.value,
      currentPoint: pointer,
      currentConnector: targetConnector,
      currentHole: targetConnector?.holeName || '', // Keep for backward compatibility
    }
  }
}


function handleWheel(event) {
  event.preventDefault()
  
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const maxZoom = 4
  const minZoom = 0.5
  
  const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel.value * delta))
  zoomLevel.value = newZoom
}

function handleBoardPointerDown(event) {
  if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
    isPanning.value = true
    panStartX.value = event.clientX
    panStartY.value = event.clientY
    return
  }

  if (event.button !== 0 || pendingPlacementPartId.value || loadingAssets.value) {
    return
  }

  const pointer = pointerToBoard(event)
  if (!pointer) {
    return
  }

  const hitResult = hitTestAtPointer(pointer)
  if (hitResult.type === 'connector') {
    startWireFromConnector(hitResult.connector)
    return
  }

  if (hitResult.type === 'wireEnd' || hitResult.type === 'wireBody') {
    selectWire(hitResult.wire.id)
    return
  }

  if (hitResult.type === 'partBody') {
    selectedPartId.value = hitResult.part.id
    selectedWireId.value = ''
    return
  }

  selectedPartId.value = ''
  selectedWireId.value = ''
}

function startWireFromConnector(connector) {
  if (!connector) {
    return
  }

  selectedPartId.value = ''
  selectedWireId.value = ''

  // Store connector info instead of just hole name
  pendingWireStart.value = connector.id
  wireDragState.value = {
    startConnector: connector,
    currentPoint: connector.position,
    currentConnector: null,
    currentHole: '', // Keep for backward compatibility during transition
  }
}

function handleBoardPointerUp(event) {
  if (isPanning.value) {
    isPanning.value = false
    return
  }

  if (!wireDragState.value) {
    return
  }

  const pointer = pointerToBoard(event)
  let releaseConnector = wireDragState.value.currentConnector
  let currentPoint = wireDragState.value.currentPoint

  if (pointer) {
    const hitResult = hitTestAtPointer(pointer)
    releaseConnector = hitResult.type === 'connector' ? hitResult.connector : releaseConnector
    currentPoint = pointer
  }

  const startConnector = wireDragState.value.startConnector
  const startHole = resolveConnectorToHole(startConnector)
  const endHole = resolveConnectorToHole(releaseConnector)

  if (startHole && endHole && startHole.name.toUpperCase() !== endHole.name.toUpperCase()) {
    wires.value = [
      ...wires.value,
      {
        id: `user-${nextWireId++}`,
        from: startHole.name,
        to: endHole.name,
        color: getSelectedWireColor(),
        width: 3.1,
        via: buildWireViaPoint(startHole.anchor, endHole.anchor, currentPoint),
      },
    ]
    captureState()
  }

  pendingWireStart.value = ''
  wireDragState.value = null
}

function clearHoverPreview() {
  hoverBoardPoint.value = null
  if (wireDragState.value) {
    wireDragState.value = {
      ...wireDragState.value,
      currentHole: '',
    }
  }
}

function placePendingPart(pointer) {
  const hole = findNearestHole(pointer, holePitch.value * 0.9)
  if (!hole) {
    return
  }

  const part = partCatalog.value.find((item) => item.id === pendingPlacementPartId.value)
  if (!part) {
    return
  }

  const rotation = partRotations[part.id] ?? 0
  const mapping = computePlacementFromAnchor(part, hole.name, rotation)
  if (!mapping) {
    return
  }

  partPlacements[part.id] = mapping
  selectedPartId.value = part.id
  pendingPlacementPartId.value = ''
  hoverBoardPoint.value = null
  
  captureState()
}

function computePlacementFromAnchor(part, anchorHoleName, rotation) {
  const anchorHole = boardHoleLookup.value.get(anchorHoleName.toUpperCase())
  const baseConnector = getBaseConnector(part)
  if (!anchorHole || !baseConnector) {
    return null
  }

  const angle = degreesToRadians(rotation)
  const basePoint = rotatePoint(baseConnector.anchor, angle)
  const used = new Set()
  const mapping = {}
  const threshold = holePitch.value * 0.92

  for (const connector of part.package.connectors) {
    if (!connector.anchor) {
      continue
    }

    const rotated = rotatePoint(connector.anchor, angle)
    const projected = {
      x: rotated.x - basePoint.x + anchorHole.anchor.x,
      y: rotated.y - basePoint.y + anchorHole.anchor.y,
    }

    let bestHole = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (const hole of boardHoleList.value) {
      if (used.has(hole.name)) {
        continue
      }

      const owner = occupiedHoleOwners.value.get(hole.name.toUpperCase())
      if (owner && owner !== part.id) {
        continue
      }

      const distance = Math.hypot(hole.anchor.x - projected.x, hole.anchor.y - projected.y)
      if (distance < bestDistance) {
        bestDistance = distance
        bestHole = hole
      }
    }

    if (!bestHole || bestDistance > threshold) {
      return null
    }

    used.add(bestHole.name)
    mapping[connector.id] = bestHole.name
  }

  return mapping
}

// Priority-based hit test: connector > wireEnd > wireBody > partBody > board
function hitTestAtPointer(point, maxDistance = Number.POSITIVE_INFINITY) {
  const connectorCandidates = []

  for (const connector of allConnectors.value) {
    const distance = Math.hypot(connector.position.x - point.x, connector.position.y - point.y)
    const connectorHitZone = connector.hitRadius || getConnectorHitRadius(connector.holeName || connector.pinName, connector.type)
    if (distance <= connectorHitZone && distance <= maxDistance) {
      connectorCandidates.push({ type: 'connector', connector, distance })
    }
  }

  if (connectorCandidates.length) {
    connectorCandidates.sort((left, right) => {
      const leftLayer = left.connector.type === 'partPin' ? 0 : 1
      const rightLayer = right.connector.type === 'partPin' ? 0 : 1
      return leftLayer - rightLayer || left.distance - right.distance
    })

    return connectorCandidates[0]
  }

  const wireEndHitZone = holePitch.value * 0.8
  for (const wire of renderedWires.value) {
    const startHole = boardHoleLookup.value.get(wire.from.toUpperCase())
    if (startHole) {
      const distance = Math.hypot(startHole.anchor.x - point.x, startHole.anchor.y - point.y)
      if (distance <= wireEndHitZone && distance <= maxDistance) {
        return { type: 'wireEnd', wire, distance }
      }
    }

    const endHole = boardHoleLookup.value.get(wire.to.toUpperCase())
    if (endHole) {
      const distance = Math.hypot(endHole.anchor.x - point.x, endHole.anchor.y - point.y)
      if (distance <= wireEndHitZone && distance <= maxDistance) {
        return { type: 'wireEnd', wire, distance }
      }
    }
  }

  const wireBodyHitZone = holePitch.value * 0.5
  for (const wire of renderedWires.value) {
    const startHole = boardHoleLookup.value.get(wire.from.toUpperCase())
    const endHole = boardHoleLookup.value.get(wire.to.toUpperCase())
    if (!startHole || !endHole) continue

    const points = wire.via ? [startHole.anchor, wire.via, endHole.anchor] : [startHole.anchor, endHole.anchor]
    const distance = distanceToPolyline(point, points)

    if (distance <= wireBodyHitZone && distance <= maxDistance) {
      return { type: 'wireBody', wire, distance }
    }
  }

  for (const part of renderedParts.value) {
    if (!part.bounds) continue

    if (pointInTransformedBounds(point, part.bounds, part.displayTransform)) {
      return { type: 'partBody', part, distance: 0 }
    }
  }

  return { type: 'board', distance: 0 }
}

function resolveConnectorToHole(connector) {
  if (!connector) {
    return null
  }

  if (connector.type === 'boardHole') {
    return boardHoleLookup.value.get(connector.holeName.toUpperCase()) || null
  }

  if (connector.type === 'partPin') {
    const part = renderedParts.value.find((item) => item.id === connector.partId)
    const holeName = part?.holes?.[connector.pinId]
    return holeName ? boardHoleLookup.value.get(holeName.toUpperCase()) || null : null
  }

  return null
}

function pointInTransformedBounds(point, bounds, transform) {
  const corners = [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.minX + bounds.width, y: bounds.minY },
    { x: bounds.minX + bounds.width, y: bounds.minY + bounds.height },
    { x: bounds.minX, y: bounds.minY + bounds.height },
  ].map((corner) => applyMatrix(transform, corner))

  return pointInPolygon(point, corners)
}

function pointInPolygon(point, polygon) {
  let inside = false

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index]
    const previousPoint = polygon[previous]
    const crosses =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x < ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) / (previousPoint.y - currentPoint.y) + currentPoint.x

    if (crosses) {
      inside = !inside
    }
  }

  return inside
}

function distanceToPolyline(point, points) {
  let bestDistance = Number.POSITIVE_INFINITY

  for (let index = 0; index < points.length - 1; index += 1) {
    bestDistance = Math.min(bestDistance, distanceToSegment(point, points[index], points[index + 1]))
  }

  return bestDistance
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y)
  }

  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared))
  const closestX = start.x + t * dx
  const closestY = start.y + t * dy
  return Math.hypot(point.x - closestX, point.y - closestY)
}

function findNearestHole(point, threshold) {
  let bestHole = null
  let bestDistance = Number.POSITIVE_INFINITY

  for (const hole of boardHoleList.value) {
    const distance = Math.hypot(hole.anchor.x - point.x, hole.anchor.y - point.y)
    if (distance < bestDistance) {
      bestDistance = distance
      bestHole = hole
    }
  }

  return bestDistance <= threshold ? bestHole : null
}

function pointerToBoard(event) {
  const svg = overlaySvgRef.value
  const viewBox = runtimeViewBox.value
  if (!svg || !viewBox) {
    return null
  }

  const rect = svg.getBoundingClientRect()
  if (!rect.width || !rect.height) {
    return null
  }

  return {
    x: viewBox.minX + ((event.clientX - rect.left) / rect.width) * viewBox.width,
    y: viewBox.minY + ((event.clientY - rect.top) / rect.height) * viewBox.height,
  }
}

function estimateHolePitch(holes) {
  if (holes.length < 2) {
    return 10
  }

  const sample = holes.slice(0, 120)
  let minDistance = Number.POSITIVE_INFINITY

  for (let index = 0; index < sample.length; index += 1) {
    for (let inner = index + 1; inner < sample.length; inner += 1) {
      const left = sample[index].anchor
      const right = sample[inner].anchor
      const distance = Math.hypot(left.x - right.x, left.y - right.y)
      if (distance > 0.1 && distance < minDistance) {
        minDistance = distance
      }
    }
  }

  return Number.isFinite(minDistance) ? minDistance : 10
}

function routedWirePath(start, end, via) {
  if (!via) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
  }

  return `M ${start.x} ${start.y} L ${via.x} ${via.y} L ${end.x} ${end.y}`
}

function buildWireViaPoint(start, end, point) {
  if (!start || !end || !point) {
    return null
  }

  const total = Math.hypot(end.x - start.x, end.y - start.y)
  const startDistance = Math.hypot(point.x - start.x, point.y - start.y)
  const endDistance = Math.hypot(point.x - end.x, point.y - end.y)

  if (startDistance < 6 || endDistance < 6 || total < 10) {
    return null
  }

  return {
    x: point.x,
    y: point.y,
  }
}

function getHoleContinuityKey(name) {
  const match = /^(\d+)(topBlue|topRed|bottomBlue|bottomRed|[A-T])$/i.exec((name || '').trim())
  if (!match) {
    return ''
  }

  const row = match[1]
  const suffix = match[2]
  const normalized = suffix.toUpperCase()

  if (normalized === 'TOPBLUE' || normalized === 'TOPRED' || normalized === 'BOTTOMBLUE' || normalized === 'BOTTOMRED') {
    return `RAIL:${normalized}`
  }

  const band = getSignalBand(normalized)
  return band ? `ROW:${row}:${band}` : ''
}

function getConnectorHitRadius(name, type) {
  if (type === 'partPin') {
    return holePitch.value * 1.45
  }

  if (isRailHoleName(name)) {
    return holePitch.value * 1.75
  }

  return holePitch.value * 1.25
}

function isRailHoleName(name) {
  return /\d+(topBlue|topRed|bottomBlue|bottomRed)$/i.test((name || '').trim())
}

function getSignalBand(column) {
  if ('ABCDE'.includes(column)) return 'A-E'
  if ('FGHIJ'.includes(column)) return 'F-J'
  if ('KLMNO'.includes(column)) return 'K-O'
  if ('PQRST'.includes(column)) return 'P-T'
  return ''
}

function createDisjointSet(keys) {
  const parent = new Map(keys.map((key) => [key, key]))

  return {
    find(key) {
      if (!key) {
        return ''
      }

      if (!parent.has(key)) {
        parent.set(key, key)
      }

      let root = parent.get(key)
      while (root !== parent.get(root)) {
        root = parent.get(root)
      }

      let current = key
      while (current !== root) {
        const next = parent.get(current)
        parent.set(current, root)
        current = next
      }

      return root
    },
    union(left, right) {
      const leftRoot = this.find(left)
      const rightRoot = this.find(right)
      if (leftRoot && rightRoot && leftRoot !== rightRoot) {
        parent.set(rightRoot, leftRoot)
      }
    },
  }
}

function rotatePoint(point, angle) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return {
    x: cos * point.x - sin * point.y,
    y: sin * point.x + cos * point.y,
  }
}

function degreesToRadians(value) {
  return (normalizeRotation(value) * Math.PI) / 180
}

function normalizeRotation(value) {
  const normalized = value % 360
  return normalized < 0 ? normalized + 360 : normalized
}

function formatVoltage(value) {
  return `${value.toFixed(2)} V`
}

function formatCurrent(value) {
  if (Math.abs(value) < 1e-6) {
    return '0 A'
  }

  if (Math.abs(value) < 1e-3) {
    return `${(value * 1e6).toFixed(1)} µA`
  }

  if (Math.abs(value) < 1) {
    return `${(value * 1e3).toFixed(value * 1e3 < 10 ? 2 : 1)} mA`
  }

  return `${value.toFixed(2)} A`
}

function formatPower(value) {
  if (Math.abs(value) < 1e-3) {
    return `${(value * 1e3).toFixed(1)} mW`
  }

  return `${value.toFixed(2)} W`
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
</script>

<style scoped>
.runtime-shell {
  display: grid;
  grid-template-columns: minmax(230px, 280px) minmax(0, 1fr) minmax(220px, 250px);
  gap: 18px;
  align-items: start;
  min-height: 760px;
}

.control-column,
.tool-column {
  display: grid;
  gap: 14px;
}

.panel-card {
  position: relative;
  overflow: hidden;
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(0, 240, 255, 0.14);
  background:
    linear-gradient(160deg, rgba(4, 11, 28, 0.92), rgba(9, 19, 48, 0.84)),
    radial-gradient(circle at top right, rgba(255, 79, 163, 0.12), transparent 34%);
  box-shadow: 0 24px 54px rgba(1, 8, 22, 0.34);
}

.panel-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(0, 240, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.018) 1px, transparent 1px);
  background-size: 18px 18px;
  pointer-events: none;
}

.card-head {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.badge {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(0, 240, 255, 0.16);
  color: #a5f3fc;
  font-size: 0.68rem;
  font-weight: 800;
  font-family: var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.badge-slate {
  background: rgba(148, 163, 184, 0.18);
  color: #e2e8f0;
}

.control-card strong,
.tool-status strong,
.meter-shell strong {
  position: relative;
  z-index: 1;
  color: #eff9ff;
}

.control-card {
  display: grid;
  gap: 14px;
}

.control-field {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 8px;
}

.control-field span,
.meter-row span,
.tool-status span {
  color: #8dd9ff;
  font-size: 0.8rem;
  font-weight: 700;
}

.control-field input[type="range"] {
  width: 100%;
  accent-color: #00f0ff;
}

.board-column {
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-frame {
  position: relative;
  width: 100%;
  max-width: 1100px;
  min-height: 620px;
  border-radius: 30px;
  border: 1px solid rgba(0, 240, 255, 0.16);
  background:
    radial-gradient(circle at top, rgba(0, 240, 255, 0.08), transparent 38%),
    linear-gradient(180deg, rgba(2, 8, 18, 0.96), rgba(7, 17, 42, 0.92));
  box-shadow: inset 0 0 0 1px rgba(255, 79, 163, 0.06), 0 24px 60px rgba(1, 8, 22, 0.34);
  overflow: hidden;
}

.board-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(0, 240, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

.board-base,
.board-overlay {
  position: absolute;
  inset: 0;
}

.board-base {
  display: grid;
  place-items: center;
}

.board-base :deep(svg),
.board-overlay {
  width: 100%;
  height: 100%;
  display: block;
}

.board-overlay.placing,
.board-overlay.wiring {
  cursor: crosshair;
}

.board-overlay.panning {
  cursor: grabbing;
}

.board-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #9eb5c8;
  font-family: var(--font-mono);
  letter-spacing: 0.14em;
}

.board-error {
  color: #fca5a5;
}

.runtime-wire {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.92;
  cursor: pointer;
}

.runtime-wire.selected {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.48));
}

.wire-preview {
  stroke-dasharray: 10 7;
  opacity: 0.92;
  filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.55));
  pointer-events: none;
}

.part-preview {
  opacity: 0.48;
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.28));
  pointer-events: none;
}

.placement-glow-outer {
  fill: rgba(34, 197, 94, 0.18);
  stroke: rgba(34, 197, 94, 0.92);
  stroke-width: 1.2px;
  filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.72));
}

.placement-glow-inner {
  fill: rgba(134, 239, 172, 0.88);
  stroke: rgba(240, 253, 244, 0.92);
  stroke-width: 0.9px;
}

.part-group {
  cursor: grab;
}

.part-group.dragging {
  cursor: grabbing;
}

.part-group.selected {
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.35));
}

.connector-status-layer {
  pointer-events: none;
}

.connector-indicator {
  stroke-width: 0.8px;
  opacity: 0.88;
  filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.4));
}

.connector-indicator.connected {
  fill: #22c55e;
  stroke: #4ade80;
}

.connector-indicator.disconnected {
  fill: #ef4444;
  stroke: #f87171;
}

.part-hitbox {
  fill: transparent;
  stroke: rgba(0, 240, 255, 0);
  pointer-events: all;
}

.measure-node {
  cursor: pointer;
}

.measure-node text {
  font-family: var(--font-mono);
  font-size: 3.2px;
  font-weight: 700;
  fill: #03111f;
  paint-order: stroke;
  stroke: rgba(255, 255, 255, 0.86);
  stroke-width: 1px;
  stroke-linejoin: round;
}

.measure-node.active {
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
}

.pending-hole {
  fill: rgba(250, 204, 21, 0.28);
  stroke: #fbbf24;
  stroke-width: 1.6px;
}

.panel-note {
  position: relative;
  z-index: 1;
  margin: 12px 0 0;
  color: #9eb5c8;
  font-size: 0.88rem;
  line-height: 1.6;
}

.part-list {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 7px;
  margin-top: 10px;
}

.part-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  text-align: left;
  padding: 8px 9px;
  border-radius: 12px;
  border: 1px solid rgba(0, 240, 255, 0.08);
  background: rgba(4, 16, 40, 0.68);
  cursor: pointer;
  transition: border-color 0.18s ease, transform 0.18s ease;
}

.part-row:not(.placed) {
  cursor: grab;
}

.part-row:hover,
.part-row.active {
  border-color: rgba(0, 240, 255, 0.28);
  transform: translateY(-1px);
}

.part-row.placed {
  box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.18);
}

.part-row span {
  color: #a5f3fc;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.part-row strong,
.part-row small {
  color: #eff9ff;
}

.part-row strong {
  font-size: 0.82rem;
}

.part-row small {
  font-size: 0.68rem;
}

.part-thumb {
  width: 42px;
  height: 38px;
  display: grid;
  place-items: center;
  padding: 4px;
  border-radius: 9px;
  background: rgba(3, 12, 28, 0.82);
  border: 1px solid rgba(0, 240, 255, 0.08);
}

.part-thumb :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.palette-drag-ghost {
  position: fixed;
  z-index: 40;
  display: grid;
  justify-items: center;
  gap: 8px;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
}

.palette-drag-ghost .part-thumb {
  width: 84px;
  height: 72px;
  border-color: rgba(0, 240, 255, 0.28);
  box-shadow: 0 10px 24px rgba(1, 8, 22, 0.26);
}

.drag-ghost-label {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(3, 12, 28, 0.92);
  border: 1px solid rgba(0, 240, 255, 0.18);
  color: #e7fbff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.part-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.part-row small,
.tool-status small {
  color: #9eb5c8;
}

.rotation-tools,
.board-toolbar {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 10px;
}

.board-toolbar {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.tool-btn {
  border: 1px solid rgba(0, 240, 255, 0.14);
  background: rgba(4, 16, 40, 0.82);
  color: #e7fbff;
  border-radius: 10px;
  padding: 8px 9px;
  cursor: pointer;
  font-size: 0.78rem;
  transition: border-color 0.18s ease, transform 0.18s ease;
}

.tool-btn:hover:not(:disabled),
.tool-btn.active {
  border-color: rgba(0, 240, 255, 0.34);
  transform: translateY(-1px);
}

.tool-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.wire-color-picker {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.color-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(0, 240, 255, 0.24);
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 0 0 0 transparent;
}

.color-dot:hover {
  border-color: rgba(0, 240, 255, 0.48);
  transform: scale(1.1);
}

.color-dot.selected {
  border-color: rgba(0, 240, 255, 0.92);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.58), inset 0 0 8px rgba(255, 255, 255, 0.18);
}

.tool-status {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 6px;
  margin-top: 14px;
}

.meter-shell {
  display: grid;
  gap: 14px;
}

.inspector-meta {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 6px;
}

.inspector-meta span {
  color: #8dd9ff;
  font-size: 0.8rem;
  font-weight: 700;
}

.inspector-meta small {
  color: #9eb5c8;
}

.inspector-actions {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.meter-divider {
  position: relative;
  z-index: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.34), transparent);
}

.card-head-secondary {
  margin-top: -2px;
}

.meter-hole {
  position: relative;
  z-index: 1;
  margin-top: 4px;
  color: #e7fbff;
  font-size: 1rem;
  font-weight: 800;
}

.meter-voltage {
  position: relative;
  z-index: 1;
  color: #bbf7d0;
  font-family: var(--font-mono);
  font-size: 1.8rem;
  line-height: 1;
  text-shadow: 0 0 14px rgba(52, 211, 153, 0.32);
}

.meter-row {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.meter-row article {
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(4, 16, 40, 0.72);
  border: 1px solid rgba(0, 240, 255, 0.08);
}

.meter-row strong {
  display: block;
  margin-top: 8px;
}

@media (max-width: 1440px) {
  .runtime-shell {
    grid-template-columns: minmax(220px, 260px) minmax(0, 1fr) minmax(210px, 240px);
  }
}

@media (max-width: 1280px) {
  .runtime-shell {
    grid-template-columns: 1fr;
    min-height: 0;
    gap: 16px;
  }

  .board-column {
    order: 1;
  }

  .control-column {
    order: 2;
  }

  .tool-column {
    order: 3;
  }

  .board-frame {
    max-width: 100%;
  }
}

@media (max-width: 720px) {
  .runtime-shell {
    gap: 12px;
  }

  .panel-card {
    padding: 16px;
    border-radius: 22px;
  }

  .board-frame {
    min-height: 440px;
    border-radius: 24px;
  }

  .meter-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .board-toolbar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .runtime-shell {
    gap: 10px;
  }

  .board-frame {
    min-height: 360px;
  }

  .rotation-tools,
  .inspector-actions,
  .board-toolbar,
  .meter-row {
    grid-template-columns: 1fr;
  }

  .part-row {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .part-thumb {
    width: 42px;
    height: 38px;
  }
}
</style>
