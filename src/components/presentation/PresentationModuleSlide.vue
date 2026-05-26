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
  padding: 22px 24px;
  border-radius: 24px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(236, 253, 245, 0.72));
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.06);
}

.slide-step {
  margin: 0 0 8px;
  color: #0f766e;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #10233a;
  font-size: clamp(1.55rem, 2.4vw, 2.2rem);
  line-height: 1.1;
}

.slide-summary {
  margin: 12px 0 0;
  color: #475569;
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
