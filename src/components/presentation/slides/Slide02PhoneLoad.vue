<template>
  <PresentationModuleSlide
    step="02"
    kicker="手機錄影場景"
    title="從手機錄影的動態負載開始觀察輸出變化"
    summary="先讓觀眾看見真實負載不是固定值，後面所有穩壓器設計，都是為了回應這種瞬時抽載。"
  >
    <Scene02PhoneLoad />
  </PresentationModuleSlide>
</template>

<script setup>
import PresentationModuleSlide from '../PresentationModuleSlide.vue'
import Scene02PhoneLoad from '../../scenes/Scene02PhoneLoad.vue'
</script>
