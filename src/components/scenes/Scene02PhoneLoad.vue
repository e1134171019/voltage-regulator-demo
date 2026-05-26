<template>
  <div class="app">
    <div class="grid-bg"></div>
    <div class="scanlines"></div>
    <div class="vignette"></div>

    <header class="hdr">
      <div class="hdr-deco">◈ POWER DEMO v1.0 ◈</div>
      <div class="hdr-center">
        <h1 class="main-title">為什麼需要穩壓？</h1>
        <p class="main-sub">手機開始錄影時，CPU、Camera、Memory 同時進入工作狀態，系統負載變重。</p>
      </div>
      <div class="hdr-deco">◈ SYSTEM INIT ◈</div>
    </header>

    <main class="triangle-layout">
      <section class="pane phone-pane">
        <div class="pane-ttl">手機畫面：模擬按下錄影</div>
        <div class="phone-scene">
          <div class="neon-halo" :class="{ active: isRec }"></div>
          <div class="neon-halo halo2" :class="{ active: isRec }"></div>

          <div class="phone" :class="{ rec: isRec }">
            <div class="side-btn sb-left"></div>
            <div class="side-btn sb-right"></div>
            <div class="ph-top">
              <div class="ph-camhole"></div>
              <div class="ph-speaker"></div>
            </div>
            <div class="ph-screen">
              <div class="ph-status-bar">
                <span class="ph-rec-indicator" :class="{ active: isRec }">
                  <span v-if="isRec" class="rec-dot"></span>{{ isRec ? '● REC' : '○ READY' }}
                </span>
                <span class="ph-time">{{ recTime }}</span>
              </div>
              <div class="viewfinder" :class="{ rec: isRec }">
                <div class="vf-c vf-tl"></div>
                <div class="vf-c vf-tr"></div>
                <div class="vf-c vf-bl"></div>
                <div class="vf-c vf-br"></div>
                <div class="vf-cross h"></div>
                <div class="vf-cross v"></div>
                <div v-if="isRec" class="vf-scanline"></div>
                <div class="vf-grid-line gl-h1"></div>
                <div class="vf-grid-line gl-h2"></div>
                <div class="vf-grid-line gl-v1"></div>
                <div class="vf-grid-line gl-v2"></div>
                <div class="vf-label">CAM PREVIEW</div>
                <div v-if="isRec" class="vf-rec-border"></div>
              </div>
              <div class="ph-controls">
                <button class="rec-btn" :class="{ rec: isRec }" :disabled="isRec" @click="startRec">
                  <span class="rb-ring"></span>
                  <span class="rb-core" :class="{ rec: isRec }"></span>
                  <span class="rb-label">{{ isRec ? '錄影中...' : '● 按下錄影' }}</span>
                </button>
              </div>
            </div>
            <div class="ph-home-bar"></div>
          </div>
        </div>
      </section>

      <section class="pane mods-pane">
        <div class="pane-ttl">左下：模組啟動與電子流淌</div>
        <div class="mod-scene">
          <svg class="conn-svg" viewBox="0 0 560 340" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="f-glow-sm">
                <feGaussianBlur stdDeviation="2" result="b"></feGaussianBlur>
                <feMerge>
                  <feMergeNode in="b"></feMergeNode>
                  <feMergeNode in="SourceGraphic"></feMergeNode>
                </feMerge>
              </filter>
            </defs>
            <path class="pg cyan-pg" :class="{ on: isRec }" d="M 160,80 C 240,36 320,36 400,80" fill="none" stroke="#00f0ff" stroke-width="8"></path>
            <path class="pg purple-pg" :class="{ on: isRec }" d="M 100,130 C 76,196 176,238 243,245" fill="none" stroke="#a855f7" stroke-width="8"></path>
            <path class="pg pink-pg" :class="{ on: isRec }" d="M 460,130 C 484,196 384,238 317,245" fill="none" stroke="#ff00aa" stroke-width="8"></path>
            <path class="pg green-pg" :class="{ on: isRec }" d="M 100,30 C 100,-2 460,-2 460,30" fill="none" stroke="#00ff88" stroke-width="5"></path>
            <path ref="pathCpuCamRef" class="cp cyan-cp" :class="{ on: isRec }" d="M 160,80 C 240,36 320,36 400,80" fill="none" stroke="#00f0ff"></path>
            <path ref="pathCpuMemRef" class="cp purple-cp" :class="{ on: isRec }" d="M 100,130 C 76,196 176,238 243,245" fill="none" stroke="#a855f7"></path>
            <path ref="pathCamMemRef" class="cp pink-cp" :class="{ on: isRec }" d="M 460,130 C 484,196 384,238 317,245" fill="none" stroke="#ff00aa"></path>
            <path ref="pathArchRef" class="cp arch-cp" :class="{ on: isRec }" d="M 100,30 C 100,-2 460,-2 460,30" fill="none" stroke="#00ff88"></path>
            <text x="280" y="17" class="svg-tag" :opacity="isRec ? 0.9 : 0" fill="#00ff88" font-size="8" text-anchor="middle" font-family="'Courier New',monospace" letter-spacing="1">SIGNAL / CONTROL PATH</text>
            <text x="280" y="198" class="svg-tag2" :opacity="isRec ? 0.8 : 0" fill="#ff00aa" font-size="7.5" text-anchor="middle" font-family="'Courier New',monospace" letter-spacing="1">POWER DEMAND RISE</text>
            <g v-for="p in particles" :key="p.id">
              <circle :cx="p.x" :cy="p.y" :r="p.r * 3.5" :fill="p.color" :opacity="p.opacity * 0.18"></circle>
              <circle :cx="p.x" :cy="p.y" :r="p.r * 1.8" :fill="p.color" :opacity="p.opacity * 0.4"></circle>
              <circle :cx="p.x" :cy="p.y" :r="p.r" :fill="p.color" :opacity="p.opacity" filter="url(#f-glow-sm)"></circle>
            </g>
          </svg>

          <div class="mod-box cpu-box" :class="{ active: mods.cpu }">
            <div class="mgr cyan-mgr"></div>
            <div class="chip-wrap">
              <div class="chip-pins ptop"><span v-for="i in 5" :key="i" class="cpin"></span></div>
              <div class="chip-mid">
                <div class="chip-pins pleft"><span v-for="i in 3" :key="i" class="cpin vpin"></span></div>
                <div class="chip-body">
                  <div class="chip-grid"><div v-for="i in 9" :key="i" class="cell" :class="{ lit: mods.cpu, odd: i % 2 === 0 }"></div></div>
                  <div class="chip-core-lbl">CPU</div>
                </div>
                <div class="chip-pins pright"><span v-for="i in 3" :key="i" class="cpin vpin"></span></div>
              </div>
              <div class="chip-pins pbot"><span v-for="i in 5" :key="i" class="cpin"></span></div>
            </div>
            <div class="mod-lbl">PROCESSOR</div>
            <div class="hud-corner hc-tl"></div><div class="hud-corner hc-tr"></div><div class="hud-corner hc-bl"></div><div class="hud-corner hc-br"></div>
          </div>

          <div class="mod-box cam-box" :class="{ active: mods.camera }">
            <div class="mgr pink-mgr"></div>
            <div class="cam-wrap">
              <div class="cam-body">
                <div class="lens-r1"><div class="lens-r2"><div class="lens-r3"><div class="lens-core"><div v-if="mods.camera" class="lens-flare"></div><div class="lens-refl"></div></div></div></div></div>
                <div class="cam-led" :class="{ on: mods.camera }"></div>
              </div>
              <div class="cam-specs"><span>f/1.8</span><span>4K</span></div>
            </div>
            <div class="mod-lbl">CAM MODULE</div>
            <div class="hud-corner hc-tl"></div><div class="hud-corner hc-tr"></div><div class="hud-corner hc-bl"></div><div class="hud-corner hc-br"></div>
          </div>

          <div class="mod-box mem-box" :class="{ active: mods.memory }">
            <div class="mgr purple-mgr"></div>
            <div class="mem-wrap">
              <div class="ddr-stick">
                <div class="ddr-chips"><div v-for="i in 6" :key="i" class="ddr-chip" :class="{ lit: mods.memory, delay: i % 2 === 0 }"></div></div>
                <div class="ddr-pcb-line"></div>
                <div class="ddr-label">DDR4</div>
                <div class="ddr-pins"><span v-for="i in 16" :key="i" class="ddr-pin"></span></div>
              </div>
            </div>
            <div class="mod-lbl">MEMORY</div>
            <div class="hud-corner hc-tl"></div><div class="hud-corner hc-tr"></div><div class="hud-corner hc-bl"></div><div class="hud-corner hc-br"></div>
          </div>
        </div>

        <div class="load-wrap">
          <div class="load-hdr">
            <span class="load-title">◆ SYSTEM LOAD MONITOR</span>
            <span class="load-badge" :class="{ high: isRec }">{{ isRec ? '▲ HIGH' : '▼ LOW' }}</span>
          </div>
          <div class="load-track">
            <div class="load-fill" :style="{ width: loadPct + '%' }" :class="{ high: isRec }"><div class="load-shimmer"></div></div>
            <div class="load-ticks"><span v-for="t in ['0%','25%','50%','75%','100%']" :key="t">{{ t }}</span></div>
          </div>
          <div class="load-val" :class="{ high: isRec }">{{ Math.round(loadPct) }}%</div>
        </div>
      </section>

      <section class="pane curve-pane">
        <div class="pane-ttl">右下：負載與電壓響應曲線</div>
        <div class="curve-panel">
          <div class="curve-title">◆ RESPONSE CURVE</div>
          <svg class="curve-svg" viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">
            <g class="curve-grid">
              <line x1="0" y1="40" x2="520" y2="40"/><line x1="0" y1="110" x2="520" y2="110"/><line x1="0" y1="180" x2="520" y2="180"/>
              <line x1="70" y1="0" x2="70" y2="220"/><line x1="170" y1="0" x2="170" y2="220"/><line x1="270" y1="0" x2="270" y2="220"/><line x1="370" y1="0" x2="370" y2="220"/><line x1="470" y1="0" x2="470" y2="220"/>
            </g>
            <defs>
              <path ref="loadMotionPathRef" d="M 14 182 C 80 182, 125 180, 170 170 C 220 158, 270 128, 320 92 C 370 58, 430 38, 506 28"/>
              <path ref="vMotionPathRef" d="M 14 70 C 110 70, 178 70, 230 70 C 258 70, 278 120, 305 132 C 330 144, 355 92, 380 74 C 415 54, 462 68, 506 70"/>
            </defs>
            <path class="curve-load" :class="{ active: isRec }" d="M 14 182 C 80 182, 125 180, 170 170 C 220 158, 270 128, 320 92 C 370 58, 430 38, 506 28"/>
            <path class="curve-vout" :class="{ active: isRec }" d="M 14 70 C 110 70, 178 70, 230 70 C 258 70, 278 120, 305 132 C 330 144, 355 92, 380 74 C 415 54, 462 68, 506 70"/>
            <g v-if="isRec" class="moving-hud" :transform="`translate(${loadHud.x}, ${loadHud.y})`">
              <circle class="curve-dot" r="6"></circle>
              <g class="curve-percent-badge load-badge-dot" transform="translate(0,-23)">
                <rect x="-24" y="-13" width="48" height="20" rx="8"></rect>
                <text x="0" y="2" text-anchor="middle">{{ loadHud.pct }}%</text>
              </g>
            </g>
            <g v-if="isRec" class="moving-hud" :transform="`translate(${voutHud.x}, ${voutHud.y})`">
              <circle class="curve-dot-v" r="5"></circle>
              <g class="curve-percent-badge vout-badge-dot" transform="translate(0,-23)">
                <rect x="-26" y="-13" width="52" height="20" rx="8"></rect>
                <text x="0" y="2" text-anchor="middle">{{ voutHud.pct }}%</text>
              </g>
            </g>
            <text x="400" y="26" class="curve-label load-label">LOAD ↑</text>
            <text x="310" y="155" class="curve-label vout-label">VOUT dip → recover</text>
            <text x="20" y="206" fill="rgba(0,240,255,0.35)" font-size="12" font-family="Courier New">time →</text>
          </svg>
        </div>
      </section>
    </main>

    <footer class="ftr" :class="{ active: isRec }">
      <div class="ftr-line" :class="{ active: isRec }"></div>
      <div class="ftr-msg"><span class="bolt">⚡</span>功能啟動，負載變重。<span class="bolt">⚡</span></div>
      <div v-if="isRec" class="ftr-sub">VOLTAGE FLUCTUATION RISK ↑ — VOLTAGE REGULATOR REQUIRED</div>
    </footer>
    <button v-if="isRec" class="reset-btn" @click="resetAll">↺ RESET</button>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const isRec = ref(false)
