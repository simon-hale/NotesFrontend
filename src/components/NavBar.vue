<template>
  <header v-if="show_navbar" class="navbar-shell">
    <div class="container">
      <div class="navbar-frame">
        <router-link class="navbar-brand" :to="{ name: 'filedisk' }">
          <span class="navbar-brand__badge">N</span>
          <span class="navbar-brand__title">{{ t('nav.title') }}</span>
        </router-link>

        <nav class="navbar-links" aria-label="Primary">
          <router-link
            v-for="item in nav_items"
            :key="item.name"
            :to="{ name: item.name }"
            :class="route_name === item.name ? 'nav-pill nav-pill--active' : 'nav-pill'"
          >
            {{ t(item.labelKey) }}
          </router-link>
        </nav>

        <div class="navbar-account-group">
          <button
            type="button"
            class="navbar-theme-toggle"
            :aria-label="theme_toggle_title"
            :title="theme_toggle_title"
            @click="toggle_theme"
          >
            <span class="navbar-theme-toggle__icon" aria-hidden="true">
              <svg
                v-if="is_dark_theme"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 1a5 5 0 1 1 0-10 5 5 0 0 1 0 10M8 0a.5.5 0 0 1 .5.5V2a.5.5 0 0 1-1 0V.5A.5.5 0 0 1 8 0m0 14a.5.5 0 0 1 .5.5V16a.5.5 0 0 1-1 0v-1.5A.5.5 0 0 1 8 14m8-6a.5.5 0 0 1-.5.5H14a.5.5 0 0 1 0-1h1.5A.5.5 0 0 1 16 8M2 8a.5.5 0 0 1-.5.5H0a.5.5 0 0 1 0-1h1.5A.5.5 0 0 1 2 8m11.314 5.314a.5.5 0 0 1-.707 0l-1.06-1.06a.5.5 0 0 1 .706-.708l1.061 1.06a.5.5 0 0 1 0 .708m-9.9-9.9a.5.5 0 0 1-.707 0L1.646 2.354a.5.5 0 1 1 .708-.708l1.06 1.061a.5.5 0 0 1 0 .707m9.9-1.06a.5.5 0 0 1 0 .706l-1.06 1.061a.5.5 0 1 1-.708-.707l1.06-1.06a.5.5 0 0 1 .708 0m-9.9 9.9a.5.5 0 0 1 0 .706l-1.06 1.061a.5.5 0 0 1-.708-.707l1.061-1.06a.5.5 0 0 1 .707 0"/>
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M6 0a.5.5 0 0 1 .492.41A7 7 0 1 0 15.59 9.508a.5.5 0 0 1 .9.302A8 8 0 1 1 6.19.01.5.5 0 0 1 6 0"/>
              </svg>
            </span>
            <span class="navbar-theme-toggle__text">{{ next_theme_label }}</span>
          </button>

          <router-link
            :to="{ name: 'accountmanagement' }"
            :class="route_name === 'accountmanagement' ? 'navbar-account navbar-account--active' : 'navbar-account'"
            :aria-label="t('nav.account')"
            :title="account_title"
          >
            <span class="navbar-account__avatar">
              {{ account_initial }}
              <span :class="is_logined ? 'navbar-account__presence navbar-account__presence--online' : 'navbar-account__presence'"></span>
            </span>
            <span class="navbar-account__name">{{ display_name }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { DARK_THEME } from '@/utils/theme';

export default {
  name: 'NavBar',
  setup() {
    const route = useRoute();
    const store = useStore();
    const { t } = useI18n();

    const nav_items = [
      { name: 'filedisk', labelKey: 'nav.disk' },
      { name: 'readingpage', labelKey: 'nav.read' },
    ];

    const show_navbar = computed(() => store.state.navbar.show_navbar);
    const route_name = computed(() => route.name);
    const is_logined = computed(() => store.state.user.is_logined);
    const is_dark_theme = computed(() => store.state.theme.mode === DARK_THEME);
    const display_name = computed(() => {
      return store.state.user.username || t('nav.guest');
    });
    const account_initial = computed(() => {
      return display_name.value.slice(0, 1).toUpperCase();
    });
    const account_title = computed(() => {
      const status = is_logined.value ? t('nav.online') : t('nav.offline');
      return `${t('nav.account')} - ${status}`;
    });
    const next_theme_label = computed(() => {
      return is_dark_theme.value ? t('common.light') : t('common.dark');
    });
    const theme_toggle_title = computed(() => {
      return is_dark_theme.value ? t('theme.switchToLight') : t('theme.switchToDark');
    });

    const toggle_theme = () => {
      store.commit('toggleTheme');
    };

    return {
      t,
      nav_items,
      show_navbar,
      route_name,
      is_logined,
      is_dark_theme,
      display_name,
      account_initial,
      account_title,
      next_theme_label,
      theme_toggle_title,
      toggle_theme,
    };
  },
}
</script>

<style scoped>
.navbar-shell {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding-top: 6px;
  color: var(--text-primary);
}

.navbar-shell::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 100%;
  background: linear-gradient(180deg, var(--accent-soft), transparent);
  opacity: 0.48;
  pointer-events: none;
}

.navbar-frame {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--accent-soft) 78%, transparent), transparent 38%),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--surface-card) 78%, transparent),
      color-mix(in srgb, var(--surface-overlay) 58%, transparent)
    );
  backdrop-filter: blur(18px) saturate(165%);
  -webkit-backdrop-filter: blur(18px) saturate(165%);
  box-shadow: var(--shadow-medium);
}

