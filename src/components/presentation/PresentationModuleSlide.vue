<template>
  <section class="slide-shell">
    <header class="slide-intro">
      <p class="slide-step">SLIDE {{ step }} · {{ kicker }}</p>
      <h2>{{ title }}</h2>
      <p class="slide-summary">{{ summary }}</p>
    </header>

    <div class="slide-module">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  step: {
    type: String,
    required: true,
  },
  kicker: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.slide-shell {
  display: grid;
  gap: 20px;
}

.slide-intro {
  position: relative;
  padding: 22px 24px;
  border-radius: 24px;
  border: 1px solid rgba(0, 240, 255, 0.16);
  background:
    linear-gradient(135deg, rgba(0, 240, 255, 0.05), transparent 42%),
    linear-gradient(160deg, rgba(4, 11, 28, 0.92), rgba(9, 19, 48, 0.84));
  box-shadow: 0 24px 55px rgba(1, 8, 22, 0.36);
  overflow: hidden;
}

.slide-intro::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0, 240, 255, 0.08), transparent 18%, transparent 82%, rgba(255, 79, 163, 0.08)),
    linear-gradient(rgba(0, 240, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.025) 1px, transparent 1px);
  background-size: auto, 20px 20px, 20px 20px;
  pointer-events: none;
}

.slide-intro::after {
  content: '';
  position: absolute;
  top: 14px;
  right: 18px;
  width: 120px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.92), rgba(255, 79, 163, 0.72));
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.32);
}

.slide-step {
  position: relative;
  z-index: 1;
  margin: 0 0 8px;
  color: #6ee7ff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
}

h2 {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #e7fbff;
  font-size: clamp(1.55rem, 2.4vw, 2.2rem);
  line-height: 1.1;
  text-shadow: 0 0 18px rgba(0, 240, 255, 0.14);
}

.slide-summary {
  position: relative;
  z-index: 1;
  margin: 12px 0 0;
  color: #96bad0;
  line-height: 1.7;
}

.slide-module {
  display: grid;
  gap: 16px;
}

.slide-module :deep(.scene-step) {
  display: none;
}
</style>
