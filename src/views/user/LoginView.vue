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

export default {
    name: 'LoginView',
    setup() {
        const store = useStore();
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
                        store.commit("setFirstLogin");
                        router.push({name: "filedisk"});
                    }else{
                        error_message.value = t('auth.unknownSuccessError');
                    }
                },
                error(resp) {
                    if(resp.status === 403) {
                        error_message.value = t('auth.incorrectCredentials');
                    }else if(resp.status === 0){
                        error_message.value = t('auth.networkError');
                    }else{
                        error_message.value = t('auth.unknownError');
                    }
                }
            })
        }

        return {
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
.auth-page {
    margin-top: 20px;
}

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

.warning-message {
    color: var(--danger);
    min-height: 24px;
    margin-bottom: 10px;
    font-size: 0.92rem;
}

.login-button {
    width: 100%;
    min-height: 44px;
    border-radius: 999px;
    font-weight: 600;
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