.navbar-frame::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.navbar-brand,
.navbar-account,
.nav-pill,
.navbar-theme-toggle {
  text-decoration: none;
}

.navbar-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  min-width: 0;
  justify-self: start;
}

.navbar-brand__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: linear-gradient(145deg, var(--brand-start), var(--accent-strong));
  color: var(--accent-contrast);
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow: 0 6px 16px var(--accent-soft);
  flex-shrink: 0;
}

.navbar-brand__title {
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1;
}

.navbar-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: max-content;
  max-width: 100%;
  justify-self: center;
}

.nav-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 82px;
  padding: 6px 12px;
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-card-muted) 76%, transparent);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.15;
  backdrop-filter: blur(12px) saturate(155%);
  -webkit-backdrop-filter: blur(12px) saturate(155%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  outline: none;
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.nav-pill:hover {
  border-color: var(--border-accent);
  background: var(--surface-soft-hover);
  color: var(--text-primary);
  box-shadow: var(--shadow-accent);
}

.nav-pill--active,
.nav-pill:focus {
  border-color: var(--border-accent);
  background: var(--surface-accent-strong);
  color: var(--accent-strong);
  box-shadow: var(--shadow-accent);
}

.nav-pill:focus-visible {
  border-color: var(--border-accent);
  background: var(--surface-accent-strong);
  color: var(--accent-strong);
  box-shadow:
    0 0 0 3px var(--accent-soft),
    var(--shadow-accent);
}

.nav-pill--active:focus-visible {
  border-color: var(--border-accent);
  background: var(--surface-accent-strong);
  color: var(--accent-strong);
  box-shadow: var(--shadow-accent);
}

.navbar-account-group {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  gap: 8px;
  min-width: 0;
}

.navbar-theme-toggle,
.navbar-account {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-card-muted) 72%, transparent);
  color: inherit;
  backdrop-filter: blur(12px) saturate(155%);
  -webkit-backdrop-filter: blur(12px) saturate(155%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.navbar-theme-toggle:hover,
.navbar-account:hover {
  border-color: var(--border-accent);
  background: var(--surface-soft-hover);
  box-shadow: var(--shadow-accent);
  transform: translateY(-1px);
}

.navbar-theme-toggle:focus-visible,
.navbar-account:focus-visible {
  outline: none;
  border-color: var(--border-accent);
  background: var(--surface-accent-strong);
  box-shadow:
    0 0 0 3px var(--accent-soft),
    var(--shadow-accent);
}

.navbar-theme-toggle {
  gap: 8px;
  padding: 4px 10px 4px 4px;
}

.navbar-theme-toggle__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-soft) 76%, transparent);
  color: var(--accent-strong);
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px var(--border-soft);
}

.navbar-theme-toggle__text {
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.navbar-account {
  gap: 8px;
  min-width: 0;
  max-width: 180px;
  padding: 4px 6px 4px 4px;
}

.navbar-account--active {
  border-color: var(--border-accent);
  background: var(--surface-accent-strong);
  box-shadow: var(--shadow-accent);
}

.navbar-account__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-soft) 76%, transparent);
  color: var(--text-primary);
  font-size: 0.76rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px var(--border-soft);
}

.navbar-account__presence {
  position: absolute;
  right: 1px;
  bottom: 1px;
  width: 7px;
  height: 7px;
  border: 1.5px solid var(--surface-card-strong);
  border-radius: 999px;
  background: var(--text-faint);
}

.navbar-account__presence--online {
  background: var(--success);
  box-shadow: 0 0 10px rgba(65, 217, 126, 0.35);
}

.navbar-account__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 700;
}

@media (max-width: 767px) {
  .navbar-shell {
    padding-top: 4px;
  }

  .navbar-frame {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 14px;
  }

  .navbar-brand__title {
    display: none;
  }

  .navbar-brand {
    gap: 6px;
    min-width: 0;
    max-width: 128px;
  }

  .navbar-links {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 2px 0;
  }

  .navbar-links::-webkit-scrollbar {
    display: none;
  }

  .nav-pill {
    min-width: max-content;
    min-height: 44px;
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 0.78rem;
    scroll-snap-align: start;
  }

  .navbar-account-group {
    justify-self: end;
    gap: 6px;
  }

  .navbar-theme-toggle,
  .navbar-account {
    min-width: 44px;
    min-height: 44px;
    width: 44px;
    height: 44px;
    justify-content: center;
    padding: 0;
    border-radius: 999px;
  }

  .navbar-theme-toggle__text {
    display: none;
  }

  .navbar-theme-toggle {
    gap: 0;
  }

  .navbar-account {
    gap: 0;
    max-width: none;
  }

  .navbar-account__name {
    display: none;
  }
}

@media (max-width: 480px) {
  .navbar-frame {
    gap: 7px;
    padding: 7px 8px;
  }

  .navbar-brand__badge {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    font-size: 0.8rem;
  }

  .nav-pill {
    min-height: 42px;
    padding: 8px 10px;
    font-size: 0.74rem;
  }

  .navbar-account__avatar {
    width: 26px;
    height: 26px;
    font-size: 0.72rem;
  }

  .navbar-theme-toggle__icon {
    width: 26px;
    height: 26px;
  }

  .navbar-theme-toggle,
  .navbar-account {
    min-width: 42px;
    min-height: 42px;
    width: 42px;
    height: 42px;
  }

  .navbar-brand {
    max-width: 114px;
  }
}
</style>
