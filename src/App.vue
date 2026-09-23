<template>
  <div :class="['app-shell', { 'app-shell--reading': is_reading_route }]">
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
import ElMessage from '@/utils/message';
import { useI18n } from 'vue-i18n';
import { BASE_URL } from "@/config";
import $ from 'jquery';
import { COMMON_HTTP_ERROR_KEY_MAP, getHttpErrorMessage } from '@/utils/http';

export default {
  name: "App",
  components: {
    NavBar,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const { t } = useI18n();
    const theme_state = computed(() => store.state.theme);
    const show_navbar = computed(() => store.state.navbar.show_navbar);
    const is_reading_route = computed(() => route.name === 'readingpage');

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

    watch(() => [theme_state.value.palette, theme_state.value.mode], ([palette, mode]) => {
      applyThemeToDocument({ palette, mode });
    }, { immediate: true });

    watch(show_navbar, () => {
      scheduleMessageViewportMetrics();
    });

    watch(() => store.state.welcomeBackPending, (welcomeBackPending) => {
      if (!welcomeBackPending) return;

      ElMessage.success(t('fileDisk.welcomeBack'));
      store.commit("cleanWelcomeBackPending");
    });

    watch(() => route.fullPath, () => {
      scheduleMessageViewportMetrics();
    });

    // The HttpOnly authentication cookie cannot be inspected by JavaScript,
    // so startup always asks the backend whether the browser is logged in.
    const auto_login = () => {
        $.ajax({
          url: `${BASE_URL}/api/user/auto-login/`,
          type: "POST",
          success(resp) {
            if(resp.error_message === "success"){
                let is_logined = true;
                store.dispatch("login", { username: resp.username, is_logined });
                store.commit("setFirstLogin");
                store.commit("setAutoLogin");
                store.commit("setWelcomeBackPending");
            }else{
                ElMessage.error(t('auth.unknownSuccessError'));
            }
          },
          error(resp) {
            // 401/403 simply means there is no valid login cookie yet.
            if (resp.status === 401 || resp.status === 403) {
              store.dispatch("cleaninfo");
              return;
            }

            ElMessage.error(getHttpErrorMessage(t, resp.status, COMMON_HTTP_ERROR_KEY_MAP));
            store.dispatch("cleaninfo");
          }
        })
      }

    onMounted(() => {
      scheduleMessageViewportMetrics();
      window.addEventListener('resize', handleViewportChange);
      auto_login();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleViewportChange);
    });

    return {
      is_reading_route,
    };
  },
}
</script>

<style>
.app-shell {
  display: flow-root;
  min-height: 100vh;
  padding-bottom: 18px;
}

.app-shell--reading {
  padding-bottom: 0;
}
</style>
