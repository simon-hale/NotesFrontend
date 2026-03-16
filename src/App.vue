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
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
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
    const route = useRoute();
    const theme_mode = computed(() => store.state.theme.mode);
    const show_navbar = computed(() => store.state.navbar.show_navbar);

    const updateMessageViewportMetrics = () => {
      if (typeof window === 'undefined') return;

      const root = document.documentElement;
      const navbarFrame = document.querySelector('.navbar-frame');
      const contentAnchor = document.querySelector('.container.content-field, .container.auth-page');
      const anchor = navbarFrame || contentAnchor;
      const anchorRect = anchor?.getBoundingClientRect();
      const rightOffset = anchorRect ? Math.max(12, Math.round(window.innerWidth - anchorRect.right)) : 16;
      const topOffset = navbarFrame ? Math.max(16, Math.round(navbarFrame.getBoundingClientRect().bottom + 12)) : 16;

      root.style.setProperty('--app-message-right', `${rightOffset}px`);
      root.style.setProperty('--app-message-offset', `${topOffset}px`);
    };

    const scheduleMessageViewportMetrics = () => {
      if (typeof window === 'undefined') return;

      nextTick(() => {
        window.requestAnimationFrame(() => {
          updateMessageViewportMetrics();
        });
      });
    };

    const handleViewportChange = () => {
      updateMessageViewportMetrics();
    };

    watch(theme_mode, (mode) => {
      applyThemeToDocument(mode);
    }, { immediate: true });

    watch(show_navbar, () => {
      scheduleMessageViewportMetrics();
    });

    watch(() => route.fullPath, () => {
      scheduleMessageViewportMetrics();
    });

    onMounted(() => {
      scheduleMessageViewportMetrics();
      window.addEventListener('resize', handleViewportChange);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleViewportChange);
    });

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
