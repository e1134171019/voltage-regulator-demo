<template>
  <VoltageRegulatorPresentation />
</template>

<script setup>
import VoltageRegulatorPresentation from './views/VoltageRegulatorPresentation.vue'
</script>

<style scoped>
:global(:root) {
  --nova-bg-0: #020812;
  --nova-bg-1: #07112a;
  --nova-bg-2: #140a2d;
  --nova-panel: rgba(6, 14, 34, 0.76);
  --nova-panel-strong: rgba(4, 11, 28, 0.9);
  --nova-border: rgba(0, 240, 255, 0.16);
  --nova-border-strong: rgba(255, 79, 163, 0.22);
  --nova-text: #d9f7ff;
  --nova-text-dim: #84abc4;
  --nova-cyan: #00f0ff;
  --nova-pink: #ff4fa3;
  --nova-violet: #8b5cf6;
}

:global(*) {
  box-sizing: border-box;
}

:global(html) {
  color-scheme: dark;
}

:global(body) {
  margin: 0;
  min-height: 100vh;
  font-family: Aptos, 'Segoe UI', 'Noto Sans TC', sans-serif;
  background:
    linear-gradient(rgba(0, 240, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.045) 1px, transparent 1px),
    radial-gradient(circle at 18% 18%, rgba(0, 240, 255, 0.18), transparent 26%),
    radial-gradient(circle at 80% 22%, rgba(255, 79, 163, 0.18), transparent 24%),
    radial-gradient(circle at 72% 78%, rgba(139, 92, 246, 0.16), transparent 28%),
    linear-gradient(125deg, var(--nova-bg-0) 0%, var(--nova-bg-1) 48%, var(--nova-bg-2) 100%);
  background-size: 120px 120px, 120px 120px, auto, auto, auto, auto;
  color: var(--nova-text);
}

:global(body::before) {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255, 255, 255, 0.02) 0%, transparent 18%, transparent 82%, rgba(255, 255, 255, 0.015) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(1, 5, 16, 0.18) 100%);
  mix-blend-mode: screen;
  z-index: 0;
}

:global(body::after) {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at center, transparent 54%, rgba(1, 6, 18, 0.42) 100%);
  z-index: 0;
}

:global(button),
:global(input),
:global(select) {
  font: inherit;
}
</style>
