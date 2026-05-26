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
            :viewBox="overlayViewBox"
            preserveAspectRatio="xMidYMid meet"
            @click="handleBoardClick"
          >
            <g class="wire-layer">
              <path
                v-for="wire in renderedWires"
                :key="wire.id"
                class="runtime-wire"
                :class="{ 'is-user-wire': wire.userCreated, selected: selectedWireId === wire.id }"
                :d="wire.path"
                :stroke="wire.color"
                :stroke-width="wire.width"
                @click.stop="selectWire(wire.id)"
              />
            </g>

            <g class="part-layer">
              <g
                v-for="part in renderedParts"
                :key="part.id"
                class="part-group"
                :class="{ selected: selectedPartId === part.id, dragging: dragState?.partId === part.id }"
                :transform="matrixToString(part.displayTransform)"
                @pointerdown.stop="startPartDrag($event, part.id)"
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

            <g class="measure-layer">
              <g
                v-for="node in boardNodes"
                :key="node.id"
                class="measure-node"
                :class="{ active: selectedNodeId === node.id }"
                @click.stop="selectNode(node.id)"
              >
                <circle :cx="node.anchor.x" :cy="node.anchor.y" :r="selectedNodeId === node.id ? 5.6 : 4.4" :fill="node.color" />
                <circle :cx="node.anchor.x" :cy="node.anchor.y" :r="selectedNodeId === node.id ? 8.2 : 6.6" fill="none" :stroke="node.color" />
                <text :x="node.anchor.x + 5" :y="node.anchor.y - 5">{{ node.shortLabel }}</text>
              </g>

              <circle
                v-if="pendingWireAnchor"
                class="pending-hole"
                :cx="pendingWireAnchor.x"
                :cy="pendingWireAnchor.y"
                :r="7"
              />
            </g>
          </svg>

          <div class="meter-float">
            <div class="board-toolbar">
              <button class="tool-btn" :class="{ active: wireMode }" @click="toggleWireMode">
                {{ wireMode ? '插線 ON' : '插線 OFF' }}
              </button>
              <button class="tool-btn" @click="resetPlacements">重設元件</button>
              <button class="tool-btn" @click="clearUserWires">清除新線</button>
            </div>

            <div class="meter-meta">
              <span>{{ activeSelectionLabel }}</span>
              <strong v-if="pendingWireStart">起點 {{ pendingWireStart }}</strong>
              <strong v-else-if="selectedWireId">Delete 可刪線</strong>
              <strong v-else-if="dragState">拖動中</strong>
              <strong v-else>{{ regulatorModel.modeLabel }}</strong>
            </div>

            <div class="meter-tag">{{ selectedMeasurement?.label ?? '--' }}</div>
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
        </template>
      </div>
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
const selectedPartId = ref('ua741')
const selectedWireId = ref('')
const vin = ref(12)
const loadCurrent = ref(0.28)
const wireMode = ref(false)
const pendingWireStart = ref('')
const dragState = ref(null)
const overlaySvgRef = ref(null)
const partPlacements = reactive({})
const partHidden = reactive({})
const wires = ref([])
let nextWireId = 1

const DEFAULT_WIRES = [
  { id: 'wire-1', from: '25topRed', to: '32topRed', color: '#ff5f7a', width: 3.6, userCreated: false },
  { id: 'wire-2', from: '25topRed', to: '28K', color: '#ff8c42', width: 3.2, userCreated: false },
  { id: 'wire-3', from: '28M', to: '28bottomBlue', color: '#67e8f9', width: 3.1, userCreated: false },
  { id: 'wire-4', from: '28K', to: '33I', color: '#34d399', width: 3.1, userCreated: false },
  { id: 'wire-5', from: '32L', to: '32topRed', color: '#ff5f7a', width: 3.1, userCreated: false },
  { id: 'wire-6', from: '34I', to: '34bottomBlue', color: '#67e8f9', width: 3.1, userCreated: false },
  { id: 'wire-7', from: '32I', to: '39Q', color: '#fbbf24', width: 3.1, userCreated: false },
  { id: 'wire-8', from: '33L', to: '41N', color: '#f472b6', width: 3.2, userCreated: false },
  { id: 'wire-9', from: '40N', to: '40topRed', color: '#ff5f7a', width: 3.4, userCreated: false },
  { id: 'wire-10', from: '42N', to: '42Q', color: '#38bdf8', width: 3.4, userCreated: false },
  { id: 'wire-11', from: '42Q', to: '42bottomBlue', color: '#fb923c', width: 3.1, userCreated: false },
]

