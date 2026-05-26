<template>
  <section class="runtime-shell">
    <aside class="hud-column controls-column">
      <div class="panel-card panel-head">
        <p class="eyebrow">Breadboard Runtime</p>
        <h3>固定麵包板 × 互動量測模板</h3>
        <p>
          第 3 頁先驗證一個可重用模式：中央固定 breadboard，左右放控制與量測 HUD，
          後續第 4 到第 10 頁只換節點、旋鈕與教學焦點。
        </p>
      </div>

      <div class="panel-card control-card">
        <div class="card-head">
          <span class="badge">Input Control</span>
          <strong>調節電壓 / 電流</strong>
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

      <div class="panel-card state-card">
        <div class="card-head">
          <span class="badge badge-amber">Runtime State</span>
          <strong>{{ regulatorModel.modeLabel }}</strong>
        </div>

        <div class="state-grid">
          <article>
            <span>Vout</span>
            <strong>{{ formatVoltage(regulatorModel.vout) }}</strong>
          </article>
          <article>
            <span>Vref</span>
            <strong>{{ formatVoltage(regulatorModel.vref) }}</strong>
          </article>
          <article>
            <span>Ib</span>
            <strong>{{ formatCurrent(regulatorModel.baseCurrent) }}</strong>
          </article>
          <article>
            <span>Power</span>
            <strong>{{ formatPower(regulatorModel.vout * loadCurrent) }}</strong>
          </article>
        </div>

        <p class="state-note">{{ regulatorModel.modeNote }}</p>
      </div>

      <div class="panel-card parts-card">
        <div class="card-head">
          <span class="badge badge-slate">FZPZ Assets</span>
          <strong>這頁已接入的元件</strong>
        </div>

        <div class="part-list">
          <article v-for="item in placedPartsSummary" :key="item.id">
            <span>{{ item.kind }}</span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.note }}</small>
          </article>
        </div>
      </div>
    </aside>

    <div class="board-column">
      <div class="board-frame" :style="boardFrameStyle">
        <div v-if="loadingAssets" class="board-empty">載入 `.fzpz` 資產中...</div>
        <div v-else-if="loadError" class="board-empty board-error">{{ loadError }}</div>
        <template v-else>
          <div class="board-svg-stage" v-html="sceneSvg"></div>

          <button
            v-for="node in boardNodes"
            :key="node.id"
            class="node-hit"
            :class="{ active: selectedNodeId === node.id }"
            :style="nodeStyle(node)"
            :title="`${node.label} · ${node.hole}`"
            @click="selectedNodeId = node.id"
          >
            <span>{{ node.shortLabel }}</span>
          </button>
        </template>
      </div>
    </div>

    <aside class="hud-column meter-column">
      <div class="panel-card meter-shell">
        <div class="meter-topline">
          <span class="badge">Probe Screen</span>
          <strong>{{ selectedMeasurement?.label ?? 'No Node' }}</strong>
        </div>

        <div class="probe-visual" v-if="probeSvg" v-html="probeSvg"></div>

        <div class="meter-screen">
          <p class="screen-kicker">{{ selectedMeasurement?.hole ?? '--' }}</p>
          <strong class="screen-voltage">{{ selectedMeasurement ? formatVoltage(selectedMeasurement.voltage) : '--' }}</strong>
          <div class="screen-divider"></div>
          <div class="screen-grid">
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

        <p class="meter-note">
          {{ selectedMeasurement?.description ?? '點麵包板上的量測點，右側小螢幕會顯示該腳位的電壓 / 電流。' }}
        </p>
      </div>

      <div class="panel-card node-card">
        <div class="card-head">
          <span class="badge badge-slate">Measurement Nodes</span>
          <strong>可量測腳位</strong>
        </div>

        <div class="node-list">
          <button
            v-for="node in boardNodes"
            :key="`${node.id}-list`"
            class="node-row"
            :class="{ active: selectedNodeId === node.id }"
            @click="selectedNodeId = node.id"
          >
            <span>{{ node.label }}</span>
            <strong>{{ node.hole }}</strong>
            <small>{{ formatVoltage(node.voltage) }} / {{ formatCurrent(node.current) }}</small>
          </button>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { loadPublicFritzingPackages } from '../utils/fritzingRuntime.js'

const loadingAssets = ref(true)
const loadError = ref('')
const packages = ref([])
const selectedNodeId = ref('vl')
const vin = ref(12)
const loadCurrent = ref(0.28)

