<template>
  <PresentationModuleSlide
    step="04"
    kicker="參考電壓"
    title="ZD 6.2V 先把穩定基準立起來"
    summary="沒有穩定的參考點，後面的比較器與回授都無從談起。這一頁負責把 Vref 的來源說清楚。"
  >
    <Scene05ZenerDiode />
  </PresentationModuleSlide>
</template>

<script setup>
import PresentationModuleSlide from '../PresentationModuleSlide.vue'
import Scene05ZenerDiode from '../../scenes/Scene05ZenerDiode.vue'
</script>
