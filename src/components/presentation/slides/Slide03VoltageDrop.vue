<template>
  <PresentationModuleSlide
    step="03"
    kicker="負載變重"
    title="負載一加重，導線與接點的壓降就會立刻浮現"
    summary="這一頁把現象從動態抽載收斂成電壓路徑，明確指出壓降不是抽象概念，而是沿路損失的累積。"
  >
    <Scene03VoltageDrop />
  </PresentationModuleSlide>
</template>

<script setup>
import PresentationModuleSlide from '../PresentationModuleSlide.vue'
import Scene03VoltageDrop from '../../Scene02VoltageDrop.vue'
</script>