const PART_LAYOUTS = [
  {
    id: 'ua741',
    match: 'custom_ua741_labeled_2x_tight',
    kind: 'IC',
    label: 'UA741',
    note: '主要比較與控制器，直接從 `.fzpz` 取 breadboard 圖與 connector。',
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
    note: '功率級控制端與輸出調整示意。',
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
    note: '建立參考電壓，後續各頁可直接重用這個模式。',
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
    note: '輸入到參考支路的限流電阻。',
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
    note: '741 輸出到 NPN base 的驅動電阻。',
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
    note: '輸出回授上支路。',
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
    note: '輸出回授下支路。',
    holes: {
      connector0: '39Q',
      connector1: '39bottomBlue',
    },
  },
]

const boardPackage = computed(() => findPackage('custom_broad_breadboard_20row_clear'))
const probePackage = computed(() => findPackage('custom_voltage_probe_meter_simplified_2pin'))

const boardHoleLookup = computed(() => {
  const connectors = boardPackage.value?.connectors || []
  return new Map(connectors.map((connector) => [connector.name.toUpperCase(), connector]))
})

const placedParts = computed(() => {
  return PART_LAYOUTS.map((layout) => ({
    ...layout,
    package: findPackage(layout.match),
  })).filter((item) => item.package)
})

const placedPartsSummary = computed(() => {
  return placedParts.value.map((item) => ({
    id: item.id,
    kind: item.kind,
    title: item.package.title,
    note: item.note,
  }))
})

const boardViewBox = computed(() => {
  return parseViewBox(boardPackage.value?.svgText || '')
})

const boardFrameStyle = computed(() => {
  if (!boardViewBox.value) {
    return {}
  }

  return {
    aspectRatio: `${boardViewBox.value.width} / ${boardViewBox.value.height}`,
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

  const modeLabel = mode === 'dropout' ? 'DROP OUT' : mode === 'regulated' ? 'REGULATING' : 'CORRECTING'
  const modeNote =
    mode === 'dropout'
      ? '輸入電壓或負載電流已逼近 headroom，輸出開始掉壓。'
      : mode === 'regulated'
        ? '741 與 NPN 正在把輸出維持在目標附近。'
        : '回授端仍有誤差，741 正在拉動輸出修正。'

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
    mode,
    modeLabel,
    modeNote,
  }
})

const measurementNodes = computed(() => [
  {
    id: 'vin',
    label: 'VIN',
    shortLabel: 'VIN',
    hole: '32topRed',
    voltage: vin.value,
    current: regulatorModel.value.supplyCurrent,
    power: vin.value * regulatorModel.value.supplyCurrent,
    description: '輸入供電 rail，所有後續控制與功率都從這裡取能量。',
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
    description: '齊納二極體建立的參考點，後續頁次都能沿用這個量測節點。',
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
    description: 'UA741 同相輸入，主要接收 Vref。',
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
    description: 'UA741 反相輸入，代表回授分壓回來的輸出狀態。',
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
    description: '741 輸出修正訊號，再經 1k 電阻推向 NPN base。',
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
    description: 'NPN 控制端，Base 電位決定輸出端會被推到哪裡。',
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
    description: '實際輸出電壓節點，也是後續第 9 頁量測展示可以直接延用的主節點。',
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
    description: '負載支路，調高電流時會最直接拉動整個閉迴路進入修正。',
    color: '#fb923c',
  },
])

const boardNodes = computed(() => {
  return measurementNodes.value
    .map((node) => {
      const boardHole = boardHoleLookup.value.get(node.hole.toUpperCase())
      return {
        ...node,
        anchor: boardHole?.anchor || null,
      }
    })
    .filter((node) => node.anchor)
})

const selectedMeasurement = computed(() => {
  return boardNodes.value.find((node) => node.id === selectedNodeId.value) ?? boardNodes.value[0] ?? null
})

const probeSvg = computed(() => {
  if (!probePackage.value?.svgText) {
    return ''
  }

  return tintProbeSvg(probePackage.value.svgText)
})

const sceneSvg = computed(() => {
  if (!boardPackage.value) {
    return ''
  }

  return buildSceneSvg({
    boardPackage: boardPackage.value,
    boardHoleLookup: boardHoleLookup.value,
    placedParts: placedParts.value,
    boardNodes: boardNodes.value,
    selectedNodeId: selectedNodeId.value,
  })
})

