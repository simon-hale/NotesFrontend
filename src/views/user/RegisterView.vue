<template>
    <div class="container auth-page">
        <div class="register-shell">
            <div class="register-panel">
                <form class="register-form">
                    <div class="mb-3">
                        <label for="username" class="form-label">{{ t('auth.username') }}</label>
                        <input v-model="username" type="text" class="form-control register-input" id="username">
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">{{ t('auth.password') }}</label>
                        <input v-model="password" type="password" class="form-control register-input" id="password">
                    </div>
                    <div class="mb-3">
                        <label for="confirmedPassword" class="form-label">{{ t('auth.confirmPassword') }}</label>
                        <input v-model="confirmedPassword" type="password" class="form-control register-input" id="confirmedPassword">
                    </div>
                    <div class="warning-message">{{ error_message }}</div>
                    <button v-on:click.prevent="register" class="btn btn-primary register-button">{{ t('auth.registerButton') }}</button>
                    <div class="text-center inconsistent-message" v-if="password !== confirmedPassword">{{ t('changePassword.mismatch') }}</div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import $ from 'jquery';
import { BASE_URL } from "@/config"
import { getCurrentLanguage, getHttpErrorMessage } from '@/utils/http';

export default {
    name: 'RegisterView',
    setup(_, context) {
        const { t } = useI18n();
        let username = ref('');
        let password = ref('');
        let confirmedPassword = ref('');
        let error_message = ref('');

        const register = () => {
            $.ajax({
                url: `${BASE_URL}/api/user/register/`,
                type: "POST",
                data: {
                    username: username.value,
                    password: password.value,
                    confirmedPassword: confirmedPassword.value,
                    language: getCurrentLanguage(),
                },
                success(resp){
                    if(resp.error_message !== 'success'){
                        error_message.value = resp.error_message;
                    }else{
                        context.emit('change_to_login_page');
                    }
                },
                error(resp) {
                    error_message.value = getHttpErrorMessage(t, resp.status);
                }
            })
        }

        return {
            t,
            username,
            password,
            confirmedPassword,
            error_message,
            register,
        }
    }
}
</script>

<style scoped>
.register-shell {
    display: flex;
    justify-content: center;
}

.register-panel {
    width: min(100%, 28rem);
}

.register-form {
    width: 100%;
    padding: 20px 22px;
    border: 1px solid var(--border-soft);
    border-radius: 18px;
    background: linear-gradient(180deg, var(--surface-card-strong) 0%, var(--surface-card-muted) 100%);
    box-shadow: var(--shadow-soft);
}

.register-input {
    min-height: 44px;
    border-radius: 12px;
}

.warning-message {
    color: var(--danger);
    min-height: 24px;
    margin-bottom: 10px;
    font-size: 0.92rem;
}

.inconsistent-message {
    color: var(--danger);
    font-size: 80%;
    margin-top: 10px;
    margin-bottom: 10px;
}

.register-button {
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

.register-button:hover,
.register-button:focus-visible {
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

.register-button:active {
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

@media (max-width: 768px) {
    .register-panel {
        width: min(100%, 32rem);
    }

    .register-form {
        padding: 16px;
        border-radius: 16px;
    }
}
</style>
