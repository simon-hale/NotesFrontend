<template>
    <div class="warning-message">{{ t('deleteAccount.warning') }}</div>
    <button type="button" class="btn btn-primary confrim-frist" data-bs-toggle="modal" data-bs-target="#exampleModal">
        {{ t('deleteAccount.confirmFirst') }}
    </button>

    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">{{ t('deleteAccount.modalTitle') }}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="t('common.close')"></button>
                </div>
                <div class="modal-body warning-message">
                    {{ t('deleteAccount.modalBody') }}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">{{ t('common.close') }}</button>
                    <button data-bs-dismiss="modal" v-on:click="delete_account" class="btn btn-primary">{{ t('deleteAccount.confirmSecond') }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
    name: "DeleteAccount",
    setup(_, context) {
        const { t } = useI18n();

        const delete_account = () => {
            context.emit('delete_account');
        }

        return {
            t,
            delete_account,
        }
    }
}
</script>

<style scoped>
.warning-message {
    color: red;
}

.confrim-frist {
    margin-top: 15px;
}
</style>
