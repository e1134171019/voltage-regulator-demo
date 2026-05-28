<template>
  <section class="opening-slide">
    <div class="title-block">
      <h2>日常生活應用</h2>
    </div>

    <figure class="image-stage">
      <img :src="openingVisual" alt="NOVA 與手機錄影負載示意圖" />
    </figure>
  </section>
</template>

<script setup>
import openingVisual from '../../../../46faf0f1-dc28-4f71-a8ec-72fb0e94d456.png'
</script>

<style scoped>
.opening-slide {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
  padding: 34px 36px 22px;
  overflow: hidden;
}

.title-block {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-height: 54px;
}

h2 {
  margin: 0;
  color: #10233f;
  font-size: clamp(2.1rem, 3.4vw, 3.25rem);
  line-height: 1.05;
  text-align: left;
  text-shadow: 0 2px 16px rgba(255, 255, 255, 0.42);
}

.image-stage {
  margin: 0;
  min-height: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

img {
  display: block;
  width: min(100%, calc((100vh - 190px) * 1.78));
  height: min(100%, calc((100vw - 120px) / 1.78));
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0;
  box-shadow: none;
}

@media (max-width: 800px) {
  .opening-slide {
    padding: 24px 20px 18px;
    gap: 14px;
  }

  .title-block {
    min-height: 46px;
  }

  h2 {
    font-size: clamp(1.7rem, 7vw, 2.6rem);
  }

  img {
    width: 100%;
    height: auto;
  }
}
</style>
