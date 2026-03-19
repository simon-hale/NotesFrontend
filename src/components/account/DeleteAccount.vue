<template>
    <div class="account-panel">
        <div class="account-panel__title">{{ t('account.deleteAccount') }}</div>
        <div class="account-panel__description">{{ t('deleteAccount.warning') }}</div>
        <div class="account-panel__note">{{ t('deleteAccount.modalBody') }}</div>

        <div v-if="error_message" class="account-panel__error">
            {{ error_message }}
        </div>

        <div class="account-panel__actions">
            <button type="button" class="btn delete-account-trigger" @click="dialog_visible = true">
                {{ t('deleteAccount.confirmFirst') }}
            </button>
        </div>
    </div>

    <el-dialog
        v-model="dialog_visible"
        append-to-body
        align-center
        width="min(92vw, 460px)"
        class="delete-account-dialog"
        :title="t('deleteAccount.modalTitle')"
    >
        <div class="delete-account-dialog__body">
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
    props: {
        error_message: {
            type: String,
            required: false,
            default: '',
        }
    },
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

.account-panel__note {
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

.delete-account-trigger {
    min-width: 140px;
    border-color: color-mix(in srgb, var(--danger) 26%, var(--border-strong));
    background: color-mix(in srgb, var(--danger) 8%, var(--surface-card-strong));
    color: color-mix(in srgb, var(--danger) 88%, var(--text-primary));
    font-weight: 700;
}

.delete-account-trigger:hover {
    border-color: color-mix(in srgb, var(--danger) 34%, var(--border-strong));
    background: color-mix(in srgb, var(--danger) 12%, var(--surface-soft-hover));
    color: color-mix(in srgb, var(--danger) 90%, var(--text-primary));
}

.delete-account-dialog__body {
    line-height: 1.6;
    color: color-mix(in srgb, var(--danger) 88%, var(--text-primary));
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
    .delete-account-trigger {
        width: 100%;
    }

    .delete-account-dialog__actions {
        flex-direction: column-reverse;
    }

    .delete-account-dialog__actions .btn {
        width: 100%;
    }
}
</style>
