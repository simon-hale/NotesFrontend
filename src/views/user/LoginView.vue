<template>
    <ContentField>
        <div class="row justify-content-md-center">
            <div class="col-3">
                <form>
                <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input v-model="username" type="username" class="form-control" id="username" aria-describedby="emailHelp">
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input v-model="password" type="password" class="form-control" id="password">
                </div>
                <div class="warning-message">{{ error_message }}</div>
                <button v-on:click.prevent="login" class="btn btn-primary">Login</button>
                </form>
            </div>
        </div>
    </ContentField>
</template>

<script>
import ContentField from '@/components/ContentField.vue';
import { ref } from 'vue';
import { useStore } from 'vuex';
import router from '@/router/index';
import $ from 'jquery';
import { BASE_URL } from "@/config"

export default {
    name: 'LoginView',
    components: {
        ContentField,
    },
    setup() {
        const store = useStore();
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
                        let admin_permission = resp.admin_permission;
                        store.dispatch("login", {username, access, is_logined, admin_permission});
                        store.commit("setFirstLogin");
                        router.push({name: "filedisk"});
                    }else{
                        error_message.value = "Unknown error. Please contact the administrator (resp-success-error).";
                    }
                },
                error(resp) {
                    if(resp.status === 403) {
                        error_message.value = "Incorrect username or password.";
                    }else if(resp.status === 0){
                        error_message.value = "Network error.";
                    }else{
                        error_message.value = "Unknown error. Please contact the administrator (resp-error-error).";
                    }
                }
            })
        }

        return {
            username,
            password,
            error_message,
            login,
        }
    }
}
</script>

<style scoped>
.warning-message {
    color: red;
}
</style>