const loadPct = ref(30)
const mods = ref({ cpu: false, camera: false, memory: false })
const particles = ref([])
const recTime = ref('00:00')
const loadHud = ref({ x: 14, y: 182, pct: 30 })
const voutHud = ref({ x: 14, y: 70, pct: 100 })

const pathCpuCamRef = ref(null)
const pathCpuMemRef = ref(null)
const pathCamMemRef = ref(null)
const pathArchRef = ref(null)
const loadMotionPathRef = ref(null)
const vMotionPathRef = ref(null)

const PATH_COLORS = ['#00f0ff', '#ff00aa', '#a855f7', '#00ff88', '#ffffff', '#ffe066']

let rafId = null
let curveHudRaf = null
let loadAnimRaf = null
let timerInterval = null
let lastSpawn = 0
let pool = []
let pid = 0
const timeoutIds = []

function queueTimeout(fn, delay) {
  const id = window.setTimeout(fn, delay)
  timeoutIds.push(id)
  return id
}

function clearQueuedTimeouts() {
  while (timeoutIds.length) {
    window.clearTimeout(timeoutIds.pop())
  }
}

function clearRuntime() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (curveHudRaf) {
    cancelAnimationFrame(curveHudRaf)
    curveHudRaf = null
  }
  if (loadAnimRaf) {
    cancelAnimationFrame(loadAnimRaf)
    loadAnimRaf = null
  }
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  clearQueuedTimeouts()
}