onMounted(async () => {
  try {
    loadingAssets.value = true
    packages.value = await loadPublicFritzingPackages()
    if (!selectedNodeId.value) {
      selectedNodeId.value = 'vl'
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error)
  } finally {
    loadingAssets.value = false
  }
})

function findPackage(fragment) {
  return packages.value.find((item) => item.moduleId.toLowerCase().includes(fragment.toLowerCase())) ?? null
}

function nodeStyle(node) {
  const viewBox = boardViewBox.value
  if (!viewBox || !node.anchor) {
    return {}
  }

  return {
    left: `${((node.anchor.x - viewBox.minX) / viewBox.width) * 100}%`,
    top: `${((node.anchor.y - viewBox.minY) / viewBox.height) * 100}%`,
    '--node-color': node.color,
  }
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

function tintProbeSvg(svgText) {
  const svgDoc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const svgRoot = svgDoc.documentElement
  const styleEl = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'style')
  styleEl.textContent = `
    * {
      filter: drop-shadow(0 0 6px rgba(0, 240, 255, 0.35));
    }
  `
  svgRoot.insertBefore(styleEl, svgRoot.firstChild)
  return new XMLSerializer().serializeToString(svgDoc)
}

function buildSceneSvg({ boardPackage, boardHoleLookup, placedParts, boardNodes, selectedNodeId }) {
  const svgDoc = new DOMParser().parseFromString(boardPackage.svgText, 'image/svg+xml')
  const svgRoot = svgDoc.documentElement
  svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet')

  const styleEl = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'style')
  styleEl.textContent = `
    .runtime-wire {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.92;
    }
    .runtime-wire.is-load {
      stroke-dasharray: 11 9;
      opacity: 0.76;
    }
    .runtime-label {
      font-family: 'Courier New', monospace;
      font-size: 3.2px;
      font-weight: 700;
      fill: #03111f;
      paint-order: stroke;
      stroke: rgba(255, 255, 255, 0.86);
      stroke-width: 1px;
      stroke-linejoin: round;
    }
    .runtime-node {
      fill: rgba(3, 17, 31, 0.22);
      stroke-width: 1.4px;
    }
    .runtime-node.is-active {
      fill: rgba(255, 255, 255, 0.12);
      stroke-width: 2px;
    }
    .part-shadow {
      opacity: 0.18;
      filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.24));
    }
  `
  svgRoot.insertBefore(styleEl, svgRoot.firstChild)

  const overlayGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g')
  overlayGroup.setAttribute('data-layer', 'runtime-overlay')

  buildWireLayer(svgDoc, overlayGroup, boardHoleLookup)
  buildPlacedPartLayer(svgDoc, overlayGroup, placedParts, boardHoleLookup)
  buildNodeLayer(svgDoc, overlayGroup, boardNodes, selectedNodeId)

  svgRoot.appendChild(overlayGroup)
  return new XMLSerializer().serializeToString(svgDoc)
}

function buildWireLayer(svgDoc, overlayGroup, boardHoleLookup) {
  const wires = [
    { from: '25topRed', to: '32topRed', color: '#ff5f7a', width: 3.6 },
    { from: '25topRed', to: '28K', color: '#ff8c42', width: 3.2 },
    { from: '28M', to: '28bottomBlue', color: '#67e8f9', width: 3.1 },
    { from: '28K', to: '33I', color: '#34d399', width: 3.1 },
    { from: '32L', to: '32topRed', color: '#ff5f7a', width: 3.1 },
    { from: '34I', to: '34bottomBlue', color: '#67e8f9', width: 3.1 },
    { from: '32I', to: '39Q', color: '#fbbf24', width: 3.1 },
    { from: '33L', to: '41N', color: '#f472b6', width: 3.2 },
    { from: '40N', to: '40topRed', color: '#ff5f7a', width: 3.4 },
    { from: '42N', to: '42Q', color: '#38bdf8', width: 3.4 },
    { from: '42Q', to: '42bottomBlue', color: '#fb923c', width: 3.1, load: true },
  ]

  const wireLayer = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g')
  wireLayer.setAttribute('data-layer', 'wires')

  wires.forEach((wire) => {
    const start = boardHoleLookup.get(wire.from.toUpperCase())?.anchor
    const end = boardHoleLookup.get(wire.to.toUpperCase())?.anchor
    if (!start || !end) {
      return
    }

    const path = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', orthogonalPath(start, end))
    path.setAttribute('class', `runtime-wire${wire.load ? ' is-load' : ''}`)
    path.setAttribute('stroke', wire.color)
    path.setAttribute('stroke-width', `${wire.width}`)
    wireLayer.appendChild(path)
  })

  overlayGroup.appendChild(wireLayer)
}

