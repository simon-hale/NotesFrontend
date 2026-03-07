<template>
    <ContentField v-if="is_logined">
        <div class="row">
            <div class="col-2 setting-choice">
                <div class="container text-center setting-title-on" v-if="is_change_password">
                    |
                    <div class="text"><button type="button" class="btn btn-light button-text-on">修改密码</button></div>
                </div>
                <div class="container text-center setting-title-off" v-if="!is_change_password">
                    |
                    <div class="text"><button v-on:click="change_change_password" type="button" class="btn btn-light">修改密码</button></div>
                </div>
                <div class="container text-center setting-title-on" v-if="is_delete_account">
                    |
                    <div class="text"><button type="button" class="btn btn-light button-text-on">删除账户</button></div>
                </div>
                <div class="container text-center setting-title-off" v-if="!is_delete_account">
                    |
                    <div class="text"><button v-on:click="change_delete_account" type="button" class="btn btn-light">删除账户</button></div>
                </div>
                <div class="container text-center setting-title-on" v-if="is_logout">
                    |
                    <div class="text"><button type="button" class="btn btn-light button-text-on">退出登录</button></div>
                </div>
                <div class="container text-center setting-title-off" v-if="!is_logout">
                    |
                    <div class="text"><button v-on:click="change_logout" type="button" class="btn btn-light">退出登录</button></div>
                </div>
            </div>
            <div class="col-10">
                <ContentField v-if="is_change_password">
                    <ChangePassword v-on:change_password="change_password" v-bind:error_message="error_message"></ChangePassword>
                </ContentField>
                <ContentField v-if="is_delete_account">
                    <DeleteAccount v-on:delete_account="delete_account"></DeleteAccount>
                </ContentField>
                <ContentField v-if="is_logout">
                    <button type="button" class="btn btn-warning" v-on:click="logout">
                        Log out
                    </button>
                </ContentField>
            </div>
        </div>
    </ContentField>
    <LoginView v-else-if="is_login_page" class="text-center"/>
    <RegisterView v-else class="text-center" @change_to_login_page="is_login_page = true"/>
    <div class="text-center" style="margin-top: 15px;">
        <el-button type="warning" v-if="!is_logined && is_login_page" @click="is_login_page = false" round>Register</el-button>
        <el-button type="primary" v-if="!is_logined && !is_login_page" @click="is_login_page = true" round>Login</el-button>
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
import $ from 'jquery';
import router from '@/router';
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
        let is_logined = computed(() => store.state.user.is_logined);
        let error_message = ref('');
        let is_change_password = ref(true);
        let is_delete_account = ref(false);
        let is_logout = ref(false);

        let is_login_page = ref(true);

        const change_change_password = () => {
            error_message.value = '';
            is_change_password.value = true;
            is_delete_account.value = false;
            is_logout.value = false;
        }

        const change_delete_account = () => {
            error_message.value = '';
            is_change_password.value = false;
            is_delete_account.value = true;
            is_logout.value = false;
        }

        const change_logout = () => {
            error_message.value = '';
            is_change_password.value = false;
            is_delete_account.value = false;
            is_logout.value = true;
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
                    error_message.value = "Network error";
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
                    error_message.value = "Network error";
                }
            })
        }

        return  {
            is_logined,
            error_message,
            is_change_password,
            is_delete_account,
            is_logout,
            is_login_page,
            change_change_password,
            change_delete_account,
            change_password,
            change_logout,
            logout,
            delete_account,
        }
    }
}
</script>

<style scoped>
.btn-light {
    width: 150%;
    display: inline-block;
}

.button-text-on {
    font-weight: 600;
}

.setting-choice {
    margin-top: 20px;
}

.setting-title-on {
    margin-bottom: 8px;
    color: red;
    font-size: 160%;
    font-weight: 600;
}

.setting-title-off {
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0);
    font-size: 160%;
    font-weight: 600;
}

.text {
    color: black;
    display: inline-block;
}

</style>