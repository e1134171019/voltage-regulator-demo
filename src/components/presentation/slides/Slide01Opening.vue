<template>
  <section class="opening-slide">
    <div class="title-block">
      <h2>日常生活應用</h2>
    </div>

    <figure class="image-frame">
      <img :src="openingVisual" alt="NOVA 與手機錄影負載示意圖" />
    </figure>
  </section>
</template>

<script setup>
import openingVisual from '../../../../46faf0f1-dc28-4f71-a8ec-72fb0e94d456.png'
</script>

<style scoped>
.opening-slide {
  min-height: 520px;
  display: grid;
  grid-template-rows: auto 1fr;
  align-items: start;
  gap: 20px;
  padding: 12px 8px;
}

.title-block {
  display: flex;
  justify-content: flex-start;
}

h2 {
  margin: 0;
  color: #10233a;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.05;
  text-align: left;
}

.image-frame {
  margin: 0;
  min-height: 0;
  padding: 14px;
  border-radius: 28px;
  background: rgba(7, 16, 36, 0.72);
  border: 1px solid rgba(0, 240, 255, 0.18);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

img {
  width: 100%;
  max-height: 560px;
  object-fit: contain;
  display: block;
  border-radius: 18px;
}
</style>
