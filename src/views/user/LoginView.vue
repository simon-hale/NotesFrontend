<template>
    <div class="container auth-page">
        <div class="login-shell">
            <div class="login-panel">
                <form class="login-form">
                    <div class="mb-3">
                        <label for="username" class="form-label">{{ t('auth.username') }}</label>
                        <input v-model="username" type="text" class="form-control login-input" id="username">
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">{{ t('auth.password') }}</label>
                        <input v-model="password" type="password" class="form-control login-input" id="password">
                    </div>
                    <el-checkbox v-model="autoLoginSelector" name="type" class="auto-login-checkbox">{{ t('auth.autoLogin') }}</el-checkbox>
                    <div class="warning-message">{{ error_message }}</div>
                    <button v-on:click.prevent="login" class="btn btn-primary login-button">{{ t('auth.loginButton') }}</button>
                </form>
            </div>
        </div>

        <!-- Teacher Notes Start: remove this entire block when no longer needed -->
        <div class="teacher-notes">
            <div class="teacher-notes__eyebrow">老师提示</div>
            <div class="teacher-notes__title">老师您好，以下是专门为您注册的测试账号</div>
            <div class="teacher-notes__account">账号：test  密码：KAOYAN@success</div>
            <div class="teacher-notes__section-title">主要功能</div>
            <div class="teacher-notes__list">
                <div class="teacher-notes__item">Disk 页面：Disk 页面是云盘，支持创建文件夹、上传文件、删除、改名等基础操作</div>
                <div class="teacher-notes__item">Read 页面：点击文档名称后可在 Read 页面在线阅读对应文件，部分场景需要手动点击“刷新”</div>
            </div>
        </div>
        <!-- Teacher Notes End -->

    </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import router from '@/router/index';
import $ from 'jquery';
import { BASE_URL } from "@/config"
import { AUTH_HTTP_ERROR_KEY_MAP, getHttpErrorMessage } from '@/utils/http';

export default {
    name: 'LoginView',
    setup() {
        const store = useStore();
        let autoLoginSelector = ref(false);
        const { t } = useI18n();
        let username = ref('');
        let password = ref('');
        let error_message = ref('');

        const login = () => {
            error_message.value = '';
            $.ajax({
                url: `${BASE_URL}/api/user/token/`,
                type: "POST",
                data: {
                    username: username.value,
                    password: password.value,
                },
                success(resp) {
                    if(resp.error_message === "success"){
                        let access = resp.token;
                        let is_logined = true;
                        store.dispatch("login", { username: username.value, access, is_logined });
                        if (autoLoginSelector.value) {
                            localStorage.setItem('notes-username', username.value);
                            localStorage.setItem('notes-access', access);
                        }else{
                            localStorage.setItem('notes-username', '');
                            localStorage.setItem('notes-access', '');
                        }
                        store.commit("setFirstLogin");
                        store.commit("setWelcomeBackPending");
                        router.push({name: "filedisk"});
                    }else{
                        error_message.value = t('auth.unknownSuccessError');
                    }
                },
                error(resp) {
                    error_message.value = getHttpErrorMessage(t, resp.status, AUTH_HTTP_ERROR_KEY_MAP);
                    localStorage.setItem('notes-username', '');
                    localStorage.setItem('notes-access', '');
                }
            })
        }

        return {
            autoLoginSelector,
            t,
            username,
            password,
            error_message,
            login,
        }
    }
}
</script>

<style scoped>
.login-shell {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.login-panel {
    width: min(100%, 28rem);
}

.login-form {
    width: 100%;
    padding: 20px 22px;
    border: 1px solid var(--border-soft);
    border-radius: 18px;
    background: linear-gradient(180deg, var(--surface-card-strong) 0%, var(--surface-card-muted) 100%);
    box-shadow: var(--shadow-soft);
}

.login-input {
    min-height: 44px;
    border-radius: 12px;
}

:deep(.auto-login-checkbox.el-checkbox) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
    color: var(--text-secondary);
    --el-checkbox-text-color: var(--text-secondary);
    --el-checkbox-checked-text-color: var(--text-primary);
    --el-checkbox-input-border-color-hover: var(--border-accent);
}

:deep(.auto-login-checkbox .el-checkbox__input) {
    display: inline-flex;
    align-items: center;
}

:deep(.auto-login-checkbox .el-checkbox__label) {
    display: inline-flex;
    align-items: center;
    padding-left: 0;
    color: inherit;
    font-weight: 600;
    line-height: 1.2;
}