const PART_LAYOUTS = [
  {
    id: 'ua741',
    match: 'custom_ua741_labeled_2x_tight',
    kind: 'IC',
    label: 'UA741',
    holes: {
      connector0: '31I',
      connector1: '32I',
      connector2: '33I',
      connector3: '34I',
      connector4: '34L',
      connector5: '33L',
      connector6: '32L',
      connector7: '31L',
    },
  },
  {
    id: 'npn',
    match: 'custom_npn_to92_cbe_2x_cbe_inside_fixed',
    kind: 'Transistor',
    label: 'NPN 2SC1384',
    holes: {
      connector0: '40N',
      connector1: '41N',
      connector2: '42N',
    },
  },
  {
    id: 'zener',
    match: 'custom_zener_u_6v2_2x_ultrashort',
    kind: 'Reference',
    label: 'ZD 6.2V',
    holes: {
      connector0: '28M',
      connector1: '28K',
    },
  },
  {
    id: 'rz',
    match: 'custom_resistor_470r_u_2x_ultrashort_center_label',
    kind: 'Resistor',
    label: '470R',
    holes: {
      connector0: '25topRed',
      connector1: '28K',
    },
  },
  {
    id: 'rb',
    match: 'custom_resistor_1k_u_2x_ultrashort_center_label',
    kind: 'Resistor',
    label: '1k',
    holes: {
      connector0: '33L',
      connector1: '41N',
    },
  },
  {
    id: 'r1',
    match: 'custom_resistor_4k7_u_2x_ultrashort_center_label',
    kind: 'Resistor',
    label: '4.7k',
    holes: {
      connector0: '42P',
      connector1: '39Q',
    },
  },
  {
    id: 'r2',
    match: 'custom_resistor_10k_u_2x_ultrashort_center_label',
    kind: 'Resistor',
    label: '10k',
    holes: {
      connector0: '39Q',
      connector1: '39bottomBlue',
    },
  },
]

const svgMarkupCache = new Map()

const boardPackage = computed(() => findPackage('custom_broad_breadboard_20row_clear'))

const boardHoleList = computed(() => {
  return (boardPackage.value?.connectors || []).filter((connector) => connector.anchor)
})

const boardHoleLookup = computed(() => {
  return new Map(boardHoleList.value.map((connector) => [connector.name.toUpperCase(), connector]))
})

const boardViewBox = computed(() => parseViewBox(boardPackage.value?.svgText || ''))

const overlayViewBox = computed(() => {
  const viewBox = boardViewBox.value
  return viewBox ? `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}` : '0 0 100 100'
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
  svgDoc.documentElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  return new XMLSerializer().serializeToString(svgDoc)
})

const holePitch = computed(() => estimateHolePitch(boardHoleList.value))

const placedParts = computed(() => {
  return PART_LAYOUTS.map((layout) => ({
    ...layout,
    package: findPackage(layout.match),
    holes: partPlacements[layout.id] || { ...layout.holes },
    hidden: Boolean(partHidden[layout.id]),
  }))
    .filter((item) => item.package)
    .filter((item) => !item.hidden)
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

    return {
      ...part,
      innerSvg,
      bounds,
      baseTransform,
      displayTransform,
    }
  })
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

const pendingWireAnchor = computed(() => {
  if (!pendingWireStart.value) {
    return null
  }

  return boardHoleLookup.value.get(pendingWireStart.value.toUpperCase())?.anchor || null
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
        path: orthogonalPath(start, end),
      }
    })
    .filter(Boolean)
})

