<template>
    <ContentField>
        <section class="not-found-shell">
            <div class="not-found-mark" aria-hidden="true">404</div>

            <div class="not-found-copy">
                <div class="not-found-kicker">{{ t('notFound.kicker') }}</div>
                <p class="not-found-description">
                    {{ t('notFound.description') }}
                </p>

                <div class="not-found-actions">
                    <button type="button" class="btn not-found-button not-found-button--primary" @click="go_home">
                        {{ t('notFound.goHome') }}
                    </button>
                    <button type="button" class="btn not-found-button not-found-button--secondary" @click="go_back">
                        {{ t('notFound.goBack') }}
                    </button>
                </div>
            </div>
        </section>
    </ContentField>
</template>

<script>
import { useRouter } from 'vue-router';
import ContentField from '@/components/ContentField.vue';
import { useI18n } from 'vue-i18n';

export default {
    name: 'NotFound',
    components: {
        ContentField,
    },
    setup() {
        const { t } = useI18n();
        const router = useRouter();

        const go_home = () => {
            router.push({ name: 'filedisk' });
        };

        const go_back = () => {
            if (window.history.length > 1) {
                router.back();
                return;
            }

            go_home();
        };

        return {
            t,
            go_home,
            go_back,
        }
    }
}
</script>

<style scoped>
:deep(.card) {
    overflow: hidden;
}

:deep(.card-body) {
    padding: clamp(26px, 4vw, 42px);
}

.not-found-shell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: min(70vh, 520px);
    padding: clamp(14px, 3vw, 28px) 0;
}

.not-found-shell::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 28px;
    background:
        linear-gradient(
            180deg,
            color-mix(in srgb, var(--surface-accent) 30%, transparent),
            transparent 30%
        );
    pointer-events: none;
}

.not-found-mark {
    position: absolute;
    top: clamp(8px, 3vw, 20px);
    left: 50%;
    transform: translateX(-50%);
    font-size: clamp(5rem, 18vw, 9rem);
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0.14em;
    text-indent: 0.14em;
    color: color-mix(in srgb, var(--text-primary) 10%, transparent);
    user-select: none;
    pointer-events: none;
}

.not-found-copy {
    position: relative;
    z-index: 1;
    width: min(100%, 620px);
    margin: 0 auto;
    padding-top: clamp(58px, 11vw, 96px);
    text-align: center;
}

.not-found-kicker {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0 14px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--surface-accent) 90%, transparent);
    border: 1px solid color-mix(in srgb, var(--border-accent) 72%, transparent);
    color: var(--text-accent);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.not-found-description {
    margin: 18px auto 0;
    max-width: 46ch;
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.68;
}

.not-found-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
    justify-content: center;
}

.not-found-button {
    min-width: 148px;
    padding: 10px 18px;
    border-radius: 12px;
    font-weight: 700;
    box-shadow: none;
    transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.not-found-button--primary {
    border: 1px solid var(--accent-strong);
    background: var(--accent-strong);
    color: var(--accent-contrast);
}

.not-found-button--primary:hover,
.not-found-button--primary:focus-visible {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--accent-contrast);
}

.not-found-button--secondary {
    border: 1px solid color-mix(in srgb, var(--border-strong) 82%, transparent);
    background: transparent;
    color: var(--text-primary);
}

.not-found-button--secondary:hover,
.not-found-button--secondary:focus-visible {
    border-color: color-mix(in srgb, var(--accent) 42%, var(--border-strong));
    background: color-mix(in srgb, var(--surface-soft) 58%, transparent);
    color: var(--text-primary);
}

@media (max-width: 860px) {
    .not-found-shell {
        min-height: auto;
    }
}

@media (max-width: 640px) {
    :deep(.card-body) {
        padding: 22px 18px;
    }

    .not-found-copy {
        padding-top: 72px;
    }

    .not-found-button {
        width: 100%;
    }
}
</style>