function buildPlacedPartLayer(svgDoc, overlayGroup, placedParts, boardHoleLookup) {
  const partLayer = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g')
  partLayer.setAttribute('data-layer', 'parts')

  placedParts.forEach((item) => {
    const partGroup = buildPlacedPartGroup(svgDoc, item, boardHoleLookup)
    if (partGroup) {
      partLayer.appendChild(partGroup)
    }

    const labelAnchor = averagePlacementAnchor(item, boardHoleLookup)
    if (labelAnchor) {
      const label = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text')
      label.setAttribute('x', `${labelAnchor.x + 5}`)
      label.setAttribute('y', `${labelAnchor.y - 4}`)
      label.setAttribute('class', 'runtime-label')
      label.textContent = item.label
      partLayer.appendChild(label)
    }
  })

  overlayGroup.appendChild(partLayer)
}

function buildPlacedPartGroup(svgDoc, item, boardHoleLookup) {
  const partPackage = item.package
  if (!partPackage?.svgText) {
    return null
  }

  const connectorPairs = partPackage.connectors
    .map((connector) => {
      const holeName = item.holes[connector.id]
      const boardHole = holeName ? boardHoleLookup.get(holeName.toUpperCase()) : null
      if (!connector.anchor || !boardHole?.anchor) {
        return null
      }

      return {
        source: connector.anchor,
        target: boardHole.anchor,
      }
    })
    .filter(Boolean)

  if (connectorPairs.length === 0) {
    return null
  }

  const transform = buildSimilarityTransform(connectorPairs)
  const partDoc = new DOMParser().parseFromString(partPackage.svgText, 'image/svg+xml')
  const partRoot = partDoc.documentElement
  const group = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g')
  group.setAttribute('transform', matrixToString(transform))
  group.setAttribute('class', 'part-shadow')

  partRoot.childNodes.forEach((node) => {
    group.appendChild(node.cloneNode(true))
  })

  return group
}

