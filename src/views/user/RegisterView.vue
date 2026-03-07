<template>
    <ContentField>
        <div class="row justify-content-md-center">
            <div class="col-4">
                <form>
                <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input v-model="username" type="username" class="form-control" id="username">
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input v-model="password" type="password" class="form-control" id="password">
                </div>
                <div class="mb-3">
                    <label for="confirmedPassword" class="form-label">
                        Confirm Password
                        <div class="inconsistent-message" v-if="password !== confirmedPassword">The two passwords do not match.</div>
                    </label>
                    <input v-model="confirmedPassword" type="password" class="form-control" id="confirmedPassword">
                </div>
                <div class="warning-message">{{ error_message }}</div>
                <button v-on:click.prevent="register" class="btn btn-primary">Register</button>
                </form>
            </div>
        </div>
    </ContentField>
</template>

<script>
import ContentField from '@/components/ContentField.vue';
import { ref } from 'vue';
import $ from 'jquery';
import { BASE_URL } from "@/config"

export default {
    name: 'RegisterView',
    components: {
        ContentField,
    },
    setup(_, context) {
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
                    error_message.value = "Network error.";
                }
            })
        }

        return {
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
.warning-message {
    color: red;
}

.inconsistent-message {
    color: red;
    font-size: 80%;
    display: inline-block;
    margin-left: 6px;
}

.divider {
    color: rgb(0, 0, 0);
}

.verCode {
    margin-top: 0%;
    margin-bottom: 0%;
}
</style>