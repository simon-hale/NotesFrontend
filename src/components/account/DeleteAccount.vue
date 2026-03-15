<template>
    <div class="delete-account-panel">
        <div class="warning-message">{{ t('deleteAccount.warning') }}</div>
        <button type="button" class="btn delete-account-trigger" @click="dialog_visible = true">
            {{ t('deleteAccount.confirmFirst') }}
        </button>
    </div>

    <el-dialog
        v-model="dialog_visible"
        append-to-body
        align-center
        width="min(92vw, 460px)"
        class="delete-account-dialog"
        :title="t('deleteAccount.modalTitle')"
    >
        <div class="warning-message delete-account-dialog__body">
            {{ t('deleteAccount.modalBody') }}
        </div>

        <template #footer>
            <div class="delete-account-dialog__actions">
                <button type="button" class="btn btn-outline-secondary" @click="dialog_visible = false">
                    {{ t('common.close') }}
                </button>
                <button type="button" class="btn btn-danger" @click="confirm_delete">
                    {{ t('deleteAccount.confirmSecond') }}
                </button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
    name: "DeleteAccount",
    setup(_, context) {
        const { t } = useI18n();
        const dialog_visible = ref(false);

        const confirm_delete = () => {
            dialog_visible.value = false;
            context.emit('delete_account');
        }

        return {
            t,
            dialog_visible,
            confirm_delete,
        }
    }
}
</script>

<style scoped>
.delete-account-panel {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
}

.warning-message {
    color: var(--danger);
}

.delete-account-trigger {
    border-color: var(--danger);
    background: var(--danger);
    color: #fff;
    font-weight: 700;
    box-shadow: 0 10px 24px rgba(220, 53, 69, 0.18);
}

.delete-account-trigger:hover {
    border-color: #bb2d3b;
    background: #bb2d3b;
    color: #fff;
}

.delete-account-dialog__body {
    line-height: 1.6;
}

.delete-account-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    width: 100%;
}

:deep(.delete-account-dialog .el-dialog) {
    border-radius: 20px;
    overflow: hidden;
}

:deep(.delete-account-dialog .el-dialog__header) {
    margin-right: 0;
    padding-bottom: 6px;
}

:deep(.delete-account-dialog .el-dialog__body) {
    padding-top: 6px;
}

@media (max-width: 576px) {
    .delete-account-dialog__actions {
        flex-direction: column-reverse;
    }

    .delete-account-dialog__actions .btn {
        width: 100%;
    }
}
</style>
