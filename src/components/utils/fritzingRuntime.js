import JSZip from 'jszip'

const publicPackageModules = import.meta.glob('../../../public/*.fzpz', {
  eager: true,
  import: 'default',
  query: '?url',
})

export async function loadPublicFritzingPackages() {
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

  return Promise.all(
    packageEntries.map(async (entry) => {
      const response = await fetch(entry.path)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${entry.path}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return parseFzpzPackage(arrayBuffer, entry)
    }),
  )
}

export async function parseFzpzPackage(arrayBuffer, meta) {
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

export function resolveZipEntryByViewName(entryNames, basename) {
  if (!basename) {
    return ''
  }

  return entryNames.find((name) => name.endsWith(basename)) || entryNames.find((name) => name.includes(`.${basename}`)) || ''
}

export function readText(node) {
  return node?.textContent?.trim() || ''
}

export function findSvgElement(svgDoc, id) {
  if (!id) {
    return null
  }

  return svgDoc.getElementById(id) || svgDoc.querySelector(`[id="${id}"]`)
}

export function getElementAnchor(element) {
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

export function parseHoleName(name) {
  const match = /^(\d+)([A-Za-z]+)$/.exec((name || '').trim())
  if (!match) {
    return null
  }

  return {
    row: Number.parseInt(match[1], 10),
    column: match[2].toUpperCase(),
  }
}

export function compareHoleNames(leftName, rightName) {
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
