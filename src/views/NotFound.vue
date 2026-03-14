<template>
    <ContentField>
        <div class="text-center title">
            {{ t('notFound.title') }}
        </div>
    </ContentField>
</template>

<script>
import ContentField from '@/components/ContentField.vue';
import { useI18n } from 'vue-i18n';

export default {
    name: 'NotFound',
    components: {
        ContentField,
    },
    setup() {
        const { t } = useI18n();

        return {
            t,
        }
    }
}
</script>

<style scoped>
.title {
    font-size: 50px;
    font-weight: 1000;
}
</style>
