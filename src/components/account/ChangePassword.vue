<template>
    <form>
    <div class="mb-3">
        <label for="password" class="form-label">New Password</label>
        <input v-model="password" type="password" class="form-control" id="password">
    </div>
    <div class="mb-3">
        <label for="confirmedPassword" class="form-label">
            Confirm Password
            <div class="error-message" v-if="password !== confirmedPassword">The two passwords do not match.</div>
        </label>
        <input v-model="confirmedPassword" type="password" class="form-control" id="confirmedPassword">
    </div>
    <div class="warning-message">For security reasons, you will need to log in again after changing your password.</div>
    <div class="error-message">{{ error_message }}</div>
    </form>
    <button v-on:click.prevent="change_password" class="btn btn-primary">Confirm changes</button>
</template>

<script>
import { ref } from 'vue';

export default {
    name: "ChangePassword",
    props: {
        error_message: {
            type: Object,
            required: false,
        }
    },
    setup(props, context) {
        let password = ref('');
        let confirmedPassword = ref('');

        const change_password = () => {
            context.emit("change_password", {
                "password": password.value,
                "confirmedPassword": confirmedPassword.value,
            })
        }

        return {
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
    /* font-size: 80%; */
    display: inline-block;
    margin-left: 6px;
}
</style>