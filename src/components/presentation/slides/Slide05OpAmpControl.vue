<template>
  <PresentationModuleSlide
    step="05"
    kicker="比較控制"
    title="μA741 負責放大誤差，決定控制方向"
    summary="當 Vfb 與 Vref 出現落差，741 不是直接扛負載，而是把誤差轉成可用的控制訊號。"
  >
    <Scene06OpAmp />
  </PresentationModuleSlide>
</template>

<script setup>
import PresentationModuleSlide from '../PresentationModuleSlide.vue'
import Scene06OpAmp from '../../scenes/Scene06OpAmp.vue'
</script>
