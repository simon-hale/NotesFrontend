<template>
  <NavBar></NavBar>
  <router-view v-slot="{ Component }">
    <keep-alive include="ReadingPage">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script>
import NavBar from './components/NavBar.vue';
export default {
  name: "App",
  components: {
    NavBar,
  }
}
</script>

<style scoped>

</style>