const activeSelectionLabel = computed(() => {
  if (selectedWireId.value) {
    return '已選擇導線'
  }

  if (selectedPartId.value) {
    return renderedParts.value.find((part) => part.id === selectedPartId.value)?.label || '已選擇元件'
  }

  return '選擇元件'
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
  window.removeEventListener('keydown', handleKeyDown)
})

function handleKeyDown(event) {
  if (event.key !== 'Delete') {
    return
  }

  if (pendingWireStart.value) {
    pendingWireStart.value = ''
    return
  }

  if (selectedWireId.value) {
    wires.value = wires.value.filter((wire) => wire.id !== selectedWireId.value)
    selectedWireId.value = ''
    return
  }

  if (selectedPartId.value) {
    partHidden[selectedPartId.value] = true
    selectedPartId.value = ''
  }
}

function resetPlacements() {
  PART_LAYOUTS.forEach((layout) => {
    partPlacements[layout.id] = { ...layout.holes }
    partHidden[layout.id] = false
  })

  selectedPartId.value = PART_LAYOUTS[0].id
  selectedWireId.value = ''
  dragState.value = null
  pendingWireStart.value = ''
  wires.value = DEFAULT_WIRES.map((wire) => ({ ...wire }))
  nextWireId = 1
}

function clearUserWires() {
  wires.value = wires.value.filter((wire) => !wire.userCreated)
  pendingWireStart.value = ''
  selectedWireId.value = ''
}

function toggleWireMode() {
  wireMode.value = !wireMode.value
  pendingWireStart.value = ''
  selectedWireId.value = ''
  if (wireMode.value) {
    stopDrag()
  }
}

