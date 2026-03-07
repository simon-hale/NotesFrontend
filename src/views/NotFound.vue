<template>
    <ContentField>
        <div class="text-center title">
            404 Not Found
        </div>
    </ContentField>
</template>

<script>
import ContentField from '@/components/ContentField.vue';

export default {
    name: 'AccountManagement',
    components: {
        ContentField,
    },
}
</script>

<style scoped>
.title {
    font-size: 50px;
    font-weight: 1000;
}
</style>