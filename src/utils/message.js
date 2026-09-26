import { ElMessage as BaseElMessage } from 'element-plus';

const DEFAULT_MESSAGE_OPTIONS = Object.freeze({
  customClass: 'app-message',
  duration: 2600,
  grouping: true,
  showClose: true,
});

// Messages must stay readable above every other floating layer of the app:
// Element Plus starts its overlays at 2000, the disk modals sit at 2100 and the
// reading image box at 3000. A fixed z-index is passed because `<el-message>` is
// rendered without an app context, so it cannot inherit Element Plus's counter.
const APP_MESSAGE_Z_INDEX = 4000;

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
    zIndex: sourceOptions.zIndex ?? APP_MESSAGE_Z_INDEX,
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