function buildSimilarityTransform(connectorPairs) {
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

function averagePlacementAnchor(item, boardHoleLookup) {
  const anchors = Object.values(item.holes)
    .map((holeName) => boardHoleLookup.get(holeName.toUpperCase())?.anchor)
    .filter(Boolean)

  if (anchors.length === 0) {
    return null
  }

  const sum = anchors.reduce(
    (accumulator, anchor) => ({
      x: accumulator.x + anchor.x,
      y: accumulator.y + anchor.y,
    }),
    { x: 0, y: 0 },
  )

  return {
    x: sum.x / anchors.length,
    y: sum.y / anchors.length,
  }
}

function buildNodeLayer(svgDoc, overlayGroup, boardNodes, selectedNodeId) {
  const nodeLayer = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g')
  nodeLayer.setAttribute('data-layer', 'nodes')

  boardNodes.forEach((node) => {
    const circle = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', `${node.anchor.x}`)
    circle.setAttribute('cy', `${node.anchor.y}`)
    circle.setAttribute('r', node.id === selectedNodeId ? '5.2' : '4')
    circle.setAttribute('class', `runtime-node${node.id === selectedNodeId ? ' is-active' : ''}`)
    circle.setAttribute('stroke', node.color)
    nodeLayer.appendChild(circle)

    const label = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text')
    label.setAttribute('x', `${node.anchor.x + 5}`)
    label.setAttribute('y', `${node.anchor.y - 5}`)
    label.setAttribute('class', 'runtime-label')
    label.textContent = node.shortLabel
    nodeLayer.appendChild(label)
  })

  overlayGroup.appendChild(nodeLayer)
}

function orthogonalPath(start, end) {
  const midX = start.x + (end.x - start.x) * 0.5
  return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`
}
</script>

<style scoped>
.runtime-shell {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr) minmax(260px, 320px);
  gap: 18px;
  align-items: stretch;
  min-height: 760px;
}

.hud-column,
.board-column {
  min-width: 0;
}

.hud-column {
  display: grid;
  gap: 14px;
  align-content: start;
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

.panel-head h3,
.panel-card strong,
.panel-card p,
.state-note,
.meter-note,
.node-row span,
.node-row strong,
.node-row small {
  position: relative;
  z-index: 1;
}

.eyebrow,
.badge {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.eyebrow {
  margin: 0 0 8px;
  color: #67e8f9;
  font-size: 0.74rem;
  font-weight: 800;
}

.panel-head h3 {
  margin: 0;
  color: #e7fbff;
  font-size: 1.2rem;
}

.panel-head p:last-child {
  margin: 12px 0 0;
  color: #9eb5c8;
  line-height: 1.68;
}

.card-head,
.meter-topline {
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
.state-card strong,
.parts-card strong,
.node-card strong,
.meter-topline strong {
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

.control-field span {
  color: #8dd9ff;
  font-size: 0.82rem;
  font-weight: 700;
}

.control-field strong {
  font-size: 1rem;
}

.control-field input[type="range"] {
  width: 100%;
  accent-color: #00f0ff;
}

.state-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.state-grid article,
.part-list article {
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(4, 16, 40, 0.72);
  border: 1px solid rgba(0, 240, 255, 0.08);
}

.state-grid span,
.part-list span {
  display: block;
  color: #7dd3fc;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.state-grid strong,
.part-list strong {
  display: block;
  margin-top: 8px;
}

.state-note,
.meter-note,
.part-list small {
  color: #9eb5c8;
  line-height: 1.6;
}

.state-note {
  margin: 14px 0 0;
}

.part-list {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.board-column {
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-frame {
  position: relative;
  width: 100%;
  max-width: 980px;
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

.board-svg-stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
}

.board-svg-stage :deep(svg) {
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

.node-hit {
  position: absolute;
  width: 34px;
  height: 34px;
  margin-left: -17px;
  margin-top: -17px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--node-color) 72%, white);
  background: color-mix(in srgb, var(--node-color) 28%, rgba(2, 8, 18, 0.28));
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), 0 0 18px color-mix(in srgb, var(--node-color) 44%, transparent);
  cursor: pointer;
  z-index: 2;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.node-hit:hover,
.node-hit.active {
  transform: scale(1.08);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 24px color-mix(in srgb, var(--node-color) 58%, transparent);
}

.node-hit span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #f8fbff;
  font-size: 0.55rem;
  font-family: 'Courier New', monospace;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.meter-shell {
  display: grid;
  gap: 16px;
}

.probe-visual {
  position: relative;
  z-index: 1;
  padding: 10px 14px;
  border-radius: 18px;
  background: rgba(4, 16, 40, 0.72);
}

.probe-visual :deep(svg) {
  width: 100%;
  height: auto;
  display: block;
}

.meter-screen {
  position: relative;
  z-index: 1;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(0, 240, 255, 0.14);
  background:
    linear-gradient(180deg, rgba(1, 16, 28, 0.96), rgba(3, 24, 37, 0.94)),
    radial-gradient(circle at top, rgba(0, 240, 255, 0.08), transparent 42%);
  box-shadow: inset 0 0 22px rgba(0, 240, 255, 0.08);
}

.screen-kicker {
  margin: 0;
  color: #7dd3fc;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.screen-voltage {
  display: block;
  margin-top: 10px;
  color: #bbf7d0;
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  line-height: 1;
  text-shadow: 0 0 14px rgba(52, 211, 153, 0.32);
}

.screen-divider {
  height: 1px;
  margin: 14px 0;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.36), transparent);
}

.screen-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.screen-grid span {
  display: block;
  color: #8dd9ff;
  font-size: 0.72rem;
  font-weight: 700;
}

.screen-grid strong {
  display: block;
  margin-top: 8px;
  font-family: 'Courier New', monospace;
}

.node-list {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.node-row {
  display: grid;
  gap: 6px;
  text-align: left;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(0, 240, 255, 0.08);
  background: rgba(4, 16, 40, 0.68);
  cursor: pointer;
  transition: border-color 0.18s ease, transform 0.18s ease;
}

.node-row:hover,
.node-row.active {
  border-color: rgba(0, 240, 255, 0.28);
  transform: translateY(-1px);
}

.node-row span {
  color: #a5f3fc;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.node-row small {
  color: #9eb5c8;
}

@media (max-width: 1280px) {
  .runtime-shell {
    grid-template-columns: 1fr;
  }

  .board-frame {
    max-width: 100%;
  }
}

@media (max-width: 720px) {
  .panel-card {
    padding: 16px;
    border-radius: 22px;
  }

  .state-grid,
  .screen-grid {
    grid-template-columns: 1fr;
  }

  .board-frame {
    min-height: 520px;
  }
}
</style>
