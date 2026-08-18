<template>
    <ContentField v-if="is_logined">
        <div class="account-layout">
            <div class="container account-mobile-nav-container">
                <div
                    class="account-mobile-nav"
                    @focusout="close_mobile_nav_on_focusout"
                >
                    <button
                        ref="mobile_nav_trigger"
                        type="button"
                        :class="[
                            'account-mobile-nav__trigger',
                            mobile_nav_open ? 'account-mobile-nav__trigger--open' : '',
                        ]"
                        :aria-expanded="mobile_nav_open"
                        aria-haspopup="menu"
                        aria-controls="account-mobile-nav-menu"
                        @click="toggle_mobile_nav"
                        @keydown="handle_mobile_nav_trigger_keydown"
                    >
                        <span
                            class="account-mobile-nav__rail"
                            aria-hidden="true"
                        ></span>

                        <span class="account-mobile-nav__current">
                            {{ current_mobile_tab_label }}
                        </span>

                        <span
                            class="account-mobile-nav__chevron"
                            aria-hidden="true"
                        ></span>
                    </button>

                    <transition name="account-mobile-menu">
                        <div
                            v-if="mobile_nav_open"
                            ref="mobile_nav_menu"
                            id="account-mobile-nav-menu"
                            class="account-mobile-nav__menu"
                            role="menu"
                            @keydown="handle_mobile_nav_keydown"
                        >
                            <button
                                v-for="tab in tabs"
                                :key="tab.key"
                                type="button"
                                role="menuitem"
                                tabindex="-1"
                                :aria-current="active_tab === tab.key ? 'page' : undefined"
                                :class="[
                                    'account-mobile-nav__option',
                                    active_tab === tab.key
                                        ? 'account-mobile-nav__option--active'
                                        : '',
                                ]"
                                @click="select_mobile_tab(tab.key)"
                            >
                                <span class="account-mobile-nav__option-label">
                                    {{ t(tab.labelKey) }}
                                </span>

                                <span
                                    v-if="active_tab === tab.key"
                                    class="account-mobile-nav__check"
                                    aria-hidden="true"
                                ></span>
                            </button>
                        </div>
                    </transition>
                </div>
            </div>
            <aside class="account-sidebar">
                <button
                    v-for="tab in tabs"
                    :key="tab.key"
                    type="button"
                    :class="active_tab === tab.key ? 'account-tab account-tab--active' : 'account-tab'"
                    @click="active_tab = tab.key"
                >
                    <span class="account-tab__rail"></span>
                    <span class="account-tab__label">{{ t(tab.labelKey) }}</span>
                </button>
            </aside>

            <section class="account-content">
                <ContentField v-if="active_tab === 'language'">
                    <div class="settings-panel">
                        <div class="settings-title">{{ t('account.languagePanelTitle') }}</div>
                        <div class="settings-description">{{ t('account.languagePanelDescription') }}</div>
                        <div class="settings-current">
                            {{ t('account.currentLanguage') }}: <strong>{{ current_locale_label }}</strong>
                        </div>
                        <div class="settings-actions">
                            <button
                                v-for="option in language_options"
                                :key="option.value"
                                type="button"
                                :class="[
                                    'btn',
                                    'setting-chip',
                                    locale === option.value ? 'setting-chip--active' : 'setting-chip--inactive',
                                ]"
                                :aria-pressed="locale === option.value"
                                @click="change_locale(option.value)"
                            >
                                {{ t(option.labelKey) }}
                            </button>
                        </div>
                    </div>
                </ContentField>

                <ContentField v-else-if="active_tab === 'theme'">
                    <div class="settings-panel">
                        <div class="settings-title">{{ t('theme.settingsTitle') }}</div>
                        <div class="settings-description">{{ t('theme.settingsDescription') }}</div>
                        <div class="settings-current">
                            {{ t('theme.currentTheme') }}: <strong>{{ current_theme_label }}</strong>
                        </div>

                        <div class="theme-control-block">
                            <div class="theme-control-label">{{ t('theme.mode') }}</div>
                            <div class="theme-mode-options">
                                <button
                                    v-for="option in theme_mode_options"
                                    :key="option.value"
                                    type="button"
                                    :class="[
                                        'btn',
                                        'setting-chip',
                                        theme_mode === option.value ? 'setting-chip--active' : 'setting-chip--inactive',
                                    ]"
                                    :aria-pressed="theme_mode === option.value"
                                    @click="change_theme_mode(option.value)"
                                >
                                    {{ t(option.labelKey) }}
                                </button>
                            </div>
                        </div>

                        <div class="theme-control-block">
                            <div class="theme-control-label">{{ t('theme.palette') }}</div>
                            <div class="theme-palette-grid">
                                <button
                                    v-for="option in standard_theme_palette_options"
                                    :key="option.value"
                                    type="button"
                                    :class="theme_palette === option.value ? 'theme-palette-button theme-palette-button--active' : 'theme-palette-button'"
                                    :aria-pressed="theme_palette === option.value"
                                    @click="change_theme_palette(option.value)"
                                >
                                    <span
                                        :class="[
                                            'theme-palette-button__preview',
                                            `theme-palette-button__preview--${option.value}`,
                                        ]"
                                        aria-hidden="true"
                                    ></span>
                                    <span class="theme-palette-button__label">{{ t(option.labelKey) }}</span>
                                </button>
                            </div>
                        </div>

                        <div class="theme-control-block theme-control-block--subsection">
                            <div class="theme-control-label theme-control-label--subsection">{{ t('theme.eyeCarePalette') }}</div>
                            <div class="theme-palette-grid">
                                <button
                                    v-for="option in eye_care_theme_palette_options"
                                    :key="option.value"
                                    type="button"
                                    :class="theme_palette === option.value ? 'theme-palette-button theme-palette-button--active' : 'theme-palette-button'"
                                    :aria-pressed="theme_palette === option.value"
                                    @click="change_theme_palette(option.value)"
                                >
                                    <span
                                        :class="[
                                            'theme-palette-button__preview',
                                            `theme-palette-button__preview--${option.value}`,
                                        ]"
                                        aria-hidden="true"
                                    ></span>
                                    <span class="theme-palette-button__label">{{ t(option.labelKey) }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </ContentField>

                <ContentField v-else-if="active_tab === 'changePassword'">
                    <ChangePassword v-on:change_password="change_password" v-bind:error_message="error_message"></ChangePassword>
                </ContentField>

                <ContentField v-else-if="active_tab === 'deleteAccount'">
                    <DeleteAccount v-on:delete_account="delete_account" v-bind:error_message="error_message"></DeleteAccount>
                </ContentField>

                <ContentField v-else-if="active_tab === 'logout'">
                    <div class="settings-panel">
                        <div class="settings-title">{{ t('account.logout') }}</div>
                        <div class="settings-description">{{ t('account.logoutPanelDescription') }}</div>
                        <div class="settings-current">
                            {{ t('account.currentAccount') }}: <strong>{{ username }}</strong>
                        </div>
                        <div class="settings-actions">
                            <button
                                type="button"
                                class="btn account-action-button account-action-button--warning account-action-button--full-mobile"
                                v-on:click="logout"
                            >
                                {{ t('account.logoutButton') }}
                            </button>
                        </div>
                    </div>
                </ContentField>
            </section>
        </div>
    </ContentField>

    <div v-else class="auth-entry">
        <LoginView v-if="is_login_page" class="text-center auth-view" />
        <RegisterView v-else class="text-center auth-view" @change_to_login_page="is_login_page = true" />

        <div class="auth-switcher">
            <button
                type="button"
                :class="is_login_page ? 'auth-switcher__button auth-switcher__button--active' : 'auth-switcher__button'"
                :aria-pressed="is_login_page"
                @click="is_login_page = true"
            >
                {{ t('common.login') }}
            </button>
            <button
                type="button"
                :class="!is_login_page ? 'auth-switcher__button auth-switcher__button--active' : 'auth-switcher__button'"
                :aria-pressed="!is_login_page"
                @click="is_login_page = false"
            >
                {{ t('common.register') }}
            </button>
        </div>
    </div>
</template>

<script>
import ContentField from '@/components/ContentField.vue';
import ChangePassword from '@/components/account/ChangePassword.vue';
import DeleteAccount from '@/components/account/DeleteAccount.vue';
import LoginView from './LoginView.vue'
import RegisterView from './RegisterView.vue'
import { computed, nextTick, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import $ from 'jquery';
import router from '@/router';
import { setAppLocale } from '@/i18n';
import { BASE_URL } from "@/config"
import { getCurrentLanguage, getHttpErrorMessage } from '@/utils/http';
import { DARK_THEME, LIGHT_THEME, THEME_PALETTES } from '@/utils/theme';

export default {
    name: 'AccountManagement',
    components: {
        ContentField,
        ChangePassword,
        DeleteAccount,
        LoginView,
        RegisterView,
    },
    setup() {
        const store = useStore();
        const { t, locale } = useI18n();
        let is_logined = computed(() => store.state.user.is_logined);
        let username = computed(() => store.state.user.username);
        let error_message = ref('');
        let active_tab = ref('language');
        let is_login_page = ref(true);
        let mobile_nav_open = ref(false);
        let mobile_nav_trigger = ref(null);
        let mobile_nav_menu = ref(null);

        const tabs = [
            { key: 'language', labelKey: 'account.language' },
            { key: 'theme', labelKey: 'theme.settingsTitle' },
            { key: 'changePassword', labelKey: 'account.changePassword' },
            { key: 'deleteAccount', labelKey: 'account.deleteAccount' },
            { key: 'logout', labelKey: 'account.logout' },
        ];

        const current_mobile_tab_label = computed(() => {
            const currentTab =
                tabs.find((tab) => tab.key === active_tab.value) || tabs[0];

            return t(currentTab.labelKey);
        });

        const get_mobile_nav_options = () => {
            if (!mobile_nav_menu.value) {
                return [];
            }

            return Array.from(
                mobile_nav_menu.value.querySelectorAll('[role="menuitem"]')
            );
        }

        const focus_mobile_nav_option = (index) => {
            const options = get_mobile_nav_options();

            if (options.length === 0) {
                return;
            }

            const normalizedIndex =
                (index + options.length) % options.length;

            options[normalizedIndex].focus();
        }

        const close_mobile_nav = (restoreFocus = false) => {
            mobile_nav_open.value = false;

            if (restoreFocus) {
                nextTick(() => {
                    mobile_nav_trigger.value?.focus();
                });
            }
        }

        const open_mobile_nav_and_focus = async (target = 'current') => {
            mobile_nav_open.value = true;

            await nextTick();

            const options = get_mobile_nav_options();

            if (options.length === 0) {
                return;
            }

            if (target === 'first') {
                focus_mobile_nav_option(0);
                return;
            }

            if (target === 'last') {
                focus_mobile_nav_option(options.length - 1);
                return;
            }

            const currentIndex = Math.max(
                0,
                tabs.findIndex((tab) => tab.key === active_tab.value),
            );

            focus_mobile_nav_option(currentIndex);
        }

        const toggle_mobile_nav = async () => {
            if (mobile_nav_open.value) {
                close_mobile_nav(false);
                return;
            }

            await open_mobile_nav_and_focus('current');
        }

        const handle_mobile_nav_trigger_keydown = (event) => {
            switch (event.key) {
                case 'Enter':
                case ' ':
                    event.preventDefault();

                    if (mobile_nav_open.value) {
                        close_mobile_nav(false);
                    } else {
                        open_mobile_nav_and_focus('current');
                    }
                    break;

                case 'ArrowDown':
                    event.preventDefault();
                    open_mobile_nav_and_focus('first');
                    break;

                case 'ArrowUp':
                    event.preventDefault();
                    open_mobile_nav_and_focus('last');
                    break;

                case 'Escape':
                    if (mobile_nav_open.value) {
                        event.preventDefault();
                        close_mobile_nav(false);
                    }
                    break;

                default:
                    break;
            }
        }

        const handle_mobile_nav_keydown = (event) => {
            const options = get_mobile_nav_options();

            if (options.length === 0) {
                return;
            }

            const focusedIndex =
                options.indexOf(document.activeElement);

            const activeIndex = Math.max(
                0,
                tabs.findIndex((tab) => tab.key === active_tab.value),
            );

            const currentIndex =
                focusedIndex >= 0
                    ? focusedIndex
                    : activeIndex;

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    event.stopPropagation();

                    focus_mobile_nav_option(currentIndex + 1);
                    break;

                case 'ArrowUp':
                    event.preventDefault();
                    event.stopPropagation();

                    focus_mobile_nav_option(currentIndex - 1);
                    break;

                case 'Home':
                    event.preventDefault();
                    event.stopPropagation();

                    focus_mobile_nav_option(0);
                    break;

                case 'End':
                    event.preventDefault();
                    event.stopPropagation();

                    focus_mobile_nav_option(options.length - 1);
                    break;

                case 'Escape':
                    event.preventDefault();
                    event.stopPropagation();

                    close_mobile_nav(true);
                    break;

                case 'Tab':
                    mobile_nav_open.value = false;
                    break;

                default:
                    break;
            }
        }

        const select_mobile_tab = (tabKey) => {
            active_tab.value = tabKey;
            close_mobile_nav(true);
        }

        const close_mobile_nav_on_focusout = (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
                mobile_nav_open.value = false;
            }
        }

        const language_options = [
            { value: 'en-US', labelKey: 'common.locales.enUS' },
            { value: 'zh-CN', labelKey: 'common.locales.zhCN' },
        ];
        const theme_mode_options = [
            { value: LIGHT_THEME, labelKey: 'common.light' },
            { value: DARK_THEME, labelKey: 'common.dark' },
        ];
        const theme_palette_options = THEME_PALETTES;
        const eye_care_theme_values = ['sage', 'almond'];
        const standard_theme_palette_options = theme_palette_options.filter((option) => !eye_care_theme_values.includes(option.value));
        const eye_care_theme_palette_options = theme_palette_options.filter((option) => eye_care_theme_values.includes(option.value));
        const theme_mode = computed(() => store.state.theme.mode);
        const theme_palette = computed(() => store.state.theme.palette);

        const current_locale_label = computed(() => {
            return locale.value === 'zh-CN' ? t('common.locales.zhCN') : t('common.locales.enUS');
        });
        const current_theme_label = computed(() => {
            const activeTheme =
                theme_palette_options.find((option) => option.value === theme_palette.value) || theme_palette_options[0];
            const modeLabel = theme_mode.value === DARK_THEME ? t('common.dark') : t('common.light');

            return `${t(activeTheme.labelKey)} / ${modeLabel}`;
        });

        const change_locale = (nextLocale) => {
            setAppLocale(nextLocale);
        }
        const change_theme_mode = (nextMode) => {
            store.commit('setThemeMode', nextMode);
        }
        const change_theme_palette = (nextPalette) => {
            store.commit('setThemePalette', nextPalette);
        }

        const clearUserState = () => {
            store.dispatch("cleaninfo");
            store.dispatch("cleanFirstLogin");
            store.dispatch("cleanPathsInfo");
            store.dispatch("cleanReadingInfo");
        }

        const logout = () => {
            clearUserState();
            localStorage.setItem('notes-username', '');
            localStorage.setItem('notes-access', '');
            router.push({name: "accountmanagement"});
        }

        const change_password = (data) => {
            $.ajax({
                url: `${BASE_URL}/api/user/update/password/`,
                type: "POST",
                headers: {
                    Authorization:"Bearer " + store.state.user.access,
                },
                data: {
                    cur_password: data.cur_password,
                    password: data.password,
                    confirmedPassword: data.confirmedPassword,
                    language: getCurrentLanguage(),
                },
                success(resp) {
                    if(resp.error_message !== "success"){
                        error_message.value = resp.error_message;
                    }else{
                        clearUserState();
                        router.push({name: 'accountmanagement'});
                    }
                },
                error(resp) {
                    error_message.value = getHttpErrorMessage(t, resp.status);
                }
            })
        }

        const delete_account = (data) => {
            $.ajax({
                url: `${BASE_URL}/api/user/delete/`,
                type: "POST",
                headers: {
                    Authorization:"Bearer " + store.state.user.access,
                },
                data: {
                    cur_password: data.cur_password,
                    language: getCurrentLanguage(),
                },
                success(resp) {
                    if(resp.error_message === "success" || resp.error_message === "该用户已被删除"){
                        clearUserState();
                        router.push({name: 'accountmanagement'});
                    }else{
                        error_message.value = resp.error_message;
                    }
                },
                error(resp) {
                    error_message.value = getHttpErrorMessage(t, resp.status);
                }
            })
        }

        watch(active_tab, () => {
            error_message.value = '';
        });

        return  {
            t,
            locale,
            username,
            tabs,
            is_logined,
            error_message,
            active_tab,
            is_login_page,
            mobile_nav_open,
            mobile_nav_trigger,
            mobile_nav_menu,
            current_mobile_tab_label,
            toggle_mobile_nav,
            handle_mobile_nav_trigger_keydown,
            handle_mobile_nav_keydown,
            select_mobile_tab,
            close_mobile_nav_on_focusout,
            language_options,
            theme_mode,
            theme_palette,
            theme_mode_options,
            theme_palette_options,
            standard_theme_palette_options,
            eye_care_theme_palette_options,
            current_locale_label,
            current_theme_label,
            change_password,
            change_locale,
            change_theme_mode,
            change_theme_palette,
            logout,
            delete_account,
        }
    }
}
</script>