:deep(.auto-login-checkbox .el-checkbox__inner) {
    width: 16px;
    height: 16px;
    border-color: var(--border-strong);
    background-color: var(--surface-card-strong);
    transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

:deep(.auto-login-checkbox:hover .el-checkbox__inner) {
    border-color: var(--border-accent);
}

:deep(.auto-login-checkbox .el-checkbox__input.is-checked .el-checkbox__inner),
:deep(.auto-login-checkbox .el-checkbox__input.is-indeterminate .el-checkbox__inner) {
    border-color: var(--accent-strong);
    background-color: var(--accent-strong);
}

:deep(.auto-login-checkbox .el-checkbox__input.is-checked + .el-checkbox__label) {
    color: var(--text-primary);
}

:deep(.auto-login-checkbox .el-checkbox__input.is-focus .el-checkbox__inner) {
    box-shadow: 0 0 0 3px var(--accent-soft);
}

.warning-message {
    color: var(--danger);
    min-height: 24px;
    margin-bottom: 10px;
    font-size: 0.92rem;
}

.login-button {
    width: 100%;
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in srgb, var(--accent-strong) 26%, var(--border-accent));
    border-radius: 999px;
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--surface-card-muted) 92%, transparent) 0%,
        color-mix(in srgb, var(--surface-overlay) 96%, transparent) 52%,
        color-mix(in srgb, var(--surface-accent-strong) 66%, transparent) 100%
    );
    color: var(--text-accent);
    font-weight: 700;
    letter-spacing: 0.01em;
    box-shadow:
        0 12px 24px color-mix(in srgb, var(--accent-soft) 65%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 72%, transparent);
    backdrop-filter: blur(18px) saturate(155%);
    -webkit-backdrop-filter: blur(18px) saturate(155%);
    transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.login-button:hover,
.login-button:focus-visible {
    border-color: color-mix(in srgb, var(--accent-strong) 40%, var(--border-accent));
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--surface-card-strong) 88%, transparent) 0%,
        color-mix(in srgb, var(--surface-overlay) 96%, transparent) 44%,
        color-mix(in srgb, var(--surface-accent-strong) 86%, transparent) 100%
    );
    color: var(--accent-strong);
    filter: saturate(1.03) brightness(1.02);
    transform: translateY(-1px);
    box-shadow:
        0 16px 30px color-mix(in srgb, var(--accent-soft) 72%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 80%, transparent);
}

.login-button:active {
    transform: translateY(0);
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--surface-card-strong) 76%, transparent) 0%,
        color-mix(in srgb, var(--surface-overlay) 90%, transparent) 100%
    );
    box-shadow:
        0 8px 18px color-mix(in srgb, var(--accent-soft) 56%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 64%, transparent);
}

/* Teacher Notes Styles Start: remove together with the teacher notes block above when no longer needed */
.teacher-notes {
    position: relative;
    width: min(100%, 36rem);
    margin: 0 auto;
    padding: 16px 18px;
    border: 1px solid var(--warning-border);
    border-radius: 16px;
    background: var(--warning-surface);
    box-shadow:
        var(--shadow-warning),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    text-align: center;
}

.teacher-notes__eyebrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 24px;
    padding: 0 10px;
    margin-bottom: 8px;
    border-radius: 999px;
    background: var(--warning-pill);
    color: var(--warning-ink);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.teacher-notes__title {
    color: var(--warning-ink-strong);
    font-size: 0.96rem;
    font-weight: 700;
    line-height: 1.4;
}

.teacher-notes__account {
    margin-top: 9px;
    padding: 8px 10px;
    border-radius: 12px;
    background: var(--warning-surface-soft);
    color: var(--warning-ink);
    font-weight: 700;
    box-shadow: inset 0 0 0 1px var(--warning-inset);
}

.teacher-notes__section-title {
    margin-top: 12px;
    color: var(--warning-ink-strong);
    font-size: 0.86rem;
    font-weight: 700;
}

.teacher-notes__list {
    margin-top: 8px;
    display: grid;
    gap: 6px;
}

.teacher-notes__item {
    padding: 8px 10px;
    border-radius: 12px;
    background: var(--warning-surface-soft);
    color: var(--warning-ink-soft);
    line-height: 1.5;
    font-size: 0.9rem;
    box-shadow: inset 0 0 0 1px var(--warning-inset-strong);
}
/* Teacher Notes Styles End */

@media (max-width: 768px) {
    .login-shell {
        margin-bottom: 16px;
    }

    .login-panel {
        width: min(100%, 32rem);
    }

    .login-form {
        padding: 16px;
        border-radius: 16px;
    }

    /* Teacher Notes Styles Start: remove together with the teacher notes block above when no longer needed */
    .teacher-notes {
        width: min(100%, 34rem);
        padding: 13px;
        border-radius: 16px;
    }

    .teacher-notes__account,
    .teacher-notes__item {
        padding: 8px 9px;
    }
    /* Teacher Notes Styles End */

}
</style>