function selectWire(wireId) {
  selectedWireId.value = wireId
  selectedPartId.value = ''
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

function buildPartTransform(part, holeLookup) {
  const connectorPairs = part.package.connectors
    .map((connector) => {
      const holeName = part.holes[connector.id]
      const targetAnchor = holeName ? holeLookup.get(holeName.toUpperCase())?.anchor : null
      if (!connector.anchor || !targetAnchor) {
        return null
      }

      return {
        source: connector.anchor,
        target: targetAnchor,
      }
    })
    .filter(Boolean)

  if (connectorPairs.length === 0) {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  }

  if (connectorPairs.length === 1) {
    const pair = connectorPairs[0]
    return {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: pair.target.x - pair.source.x,
      f: pair.target.y - pair.source.y,
    }
  }

  const first = connectorPairs[0]
  const second = connectorPairs[1]
  const fromVector = {
    x: second.source.x - first.source.x,
    y: second.source.y - first.source.y,
  }
  const toVector = {
    x: second.target.x - first.target.x,
    y: second.target.y - first.target.y,
  }

  const fromLength = Math.hypot(fromVector.x, fromVector.y) || 1
  const toLength = Math.hypot(toVector.x, toVector.y) || 1
  const scale = toLength / fromLength
  const angle = Math.atan2(toVector.y, toVector.x) - Math.atan2(fromVector.y, fromVector.x)
  const cos = Math.cos(angle) * scale
  const sin = Math.sin(angle) * scale
  const e = first.target.x - (cos * first.source.x - sin * first.source.y)
  const f = first.target.y - (sin * first.source.x + cos * first.source.y)

  return {
    a: cos,
    b: sin,
    c: -sin,
    d: cos,
    e,
    f,
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
  if (wireMode.value || loadingAssets.value) {
    return
  }

  const pointer = pointerToBoard(event)
  if (!pointer) {
    return
  }

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
  const threshold = holePitch.value * 1.35
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
  if (!wireMode.value || !boardHoleList.value.length) {
    return
  }

  const pointer = pointerToBoard(event)
  if (!pointer) {
    return
  }

  const targetHole = findNearestHole(pointer, holePitch.value * 0.85)
  if (!targetHole) {
    return
  }

  if (!pendingWireStart.value) {
    pendingWireStart.value = targetHole.name
    return
  }

  if (pendingWireStart.value === targetHole.name) {
    pendingWireStart.value = ''
    return
  }

  wires.value = [
    ...wires.value,
    {
      id: `user-${nextWireId++}`,
      from: pendingWireStart.value,
      to: targetHole.name,
      color: '#22d3ee',
      width: 3.1,
      userCreated: true,
    },
  ]
  pendingWireStart.value = ''
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
  const viewBox = boardViewBox.value
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

function orthogonalPath(start, end) {
  const midX = start.x + (end.x - start.x) * 0.5
  return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`
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
  grid-template-columns: minmax(250px, 300px) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  min-height: 760px;
}

.control-column {
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
  font-family: 'Courier New', monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.badge-slate {
  background: rgba(148, 163, 184, 0.18);
  color: #e2e8f0;
}

.badge-amber {
  background: rgba(251, 191, 36, 0.16);
  color: #fde68a;
}

.control-card strong,
.meter-meta strong {
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
.meter-meta span {
  color: #8dd9ff;
  font-size: 0.8rem;
  font-weight: 700;
}

.control-field input[type="range"] {
  width: 100%;
  accent-color: #00f0ff;
}

.tool-btn {
  border: 1px solid rgba(0, 240, 255, 0.14);
  background: rgba(4, 16, 40, 0.82);
  color: #e7fbff;
  border-radius: 14px;
  padding: 10px 12px;
  cursor: pointer;
  transition: border-color 0.18s ease, transform 0.18s ease;
}

.tool-btn:hover,
.tool-btn.active {
  border-color: rgba(0, 240, 255, 0.34);
  transform: translateY(-1px);
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
  padding: 18px;
}

.board-base :deep(svg),
.board-overlay {
  width: 100%;
  height: 100%;
  display: block;
}

.board-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #9eb5c8;
  font-family: 'Courier New', monospace;
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

.runtime-wire.is-user-wire {
  stroke-dasharray: 11 9;
}

.runtime-wire.selected {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.48));
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

.part-hitbox {
  fill: transparent;
  stroke: rgba(0, 240, 255, 0);
  pointer-events: all;
}

.measure-node {
  cursor: pointer;
}

.measure-node text {
  font-family: 'Courier New', monospace;
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

.meter-float {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 3;
  width: min(260px, calc(100% - 40px));
  padding: 16px;
  border-radius: 22px;
  border: 1px solid rgba(0, 240, 255, 0.18);
  background:
    linear-gradient(180deg, rgba(1, 16, 28, 0.96), rgba(3, 24, 37, 0.94)),
    radial-gradient(circle at top, rgba(0, 240, 255, 0.08), transparent 42%);
  box-shadow: inset 0 0 22px rgba(0, 240, 255, 0.08), 0 18px 40px rgba(1, 8, 22, 0.28);
}

.board-toolbar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.meter-meta {
  display: grid;
  gap: 6px;
  margin-top: 12px;
  min-height: 34px;
}

.meter-tag {
  color: #7dd3fc;
  font-size: 0.72rem;
  font-weight: 800;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.meter-hole {
  margin-top: 8px;
  color: #e7fbff;
  font-size: 1rem;
  font-weight: 800;
}

.meter-voltage {
  margin-top: 10px;
  color: #bbf7d0;
  font-family: 'Courier New', monospace;
  font-size: 1.8rem;
  line-height: 1;
  text-shadow: 0 0 14px rgba(52, 211, 153, 0.32);
}

.meter-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.meter-row span {
  display: block;
  color: #8dd9ff;
  font-size: 0.72rem;
  font-weight: 700;
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

  .board-base,
  .board-overlay {
    inset: 0 0 190px 0;
  }

  .board-base {
    padding: 12px;
  }

  .meter-float {
    position: absolute;
    top: auto;
    right: 12px;
    left: 12px;
    bottom: 12px;
    width: auto;
  }

  .meter-voltage {
    font-size: 1.5rem;
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
    min-height: 400px;
  }

  .board-base,
  .board-overlay {
    inset: 0 0 210px 0;
  }

  .meter-row {
    grid-template-columns: 1fr;
  }

  .board-toolbar {
    grid-template-columns: 1fr;
  }

  .meter-float {
    padding: 14px;
  }
}
</style>