<style scoped>
.account-layout {
    display: grid;
    grid-template-columns: minmax(220px, 240px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
}

.account-mobile-nav-container {
    display: none;
}

.account-sidebar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
}

.account-tab {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 56px;
    padding: 0 16px;
    border: 1px solid var(--border-soft);
    border-radius: 16px;
    background: var(--surface-card-strong);
    color: var(--text-primary);
    text-align: left;
    box-shadow: var(--shadow-medium);
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease, background-color 0.15s ease;
}

.account-tab:hover {
    border-color: var(--border-accent);
    background: var(--surface-accent-strong);
    transform: translateY(-1px);
    box-shadow: var(--shadow-accent);
}

.account-tab--active {
    border-color: var(--border-accent);
    background: var(--surface-accent-strong);
    box-shadow: var(--shadow-accent);
    color: var(--text-accent);
}

.account-tab__rail {
    width: 4px;
    height: 24px;
    border-radius: 999px;
    background: var(--border-strong);
    flex-shrink: 0;
}

.account-tab--active .account-tab__rail {
    background: var(--accent-strong);
}

.account-tab__label {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 0.98rem;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
}

.account-content {
    min-width: 0;
}

.settings-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.settings-title {
    font-size: 1.1rem;
    font-weight: 700;
}

.settings-description,
.settings-current {
    color: var(--text-secondary);
}

