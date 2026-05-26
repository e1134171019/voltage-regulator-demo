<template>
  <PresentationModuleSlide
    step="08"
    kicker="閉迴路"
    title="把參考、比較、功率與回授合成一個閉迴路"
    summary="這裡不再單看個別元件，而是看整個系統如何在輸出下陷時完成偵測、修正與回穩。"
  >
    <Scene08NegativeFeedback />
  </PresentationModuleSlide>
</template>

<script setup>
import PresentationModuleSlide from '../PresentationModuleSlide.vue'
import Scene08NegativeFeedback from '../../scenes/Scene08NegativeFeedback.vue'
</script>
