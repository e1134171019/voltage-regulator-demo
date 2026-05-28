<template>
  <VoltageRegulatorPresentation />
</template>

<script setup>
import VoltageRegulatorPresentation from './views/VoltageRegulatorPresentation.vue'
</script>

<style scoped>
:global(:root) {
  --nova-bg-0: #f8fbff;
  --nova-bg-1: #eef6ff;
  --nova-bg-2: #fff7ed;
  --nova-panel: rgba(255, 255, 255, 0.76);
  --nova-panel-strong: rgba(255, 255, 255, 0.94);
  --nova-border: rgba(14, 116, 144, 0.18);
  --nova-border-strong: rgba(37, 99, 235, 0.24);
  --nova-text: #10233f;
  --nova-text-dim: #64748b;
  --nova-cyan: #0284c7;
  --nova-pink: #f97316;
  --nova-violet: #7c3aed;
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
    linear-gradient(rgba(14, 116, 144, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 116, 144, 0.055) 1px, transparent 1px),
    radial-gradient(circle at 18% 18%, rgba(14, 165, 233, 0.2), transparent 28%),
    radial-gradient(circle at 82% 16%, rgba(249, 115, 22, 0.18), transparent 24%),
    radial-gradient(circle at 74% 82%, rgba(124, 58, 237, 0.12), transparent 30%),
    linear-gradient(125deg, var(--nova-bg-0) 0%, var(--nova-bg-1) 52%, var(--nova-bg-2) 100%);
  background-size: 120px 120px, 120px 120px, auto, auto, auto, auto;
  color: var(--nova-text);
}

:global(body::before) {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255, 255, 255, 0.38) 0%, transparent 22%, transparent 78%, rgba(255, 255, 255, 0.22) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(226, 232, 240, 0.18) 100%);
  mix-blend-mode: normal;
  z-index: 0;
}

:global(body::after) {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at center, transparent 60%, rgba(148, 163, 184, 0.2) 100%);
  z-index: 0;
}

:global(button),
:global(input),
:global(select) {
  font: inherit;
}

/* Light presentation overrides for scene-style pages. */
:global(.app) {
  background: #f8fbff !important;
  color: #10233f !important;
}

:global(.grid-bg) {
  background-image:
    linear-gradient(rgba(14, 116, 144, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 116, 144, 0.07) 1px, transparent 1px),
    linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px) !important;
}

:global(.scanlines) {
  display: none !important;
}

:global(.vignette) {
  background: radial-gradient(ellipse at center, transparent 62%, rgba(148, 163, 184, 0.22) 100%) !important;
}

:global(.hdr) {
  border-bottom-color: rgba(14, 116, 144, 0.18) !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.28) 100%) !important;
}

:global(.hdr-deco),
:global(.pane-ttl) {
  color: rgba(14, 116, 144, 0.78) !important;
  text-shadow: none !important;
}

:global(.main-sub) {
  color: #475569 !important;
}

:global(.pane-ttl) {
  border-bottom-color: rgba(14, 116, 144, 0.18) !important;
}

:global(.scene-node-viewer) {
  background: #f8fbff !important;
  color: #10233f !important;
}
</style>
