<template>
  <section class="viewer-shell">
    <aside class="asset-rail">
      <div class="rail-head">
        <p>Fritzing Assets</p>
        <strong>讀取 `.fzpz` 並還原 breadboard view</strong>
      </div>

      <label class="upload-card">
        <span>載入本機 `.fzpz`</span>
        <strong>額外測試自訂元件</strong>
        <small>不改寫 repo，只在瀏覽器記憶體裡解析。</small>
        <input type="file" accept=".fzpz" class="upload-input" @change="handleFileImport" />
      </label>

      <button
        v-for="part in packages"
        :key="part.key"
        class="asset-button"
        :class="{ active: selectedPackageKey === part.key }"
        @click="selectPackage(part.key)"
      >
        <span>{{ part.kind }}</span>
        <strong>{{ part.title }}</strong>
        <small>{{ part.summary }}</small>
      </button>
    </aside>

    <div class="viewer-stage">
      <header class="stage-head">
        <div>
          <p class="stage-kicker">FZPZ Viewer</p>
          <h2>{{ selectedPackage?.title ?? 'Loading...' }}</h2>
        </div>

        <div class="stat-strip" v-if="selectedPackage">
          <article>
            <span>Connectors</span>
            <strong>{{ selectedPackage.connectors.length }}</strong>
          </article>
          <article>
            <span>Type</span>
            <strong>{{ selectedPackage.connectorMix }}</strong>
          </article>
          <article>
            <span>View</span>
            <strong>{{ selectedPackage.breadboardImageName }}</strong>
          </article>
        </div>
      </header>

      <section v-if="errorMessage" class="error-banner">
        <strong>載入失敗</strong>
        <p>{{ errorMessage }}</p>
      </section>

      <section v-if="selectedPackage" class="viewer-grid">
        <div class="preview-card">
          <div class="card-head">
            <span class="badge">Breadboard View</span>
            <h3>SVG 預覽與 connector 高亮</h3>
          </div>

          <div class="svg-frame">
            <div class="svg-stage" v-html="highlightedSvg"></div>
          </div>

          <div class="preview-note">
            <strong>目前 viewer 能做的事：</strong>
            <span>讀 part metadata、還原 breadboard 圖、定位 connector / terminal、作為後續麵包板動畫的幾何來源。</span>
          </div>
        </div>

        <div class="inspect-card">
          <div class="card-head">
            <span class="badge badge-slate">Connector Map</span>
            <h3>`.fzp` connector 與 SVG anchor</h3>
          </div>

          <div class="inspect-controls">
            <input
              v-model.trim="connectorFilter"
              type="text"
              class="search-input"
              placeholder="搜尋 connector id / 名稱 / type"
            />
            <p class="inspect-note" v-if="isConnectorListTruncated">
              目前顯示前 {{ visibleConnectors.length }} 筆；輸入搜尋詞可縮小範圍。
            </p>
          </div>

          <div class="connector-table-wrap">
            <table class="connector-table">
              <thead>
                <tr>
                  <th>id</th>
                  <th>name</th>
                  <th>type</th>
                  <th>svgId</th>
                  <th>anchor</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="connector in visibleConnectors"
                  :key="connector.id"
                  :class="{ active: selectedConnectorId === connector.id }"
                  @click="selectedConnectorId = connector.id"
                >
                  <td>{{ connector.id }}</td>
                  <td>{{ connector.name }}</td>
                  <td>{{ connector.type }}</td>
                  <td>{{ connector.svgId || '-' }}</td>
                  <td>{{ formatAnchor(connector.anchor) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="selectedConnector" class="connector-detail">
            <span>Selected Connector</span>
            <strong>{{ selectedConnector.name }}</strong>
            <p>{{ selectedConnector.description || 'No description' }}</p>
            <div class="detail-grid">
              <article>
                <small>connector id</small>
                <strong>{{ selectedConnector.id }}</strong>
              </article>
              <article>
                <small>terminal id</small>
                <strong>{{ selectedConnector.terminalId || '-' }}</strong>
              </article>
              <article>
                <small>anchor</small>
                <strong>{{ formatAnchor(selectedConnector.anchor) }}</strong>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section v-if="placementBoard && placementPart" class="placement-card">
        <div class="placement-head">
          <div>
            <p class="stage-kicker">Placement Sandbox</p>
            <h3>把 part connector 對應到 breadboard hole map</h3>
          </div>

          <div class="placement-stats">
            <article>
              <span>Board</span>
              <strong>{{ placementBoard.title }}</strong>
            </article>
            <article>
              <span>Part</span>
              <strong>{{ placementPart.title }}</strong>
            </article>
            <article>
              <span>Mapped</span>
              <strong>{{ mappedConnectorCount }} / {{ placementPart.connectors.length }}</strong>
            </article>
          </div>
        </div>

        <div class="placement-grid">
          <div class="placement-config">
            <div class="config-card">
              <div class="config-head">
                <span class="badge badge-slate">Placement Inputs</span>
                <h4>板子、元件與 quick fill</h4>
              </div>

              <div class="form-grid">
                <label class="field">
                  <span>Breadboard</span>
                  <select v-model="placementBoardKey" class="select-input">
                    <option v-for="board in boardPackages" :key="board.key" :value="board.key">
                      {{ board.title }}
                    </option>
                  </select>
                </label>

                <label class="field">
                  <span>Part</span>
                  <select v-model="placementPartKey" class="select-input">
                    <option v-for="part in placeablePackages" :key="part.key" :value="part.key">
                      {{ part.title }}
                    </option>
                  </select>
                </label>
              </div>

              <div class="auto-fill-box">
                <div class="auto-fill-head">
                  <strong>Quick Fill</strong>
                  <small>先給第一個 hole，再用規則批次帶入 connector。</small>
                </div>

                <div class="form-grid">
                  <label class="field">
                    <span>Start Hole</span>
                    <input v-model.trim="autoPlacementStart" list="board-hole-options" class="text-input" placeholder="例如 5A" />
                  </label>

                  <label class="field">
                    <span>Pattern</span>
                    <select v-model="autoPlacementMode" class="select-input">
                      <option value="same-column-down">同一欄往下</option>
                      <option value="same-column-up">同一欄往上</option>
                      <option value="same-row-across">同一列往右</option>
                      <option value="same-row-reverse">同一列往左</option>
                    </select>
                  </label>
                </div>

                <div class="button-row">
                  <button class="action-btn" type="button" @click="applyAutoPlacement">
                    套用 quick fill
                  </button>
                  <button class="ghost-btn" type="button" @click="clearPlacement">
                    清除 mapping
                  </button>
                </div>
              </div>

              <datalist id="board-hole-options">
                <option v-for="hole in boardHoleOptions" :key="hole.id" :value="hole.name"></option>
              </datalist>
            </div>

            <div class="config-card">
              <div class="config-head">
                <span class="badge">Connector Mapping</span>
                <h4>逐腳位指定 board hole</h4>
              </div>

              <div class="mapping-list">
                <article
                  v-for="row in placementRows"
                  :key="row.connector.id"
                  class="mapping-row"
                  :class="{ active: placementFocusId === row.connector.id }"
                  @click="placementFocusId = row.connector.id"
                >
                  <div class="mapping-meta">
                    <span>{{ row.connector.id }}</span>
                    <strong>{{ row.connector.name }}</strong>
                    <small>{{ row.connector.type }} · {{ formatAnchor(row.connector.anchor) }}</small>
                  </div>

                  <label class="mapping-input">
                    <span>Board hole</span>
                    <input
                      v-model.trim="connectorPlacements[row.connector.id]"
                      list="board-hole-options"
                      class="text-input"
                      :placeholder="row.suggestedHole || '輸入像 5A / 7E 的 hole 名稱'"
                    />
                  </label>
                </article>
              </div>
            </div>

            <div class="config-card">
              <div class="config-head">
                <span class="badge badge-slate">Validation</span>
                <h4>目前 mapping 狀態</h4>
              </div>

              <div class="validation-list">
                <article class="validation-item" :class="{ ok: placementIssues.unassigned.length === 0 }">
                  <strong>未指定</strong>
                  <p>{{ placementIssues.unassigned.length === 0 ? '全部 connector 都已指定 hole。' : placementIssues.unassigned.join(', ') }}</p>
                </article>
                <article class="validation-item" :class="{ ok: placementIssues.duplicates.length === 0 }">
                  <strong>重複占用</strong>
                  <p>{{ placementIssues.duplicates.length === 0 ? '沒有 connector 共用同一個 hole。' : placementIssues.duplicates.join(', ') }}</p>
                </article>
                <article class="validation-item" :class="{ ok: placementIssues.invalid.length === 0 }">
                  <strong>不存在的 hole</strong>
                  <p>{{ placementIssues.invalid.length === 0 ? '所有 hole 名稱都能在 breadboard 上找到。' : placementIssues.invalid.join(', ') }}</p>
                </article>
              </div>
            </div>
          </div>

          <div class="placement-visual">
            <div class="config-card">
              <div class="config-head">
                <span class="badge">Board Overlay</span>
                <h4>將 mapping 投影到 breadboard</h4>
              </div>

              <div class="svg-frame board-frame">
                <div class="svg-stage" v-html="placementBoardSvg"></div>
              </div>

              <div class="preview-note">
                <strong>這一層已完成的能力：</strong>
                <span>part connector 已經能對應到 board hole 名稱與座標，下一步就可以接 placement lock、wire 與導通檢查。</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import JSZip from 'jszip'

const publicPackageModules = import.meta.glob('../../../public/*.fzpz', {
  eager: true,
  import: 'default',
  query: '?url',
})

const packages = ref([])
const selectedPackageKey = ref('')
const selectedConnectorId = ref('')
const connectorFilter = ref('')
const errorMessage = ref('')
const placementBoardKey = ref('')
const placementPartKey = ref('')
const connectorPlacements = reactive({})
const autoPlacementStart = ref('')
const autoPlacementMode = ref('same-column-down')
const placementFocusId = ref('')

const selectedPackage = computed(() => {
  return packages.value.find((item) => item.key === selectedPackageKey.value) ?? null
})

const boardPackages = computed(() => {
  return packages.value.filter((item) => item.kind === 'Board')
})

const placeablePackages = computed(() => {
  return packages.value.filter((item) => item.kind !== 'Board')
})

const placementBoard = computed(() => {
  return packages.value.find((item) => item.key === placementBoardKey.value) ?? null
})

const placementPart = computed(() => {
  return packages.value.find((item) => item.key === placementPartKey.value) ?? null
})

const boardHoleOptions = computed(() => {
  if (!placementBoard.value) {
    return []
  }

  return [...placementBoard.value.connectors].sort((left, right) => compareHoleNames(left.name, right.name))
})

const boardHoleLookup = computed(() => {
  return new Map(boardHoleOptions.value.map((connector) => [connector.name.toUpperCase(), connector]))
})

const placementRows = computed(() => {
  if (!placementPart.value) {
    return []
  }

  const orderedConnectors = orderPartConnectors(placementPart.value.connectors, autoPlacementMode.value)

  return orderedConnectors.map((connector, index) => {
    const assignedHoleName = (connectorPlacements[connector.id] || '').toUpperCase()
    return {
      connector,
      index,
      assignedHoleName,
      boardHole: boardHoleLookup.value.get(assignedHoleName) || null,
      suggestedHole: suggestHoleName(index),
    }
  })
})

const mappedConnectorCount = computed(() => {
  return placementRows.value.filter((row) => row.boardHole).length
})

const placementIssues = computed(() => {
  const duplicatesMap = new Map()
  const invalid = []
  const unassigned = []

  placementRows.value.forEach((row) => {
    if (!row.assignedHoleName) {
      unassigned.push(row.connector.name || row.connector.id)
      return
    }

    if (!row.boardHole) {
      invalid.push(`${row.connector.id} -> ${row.assignedHoleName}`)
      return
    }

    const bucket = duplicatesMap.get(row.assignedHoleName) || []
    bucket.push(row.connector.id)
    duplicatesMap.set(row.assignedHoleName, bucket)
  })

  const duplicates = [...duplicatesMap.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([hole, ids]) => `${hole}: ${ids.join(', ')}`)

  return {
    unassigned,
    invalid,
    duplicates,
  }
})

const placementBoardSvg = computed(() => {
  if (!placementBoard.value) {
    return ''
  }

  return buildPlacementBoardSvg(placementBoard.value.svgText, placementRows.value, placementFocusId.value)
})

const selectedConnector = computed(() => {
  if (!selectedPackage.value) {
    return null
  }

  return selectedPackage.value.connectors.find((connector) => connector.id === selectedConnectorId.value) ?? null
})

const visibleConnectors = computed(() => {
  if (!selectedPackage.value) {
    return []
  }

  const normalized = connectorFilter.value.toLowerCase()
  const matches = selectedPackage.value.connectors.filter((connector) => {
    const haystack = [
      connector.id,
      connector.name,
      connector.type,
      connector.svgId,
      connector.terminalId,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalized)
  })

  if (normalized) {
    return matches
  }

  return matches.slice(0, selectedPackage.value.defaultVisibleCount)
})

const isConnectorListTruncated = computed(() => {
  if (!selectedPackage.value || connectorFilter.value) {
    return false
  }

  return visibleConnectors.value.length < selectedPackage.value.connectors.length
})

const highlightedSvg = computed(() => {
  if (!selectedPackage.value) {
    return ''
  }

  return buildHighlightedSvg(selectedPackage.value.svgText, selectedPackage.value.connectors, selectedConnectorId.value)
})

onMounted(async () => {
  try {
    const packageEntries = Object.entries(publicPackageModules)
      .map(([modulePath, url]) => {
        const filename = modulePath.split('/').pop() || modulePath
        return {
          key: filename,
          path: url,
          filename,
          kind: 'Part',
          summary: '從 public 自動收集的 Fritzing part bundle。',
        }
      })
      .sort((left, right) => comparePackageNames(left.filename, right.filename))

    const parsed = await Promise.all(
      packageEntries.map(async (entry) => {
        const response = await fetch(entry.path)
        if (!response.ok) {
          throw new Error(`Failed to fetch ${entry.path}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const parsedPackage = await parseFzpzPackage(arrayBuffer, entry)
        return parsedPackage
      }),
    )

    packages.value = parsed

    if (parsed.length > 0) {
      const preferred =
        parsed.find((item) => item.moduleId.toLowerCase().includes('ua741')) ||
        parsed.find((item) => item.kind === 'Board') ||
        parsed[0]
      selectPackage(preferred.key)
    }

    initializePlacementDefaults(parsed)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
})

watch(placementPartKey, () => {
  clearPlacement(false)
  const firstConnector = placementPart.value?.connectors[0]?.id || ''
  placementFocusId.value = firstConnector
})

watch(placementBoardKey, () => {
  clearPlacement(false)
})

function selectPackage(key) {
  selectedPackageKey.value = key
  connectorFilter.value = ''
  const targetPackage = packages.value.find((item) => item.key === key)
  selectedConnectorId.value = targetPackage?.connectors[0]?.id ?? ''
}

async function handleFileImport(event) {
  const file = event.target.files?.[0]
  if (!file) {
    return
  }

  try {
    errorMessage.value = ''
    const buffer = await file.arrayBuffer()
    const parsed = await parseFzpzPackage(buffer, {
      key: `upload-${Date.now()}`,
      path: file.name,
      kind: 'Upload',
      summary: '使用者本機匯入',
    })
    packages.value = [parsed, ...packages.value]
    selectPackage(parsed.key)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  } finally {
    event.target.value = ''
  }
}

async function parseFzpzPackage(arrayBuffer, meta) {
  const zip = await JSZip.loadAsync(arrayBuffer)
  const entryNames = Object.keys(zip.files)

  const fzpName = entryNames.find((name) => name.toLowerCase().endsWith('.fzp'))
  if (!fzpName) {
    throw new Error(`No .fzp metadata file found in ${meta.path}`)
  }

  const fzpText = await zip.files[fzpName].async('text')
  const fzpXml = new DOMParser().parseFromString(fzpText, 'application/xml')

  const title = readText(fzpXml.querySelector('module > title')) || meta.path
  const description = readText(fzpXml.querySelector('module > description'))
  const moduleId = fzpXml.querySelector('module')?.getAttribute('moduleId') || meta.key
  const breadboardImageRef = fzpXml.querySelector('module > views > breadboardView > layers')?.getAttribute('image') || ''
  const breadboardImageName = breadboardImageRef.split('/').pop() || ''

  const breadboardSvgEntryName =
    resolveZipEntryByViewName(entryNames, breadboardImageName) ||
    entryNames.find((name) => name.toLowerCase().includes('breadboard') && name.toLowerCase().endsWith('.svg'))

  if (!breadboardSvgEntryName) {
    throw new Error(`No breadboard SVG found in ${meta.path}`)
  }

  const svgText = await zip.files[breadboardSvgEntryName].async('text')
  const svgDoc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const connectors = [...fzpXml.querySelectorAll('module > connectors > connector')].map((connectorNode) => {
    const viewNode = connectorNode.querySelector('views > breadboardView > p')
    const svgId = viewNode?.getAttribute('svgId') || ''
    const terminalId = viewNode?.getAttribute('terminalId') || ''
    const anchorSource = findSvgElement(svgDoc, terminalId) || findSvgElement(svgDoc, svgId)

    return {
      id: connectorNode.getAttribute('id') || '',
      name: connectorNode.getAttribute('name') || '',
      type: connectorNode.getAttribute('type') || '',
      description: readText(connectorNode.querySelector('description')),
      svgId,
      terminalId,
      anchor: getElementAnchor(anchorSource),
    }
  })

  const typeSet = [...new Set(connectors.map((connector) => connector.type).filter(Boolean))]
  const classification = classifyPackage({ title, moduleId, connectors, filename: meta.filename || meta.path })

  return {
    key: meta.key,
    path: meta.path,
    filename: meta.filename || meta.path,
    kind: classification.kind,
    summary: classification.summary,
    title,
    description,
    moduleId,
    breadboardImageName,
    svgText,
    connectors,
    connectorMix: typeSet.join(', ') || 'unknown',
    defaultVisibleCount: connectors.length > 200 ? 60 : connectors.length,
  }
}

function resolveZipEntryByViewName(entryNames, basename) {
  if (!basename) {
    return ''
  }

  return (
    entryNames.find((name) => name.endsWith(basename)) ||
    entryNames.find((name) => name.includes(`.${basename}`)) ||
    ''
  )
}

function readText(node) {
  return node?.textContent?.trim() || ''
}

function findSvgElement(svgDoc, id) {
  if (!id) {
    return null
  }

  return svgDoc.getElementById(id) || svgDoc.querySelector(`[id="${id}"]`)
}

function getElementAnchor(element) {
  if (!element) {
    return null
  }

  const tag = element.tagName.toLowerCase()
  const transform = parseTranslate(element.getAttribute('transform'))

  if (tag === 'rect') {
    const x = parseNumber(element.getAttribute('x')) + parseNumber(element.getAttribute('width')) / 2
    const y = parseNumber(element.getAttribute('y')) + parseNumber(element.getAttribute('height')) / 2
    return applyOffset({ x, y }, transform)
  }

  if (tag === 'circle' || tag === 'ellipse') {
    const x = parseNumber(element.getAttribute('cx'))
    const y = parseNumber(element.getAttribute('cy'))
    return applyOffset({ x, y }, transform)
  }

  if (tag === 'line') {
    const x = (parseNumber(element.getAttribute('x1')) + parseNumber(element.getAttribute('x2'))) / 2
    const y = (parseNumber(element.getAttribute('y1')) + parseNumber(element.getAttribute('y2'))) / 2
    return applyOffset({ x, y }, transform)
  }

  if (tag === 'polygon' || tag === 'polyline') {
    const points = parsePoints(element.getAttribute('points'))
    if (points.length === 0) {
      return null
    }

    const xs = points.map((point) => point.x)
    const ys = points.map((point) => point.y)
    const x = (Math.min(...xs) + Math.max(...xs)) / 2
    const y = (Math.min(...ys) + Math.max(...ys)) / 2
    return applyOffset({ x, y }, transform)
  }

  return null
}

function parseNumber(value) {
  return Number.parseFloat(value || '0') || 0
}

function parseTranslate(transform) {
  const match = /translate\(\s*([-\d.]+)(?:[\s,]+([-\d.]+))?\s*\)/.exec(transform || '')
  if (!match) {
    return { x: 0, y: 0 }
  }

  return {
    x: Number.parseFloat(match[1]) || 0,
    y: Number.parseFloat(match[2] || '0') || 0,
  }
}

function applyOffset(point, offset) {
  return {
    x: point.x + offset.x,
    y: point.y + offset.y,
  }
}

function parsePoints(pointsText) {
  if (!pointsText) {
    return []
  }

  return pointsText
    .trim()
    .split(/\s+/)
    .map((chunk) => chunk.split(','))
    .filter((pair) => pair.length === 2)
    .map(([x, y]) => ({ x: Number.parseFloat(x) || 0, y: Number.parseFloat(y) || 0 }))
}

function buildHighlightedSvg(svgText, connectors, selectedId) {
  const svgDoc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const svgRoot = svgDoc.documentElement

  const styleEl = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'style')
  styleEl.textContent = `
    .fritzing-connector-pin {
      fill: rgba(56, 189, 248, 0.16) !important;
      stroke: rgba(14, 116, 144, 0.85) !important;
      stroke-width: 1.5px !important;
    }
    .fritzing-connector-pin.is-active {
      fill: rgba(245, 158, 11, 0.3) !important;
      stroke: rgba(217, 119, 6, 1) !important;
      stroke-width: 2.4px !important;
    }
    .fritzing-terminal-pin {
      fill: rgba(16, 185, 129, 0.4) !important;
      stroke: rgba(5, 150, 105, 1) !important;
      stroke-width: 1.4px !important;
    }
    .fritzing-terminal-pin.is-active {
      fill: rgba(239, 68, 68, 0.72) !important;
      stroke: rgba(185, 28, 28, 1) !important;
      stroke-width: 1.8px !important;
    }
  `
  svgRoot.insertBefore(styleEl, svgRoot.firstChild)

  connectors.forEach((connector) => {
    const pinElement = findSvgElement(svgDoc, connector.svgId)
    if (pinElement) {
      pinElement.setAttribute(
        'class',
        `${pinElement.getAttribute('class') || ''} fritzing-connector-pin${connector.id === selectedId ? ' is-active' : ''}`.trim(),
      )
    }

    const terminalElement = findSvgElement(svgDoc, connector.terminalId)
    if (terminalElement) {
      terminalElement.setAttribute(
        'class',
        `${terminalElement.getAttribute('class') || ''} fritzing-terminal-pin${connector.id === selectedId ? ' is-active' : ''}`.trim(),
      )
    }
  })

  return new XMLSerializer().serializeToString(svgDoc)
}

function formatAnchor(anchor) {
  if (!anchor) {
    return '-'
  }

  return `${anchor.x.toFixed(1)}, ${anchor.y.toFixed(1)}`
}

function initializePlacementDefaults(parsedPackages) {
  const defaultBoard = parsedPackages.find((item) => item.kind === 'Board')
  const defaultPart =
    parsedPackages.find((item) => item.moduleId.toLowerCase().includes('ua741')) ||
    parsedPackages.find((item) => item.kind !== 'Board')

  placementBoardKey.value = defaultBoard?.key || ''
  placementPartKey.value = defaultPart?.key || ''
  placementFocusId.value = defaultPart?.connectors[0]?.id || ''
}

function clearPlacement(resetStart = true) {
  Object.keys(connectorPlacements).forEach((key) => {
    delete connectorPlacements[key]
  })

  if (resetStart) {
    autoPlacementStart.value = ''
  }
}

function applyAutoPlacement() {
  if (!placementPart.value || !placementBoard.value || !autoPlacementStart.value) {
    return
  }

  const orderedConnectors = orderPartConnectors(placementPart.value.connectors, autoPlacementMode.value)
  const startHole = autoPlacementStart.value.toUpperCase()

  orderedConnectors.forEach((connector, index) => {
    const holeName = stepHoleName(startHole, autoPlacementMode.value, index)
    if (holeName && boardHoleLookup.value.has(holeName)) {
      connectorPlacements[connector.id] = holeName
    }
  })

  placementFocusId.value = orderedConnectors[0]?.id || ''
}

function orderPartConnectors(connectors, mode) {
  const oriented = [...connectors]
  const verticalMode = mode.startsWith('same-column')

  oriented.sort((left, right) => {
    const leftAnchor = left.anchor || { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER }
    const rightAnchor = right.anchor || { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER }

    if (verticalMode) {
      return leftAnchor.y - rightAnchor.y || leftAnchor.x - rightAnchor.x
    }

    return leftAnchor.x - rightAnchor.x || leftAnchor.y - rightAnchor.y
  })

  if (mode === 'same-column-up' || mode === 'same-row-reverse') {
    oriented.reverse()
  }

  return oriented
}

function suggestHoleName(index) {
  if (!autoPlacementStart.value) {
    return ''
  }

  return stepHoleName(autoPlacementStart.value.toUpperCase(), autoPlacementMode.value, index)
}

function stepHoleName(startHole, mode, offset) {
  const parsed = parseHoleName(startHole)
  if (!parsed) {
    return ''
  }

  const letters = 'ABCDEFGHIJ'.split('')
  const letterIndex = letters.indexOf(parsed.column)
  if (letterIndex === -1) {
    return ''
  }

  let nextRow = parsed.row
  let nextLetterIndex = letterIndex

  if (mode === 'same-column-down') {
    nextRow += offset
  } else if (mode === 'same-column-up') {
    nextRow -= offset
  } else if (mode === 'same-row-across') {
    nextLetterIndex += offset
  } else if (mode === 'same-row-reverse') {
    nextLetterIndex -= offset
  }

  if (nextRow < 1 || nextLetterIndex < 0 || nextLetterIndex >= letters.length) {
    return ''
  }

  return `${nextRow}${letters[nextLetterIndex]}`
}

function parseHoleName(name) {
  const match = /^(\d+)([A-Za-z]+)$/.exec((name || '').trim())
  if (!match) {
    return null
  }

  return {
    row: Number.parseInt(match[1], 10),
    column: match[2].toUpperCase(),
  }
}

function compareHoleNames(leftName, rightName) {
  const left = parseHoleName(leftName)
  const right = parseHoleName(rightName)

  if (!left || !right) {
    return leftName.localeCompare(rightName)
  }

  if (left.row !== right.row) {
    return left.row - right.row
  }

  return left.column.localeCompare(right.column)
}

function buildPlacementBoardSvg(svgText, rows, focusId) {
  const svgDoc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const svgRoot = svgDoc.documentElement

  const styleEl = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'style')
  styleEl.textContent = `
    .placement-hole {
      fill: rgba(34, 197, 94, 0.24);
      stroke: rgba(21, 128, 61, 0.95);
      stroke-width: 2px;
    }
    .placement-hole.is-focus {
      fill: rgba(249, 115, 22, 0.35);
      stroke: rgba(194, 65, 12, 1);
      stroke-width: 2.8px;
    }
    .placement-label {
      font-family: var(--font-sans);
      font-size: 12px;
      font-weight: 800;
      fill: #0f172a;
      paint-order: stroke;
      stroke: rgba(255, 255, 255, 0.9);
      stroke-width: 3px;
      stroke-linejoin: round;
    }
  `
  svgRoot.insertBefore(styleEl, svgRoot.firstChild)

  const overlayGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g')
  overlayGroup.setAttribute('data-role', 'placement-overlay')

  rows.forEach((row) => {
    if (!row.boardHole?.anchor) {
      return
    }

    const focus = row.connector.id === focusId
    const anchor = row.boardHole.anchor

    const circle = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', `${anchor.x}`)
    circle.setAttribute('cy', `${anchor.y}`)
    circle.setAttribute('r', focus ? '10' : '8')
    circle.setAttribute('class', `placement-hole${focus ? ' is-focus' : ''}`)
    overlayGroup.appendChild(circle)

    const label = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text')
    label.setAttribute('x', `${anchor.x + 10}`)
    label.setAttribute('y', `${anchor.y - 10}`)
    label.setAttribute('class', 'placement-label')
    label.textContent = `${row.connector.name} -> ${row.assignedHoleName}`
    overlayGroup.appendChild(label)
  })

  svgRoot.appendChild(overlayGroup)
  return new XMLSerializer().serializeToString(svgDoc)
}

function classifyPackage({ title, moduleId, connectors, filename }) {
  const text = `${title} ${moduleId} ${filename}`.toLowerCase()

  if (connectors.length > 100 || text.includes('breadboard')) {
    return {
      kind: 'Board',
      summary: `麵包板本體，含 ${connectors.length} 個 connector，可作為 placement 與 hole map 的幾何基底。`,
    }
  }

  if (text.includes('741') || text.includes('opamp') || text.includes('ua741')) {
    return {
      kind: 'IC',
      summary: `多腳位控制元件，這批資產含 ${connectors.length} 腳，適合先驗證 pin naming 與 orientation。`,
    }
  }

  if (text.includes('npn') || text.includes('to-92') || text.includes('transistor')) {
    return {
      kind: 'Transistor',
      summary: '三腳功率/小訊號元件，可直接對應 C / B / E 並做 breadboard 放置測試。',
    }
  }

  if (text.includes('zener') || text.includes('diode')) {
    return {
      kind: 'Diode',
      summary: '雙腳位參考元件，適合驗證方向性與最小 connector pipeline。',
    }
  }

  if (text.includes('resistor')) {
    return {
      kind: 'Resistor',
      summary: '雙腳位被動元件，可拿來測試跨列放置、間距與 value label。',
    }
  }

  if (text.includes('probe') || text.includes('meter')) {
    return {
      kind: 'Instrument',
      summary: '量測類元件，可作為顯示、探測點與輔助教學 overlay 的來源。',
    }
  }

  return {
    kind: 'Part',
    summary: `一般 Fritzing part bundle，含 ${connectors.length} 個 connector。`,
  }
}

function comparePackageNames(left, right) {
  const weight = (name) => {
    const text = name.toLowerCase()
    if (text.includes('breadboard')) return 0
    if (text.includes('ua741')) return 1
    if (text.includes('npn')) return 2
    if (text.includes('zener')) return 3
    if (text.includes('resistor')) return 4
    if (text.includes('probe')) return 5
    return 6
  }

  const leftWeight = weight(left)
  const rightWeight = weight(right)
  if (leftWeight !== rightWeight) {
    return leftWeight - rightWeight
  }

  return left.localeCompare(right)
}
</script>

<style scoped>
.viewer-shell {
  display: grid;
  grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
  gap: 20px;
}

.asset-rail {
  display: grid;
  gap: 12px;
  align-content: start;
}

.rail-head,
.upload-card,
.asset-button,
.stage-head,
.preview-card,
.inspect-card {
  border-radius: 26px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.08);
}

.rail-head {
  padding: 18px;
}

.rail-head p {
  margin: 0;
  color: #b45309;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.rail-head strong {
  display: block;
  margin-top: 8px;
  color: #12253f;
  font-size: 1.08rem;
  line-height: 1.45;
}

.upload-card {
  position: relative;
  display: block;
  padding: 16px 18px;
  overflow: hidden;
  cursor: pointer;
}

.upload-card span,
.asset-button span {
  display: block;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.upload-card strong,
.asset-button strong {
  display: block;
  margin-top: 8px;
  color: #12253f;
  font-size: 1rem;
}

.upload-card small,
.asset-button small {
  display: block;
  margin-top: 8px;
  color: #64748b;
  line-height: 1.45;
}

.upload-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.asset-button {
  width: 100%;
  padding: 16px 18px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.asset-button:hover {
  transform: translateY(-1px);
}

.asset-button.active {
  border-color: rgba(8, 145, 178, 0.42);
  background: linear-gradient(135deg, rgba(230, 247, 255, 0.96), rgba(238, 251, 246, 0.94));
}

.viewer-stage {
  display: grid;
  gap: 18px;
}

.stage-head {
  display: grid;
  gap: 16px;
  padding: 22px 24px;
}

.stage-kicker {
  margin: 0 0 8px;
  color: #b45309;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.stage-head h2 {
  margin: 0;
  color: #12253f;
  font-size: 1.7rem;
}

.stat-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stat-strip article {
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #eef3fb);
}

.stat-strip span {
  display: block;
  color: #0f766e;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.stat-strip strong {
  display: block;
  margin-top: 8px;
  color: #12253f;
  font-size: 0.98rem;
  word-break: break-word;
}

.error-banner {
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(239, 68, 68, 0.22);
  background: rgba(254, 242, 242, 0.9);
  color: #991b1b;
}

.error-banner strong {
  display: block;
}

.error-banner p {
  margin: 8px 0 0;
}

.viewer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);
  gap: 18px;
  align-items: start;
}

.preview-card,
.inspect-card {
  padding: 20px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.badge {
  padding: 5px 10px;
  border-radius: 999px;
  background: #0f766e;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.badge-slate {
  background: #1e293b;
}

.card-head h3 {
  margin: 0;
  color: #12253f;
  font-size: 1.02rem;
}

.svg-frame {
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fcfdff, #edf4fb);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.svg-stage :deep(svg) {
  width: 100%;
  height: auto;
  display: block;
}

.preview-note {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.04);
  color: #475569;
  line-height: 1.6;
}

.preview-note strong {
  color: #12253f;
}

.inspect-controls {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 14px;
  outline: none;
}

.search-input:focus {
  border-color: rgba(8, 145, 178, 0.5);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
}

.inspect-note {
  margin: 0;
  color: #64748b;
  font-size: 0.8rem;
}

.connector-table-wrap {
  max-height: 420px;
  overflow: auto;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.connector-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
}

.connector-table th,
.connector-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  text-align: left;
  vertical-align: top;
}

.connector-table thead th {
  position: sticky;
  top: 0;
  background: #f8fbff;
  color: #12253f;
}

.connector-table tbody tr {
  cursor: pointer;
}

.connector-table tbody tr.active {
  background: rgba(14, 165, 233, 0.08);
}

.connector-detail {
  margin-top: 14px;
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #eef8f6);
  border: 1px solid rgba(15, 118, 110, 0.14);
}

.connector-detail span {
  display: block;
  color: #0f766e;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.connector-detail strong {
  display: block;
  margin-top: 8px;
  color: #12253f;
  font-size: 1rem;
}

.connector-detail p {
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.55;
}

.placement-card {
  padding: 22px;
  border-radius: 28px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.08);
}

.placement-head {
  display: grid;
  gap: 16px;
}

.placement-head h3 {
  margin: 0;
  color: #12253f;
  font-size: 1.35rem;
}

.placement-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.placement-stats article {
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #eef3fb);
}

.placement-stats span {
  display: block;
  color: #0f766e;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.placement-stats strong {
  display: block;
  margin-top: 8px;
  color: #12253f;
  font-size: 0.98rem;
  word-break: break-word;
}

.placement-grid {
  display: grid;
  grid-template-columns: minmax(360px, 0.92fr) minmax(0, 1.08fr);
  gap: 18px;
  margin-top: 18px;
  align-items: start;
}

.placement-config,
.placement-visual {
  display: grid;
  gap: 14px;
}

.config-card {
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: linear-gradient(180deg, #ffffff, #f7fafe);
}

.config-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.config-head h4 {
  margin: 0;
  color: #12253f;
  font-size: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field,
.mapping-input {
  display: grid;
  gap: 6px;
}

.field span,
.mapping-input span {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
}

.select-input,
.text-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 14px;
  background: #fff;
  outline: none;
}

.select-input:focus,
.text-input:focus {
  border-color: rgba(8, 145, 178, 0.5);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
}

.auto-fill-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.04);
}

.auto-fill-head strong {
  color: #12253f;
}

.auto-fill-head small {
  display: block;
  margin-top: 6px;
  color: #64748b;
  line-height: 1.45;
}

.button-row {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.action-btn,
.ghost-btn {
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.action-btn {
  background: linear-gradient(135deg, #0891b2, #0f766e);
  color: #fff;
  box-shadow: 0 10px 24px rgba(8, 145, 178, 0.2);
}

.ghost-btn {
  background: #fff;
  color: #334155;
  border-color: rgba(148, 163, 184, 0.24);
}

.mapping-list {
  display: grid;
  gap: 10px;
}

.mapping-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 220px);
  gap: 14px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.82);
  cursor: pointer;
}

.mapping-row.active {
  border-color: rgba(8, 145, 178, 0.36);
  background: linear-gradient(135deg, rgba(230, 247, 255, 0.92), rgba(238, 251, 246, 0.88));
}

.mapping-meta span {
  display: block;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.mapping-meta strong {
  display: block;
  margin-top: 6px;
  color: #12253f;
}

.mapping-meta small {
  display: block;
  margin-top: 6px;
  color: #64748b;
}

.validation-list {
  display: grid;
  gap: 10px;
}

.validation-item {
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(239, 68, 68, 0.16);
  background: rgba(254, 242, 242, 0.72);
}

.validation-item.ok {
  border-color: rgba(34, 197, 94, 0.2);
  background: rgba(240, 253, 244, 0.9);
}

.validation-item strong {
  color: #12253f;
}

.validation-item p {
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.55;
}

.board-frame {
  min-height: 420px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.detail-grid article {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
}

.detail-grid small {
  display: block;
  color: #64748b;
}

.detail-grid strong {
  margin-top: 6px;
  word-break: break-word;
}

@media (max-width: 1180px) {
  .viewer-shell,
  .viewer-grid,
  .placement-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .stage-head,
  .preview-card,
  .inspect-card,
  .placement-card,
  .config-card,
  .asset-button,
  .upload-card,
  .rail-head {
    padding: 16px;
    border-radius: 22px;
  }

  .stat-strip,
  .detail-grid,
  .placement-stats,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .mapping-row {
    grid-template-columns: 1fr;
  }

  .button-row {
    flex-direction: column;
  }
}
</style>
