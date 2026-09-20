<template>
    <ContentField class="text-center login-reminder-field">
        <div class="login-reminder-content">
            <div>{{ t('auth.loginFirst') }}</div>
            <button type="button" class="login-reminder-button" @click="go_to_login">
                {{ t('common.login') }}
            </button>
        </div>
    </ContentField>
</template>

<script>
import ContentField from '@/components/ContentField.vue';
import { useI18n } from 'vue-i18n';
import router from '@/router';

export default {
    name: 'LoginReminder',
    components: {
        ContentField,
    },
    // 让父组件的 v-if / v-show 与 class 落到根节点上，槽内容本身不接收透传属性。
    inheritAttrs: false,
    setup() {
        const { t } = useI18n();

        const go_to_login = () => {
            router.push({ name: 'accountmanagement' });
        };

        return {
            t,
            go_to_login,
        };
    },
}
</script>

<style scoped>
.login-reminder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}
</style>

<style>
/* 该按钮是唯一的使用者，集中在此处定义，无需父组件再用 :deep() 覆盖 Element Plus。
   形态：圆角矩形；材质：浅色透明玻璃（半透明浅色填充 + backdrop-filter + 顶部高光）；体感：整体突起。
   玻璃结构（高光层 + 填充 + 四层投影）只写一次，深浅模式的差异全部由下方局部变量表达，
   因此深色分支只改值、不复制结构。填充用 color-mix 直接调低强调色不透明度（而不是叠白色），
   这样"浅 + 透"跟着主题走：默认蓝偏水蓝、深蓝色偏雾蓝、豆沙绿偏豆绿、杏仁黄偏米黄。 */
.login-reminder-button {
    --reminder-glass-fill: 30%;
    --reminder-sheen-top: 46%;
    --reminder-sheen-mid: 12%;
    --reminder-sheen-angle: 180deg;
    --reminder-ink: var(--text-accent);
    --reminder-ink-soft: color-mix(in srgb, var(--text-primary) 10%, transparent);
    --reminder-ink-strong: color-mix(in srgb, var(--text-primary) 26%, transparent);
    --reminder-glass-edge: color-mix(in srgb, var(--accent) 22%, transparent);
    --reminder-bevel: color-mix(in srgb, white 70%, transparent);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 6.5rem;
    max-width: 100%;
    min-height: 2.1rem;
    padding: 0 0.9rem;
    border: 1px solid color-mix(in srgb, var(--accent) 42%, transparent);
    border-radius: 14px;
    background:
        linear-gradient(
            var(--reminder-sheen-angle),
            color-mix(in srgb, white var(--reminder-sheen-top), transparent) 0%,
            color-mix(in srgb, white var(--reminder-sheen-mid), transparent) 48%,
            transparent 100%
        ),
        color-mix(in srgb, var(--accent) var(--reminder-glass-fill), transparent);
    color: var(--reminder-ink);
    font: inherit;
    font-size: 0.86rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    backdrop-filter: blur(12px) saturate(160%);
    -webkit-backdrop-filter: blur(12px) saturate(160%);
    /* 突起：外投影浮起 + 接触阴影 + 顶部棱边高光 + 底部玻璃厚度 */
    box-shadow:
        0 5px 11px color-mix(in srgb, var(--accent) 30%, transparent),
        0 1px 2px var(--reminder-ink-soft),
        inset 0 1px 0 var(--reminder-bevel),
        inset 0 -1px 1px var(--reminder-glass-edge);
    transition: color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

/* 深色下纸面本身很暗，30% 的浅玻璃几乎看不见，所以把玻璃做得更实、高光更利，
   文字翻成深色以承托浅色玻璃（实测对比度 5.2~6.4:1）。 */
:root[data-theme-mode='dark'] .login-reminder-button {
    --reminder-glass-fill: 70%;
    --reminder-ink: var(--accent-contrast);
    --reminder-ink-soft: color-mix(in srgb, var(--accent-contrast) 26%, transparent);
    --reminder-ink-strong: color-mix(in srgb, var(--accent-contrast) 42%, transparent);
    --reminder-glass-edge: color-mix(in srgb, var(--accent-contrast) 18%, transparent);
    --reminder-bevel: color-mix(in srgb, white 62%, transparent);
}

.login-reminder-button:hover {
    --reminder-glass-fill: 42%;
    --reminder-sheen-top: 58%;
    --reminder-sheen-mid: 16%;

    transform: translateY(-1px);
    box-shadow:
        0 8px 16px color-mix(in srgb, var(--accent) 34%, transparent),
        0 2px 3px var(--reminder-ink-soft),
        inset 0 1px 0 var(--reminder-bevel),
        inset 0 -1px 1px var(--reminder-glass-edge);
}

:root[data-theme-mode='dark'] .login-reminder-button:hover {
    --reminder-glass-fill: 82%;
}

.login-reminder-button:focus-visible {
    outline: none;
    box-shadow:
        0 0 0 3px var(--accent-soft),
        0 5px 11px color-mix(in srgb, var(--accent) 30%, transparent),
        0 1px 2px var(--reminder-ink-soft),
        inset 0 1px 0 var(--reminder-bevel);
}

/* 按下：投影收起、外表面被压平，高光翻面、内阴影由下翻到上，视觉上整体陷入纸面 */
.login-reminder-button:active {
    --reminder-glass-fill: 46%;
    --reminder-sheen-angle: 0deg;
    --reminder-sheen-top: 0%;
    --reminder-sheen-mid: 16%;

    transform: translateY(1px);
    box-shadow:
        0 1px 2px color-mix(in srgb, var(--accent) 20%, transparent),
        inset 0 2px 4px var(--reminder-ink-strong),
        inset 0 -1px 0 color-mix(in srgb, white 30%, transparent);
}

:root[data-theme-mode='dark'] .login-reminder-button:active {
    --reminder-glass-fill: 86%;
}
</style>
