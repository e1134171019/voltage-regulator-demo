<template>
  <VoltageRegulatorPresentation />
</template>

<script setup>
import VoltageRegulatorPresentation from './views/VoltageRegulatorPresentation.vue'
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(html) {
  color-scheme: light;
}

:global(body) {
  margin: 0;
  min-height: 100vh;
  font-family: Aptos, 'Segoe UI', 'Noto Sans TC', sans-serif;
  background: radial-gradient(circle at top, #f5fbff 0%, #e4eef8 42%, #d7e3ef 100%);
  color: #10233a;
}

:global(button),
:global(input),
:global(select) {
  font: inherit;
}
</style>
