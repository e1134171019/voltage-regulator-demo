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
</style>
