<template>
  <div class="home">
    <p v-for="item in route" :key="item.path" class="home-item" @click="handleClick(item)">{{ item.title }}</p>
  </div>
</template>
<script setup lang="js">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { routes } from '@/routers';

const route = ref(routes);
const router = useRouter();

const handleClick = (item) => {
  router.push(item.path);
};
</script>
<style lang="scss" scoped>
.home {
  display: flex;
  gap: 10px;
  &-item {
    cursor: pointer;
    color: blue;
  }
}
</style>
