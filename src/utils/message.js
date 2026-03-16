import { ElMessage as BaseElMessage } from 'element-plus';

const DEFAULT_MESSAGE_OPTIONS = Object.freeze({
  customClass: 'app-message',
  duration: 2600,
  grouping: true,
  showClose: true,
});

const getMessageOffset = () => {
  if (typeof window === 'undefined') return 16;

  const rawOffset = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--app-message-offset');
  const parsedOffset = Number.parseFloat(rawOffset);

  return Number.isFinite(parsedOffset) ? parsedOffset : 16;
};

const normalizeCustomClass = (customClass) => {
  if (Array.isArray(customClass)) {
    return customClass.filter(Boolean).join(' ');
  }

  return customClass || '';
};

const createMessageOptions = (input, type) => {
  const sourceOptions = typeof input === 'string' ? { message: input } : { ...(input || {}) };

  return {
    ...DEFAULT_MESSAGE_OPTIONS,
    ...sourceOptions,
    type: type || sourceOptions.type,
    offset: sourceOptions.offset ?? getMessageOffset(),
    customClass: [DEFAULT_MESSAGE_OPTIONS.customClass, normalizeCustomClass(sourceOptions.customClass)]
      .filter(Boolean)
      .join(' '),
  };
};

const createTypedMessage = (type) => (input) => BaseElMessage(createMessageOptions(input, type));

const ElMessage = Object.assign(
  (input) => BaseElMessage(createMessageOptions(input)),
  {
    success: createTypedMessage('success'),
    warning: createTypedMessage('warning'),
    info: createTypedMessage('info'),
    error: createTypedMessage('error'),
    closeAll: () => BaseElMessage.closeAll(),
  },
);

export default ElMessage;
export { ElMessage };
