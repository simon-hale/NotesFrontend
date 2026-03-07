<template>
  <div class="card text-center" v-if="show_navbar">
    <div class="card-header">
      <ul class="nav nav-tabs card-header-tabs">
        <li class="nav-item">
            <router-link :class="route_name == 'filedisk' ? 'nav-link active' : 'nav-link'" :to="{name: 'filedisk'}">Disk</router-link>
        </li>
        <li class="nav-item">
            <router-link :class="route_name == 'readingpage' ? 'nav-link active' : 'nav-link'" :to="{name: 'readingpage'}">Read</router-link>
        </li>
        <li class="nav-item">
            <router-link :class="route_name == 'accountmanagement' ? 'nav-link active' : 'nav-link'" :to="{name: 'accountmanagement'}">Account</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router';
import router from '@/router/index';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
    name: "NavBar",
    setup() {
      const route = useRoute();
      const store = useStore();
      
      let username = computed(() => store.state.user.username);
      let is_logined = computed(() => store.state.user.is_logined);
      let show_navbar = computed(() => store.state.navbar.show_navbar);

      const logout = () => {
        store.dispatch("cleaninfo")
        router.push({name: "home"});
      }

      let route_name = computed(() => route.name)
      return  {
        route_name,
        is_logined,
        username,
        show_navbar,
        logout,
      }
    }
}
</script>

<style scoped>
.dropdown-toggle {
    color: black;
}
</style>