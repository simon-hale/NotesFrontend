<template>
  <div class="app-shell">
    <NavBar></NavBar>
    <router-view v-slot="{ Component }">
      <keep-alive include="ReadingPage">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script>
import { computed, watch } from 'vue';
import { useStore } from 'vuex';
import NavBar from './components/NavBar.vue';
import { applyThemeToDocument } from './utils/theme';

export default {
  name: "App",
  components: {
    NavBar,
  },
  setup() {
    const store = useStore();
    const theme_mode = computed(() => store.state.theme.mode);

    watch(theme_mode, (mode) => {
      applyThemeToDocument(mode);
    }, { immediate: true });

    return {};
  },
}
</script>

<style>
.app-shell {
  min-height: 100vh;
  padding-bottom: 18px;
}
</style>
