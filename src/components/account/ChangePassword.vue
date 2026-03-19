<template>
    <form class="account-panel" @submit.prevent="change_password">
        <div class="account-panel__title">{{ t('account.changePassword') }}</div>
        <div class="account-panel__description">{{ t('changePassword.warning') }}</div>

        <div class="change-password-grid">
            <label for="password" class="change-password-field">
                <span class="change-password-field__label">{{ t('changePassword.newPassword') }}</span>
                <input v-model="password" type="password" class="form-control change-password-field__input" id="password">
            </label>

            <label for="confirmedPassword" class="change-password-field">
                <span class="change-password-field__label">{{ t('changePassword.confirmPassword') }}</span>
                <input v-model="confirmedPassword" type="password" class="form-control change-password-field__input" id="confirmedPassword">
                <span v-if="show_mismatch" class="change-password-field__feedback">
                    {{ t('changePassword.mismatch') }}
                </span>
            </label>
        </div>

        <div v-if="error_message" class="account-panel__error">
            {{ error_message }}
        </div>

        <div class="account-panel__actions">
            <button v-on:click.prevent="change_password" class="btn change-password-trigger">
                {{ t('changePassword.submit') }}
            </button>
        </div>
    </form>
</template>

<script>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
    name: "ChangePassword",
    props: {
        error_message: {
            type: String,
            required: false,
            default: '',
        }
    },
    setup(_, context) {
        const { t } = useI18n();
        let password = ref('');
        let confirmedPassword = ref('');
        const show_mismatch = computed(() => {
            if (password.value === '' && confirmedPassword.value === '') return false;
            return password.value !== confirmedPassword.value;
        });

        const change_password = () => {
            context.emit("change_password", {
                "password": password.value,
                "confirmedPassword": confirmedPassword.value,
            })
        }

        return {
            t,
            password,
            confirmedPassword,
            show_mismatch,
            change_password,
        }
    }
}
</script>

<style scoped>
.account-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.account-panel__title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
}

.account-panel__description {
    color: var(--text-secondary);
    line-height: 1.65;
}

.account-panel__error {
    color: var(--danger);
    line-height: 1.6;
}

.account-panel__actions {
    display: flex;
    justify-content: flex-start;
}

.change-password-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.change-password-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
}

.change-password-field__label {
    font-weight: 700;
    color: var(--text-primary);
}

.change-password-field__input {
    min-height: 48px;
    border-radius: 14px;
}

.change-password-field__feedback {
    color: var(--danger);
    font-size: 0.86rem;
    line-height: 1.5;
}

.change-password-trigger {
    min-width: 140px;
    border-color: var(--border-accent);
    background: var(--surface-soft-hover);
    color: var(--text-accent);
    font-weight: 700;
}

.change-password-trigger:hover {
    border-color: var(--border-accent);
    background: var(--surface-soft-hover);
    color: var(--text-accent);
}

@media (max-width: 576px) {
    .change-password-trigger {
        width: 100%;
    }
}
</style>
