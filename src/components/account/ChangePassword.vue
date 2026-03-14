<template>
    <form>
        <div class="mb-3">
            <label for="password" class="form-label">{{ t('changePassword.newPassword') }}</label>
            <input v-model="password" type="password" class="form-control" id="password">
        </div>
        <div class="mb-3">
            <label for="confirmedPassword" class="form-label">
                {{ t('changePassword.confirmPassword') }}
                <div class="error-message" v-if="password !== confirmedPassword">{{ t('changePassword.mismatch') }}</div>
            </label>
            <input v-model="confirmedPassword" type="password" class="form-control" id="confirmedPassword">
        </div>
        <div class="warning-message">{{ t('changePassword.warning') }}</div>
        <div class="error-message">{{ error_message }}</div>
    </form>
    <button v-on:click.prevent="change_password" class="btn btn-primary">{{ t('changePassword.submit') }}</button>
</template>

<script>
import { ref } from 'vue';
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
            change_password,
        }
    }
}
</script>

<style scoped>
.warning-message {
    color: orange;
    margin-bottom: 10px;
}

.error-message {
    color: red;
    display: inline-block;
    margin-left: 6px;
}
</style>
