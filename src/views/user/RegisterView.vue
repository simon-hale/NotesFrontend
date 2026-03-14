<template>
    <div class="container auth-page">
        <div class="register-shell">
            <div class="register-panel">
                <form class="register-form">
                    <div class="mb-3">
                        <label for="username" class="form-label">{{ t('auth.username') }}</label>
                        <input v-model="username" type="username" class="form-control register-input" id="username">
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">{{ t('auth.password') }}</label>
                        <input v-model="password" type="password" class="form-control register-input" id="password">
                    </div>
                    <div class="mb-3">
                        <label for="confirmedPassword" class="form-label register-label">
                            <span>{{ t('auth.confirmPassword') }}</span>
                            <span class="inconsistent-message" v-if="password !== confirmedPassword">{{ t('changePassword.mismatch') }}</span>
                        </label>
                        <input v-model="confirmedPassword" type="password" class="form-control register-input" id="confirmedPassword">
                    </div>
                    <div class="warning-message">{{ error_message }}</div>
                    <button v-on:click.prevent="register" class="btn btn-primary register-button">{{ t('auth.registerButton') }}</button>
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
                },
                success(resp){
                    if(resp.error_message !== 'success'){
                        error_message.value = resp.error_message;
                    }else{
                        context.emit('change_to_login_page');
                    }
                },
                error() {
                    error_message.value = t('auth.networkError');
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
.auth-page {
    margin-top: 20px;
}

.register-shell {
    display: flex;
    justify-content: center;
}

.register-panel {
    width: min(100%, 30rem);
}

.register-form {
    width: 100%;
    padding: 20px 22px;
    border: 1px solid #e6ecf3;
    border-radius: 18px;
    background: linear-gradient(180deg, #fbfdff 0%, #f6f9fc 100%);
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.06);
}

.register-input {
    min-height: 44px;
    border-radius: 12px;
}

.register-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
}

.warning-message {
    color: red;
    min-height: 24px;
    margin-bottom: 10px;
    font-size: 0.92rem;
}

.inconsistent-message {
    color: red;
    font-size: 80%;
}

.register-button {
    width: 100%;
    min-height: 44px;
    border-radius: 999px;
    font-weight: 600;
}

@media (max-width: 768px) {
    .register-form {
        padding: 16px;
        border-radius: 16px;
    }
}
</style>