function startTimer() {
  let secs = 0
  timerInterval = window.setInterval(() => {
    secs += 1
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    recTime.value = `${m}:${s}`
  }, 1000)
}

function startRec() {
  if (isRec.value) return

  clearRuntime()
  isRec.value = true
  recTime.value = '00:00'

  queueTimeout(() => {
    mods.value.cpu = true
  }, 500)
  queueTimeout(() => {
    mods.value.camera = true
  }, 1200)
  queueTimeout(() => {
    mods.value.memory = true
  }, 1900)

  animateLoad(30, 90, 6200)
  queueTimeout(runParticles, 1400)
  queueTimeout(runCurveHud, 1000)
  startTimer()
}

function animateLoad(from, to, duration) {
  const start = performance.now()

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1)
    const ease = 1 - (1 - progress) ** 2
    loadPct.value = from + (to - from) * ease

    if (progress < 1 && isRec.value) {
      loadAnimRaf = requestAnimationFrame(tick)
    }
  }

  loadAnimRaf = requestAnimationFrame(tick)
}

function particlePaths() {
  return [pathCpuCamRef.value, pathCpuMemRef.value, pathCamMemRef.value, pathArchRef.value].filter(Boolean)
}

function mkParticle() {
  const paths = particlePaths()
  if (!paths.length) return null

  const el = paths[Math.floor(Math.random() * paths.length)]
  const len = el.getTotalLength()

  return {
    id: pid += 1,
    el,
    len,
    prog: 0,
    spd: 0.001 + Math.random() * 0.0018,
    r: 1.8 + Math.random() * 2.7,
    color: PATH_COLORS[Math.floor(Math.random() * PATH_COLORS.length)],
    opacity: 0.72 + Math.random() * 0.28,
    x: 0,
    y: 0,
    alive: true,
  }
}

