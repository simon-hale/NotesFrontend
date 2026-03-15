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
                    <div class="language-panel">
                        <div class="language-title">{{ t('account.languagePanelTitle') }}</div>
                        <div class="language-description">{{ t('account.languagePanelDescription') }}</div>
                        <div class="language-current">
                            {{ t('account.currentLanguage') }}: <strong>{{ current_locale_label }}</strong>
                        </div>
                        <div class="language-options">
                            <button
                                v-for="option in language_options"
                                :key="option.value"
                                type="button"
                                :class="locale === option.value ? 'btn btn-primary language-button' : 'btn btn-outline-secondary language-button'"
                                @click="change_locale(option.value)"
                            >
                                {{ t(option.labelKey) }}
                            </button>
                        </div>
                    </div>
                </ContentField>

                <ContentField v-else-if="active_tab === 'changePassword'">
                    <ChangePassword v-on:change_password="change_password" v-bind:error_message="error_message"></ChangePassword>
                </ContentField>

                <ContentField v-else-if="active_tab === 'deleteAccount'">
                    <DeleteAccount v-on:delete_account="delete_account"></DeleteAccount>
                </ContentField>

                <ContentField v-else-if="active_tab === 'logout'">
                    <button type="button" class="btn btn-warning" v-on:click="logout">
                        {{ t('account.logoutButton') }}
                    </button>
                </ContentField>
            </section>
        </div>
    </ContentField>

    <LoginView v-else-if="is_login_page" class="text-center" />
    <RegisterView v-else class="text-center" @change_to_login_page="is_login_page = true" />

    <div class="text-center auth-switcher">
        <el-button type="warning" v-if="!is_logined && is_login_page" @click="is_login_page = false" round>{{ t('common.register') }}</el-button>
        <el-button type="primary" v-if="!is_logined && !is_login_page" @click="is_login_page = true" round>{{ t('common.login') }}</el-button>
    </div>
</template>

<script>
import ContentField from '@/components/ContentField.vue';
import ChangePassword from '@/components/account/ChangePassword.vue';
import DeleteAccount from '@/components/account/DeleteAccount.vue';
import LoginView from './LoginView.vue'
import RegisterView from './RegisterView.vue'
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import $ from 'jquery';
import router from '@/router';
import { setAppLocale } from '@/i18n';
import { BASE_URL } from "@/config"

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
        let error_message = ref('');
        let active_tab = ref('language');
        let is_login_page = ref(true);

        const tabs = [
            { key: 'language', labelKey: 'account.language' },
            { key: 'changePassword', labelKey: 'account.changePassword' },
            { key: 'deleteAccount', labelKey: 'account.deleteAccount' },
            { key: 'logout', labelKey: 'account.logout' },
        ];

        const language_options = [
            { value: 'en-US', labelKey: 'common.locales.enUS' },
            { value: 'zh-CN', labelKey: 'common.locales.zhCN' },
        ];

        const current_locale_label = computed(() => {
            return locale.value === 'zh-CN' ? t('common.locales.zhCN') : t('common.locales.enUS');
        });

        const change_locale = (nextLocale) => {
            setAppLocale(nextLocale);
        }

        const logout = () => {
            store.dispatch("cleaninfo");
            store.dispatch("cleanFirstLogin");
            store.dispatch("cleanPathsInfo");
            store.dispatch("cleanReadingInfo");
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
                },
                success(resp) {
                    if(resp.error_message !== "success"){
                        error_message.value = resp.error_message;
                    }else{
                        store.dispatch('cleaninfo');
                        store.dispatch("cleanFirstLogin");
                        store.dispatch("cleanPathsInfo");
                        store.dispatch("cleanReadingInfo");
                        router.push({name: 'accountmanagement'});
                    }
                },
                error() {
                    error_message.value = t('common.networkError');
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
                },
                success(resp) {
                    if(resp.error_message === "success" || resp.error_message === "该用户已被删除"){
                        store.dispatch('cleaninfo');
                        store.dispatch("cleanFirstLogin");
                        store.dispatch("cleanPathsInfo");
                        store.dispatch("cleanReadingInfo");
                        router.push({name: 'accountmanagement'});
                    }else{
                        error_message.value = resp.error_message;
                    }
                },
                error() {
                    error_message.value = t('common.networkError');
                }
            })
        }

        return  {
            t,
            locale,
            tabs,
            is_logined,
            error_message,
            active_tab,
            is_login_page,
            language_options,
            current_locale_label,
            change_password,
            change_locale,
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
    border: 1px solid #e6ebf2;
    border-radius: 16px;
    background: #ffffff;
    color: #2f3a45;
    text-align: left;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease, background-color 0.15s ease;
}

.account-tab:hover {
    border-color: #b8cdf1;
    background: #edf4ff;
    transform: translateY(-1px);
    box-shadow: 0 12px 26px rgba(13, 110, 253, 0.1);
}

.account-tab--active {
    border-color: #b8cdf1;
    background: #edf4ff;
    box-shadow: 0 12px 26px rgba(13, 110, 253, 0.1);
    color: #174ea6;
}

.account-tab__rail {
    width: 4px;
    height: 24px;
    border-radius: 999px;
    background: #d7e0ea;
    flex-shrink: 0;
}

.account-tab--active .account-tab__rail {
    background: #0d6efd;
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

.language-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.language-title {
    font-size: 1.1rem;
    font-weight: 700;
}

.language-description,
.language-current {
    color: #5c6672;
}

.language-options {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.language-button {
    min-width: 140px;
}

.auth-switcher {
    margin-top: 15px;
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
