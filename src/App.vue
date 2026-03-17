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
import { ref, computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import NavBar from './components/NavBar.vue';
import { applyThemeToDocument } from './utils/theme';
import ElMessage from '@/utils/message';
import { useI18n } from 'vue-i18n';
import router from '@/router/index';
import { BASE_URL } from "@/config";
import $ from 'jquery';

export default {
  name: "App",
  components: {
    NavBar,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const { t } = useI18n();
    const theme_mode = computed(() => store.state.theme.mode);
    const show_navbar = computed(() => store.state.navbar.show_navbar);

    const username = ref('');
    const access = ref('');

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

    const auto_login = () => {
          $.ajax({
              url: `${BASE_URL}/api/user/auto-login/`,
              type: "POST",
              headers: {
                  Authorization:"Bearer " + access.value,
              },
              success(resp) {
                if(resp.error_message === "success"){
                    let is_logined = true;
                    store.dispatch("login", { username: username.value, access:access.value, is_logined });
                    store.commit("setFirstLogin");
                    store.commit("setAutoLogin");
                    router.push({name: "filedisk"});
                }else{
                    ElMessage.error(t('auth.unknownSuccessError'));
                }
              },
              error(resp) {
                  if(resp.status === 403) {
                    ElMessage.error(t('auth.incorrectCredentials'));
                  }else if(resp.status === 0){
                    ElMessage.error(t('auth.networkError'));
                  }else{
                    ElMessage.error(t('auth.unknownError'));
                  }
                  localStorage.setItem('notes-username', '');
                  localStorage.setItem('notes-access', '');
              }
          })
      }

    onMounted(() => {
      scheduleMessageViewportMetrics();
      window.addEventListener('resize', handleViewportChange);
      const storedUsername = localStorage.getItem('notes-username');
      const storedAccess = localStorage.getItem('notes-access');
      username.value = storedUsername || '';
      access.value = storedAccess || '';
      if (storedUsername && storedAccess) auto_login();
      else {
        localStorage.setItem('notes-username', '');
        localStorage.setItem('notes-access', '');
      }
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