function runParticles() {
  lastSpawn = 0

  const loop = (ts) => {
    if (!isRec.value) return

    if (ts - lastSpawn > 280) {
      lastSpawn = ts
      const spawnCount = Math.random() < 0.45 ? 2 : 1
      for (let i = 0; i < spawnCount; i += 1) {
        const particle = mkParticle()
        if (particle) pool.push(particle)
      }
    }

    for (const particle of pool) {
      particle.prog += particle.spd
      if (particle.prog >= 1) {
        particle.alive = false
        continue
      }
      const point = particle.el.getPointAtLength(particle.prog * particle.len)
      particle.x = point.x
      particle.y = point.y
    }

    pool = pool.filter((particle) => particle.alive)
    particles.value = pool.map((particle) => ({
      id: particle.id,
      x: particle.x,
      y: particle.y,
      r: particle.r,
      color: particle.color,
      opacity: particle.opacity,
    }))

    rafId = requestAnimationFrame(loop)
  }

  rafId = requestAnimationFrame(loop)
}

function calcVoutPct(t) {
  if (t < 0.42) return 100
  if (t < 0.6) {
    const k = (t - 0.42) / 0.18
    return 100 - 18 * k
  }
  if (t < 0.8) {
    const k = (t - 0.6) / 0.2
    return 82 + 15 * k
  }
  const k = (t - 0.8) / 0.2
  return 97 - 2 * k
}

function runCurveHud() {
  const loadPath = loadMotionPathRef.value
  const voutPath = vMotionPathRef.value
  if (!loadPath || !voutPath) return

  const loadLength = loadPath.getTotalLength()
  const voutLength = voutPath.getTotalLength()
  const duration = 6800
  let startTime = null

  const tick = (now) => {
    if (!isRec.value) return
    if (startTime === null) startTime = now

    const t = ((now - startTime) % duration) / duration
    const ease = 1 - (1 - t) ** 2
    const loadNow = 30 + 60 * ease
    const voutNow = calcVoutPct(t)

    const loadPoint = loadPath.getPointAtLength(t * loadLength)
    const voutPoint = voutPath.getPointAtLength(t * voutLength)

    loadHud.value = { x: loadPoint.x, y: loadPoint.y, pct: Math.round(loadNow) }
    voutHud.value = { x: voutPoint.x, y: voutPoint.y, pct: Math.round(voutNow) }

    curveHudRaf = requestAnimationFrame(tick)
  }

  curveHudRaf = requestAnimationFrame(tick)
}

function resetAll() {
  isRec.value = false
  loadPct.value = 30
  mods.value = { cpu: false, camera: false, memory: false }
  particles.value = []
  recTime.value = '00:00'
  loadHud.value = { x: 14, y: 182, pct: 30 }
  voutHud.value = { x: 14, y: 70, pct: 100 }
  pool = []
  lastSpawn = 0
  clearRuntime()
}

onUnmounted(() => {
  resetAll()
})
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app {
  min-height: 100vh;
  background: #020812;
  color: #d0e4ff;
  font-family: 'Courier New', Courier, monospace;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  user-select: none;
}

.grid-bg {
  position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px),
    linear-gradient(rgba(0,240,255,0.014) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,240,255,0.014) 1px, transparent 1px);
  background-size: 80px 80px, 80px 80px, 20px 20px, 20px 20px;
  pointer-events: none;
  z-index: 0;
}

.scanlines {
  position: fixed; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.16) 2px, rgba(0,0,0,0.16) 4px);
  pointer-events: none;
  z-index: 1;
}

.vignette {
  position: fixed; inset: 0;
  background: radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.58) 100%);
  pointer-events: none;
  z-index: 1;
}

.hdr {
  position: relative; z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 14px 28px 10px;
  border-bottom: 1px solid rgba(0,240,255,0.22);
  background: linear-gradient(180deg, rgba(0,240,255,0.05) 0%, transparent 100%);
  flex-shrink: 0;
}

.hdr-deco {
  font-size: 11px; letter-spacing: 4px;
  color: rgba(0,240,255,0.56);
  white-space: nowrap;
}
.hdr-deco:last-child { text-align: right; }

.hdr-center { text-align: center; padding: 0 24px; }

.main-title {
  font-size: clamp(28px, 3vw, 44px);
  font-weight: 900;
  letter-spacing: 3px;
  background: linear-gradient(120deg, #00f0ff 0%, #a855f7 48%, #ff00aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.main-sub {
  font-size: clamp(13px, 1.15vw, 17px);
  color: rgba(180,210,255,0.74);
  letter-spacing: 0.8px;
  margin-top: 7px;
}

.triangle-layout {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: minmax(640px, 1.1fr) minmax(480px, 0.9fr);
  grid-template-rows: 390px minmax(360px, 1fr);
  grid-template-areas:
    'phone phone'
    'mods curve';
  gap: 20px 30px;
  width: min(1480px, 96vw);
  height: calc(100vh - 130px);
  margin: 0 auto;
  padding: 18px 20px 8px;
  align-items: start;
}

.pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.phone-pane { grid-area: phone; align-items: center; justify-content: flex-start; }
.mods-pane { grid-area: mods; align-items: stretch; justify-content: flex-start; }
.curve-pane { grid-area: curve; align-items: stretch; justify-content: flex-start; }

.pane-ttl {
  font-size: 13px;
  letter-spacing: 2.5px;
  color: rgba(0,240,255,0.78);
  margin-bottom: 10px;
  text-transform: uppercase;
  width: 100%;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0,240,255,0.16);
  text-shadow: 0 0 10px rgba(0,240,255,0.25);
}

.phone-scene {
  position: relative;
  width: 100%;
  min-height: 334px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
}

.neon-halo {
  position: absolute;
  width: 250px; height: 350px;
  border-radius: 36px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
}

.neon-halo.active {
  opacity: 1;
  box-shadow: 0 0 26px 8px rgba(255,0,170,0.34), 0 0 70px 22px rgba(0,240,255,0.15);
  animation: halo-pulse 2.2s ease-in-out infinite;
}

