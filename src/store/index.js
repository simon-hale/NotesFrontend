import { createStore } from 'vuex'
import {
  DARK_THEME,
  LIGHT_THEME,
  getStoredTheme,
  normalizeThemeMode,
  normalizeThemePalette,
  persistTheme,
} from '@/utils/theme'

const syncThemeState = (state, nextTheme) => {
  state.theme = nextTheme
  persistTheme(nextTheme)
}

export default createStore({
  state: {
    user: {
      username: "",
      access: "",
      is_logined: false,
    },
    firstLogin: false,
    autoLogin: false,
    welcomeBackPending: false,
    file: {
      path_level: -1,
      paths: [],
    },
    reading: {
      file_id: -1,
      file_name: "",
    },
    navbar: {
      show_navbar: true,
    },
    theme: getStoredTheme(),
  },
  getters: {
  },
  mutations: {
    setUsername(state, username) {
      state.user.username = username;
    },
    setAccess(state, access) {
      state.user.access = access;
    },
    setLogined(state, is_logined) {
      state.user.is_logined = is_logined;
    },
    cleanUsername(state) { 
      state.user.username = "";
    },
    cleanAccess(state) {
      state.user.access = "";
    },
    cleanLogined(state) {
      state.user.is_logined = false;
    },
    setFirstLogin(state) {
      state.firstLogin = true;
    },
    cleanFirstLogin(state) {
      state.firstLogin = false;
    },
    setAutoLogin(state) {
      state.autoLogin = true;
    },
    cleanAutoLogin(state) {
      state.autoLogin = false;
    },
    setWelcomeBackPending(state) {
      state.welcomeBackPending = true;
    },
    cleanWelcomeBackPending(state) {
      state.welcomeBackPending = false;
    },
    refreshPathLevel(state, path_level) {
      state.file.path_level = path_level;
    },
    refreshPaths(state, paths) {
      state.file.paths = paths;
    },
    setReadingFileId(state, id) {
      state.reading.file_id = id;
    },
    setReadingFileName(state, file_name) {
      state.reading.file_name = file_name;
    },
    showNavbar(state) {
      state.navbar.show_navbar = true;
    },
    unshowNavbar(state) {
      state.navbar.show_navbar = false;
    },
    setThemeMode(state, mode) {
      syncThemeState(state, {
        ...state.theme,
        mode: normalizeThemeMode(mode),
      });
    },
    setThemePalette(state, palette) {
      syncThemeState(state, {
        ...state.theme,
        palette: normalizeThemePalette(palette),
      });
    },
    toggleTheme(state) {
      syncThemeState(state, {
        ...state.theme,
        mode: state.theme.mode === DARK_THEME ? LIGHT_THEME : DARK_THEME,
      });
    }
  },
  actions: {
    login(context, data) {
      context.commit('setUsername', data.username);
      context.commit('setAccess', data.access);
      context.commit('setLogined', data.is_logined);
    },
    cleaninfo(context) {
      context.commit('cleanUsername');
      context.commit('cleanAccess');
      context.commit('cleanLogined');
    },
    cleanFirstLogin(context) {
      context.commit('cleanFirstLogin');
    },
    refreshPathsInfo(context, data) {
      context.commit('refreshPathLevel', data.path_level);
      context.commit('refreshPaths', data.paths);
    },
    cleanPathsInfo(context) {
      context.commit('refreshPathLevel', -1);
      context.commit('refreshPaths', []);
    },
    cleanReadingInfo(context) {
      context.commit('setReadingFileId', -1);
      context.commit('setReadingFileName', "");
    },
  },
  modules: {
  }
})