.settings-actions,
.theme-mode-options {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.setting-chip {
    min-width: 140px;
    border-radius: 999px;
    border-width: 1px;
    font-weight: 700;
    transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.setting-chip:hover {
    transform: translateY(-1px);
}

.setting-chip--inactive {
    border-color: var(--border-strong);
    background: var(--surface-card-strong);
    color: var(--text-primary);
}

.setting-chip--inactive:hover {
    border-color: var(--border-accent);
    background: var(--surface-soft-hover);
    color: var(--text-accent);
}

.setting-chip--active {
    border-color: var(--border-accent);
    background: var(--surface-soft-hover);
    color: var(--text-accent);
}

.setting-chip--active:hover {
    border-color: var(--border-accent);
    background: var(--surface-soft-hover);
    color: var(--text-accent);
}

.theme-control-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.theme-control-block--subsection {
    margin-top: 6px;
}

.theme-control-label {
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-weight: 700;
}

.theme-palette-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(176px, 176px));
    gap: 10px;
    justify-content: start;
}

.theme-palette-button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 54px;
    padding: 0 14px;
    border: 1px solid var(--border-strong);
    border-radius: 16px;
    background: var(--surface-card-strong);
    color: var(--text-primary);
    text-align: left;
    font-weight: 700;
    transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.theme-palette-button:hover {
    border-color: var(--border-accent);
    background: var(--surface-soft-hover);
    color: var(--text-accent);
    box-shadow: var(--shadow-accent);
    transform: translateY(-1px);
}