.halo2 { width: 280px; height: 380px; }
.halo2.active {
  box-shadow: 0 0 34px 12px rgba(168,85,247,0.22), 0 0 86px 30px rgba(255,0,170,0.09);
  animation: halo-pulse 3s ease-in-out infinite reverse;
}

.phone {
  position: relative;
  width: 184px; height: 332px;
  border-radius: 30px;
  background: linear-gradient(175deg, #0b1120 0%, #0e1830 50%, #0a0d1a 100%);
  border: 2px solid rgba(0,240,255,0.38);
  box-shadow: 0 0 16px rgba(0,240,255,0.2), inset 0 0 18px rgba(0,240,255,0.05);
  display: flex; flex-direction: column;
  padding: 6px;
  transition: border-color 0.5s, box-shadow 0.5s;
}
.phone.rec {
  border-color: rgba(255,0,170,0.72);
  box-shadow: 0 0 28px rgba(255,0,170,0.42), 0 0 54px rgba(0,240,255,0.13), inset 0 0 20px rgba(255,0,170,0.08);
}

.side-btn { position: absolute; background: rgba(0,240,255,0.28); border-radius: 2px; }
.sb-left  { left:-3px; top:78px; width:3px; height:38px; }
.sb-right { right:-3px; top:98px; width:3px; height:54px; }

.ph-top { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 4px 0 5px; }
.ph-camhole {
  width: 8px; height: 8px; border-radius: 50%;
  background: #050a14;
  border: 1px solid rgba(0,240,255,0.45);
  box-shadow: inset 0 0 4px rgba(0,240,255,0.35);
}
.ph-speaker {
  width: 42px; height: 4px; border-radius: 3px;
  background: linear-gradient(90deg, rgba(0,240,255,0.15), rgba(0,240,255,0.4), rgba(0,240,255,0.15));
}

.ph-screen {
  flex: 1;
  background: #040a14;
  border-radius: 22px;
  display: flex; flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0,240,255,0.13);
}

