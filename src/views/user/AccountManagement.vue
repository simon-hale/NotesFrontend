<template>
    <ContentField v-if="is_logined">
        <div class="account-layout">
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
                            <button type="button" class="btn logout-trigger" v-on:click="logout">
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
import { computed, ref, watch } from 'vue';
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

        const tabs = [
            { key: 'language', labelKey: 'account.language' },
            { key: 'theme', labelKey: 'theme.settingsTitle' },
            { key: 'changePassword', labelKey: 'account.changePassword' },
            { key: 'deleteAccount', labelKey: 'account.deleteAccount' },
            { key: 'logout', labelKey: 'account.logout' },
        ];

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
                    username: store.state.user.username,
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

        const delete_account = () => {
            $.ajax({
                url: `${BASE_URL}/api/user/delete/`,
                type: "POST",
                headers: {
                    Authorization:"Bearer " + store.state.user.access,
                },
                data: {
                    username: store.state.user.username,
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

.auth-entry :deep(.auth-page) {
    margin-top: 20px;
}

.logout-trigger {
    min-width: 140px;
    border-color: color-mix(in srgb, var(--warning) 28%, var(--border-strong));
    background: color-mix(in srgb, var(--warning) 10%, var(--surface-card-strong));
    color: color-mix(in srgb, var(--warning) 88%, var(--text-primary));
    font-weight: 700;
}

.logout-trigger:hover {
    border-color: color-mix(in srgb, var(--warning) 36%, var(--border-strong));
    background: color-mix(in srgb, var(--warning) 14%, var(--surface-soft-hover));
    color: color-mix(in srgb, var(--warning) 90%, var(--text-primary));
}

@media (max-width: 991px) {
    .account-layout {
        grid-template-columns: 1fr;
        gap: 14px;
    }

    .account-sidebar {
        margin-top: 0;
    }
}

@media (max-width: 576px) {
    .setting-chip,
    .logout-trigger {
        width: 100%;
    }

    .theme-palette-grid {
        grid-template-columns: 1fr;
    }

    .theme-palette-button {
        min-height: 50px;
        padding: 0 12px;
        border-radius: 14px;
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

    .account-tab {
        min-height: 50px;
        padding: 0 14px;
        border-radius: 14px;
    }

    .account-tab__label {
        font-size: 0.94rem;
    }
}
</style>