.theme-palette-button--active {
    border-color: var(--border-accent);
    background: var(--surface-accent-strong);
    color: var(--text-accent);
    box-shadow: var(--shadow-accent);
}

.theme-palette-button__preview {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    flex-shrink: 0;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5), 0 2px 8px rgba(15, 23, 42, 0.16);
}

.theme-palette-button__preview--blue {
    background: linear-gradient(135deg, #7ec2ff 0%, #0d6efd 100%);
}

.theme-palette-button__preview--emerald {
    background: linear-gradient(135deg, #83dfb6 0%, #118c61 100%);
}

.theme-palette-button__preview--amber {
    background: linear-gradient(135deg, #ffd27f 0%, #d88900 100%);
}

.theme-palette-button__preview--rose {
    background: linear-gradient(135deg, #ffacc8 0%, #db4376 100%);
}

.theme-palette-button__preview--sage {
    background: linear-gradient(135deg, #ccd9bf 0%, #68875e 100%);
}

.theme-palette-button__preview--almond {
    background: linear-gradient(135deg, #f1dfb2 0%, #aa8140 100%);
}

.theme-palette-button__label {
    min-width: 0;
    flex: 1 1 auto;
}

.auth-switcher {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    width: min(100%, 28rem);
    margin: 12px auto 0;
    padding: 6px;
    border: 1px solid var(--border-soft);
    border-radius: 18px;
    background: var(--surface-card);
    box-shadow: var(--shadow-soft);
    backdrop-filter: blur(18px) saturate(145%);
    -webkit-backdrop-filter: blur(18px) saturate(145%);
}

.auth-switcher__button {
    min-height: 46px;
    padding: 0 16px;
    border: 1px solid transparent;
    border-radius: 14px;
    background: transparent;
    color: var(--text-secondary);
    font-weight: 700;
    transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.auth-switcher__button:hover {
    background: var(--surface-soft-hover);
    color: var(--text-accent);
    transform: translateY(-1px);
}

.auth-switcher__button--active {
    border-color: var(--border-accent);
    background: var(--surface-accent-strong);
    color: var(--accent-strong);
    box-shadow: var(--shadow-accent);
}

.auth-switcher__button--active:hover {
    background: var(--surface-accent-strong);
    color: var(--accent-strong);
}

@media (max-width: 991px) {
    .account-layout {
        grid-template-columns: 1fr;
        gap: 14px;
    }

    .account-sidebar {
        display: none;
    }

    .account-mobile-nav-container {
        display: block;
    }

    .account-mobile-nav {
        display: block;
        position: relative;
        z-index: 30;
        width: max-content;
        max-width: 100%;
        margin: 4px 0 0;
    }

    .account-mobile-nav__trigger {
        display: flex;
        align-items: center;
        width: auto;
        max-width: 100%;
        min-height: 50px;
        padding: 0 16px;
        border: 1px solid var(--border-soft);
        border-radius: 17px;
        background: var(--surface-card-strong);
        color: var(--text-primary);
        text-align: left;
        box-shadow: var(--shadow-soft);
        transition:
            border-color 0.15s ease,
            background-color 0.15s ease,
            box-shadow 0.15s ease;
    }

    .account-mobile-nav__trigger:hover,
    .account-mobile-nav__trigger--open,
    .account-mobile-nav__trigger:focus-visible {
        border-color: var(--border-accent);
        background: var(--surface-soft-hover);
        box-shadow: var(--shadow-accent);
    }

    .account-mobile-nav__trigger:focus-visible {
        outline: 2px solid var(--accent-strong);
        outline-offset: 2px;
    }

    .account-mobile-nav__rail {
        width: 4px;
        height: 22px;
        margin-right: 12px;
        border-radius: 999px;
        background: var(--accent-strong);
        flex-shrink: 0;
    }

    .account-mobile-nav__current {
        min-width: 0;
        flex: 0 1 auto;
        overflow: hidden;
        color: var(--text-primary);
        font-size: 0.95rem;
        font-weight: 700;
        line-height: 1.2;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .account-mobile-nav__chevron {
        width: 8px;
        height: 8px;
        margin: -4px 3px 0 14px;
        border-right: 2px solid var(--text-secondary);
        border-bottom: 2px solid var(--text-secondary);
        flex-shrink: 0;
        transform: rotate(45deg);
        transition:
            transform 0.18s ease,
            margin 0.18s ease;
    }

    .account-mobile-nav__trigger--open .account-mobile-nav__chevron {
        margin-top: 4px;
        transform: rotate(225deg);
    }

    .account-mobile-nav__menu {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        width: max-content;
        min-width: 100%;
        max-width: calc(100vw - 32px);
        padding: 6px;
        border: 1px solid var(--border-soft);
        border-radius: 16px;
        background: var(--surface-card-strong);
        box-shadow: var(--shadow-medium);
        overflow: hidden;
    }

    .account-mobile-nav__option {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 42px;
        padding: 0 12px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--text-primary);
        text-align: left;
        transition:
            background-color 0.15s ease,
            color 0.15s ease;
    }

    .account-mobile-nav__option:hover,
    .account-mobile-nav__option:focus-visible {
        background: var(--surface-soft-hover);
        color: var(--text-accent);
    }

    .account-mobile-nav__option:focus-visible {
        outline: 2px solid var(--accent-strong);
        outline-offset: -2px;
    }

    .account-mobile-nav__option--active {
        background: var(--surface-accent-strong);
        color: var(--text-accent);
        font-weight: 700;
    }

    .account-mobile-nav__option--active:hover {
        background: var(--surface-accent-strong);
        color: var(--text-accent);
    }

    .account-mobile-nav__option-label {
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .account-mobile-nav__check {
        width: 7px;
        height: 12px;
        margin: -2px 4px 0 14px;
        border-right: 2px solid var(--accent-strong);
        border-bottom: 2px solid var(--accent-strong);
        flex-shrink: 0;
        transform: rotate(45deg);
    }

    .account-mobile-menu-enter-active,
    .account-mobile-menu-leave-active {
        transition:
            opacity 0.15s ease,
            transform 0.15s ease;
        transform-origin: top left;
    }

    .account-mobile-menu-enter-from,
    .account-mobile-menu-leave-to {
        opacity: 0;
        transform: translateY(-4px) scale(0.985);
    }
}

@media (max-width: 576px) {
    .account-layout {
        gap: 10px;
    }

    .account-mobile-nav {
        width: max-content;
        max-width: 100%;
        margin: 2px 0 0;
    }

    .account-mobile-nav__trigger {
        min-height: 48px;
        padding: 0 15px;
        border-radius: 16px;
    }

    .account-mobile-nav__rail {
        width: 4px;
        height: 21px;
        margin-right: 11px;
    }

    .account-mobile-nav__current {
        font-size: 0.94rem;
    }

    .account-mobile-nav__menu {
        top: calc(100% + 7px);
        padding: 5px;
        border-radius: 15px;
    }

    .account-mobile-nav__option {
        min-height: 40px;
        padding: 0 11px;
        border-radius: 9px;
        font-size: 0.94rem;
    }

    .settings-panel {
        gap: 10px;
    }

    .setting-chip {
        flex: 1 1 0;
        min-width: 0;
        width: auto;
    }

    .theme-palette-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
    }

    .theme-palette-button {
        min-height: 46px;
        gap: 8px;
        padding: 0 10px;
        border-radius: 12px;
    }

    .theme-palette-button__label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .auth-switcher {
        width: min(100%, 30rem);
        padding: 5px;
        border-radius: 16px;
    }

    .auth-switcher__button {
        min-height: 44px;
        padding: 0 14px;
        border-radius: 12px;
        font-size: 0.95rem;
    }
}
</style>
