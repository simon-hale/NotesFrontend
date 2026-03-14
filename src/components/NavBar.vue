<template>
  <div class="card text-center" v-if="show_navbar">
    <div class="card-header">
      <ul class="nav nav-tabs card-header-tabs">
        <li class="nav-item">
            <router-link :class="route_name == 'filedisk' ? 'nav-link active' : 'nav-link'" :to="{name: 'filedisk'}">{{ t('nav.disk') }}</router-link>
        </li>
        <li class="nav-item">
            <router-link :class="route_name == 'readingpage' ? 'nav-link active' : 'nav-link'" :to="{name: 'readingpage'}">{{ t('nav.read') }}</router-link>
        </li>
        <li class="nav-item">
            <router-link :class="route_name == 'accountmanagement' ? 'nav-link active' : 'nav-link'" :to="{name: 'accountmanagement'}">{{ t('nav.account') }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

export default {
    name: "NavBar",
    setup() {
      const route = useRoute();
      const store = useStore();
      const { t } = useI18n();
      
      let show_navbar = computed(() => store.state.navbar.show_navbar);

      let route_name = computed(() => route.name)
      return  {
        t,
        route_name,
        show_navbar,
      }
    }
}
</script>
