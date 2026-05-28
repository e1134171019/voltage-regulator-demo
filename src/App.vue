<template>
  <VoltageRegulatorPresentation />
</template>

<script setup>
import VoltageRegulatorPresentation from './views/VoltageRegulatorPresentation.vue'
</script>

<style scoped>
:global(:root) {
  --nova-bg-0: #d7e3ee;
  --nova-bg-1: #c9d9e7;
  --nova-bg-2: #e8dfd2;
  --nova-panel: rgba(248, 250, 252, 0.76);
  --nova-panel-strong: rgba(248, 250, 252, 0.94);
  --nova-border: rgba(51, 65, 85, 0.2);
  --nova-border-strong: rgba(14, 116, 144, 0.28);
  --nova-text: #10233f;
  --nova-text-dim: #475569;
  --nova-cyan: #0f766e;
  --nova-pink: #c05621;
  --nova-violet: #5b4b8a;
  --font-sans: 'Noto Sans TC', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Cascadia Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
}

:global(*) {
  box-sizing: border-box;
}

:global(html) {
  color-scheme: light;
}

:global(body) {
  margin: 0;
  min-height: 100vh;
  font-family: var(--font-sans);
  background:
    linear-gradient(rgba(51, 65, 85, 0.075) 1px, transparent 1px),
    linear-gradient(90deg, rgba(51, 65, 85, 0.075) 1px, transparent 1px),
    radial-gradient(circle at 18% 18%, rgba(14, 116, 144, 0.24), transparent 30%),
    radial-gradient(circle at 82% 16%, rgba(192, 86, 33, 0.18), transparent 26%),
    radial-gradient(circle at 74% 82%, rgba(91, 75, 138, 0.16), transparent 32%),
    linear-gradient(125deg, var(--nova-bg-0) 0%, var(--nova-bg-1) 54%, var(--nova-bg-2) 100%);
  background-size: 120px 120px, 120px 120px, auto, auto, auto, auto;
  color: var(--nova-text);
}

:global(body::before) {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255, 255, 255, 0.18) 0%, transparent 22%, transparent 78%, rgba(255, 255, 255, 0.12) 100%),
    linear-gradient(180deg, rgba(71, 85, 105, 0.08) 0%, rgba(15, 23, 42, 0.08) 100%);
  mix-blend-mode: normal;
  z-index: 0;
}

:global(body::after) {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at center, transparent 58%, rgba(51, 65, 85, 0.28) 100%);
  z-index: 0;
}

:global(button),
:global(input),
:global(select) {
  font: inherit;
}

/* Balanced presentation overrides for scene-style pages. */
:global(.app) {
  background: #d7e3ee !important;
  color: #10233f !important;
}

:global(.grid-bg) {
  background-image:
    linear-gradient(rgba(51, 65, 85, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(51, 65, 85, 0.08) 1px, transparent 1px),
    linear-gradient(rgba(14, 116, 144, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 116, 144, 0.08) 1px, transparent 1px) !important;
}

:global(.scanlines) {
  display: none !important;
}

:global(.vignette) {
  background: radial-gradient(ellipse at center, transparent 60%, rgba(51, 65, 85, 0.26) 100%) !important;
}

:global(.hdr) {
  border-bottom-color: rgba(51, 65, 85, 0.2) !important;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.7) 0%, rgba(226, 232, 240, 0.34) 100%) !important;
}

:global(.hdr-deco),
:global(.pane-ttl) {
  color: rgba(15, 118, 110, 0.86) !important;
  text-shadow: none !important;
}

:global(.main-sub) {
  color: #334155 !important;
}

:global(.pane-ttl) {
  border-bottom-color: rgba(51, 65, 85, 0.18) !important;
}

:global(.scene-node-viewer) {
  background: #d7e3ee !important;
  color: #10233f !important;
}

/* Scene 02 compact fit: keep the phone-load page visible without internal scrolling. */
:global(.slide-surface .app) {
  height: 100% !important;
  min-height: 0 !important;
  overflow: hidden !important;
}

:global(.slide-surface .hdr) {
  padding: 8px 28px 6px !important;
  min-height: 76px !important;
}

:global(.slide-surface .main-title) {
  font-size: clamp(24px, 2.45vw, 34px) !important;
  letter-spacing: 2px !important;
}

:global(.slide-surface .main-sub) {
  font-size: clamp(11px, 0.95vw, 14px) !important;
  margin-top: 4px !important;
}

:global(.slide-surface .triangle-layout) {
  grid-template-rows: 300px minmax(260px, 1fr) !important;
  gap: 10px 24px !important;
  width: min(1420px, 96vw) !important;
  height: calc(100% - 78px) !important;
  padding: 8px 20px 0 !important;
}

:global(.slide-surface .pane-ttl) {
  font-size: 11px !important;
  letter-spacing: 2px !important;
  margin-bottom: 5px !important;
  padding-bottom: 5px !important;
}

:global(.slide-surface .phone-scene) {
  min-height: 246px !important;
  height: 246px !important;
  padding-top: 0 !important;
  transform: scale(0.82) !important;
  transform-origin: top center !important;
}

:global(.slide-surface .mods-pane),
:global(.slide-surface .curve-pane) {
  overflow: hidden !important;
}

:global(.slide-surface .mod-scene) {
  min-height: 0 !important;
  height: 224px !important;
  transform: scale(0.84) !important;
  transform-origin: top left !important;
  width: 119% !important;
}

:global(.slide-surface .load-wrap) {
  margin-top: 4px !important;
  padding: 8px 12px !important;
}

:global(.slide-surface .curve-panel) {
  height: 264px !important;
  min-height: 0 !important;
  padding: 10px 12px !important;
}

:global(.slide-surface .curve-svg) {
  height: 214px !important;
}

:global(.slide-surface .ftr) {
  display: none !important;
}
</style>