.ph-status-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 5px 9px;
  background: rgba(0,240,255,0.045);
  border-bottom: 1px solid rgba(0,240,255,0.09);
  font-size: 9px; letter-spacing: 1px;
}
.ph-rec-indicator { display: flex; align-items: center; gap: 4px; color: rgba(0,240,255,0.65); font-weight: bold; transition: color 0.4s; }
.ph-rec-indicator.active { color: #ff2244; }
.rec-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #ff2244; animation: blink 0.75s ease infinite; }
.ph-time { color: rgba(0,240,255,0.48); font-size: 9px; }

.viewfinder {
  flex: 1;
  position: relative;
  margin: 6px;
  background: linear-gradient(135deg, #02060e, #050d1c);
  border-radius: 7px;
  overflow: hidden;
}
.viewfinder.rec { background: linear-gradient(135deg, #030810, #060310); }

.vf-c { position: absolute; width: 13px; height: 13px; border-color: rgba(0,240,255,0.7); border-style: solid; }
.vf-tl { top:5px; left:5px; border-width:2px 0 0 2px; }
.vf-tr { top:5px; right:5px; border-width:2px 2px 0 0; }
.vf-bl { bottom:5px; left:5px; border-width:0 0 2px 2px; }
.vf-br { bottom:5px; right:5px; border-width:0 2px 2px 0; }

.vf-cross { position: absolute; background: rgba(0,240,255,0.17); }
.vf-cross.h { top:50%; left:15%; right:15%; height:1px; transform:translateY(-50%); }
.vf-cross.v { left:50%; top:15%; bottom:15%; width:1px; transform:translateX(-50%); }
.vf-grid-line { position: absolute; background: rgba(0,240,255,0.07); }
.gl-h1 { top:33%; left:0; right:0; height:1px; }
.gl-h2 { top:66%; left:0; right:0; height:1px; }
.gl-v1 { left:33%; top:0; bottom:0; width:1px; }
.gl-v2 { left:66%; top:0; bottom:0; width:1px; }

.vf-scanline {
  position: absolute; left:0; right:0; height:2px;
  background: linear-gradient(90deg, transparent, rgba(255,0,170,0.8), rgba(255,0,170,0.35), transparent);
  animation: scan-down 2.6s linear infinite;
}
.vf-rec-border { position: absolute; inset: 3px; border: 1px solid rgba(255,34,68,0.55); border-radius: 4px; animation: rec-border 1.5s ease infinite; }
.vf-label { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); font-size: 7px; color: rgba(0,240,255,0.36); letter-spacing: 1.6px; }

.ph-controls {
  padding: 8px 8px 9px;
  display: flex; justify-content: center;
  background: rgba(0,0,0,0.26);
  border-top: 1px solid rgba(0,240,255,0.08);
}
.rec-btn {
  position: relative;
  background: transparent;
  border: 1px solid rgba(0,240,255,0.45);
  border-radius: 18px;
  padding: 6px 14px;
  cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.35s;
  font-family: inherit;
}
.rec-btn:hover:not(:disabled) { border-color: #ff00aa; background: rgba(255,0,170,0.08); box-shadow: 0 0 12px rgba(255,0,170,0.32); }
.rec-btn.rec { border-color: rgba(255,34,68,0.55); cursor: default; }
.rec-btn:disabled { pointer-events: none; }
.rb-ring { position: absolute; inset: -3px; border-radius: 20px; border: 1px solid transparent; }
.rec-btn.rec .rb-ring { border-color: rgba(255,34,68,0.32); animation: btn-ring 1.5s ease infinite; }
.rb-core { width: 9px; height: 9px; border-radius: 50%; background: rgba(0,240,255,0.65); transition: background 0.4s; flex-shrink: 0; }
.rb-core.rec { background: #ff2244; animation: blink 0.75s ease infinite; }
.rb-label { font-size: 10px; letter-spacing: 1px; color: rgba(220,238,255,0.86); white-space: nowrap; }

.ph-home-bar { height: 20px; display: flex; align-items: center; justify-content: center; }
.ph-home-bar::after { content: ''; width: 54px; height: 3px; background: rgba(0,240,255,0.28); border-radius: 2px; }

.mod-scene {
  position: relative;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 560 / 340;
  min-height: 390px;
  max-height: 450px;
  margin: 8px 0 10px;
  flex-shrink: 0;
}

.conn-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
.pg { opacity: 0; filter: blur(5px); transition: opacity 0.7s ease; }
.pg.on { opacity: 0.34; }
.green-pg.on { opacity: 0.23; }

.cp { stroke-width: 2; stroke-dasharray: 8 5; opacity: 0; transition: opacity 0.6s ease; }
.cp.on { opacity: 1; animation: dash-flow 2.8s linear infinite; }
.arch-cp { stroke-dasharray: 5 8; }
.arch-cp.on { animation: dash-flow 3.5s linear infinite reverse; }

.mod-box { position: absolute; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.cpu-box { left: 7.143%; top: 8.824%; width: 21.429%; }
.cam-box { left: 71.429%; top: 8.824%; width: 21.429%; }
.mem-box { left: 34.821%; top: 72.059%; width: 30.357%; }

.mgr { position: absolute; inset: -7px; border-radius: 10px; opacity: 0; transition: opacity 0.6s ease; pointer-events: none; }
.mod-box.active .mgr { opacity: 1; animation: mgr-pulse 2s ease-in-out infinite; }
.cyan-mgr { box-shadow: 0 0 24px 6px rgba(0,240,255,0.6), inset 0 0 12px rgba(0,240,255,0.12); }
.pink-mgr { box-shadow: 0 0 24px 6px rgba(255,0,170,0.6), inset 0 0 12px rgba(255,0,170,0.12); }
.purple-mgr { box-shadow: 0 0 24px 6px rgba(168,85,247,0.6), inset 0 0 12px rgba(168,85,247,0.12); border-radius: 5px; }

.hud-corner { position: absolute; width: 9px; height: 9px; border-color: rgba(0,240,255,0.48); border-style: solid; opacity: 0; transition: opacity 0.5s, border-color 0.5s; }
.mod-box.active .hud-corner { opacity: 1; }
.cam-box.active .hud-corner { border-color: rgba(255,0,170,0.55); }
.mem-box.active .hud-corner { border-color: rgba(168,85,247,0.58); }
.hc-tl { top:-4px; left:-4px; border-width:2px 0 0 2px; }
.hc-tr { top:-4px; right:-4px; border-width:2px 2px 0 0; }
.hc-bl { bottom:-4px; left:-4px; border-width:0 0 2px 2px; }
.hc-br { bottom:-4px; right:-4px; border-width:0 2px 2px 0; }

.mod-lbl { font-size: 9px; letter-spacing: 2.2px; color: rgba(0,240,255,0.42); transition: color 0.4s; margin-top: 2px; }
.mod-box.active .mod-lbl { color: rgba(0,240,255,0.9); }
.cam-box.active .mod-lbl { color: rgba(255,0,170,0.9); }
.mem-box.active .mod-lbl { color: rgba(168,85,247,0.92); }

.chip-wrap { display: flex; flex-direction: column; align-items: center; width: 100%; }
.chip-pins { display: flex; gap: 4px; padding: 3px 10px; }
.chip-mid { display: flex; align-items: center; width: 100%; }
.pleft, .pright { flex-direction: column; padding: 4px 3px; }
.cpin { display: block; background: rgba(0,240,255,0.34); border-radius: 1px; }
.cpin:not(.vpin) { width: 5px; height: 8px; }
.cpin.vpin { width: 8px; height: 5px; }

.chip-body {
  flex: 1;
  background: linear-gradient(145deg, #08152a, #0e2040);
  border: 1px solid rgba(0,240,255,0.28);
  border-radius: 5px;
  padding: 8px 7px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  transition: border-color 0.5s, box-shadow 0.5s;
}
.mod-box.active .chip-body { border-color: rgba(0,240,255,0.86); box-shadow: inset 0 0 14px rgba(0,240,255,0.18); }
.chip-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; width: 100%; }
.cell { aspect-ratio: 1; background: rgba(0,240,255,0.09); border: 1px solid rgba(0,240,255,0.13); border-radius: 1px; transition: background 0.3s; }
.cell.lit { background: rgba(0,240,255,0.48); border-color: rgba(0,240,255,0.76); box-shadow: 0 0 5px rgba(0,240,255,0.44); animation: cell-flicker 2.1s ease infinite; }
.cell.lit.odd { animation-delay: 1s; background: rgba(0,240,255,0.34); }
.chip-core-lbl { font-size: 15px; font-weight: 900; letter-spacing: 4px; color: rgba(0,240,255,0.58); transition: color 0.4s, text-shadow 0.4s; }
.mod-box.active .chip-core-lbl { color: #00f0ff; text-shadow: 0 0 10px rgba(0,240,255,0.86); }

.cam-wrap { display: flex; flex-direction: column; align-items: center; gap: 5px; width: 100%; }
.cam-body { display: flex; flex-direction: column; align-items: center; background: linear-gradient(145deg, #0a0518, #130828); border: 1px solid rgba(255,0,170,0.23); border-radius: 10px; padding: 10px; width: 100%; transition: border-color 0.5s, box-shadow 0.5s; }
.mod-box.active .cam-body { border-color: rgba(255,0,170,0.78); box-shadow: inset 0 0 14px rgba(255,0,170,0.12); }
.lens-r1, .lens-r2, .lens-r3, .lens-core { display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.lens-r1 { width: 72px; height: 72px; background: #06040f; border: 2px solid rgba(255,0,170,0.28); transition: border-color 0.5s; }
.mod-box.active .lens-r1 { border-color: rgba(255,0,170,0.82); box-shadow: 0 0 14px rgba(255,0,170,0.38); }
.lens-r2 { width: 54px; height: 54px; background: #040210; border: 1.5px solid rgba(168,85,247,0.22); transition: border-color 0.5s; }
.mod-box.active .lens-r2 { border-color: rgba(168,85,247,0.66); }
.lens-r3 { width: 36px; height: 36px; background: radial-gradient(circle, #120826, #050310); border: 1.5px solid rgba(168,85,247,0.16); transition: all 0.5s; }
.mod-box.active .lens-r3 { border-color: rgba(168,85,247,0.76); box-shadow: 0 0 10px rgba(168,85,247,0.55); }
.lens-core { width: 22px; height: 22px; background: radial-gradient(circle, #1c0a32, #060210); position: relative; }
.lens-refl { position: absolute; top: 4px; left: 4px; width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.36); }
.lens-flare { width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle, #fff, #a855f7); animation: lens-glow 1s ease-in-out infinite alternate; }
.cam-led { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,0,170,0.16); margin-top: 3px; transition: background 0.4s; }
.cam-led.on { background: #ff00aa; box-shadow: 0 0 8px #ff00aa; animation: blink 1.3s ease infinite; }
.cam-specs { display: flex; gap: 10px; font-size: 9px; color: rgba(255,0,170,0.38); letter-spacing: 1px; transition: color 0.4s; }
.mod-box.active .cam-specs { color: rgba(255,0,170,0.78); }

.mem-wrap { width: 100%; }
.ddr-stick { width: 100%; background: linear-gradient(145deg, #06081a, #0a0e22); border: 1px solid rgba(168,85,247,0.28); border-radius: 4px; padding: 7px 8px; display: flex; flex-direction: column; align-items: center; gap: 5px; transition: border-color 0.5s, box-shadow 0.5s; }
.mod-box.active .ddr-stick { border-color: rgba(168,85,247,0.82); box-shadow: inset 0 0 14px rgba(168,85,247,0.14); }
.ddr-chips { display: flex; gap: 4px; flex-wrap: nowrap; }
.ddr-chip { width: 18px; height: 18px; background: rgba(168,85,247,0.13); border: 1px solid rgba(168,85,247,0.24); border-radius: 2px; transition: background 0.3s; }
.ddr-chip.lit { background: rgba(168,85,247,0.54); border-color: rgba(168,85,247,0.86); box-shadow: 0 0 6px rgba(168,85,247,0.55); animation: cell-flicker 2.4s ease infinite; }
.ddr-chip.lit.delay { animation-delay: 1.2s; }
.ddr-pcb-line { width: 82%; height: 1px; background: linear-gradient(90deg, transparent, rgba(168,85,247,0.48), transparent); }
.ddr-label { font-size: 13px; font-weight: 900; letter-spacing: 5px; color: rgba(168,85,247,0.52); transition: color 0.4s, text-shadow 0.4s; }
.mod-box.active .ddr-label { color: #a855f7; text-shadow: 0 0 10px rgba(168,85,247,0.76); }
.ddr-pins { display: flex; gap: 2.5px; }
.ddr-pin { display: block; width: 4px; height: 6px; background: rgba(168,85,247,0.28); border-radius: 1px; }

.load-wrap { width: 100%; max-width: 800px; padding: 10px 2px 2px; border-top: 1px solid rgba(0,240,255,0.11); margin-top: 6px; flex-shrink: 0; }
.load-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
.load-title { font-size: 12px; letter-spacing: 2px; color: rgba(0,240,255,0.72); }
.load-badge { font-size: 11px; padding: 4px 10px; border: 1px solid rgba(0,240,255,0.38); border-radius: 12px; color: rgba(0,240,255,0.76); letter-spacing: 1px; transition: all 0.5s; }
.load-badge.high { border-color: #ff2244; color: #ff2244; box-shadow: 0 0 10px rgba(255,34,68,0.42); animation: blink 1.2s ease infinite; }
.load-track { position: relative; height: 18px; background: rgba(0,240,255,0.06); border: 1px solid rgba(0,240,255,0.16); border-radius: 9px; overflow: hidden; margin-bottom: 5px; }
.load-fill { height: 100%; border-radius: 9px; background: linear-gradient(90deg, #00c8ff, #a855f7); transition: width 0.1s linear, background 0.6s; position: relative; overflow: hidden; }
.load-fill.high { background: linear-gradient(90deg, #ff2244, #ff00aa, #a855f7); box-shadow: 0 0 10px rgba(255,34,68,0.45); }
.load-shimmer { position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.26) 50%, transparent 100%); animation: shimmer 2s ease-in-out infinite; }
.load-ticks { position: absolute; inset: 0; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 3px 2px; pointer-events: none; }
.load-ticks span { font-size: 7px; color: rgba(0,240,255,0.25); }
.load-val { font-size: 16px; font-weight: 700; color: #00c8ff; letter-spacing: 2px; text-align: right; transition: color 0.5s; }
.load-val.high { color: #ff2244; text-shadow: 0 0 8px #ff2244; }

.curve-panel { width: 100%; max-width: 580px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,240,255,0.09); }
.curve-title { font-size: 13px; letter-spacing: 2px; color: rgba(0,240,255,0.72); margin-bottom: 8px; }
.curve-svg { width: 100%; height: 250px; display: block; background: linear-gradient(180deg, rgba(0,240,255,0.035), rgba(0,0,0,0.12)); border: 1px solid rgba(0,240,255,0.13); border-radius: 10px; }
.curve-grid line { stroke: rgba(0,240,255,0.08); stroke-width: 1; }
.curve-load, .curve-vout { fill: none; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; opacity: 0.28; }
.curve-load { stroke: #00f0ff; filter: drop-shadow(0 0 7px rgba(0,240,255,0.42)); stroke-dasharray: 540; stroke-dashoffset: 540; }
.curve-vout { stroke: #ff00aa; filter: drop-shadow(0 0 7px rgba(255,0,170,0.38)); stroke-dasharray: 540; stroke-dashoffset: 540; }
.curve-load.active { opacity: 1; animation: drawCurve 4.6s ease forwards; }
.curve-vout.active { opacity: 1; animation: drawCurve 5.2s ease forwards; }
.curve-label { font-size: 12px; letter-spacing: 1px; font-family: 'Courier New', monospace; }
.load-label { fill: #00f0ff; }
.vout-label { fill: #ff00aa; }
.curve-dot { fill: #00f0ff; filter: drop-shadow(0 0 9px rgba(0,240,255,0.92)); }
.curve-dot-v { fill: #ff00aa; filter: drop-shadow(0 0 9px rgba(255,0,170,0.82)); }
.moving-hud { pointer-events: none; }
.curve-percent-badge rect {
  fill: rgba(2, 8, 18, 0.88);
  stroke-width: 1.2;
  filter: drop-shadow(0 0 8px currentColor);
}
.curve-percent-badge text {
  font-size: 11px;
  font-weight: 900;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  dominant-baseline: middle;
  stroke: none;
}
.load-badge-dot { color: #00f0ff; }
.load-badge-dot rect { stroke: rgba(0,240,255,0.78); }
.load-badge-dot text { fill: #00f0ff; }
.vout-badge-dot { color: #ff00aa; }
.vout-badge-dot rect { stroke: rgba(255,0,170,0.78); }
.vout-badge-dot text { fill: #ff00aa; }

.ftr { position: relative; z-index: 10; text-align: center; padding: 8px 10px 7px; font-size: 16px; letter-spacing: 2px; color: rgba(200,220,255,0.34); transition: all 0.5s; flex-shrink: 0; }
.ftr.active { color: #ff00aa; text-shadow: 0 0 14px rgba(255,0,170,0.5); background: rgba(255,0,170,0.04); }
.ftr-line { height: 1px; background: rgba(0,240,255,0.1); margin-bottom: 6px; transition: background 0.5s; }
.ftr-line.active { background: linear-gradient(90deg, transparent, rgba(255,0,170,0.5), transparent); }
.ftr-msg { display: flex; align-items: center; justify-content: center; gap: 10px; }
.bolt { font-size: 17px; }
.ftr-sub { font-size: 11px; letter-spacing: 1.5px; color: rgba(0,240,255,0.52); margin-top: 4px; }

.reset-btn { position: fixed; bottom: 62px; right: 24px; z-index: 100; background: rgba(0,240,255,0.08); border: 1px solid rgba(0,240,255,0.42); border-radius: 18px; color: rgba(0,240,255,0.85); font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 2px; padding: 8px 16px; cursor: pointer; transition: all 0.3s; }
.reset-btn:hover { background: rgba(0,240,255,0.16); box-shadow: 0 0 14px rgba(0,240,255,0.4); }

.svg-tag, .svg-tag2 { transition: opacity 0.8s ease; }

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes scan-down { 0% { top: 0; opacity: 0.9; } 100% { top: 100%; opacity: 0.4; } }
@keyframes dash-flow { to { stroke-dashoffset: -30; } }
@keyframes halo-pulse { 0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.02); } }
@keyframes mgr-pulse { 0%, 100% { opacity: 0.75; } 50% { opacity: 1; } }
@keyframes cell-flicker { 0%, 88%, 100% { opacity: 1; } 93% { opacity: 0.3; } }
@keyframes lens-glow { from { transform: scale(0.8); opacity: 0.7; box-shadow: none; } to { transform: scale(1.3); opacity: 1; box-shadow: 0 0 8px #a855f7; } }
@keyframes btn-ring { 0% { box-shadow: 0 0 0 0 rgba(255,34,68,0.5); } 100% { box-shadow: 0 0 0 5px rgba(255,34,68,0); } }
@keyframes rec-border { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; box-shadow: 0 0 6px rgba(255,34,68,0.4); } }
@keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
@keyframes drawCurve { to { stroke-dashoffset: 0; } }

@media (max-width: 1180px) {
  .triangle-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas: 'phone' 'mods' 'curve';
    height: auto;
    overflow: auto;
  }
  .mod-scene { max-width: 760px; margin-left: auto; margin-right: auto; }
  .load-wrap { margin-left: auto; margin-right: auto; }
  .curve-panel { max-width: 760px; margin-left: auto; margin-right: auto; }
  .hdr {
    grid-template-columns: 1fr;
    gap: 10px;
    justify-items: center;
  }
  .hdr-deco:last-child,
  .hdr-deco { text-align: center; }
}
</style>
