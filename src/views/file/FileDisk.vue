<template>
    <div class="container content-field file-disk-page" v-if="is_logined">
        <div class="card-body disk-card-body">
          <div class="disk-toolbar">
            <div class="breadcrumb-wrapper">
              <button
                type="button"
                class="icon-action icon-action--plain"
                :aria-label="t('fileDisk.root')"
                @click="requestDirectoryRoot()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
                  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
                </svg>
              </button>
              <div class="breadcrumb-scroll">
                <el-breadcrumb separator=">">
                  <el-breadcrumb-item
                    v-for="path in paths"
                    v-bind:key="path.level"
                    class="ep-breadcrumb-item"
                    @click="refresh(path.level, path.id, path.name, true)"
                  >
                    <span class="breadcrumb-item-text" :title="displayPathName(path.name)">{{ displayPathName(path.name) }}</span>
                  </el-breadcrumb-item>
                </el-breadcrumb>
              </div>
            </div>
            <div class="page-actions">
              <button
                type="button"
                class="icon-action"
                :aria-label="t('fileDisk.openUploadDialog')"
                @click="openUploadDialog"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                  <path d="M7 9l5 -5l5 5" />
                  <path d="M12 4l0 12" />
                </svg>
              </button>
              <button
                type="button"
                class="icon-action mobile-sort-trigger"
                :class="{ 'mobile-sort-trigger--active': !is_default_sort }"
                :aria-label="mobile_sort_trigger_label"
                :title="mobile_sort_trigger_label"
                @click="openMobileSortSheet"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 9l3 -3l3 3" />
                  <path d="M5 5.5a.5 .5 0 0 1 .5 -.5h4a.5 .5 0 0 1 .5 .5v4a.5 .5 0 0 1 -.5 .5h-4a.5 .5 0 0 1 -.5 -.5l0 -4" />
                  <path d="M5 14.5a.5 .5 0 0 1 .5 -.5h4a.5 .5 0 0 1 .5 .5v4a.5 .5 0 0 1 -.5 .5h-4a.5 .5 0 0 1 -.5 -.5l0 -4" />
                  <path d="M17 6v12" />
                </svg>
              </button>
              <el-divider direction="vertical" />
              <button
                type="button"
                class="icon-action"
                :aria-label="t('fileDisk.refreshDirectory')"
                @click="refreshCurrentPath"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                </svg>
              </button>
            </div>
          </div>

          <el-drawer
            v-model="mobile_sort_visible"
            append-to-body
            direction="btt"
            size="min(78vh, 26rem)"
            :with-header="false"
            class="mobile-sort-drawer"
            modal-class="disk-action-dialog-mask"
          >
            <div class="mobile-sort-sheet">
              <div class="mobile-sort-sheet__handle" aria-hidden="true"></div>
              <div class="mobile-sort-sheet__header">
                <div class="mobile-sort-sheet__title">{{ t('fileDisk.sortOptionsTitle') }}</div>
                <div class="mobile-sort-sheet__current">{{ t('fileDisk.sortCurrentLabel', { label: mobile_current_sort_label }) }}</div>
              </div>

              <div class="mobile-sort-sheet__options">
                <button
                  v-for="option in mobile_sort_options"
                  :key="option.id"
                  type="button"
                  class="mobile-sort-option"
                  :class="{ 'is-active': isMobileSortOptionActive(option) }"
                  @click="applyMobileSortOption(option)"
                >
                  <span class="mobile-sort-option__label">{{ option.label }}</span>
                  <span class="mobile-sort-option__check" aria-hidden="true">
                    <svg v-if="isMobileSortOptionActive(option)" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </el-drawer>

          <el-dialog
            v-model="upload_dialog_visible"
            append-to-body
            width="min(92vw, 700px)"
            class="upload-dialog"
            modal-class="disk-action-dialog-mask"
            :title="t('fileDisk.uploadTitle')"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            @closed="resetUploadDialogState"
          >
            <div class="upload-dialog__shell">
              <div class="upload-switcher">
                <div class="upload-switcher__frame">
                  <el-segmented
                    v-model="selection_value"
                    :options="selection_options"
                    size="large"
                    class="upload-switcher__control"
                  />
                </div>
              </div>

              <div class="upload-glass-card" v-if="selection_value === 'Dir'">
                <div class="upload-glass-card__header">
                  <div class="upload-glass-card__icon upload-glass-card__icon--directory" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"/>
                    </svg>
                  </div>
                  <div class="upload-glass-card__heading">
                    <h4 class="upload-glass-card__title">{{ t('common.create') }}</h4>
                    <span class="upload-glass-card__chip">{{ t('fileDisk.uploadTypeDirectory') }}</span>
                  </div>
                </div>

                <div class="upload-glass-card__body">
                  <el-form-item class="upload-form-item" :label="t('fileDisk.dirName')">
                    <el-input v-model="new_dir_name" class="upload-dialog__input" />
                  </el-form-item>

                  <div class="upload-actions">
                    <button
                      type="button"
                      class="disk-dialog-button disk-dialog-button--accent upload-dialog-button"
                      :disabled="new_dir_name.length === 0"
                      @click="submitCreateDirectory"
                    >
                      {{ t('common.create') }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="upload-glass-card upload-glass-card--file" v-if="selection_value === 'File'">
                <div class="upload-glass-card__header">
                  <div class="upload-glass-card__icon upload-glass-card__icon--file" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5z"/>
                      <path d="M9.5 0v3A1.5 1.5 0 0 0 11 4.5h3z"/>
                    </svg>
                  </div>
                  <div class="upload-glass-card__heading">
                    <h4 class="upload-glass-card__title">{{ t('common.upload') }}</h4>
                    <span class="upload-glass-card__chip">{{ t('fileDisk.uploadTypeFile') }}</span>
                  </div>
                </div>

                <div class="upload-glass-card__body">
                  <el-upload
                    class="upload-demo upload-demo--glass"
                    drag
                    multiple
                    :auto-upload="false"
                    :show-file-list="true"
                    :file-list="elFileList"
                    :on-change="handleChange"
                    :on-remove="handleRemove"
                  >
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                      {{ t('fileDisk.uploadPrompt') }}
                    </div>
                    <template #tip>
                      <div class="el-upload__tip text-center">
                        {{ t('fileDisk.uploadTip') }}
                      </div>
                    </template>
                  </el-upload>

                  <div class="upload-actions upload-actions--file">
                    <div class="upload-progress" v-show="show_upload_progress">
                      <el-progress :percentage="percentage" />
                    </div>
                    <button
                      type="button"
                      class="disk-dialog-button disk-dialog-button--accent upload-dialog-button"
                      :disabled="elFileList.length === 0"
                      @click="uploadAll()"
                    >
                      {{ t('common.upload') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </el-dialog>

          <el-dialog
            v-model="rename_dialog_visible"
            append-to-body
            width="min(92vw, 460px)"
            :show-close="false"
            :close-on-click-modal="true"
            :close-on-press-escape="false"
            modal-class="disk-action-dialog-mask"
            class="disk-action-dialog"
            @closed="handleRenameDialogClosed"
          >
            <div class="disk-action-shell">
              <div class="disk-action-header">
                <div class="disk-action-icon" :class="`disk-action-icon--${rename_dialog_type}`" aria-hidden="true">
                  <svg v-if="rename_dialog_type === 'directory'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5z"/>
                    <path d="M9.5 0v3A1.5 1.5 0 0 0 11 4.5h3z"/>
                    <path d="M11.854 7.146a.5.5 0 0 1 0 .708L9.707 10l2.147 2.146a.5.5 0 0 1-.708.708L9 10.707l-2.146 2.147a.5.5 0 1 1-.708-.708L8.293 10 6.146 7.854a.5.5 0 1 1 .708-.708L9 9.293l2.146-2.147a.5.5 0 0 1 .708 0"/>
                  </svg>
                </div>
                <div class="disk-action-heading">
                  <h3 class="disk-action-title">{{ rename_dialog_title }}</h3>
                  <span class="disk-action-chip">{{ rename_dialog_target_label }}</span>
                </div>
              </div>

              <div class="disk-action-panel">
                <div class="disk-action-row">
                  <span class="disk-action-row__label">{{ t('fileDisk.renameCurrentName') }}</span>
                  <span class="disk-action-row__value" :title="rename_original_name">{{ rename_original_name }}</span>
                </div>

                <div class="disk-action-field">
                  <label class="disk-action-field__label" for="disk-rename-input">{{ t('fileDisk.renameNewName') }}</label>
                  <el-input
                    id="disk-rename-input"
                    ref="rename_input_ref"
                    v-model="rename_draft"
                    maxlength="255"
                    class="disk-action-input"
                    @keyup.enter="confirmRenameDialog"
                  />
                  <p v-if="rename_validation_message" class="disk-action-error">{{ rename_validation_message }}</p>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="disk-action-footer">
                <button type="button" class="disk-dialog-button disk-dialog-button--ghost" @click="cancelRenameDialog">
                  {{ t('common.cancel') }}
                </button>
                <button type="button" class="disk-dialog-button disk-dialog-button--accent" @click="confirmRenameDialog">
                  {{ t('common.confirm') }}
                </button>
              </div>
            </template>
          </el-dialog>

          <el-dialog
            v-model="delete_dialog_visible"
            append-to-body
            width="min(92vw, 420px)"
            :show-close="false"
            :close-on-click-modal="true"
            :close-on-press-escape="false"
            modal-class="disk-action-dialog-mask"
            class="disk-action-dialog"
            @closed="resetDeleteDialogState"
          >
            <div class="disk-action-shell">
              <div class="disk-action-header">
                <div class="disk-action-icon disk-action-icon--danger" aria-hidden="true">
                  <svg v-if="delete_dialog_type === 'directory'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181L15.546 8H14.54l.265-2.91A1 1 0 0 0 13.81 4H2.19a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91H9v1H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zm6.339-1.577A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
                    <path d="M11.854 10.146a.5.5 0 0 0-.707.708L12.293 12l-1.146 1.146a.5.5 0 0 0 .707.708L13 12.707l1.146 1.147a.5.5 0 0 0 .708-.708L13.707 12l1.147-1.146a.5.5 0 0 0-.707-.708L13 11.293z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6.854 7.146a.5.5 0 1 0-.708.708L7.293 9l-1.147 1.146a.5.5 0 0 0 .708.708L8 9.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 9l1.147-1.146a.5.5 0 0 0-.708-.708L8 8.293z"/>
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                  </svg>
                </div>
                <div class="disk-action-heading">
                  <h3 class="disk-action-title">{{ delete_dialog_title }}</h3>
                  <span class="disk-action-chip disk-action-chip--danger">{{ delete_dialog_target_label }}</span>
                </div>
              </div>

              <div class="disk-action-panel disk-action-panel--danger">
                <div class="disk-action-warning">
                  {{ t('fileDisk.deleteDialogWarning') }}
                </div>

                <div class="disk-action-row">
                  <span class="disk-action-row__label">{{ t('fileDisk.deleteTargetName') }}</span>
                  <span class="disk-action-row__value" :title="delete_target_name">{{ delete_target_name }}</span>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="disk-action-footer">
                <button type="button" class="disk-dialog-button disk-dialog-button--ghost-danger" @click="closeDeleteDialog">
                  {{ t('common.cancel') }}
                </button>
                <button type="button" class="disk-dialog-button disk-dialog-button--danger" @click="confirmDeleteDialog">
                  {{ t('fileDisk.confirmDelete') }}
                </button>
              </div>
            </template>
          </el-dialog>

          <div
            v-if="show_directory_feedback"
            class="directory-feedback"
            :class="directory_feedback_tone"
            :role="directory_feedback_tone === 'directory-feedback--error' ? 'alert' : 'status'"
            aria-live="polite"
          >
            <div class="directory-feedback__message">{{ directory_feedback_message }}</div>
            <div v-if="directory_feedback_detail" class="directory-feedback__detail">{{ directory_feedback_detail }}</div>
          </div>

          <template v-else>
            <div class="table-header entry-row entry-row--header">
              <button
                type="button"
                class="entry-sort-button entry-sort-button--name"
                :class="{ 'is-active': isSortActive(sort_keys.NAME) }"
                :aria-label="getSortButtonTitle(sort_keys.NAME, t('common.name'))"
                :title="getSortButtonTitle(sort_keys.NAME, t('common.name'))"
                @click="toggleSort(sort_keys.NAME)"
              >
                <span class="entry-sort-button__label">{{ t('common.name') }}</span>
                <span class="entry-sort-button__indicator" :class="`is-${getSortDirection(sort_keys.NAME) || 'none'}`" aria-hidden="true">
                  <svg v-if="getSortDirection(sort_keys.NAME) === sort_directions.DESC" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v6.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 11.293V4.5A.5.5 0 0 1 8 4"/>
                  </svg>
                  <svg v-else-if="!isSortActive(sort_keys.NAME)" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 2.5a.5.5 0 0 1 .5.5v8.293l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 11.293V3a.5.5 0 0 1 .5-.5"/>
                    <path fill-rule="evenodd" d="M8 13.5a.5.5 0 0 1-.5-.5V4.707L5.354 6.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 4.707V13a.5.5 0 0 1-.5.5"/>
                  </svg>
                </span>
              </button>
              <button
                type="button"
                class="entry-sort-button entry-sort-button--meta"
                :class="{ 'is-active': isSortActive(sort_keys.CREATED) }"
                :aria-label="getSortButtonTitle(sort_keys.CREATED, t('fileDisk.creationTime'))"
                :title="getSortButtonTitle(sort_keys.CREATED, t('fileDisk.creationTime'))"
                @click="toggleSort(sort_keys.CREATED)"
              >
                <span class="entry-sort-button__label">{{ t('fileDisk.creationTime') }}</span>
                <span class="entry-sort-button__indicator" :class="`is-${getSortDirection(sort_keys.CREATED) || 'none'}`" aria-hidden="true">
                  <svg v-if="getSortDirection(sort_keys.CREATED) === sort_directions.ASC" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 12a.5.5 0 0 1-.5-.5V4.707L5.354 6.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 4.707V11.5A.5.5 0 0 1 8 12"/>
                  </svg>
                  <svg v-else-if="getSortDirection(sort_keys.CREATED) === sort_directions.DESC" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v6.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 11.293V4.5A.5.5 0 0 1 8 4"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 2.5a.5.5 0 0 1 .5.5v8.293l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 11.293V3a.5.5 0 0 1 .5-.5"/>
                    <path fill-rule="evenodd" d="M8 13.5a.5.5 0 0 1-.5-.5V4.707L5.354 6.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 4.707V13a.5.5 0 0 1-.5.5"/>
                  </svg>
                </span>
              </button>
              <button
                type="button"
                class="entry-sort-button entry-sort-button--meta"
                :class="{ 'is-active': isSortActive(sort_keys.UPDATED) }"
                :aria-label="getSortButtonTitle(sort_keys.UPDATED, t('fileDisk.lastModified'))"
                :title="getSortButtonTitle(sort_keys.UPDATED, t('fileDisk.lastModified'))"
                @click="toggleSort(sort_keys.UPDATED)"
              >
                <span class="entry-sort-button__label">{{ t('fileDisk.lastModified') }}</span>
                <span class="entry-sort-button__indicator" :class="`is-${getSortDirection(sort_keys.UPDATED) || 'none'}`" aria-hidden="true">
                  <svg v-if="getSortDirection(sort_keys.UPDATED) === sort_directions.ASC" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 12a.5.5 0 0 1-.5-.5V4.707L5.354 6.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 4.707V11.5A.5.5 0 0 1 8 12"/>
                  </svg>
                  <svg v-else-if="getSortDirection(sort_keys.UPDATED) === sort_directions.DESC" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v6.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 11.293V4.5A.5.5 0 0 1 8 4"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 2.5a.5.5 0 0 1 .5.5v8.293l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 11.293V3a.5.5 0 0 1 .5-.5"/>
                    <path fill-rule="evenodd" d="M8 13.5a.5.5 0 0 1-.5-.5V4.707L5.354 6.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 4.707V13a.5.5 0 0 1-.5.5"/>
                  </svg>
                </span>
              </button>
              <div class="entry-actions entry-actions--header">{{ t('common.actions') }}</div>
            </div>

            <div v-for="directory in directories" v-bind:key="directory.id" class="entry-card entry-card--directory">
              <div class="entry-row">
                <button
                  type="button"
                  class="entry-name entry-name--interactive"
                  :title="directory.name"
                  @click="refresh(path_level, directory.id, directory.name, false)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-folder-fill entry-icon" viewBox="0 0 16 16">
                    <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"/>
                  </svg>
                  <span class="entry-name__text">{{ directory.name }}</span>
                </button>
                <div class="entry-meta entry-meta--created entry-meta--placeholder" aria-hidden="true">
                  <span class="entry-meta__label">{{ t('fileDisk.created') }}</span>
                  <span class="entry-meta__value">--</span>
                </div>
                <div class="entry-meta entry-meta--updated entry-meta--placeholder" aria-hidden="true">
                  <span class="entry-meta__label">{{ t('fileDisk.updated') }}</span>
                  <span class="entry-meta__value">--</span>
                </div>
                <div class="entry-actions">
                  <button
                    type="button"
                    class="icon-action"
                    :aria-label="t('fileDisk.renameDirectory')"
                    @click="openRenameDialog('directory', directory.id, directory.name)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                      <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                  </button>
                  <el-divider direction="vertical" />
                  <button
                    type="button"
                    class="icon-action icon-action--danger"
                    :aria-label="t('fileDisk.deleteDirectory')"
                    @click="openDeleteDialog('directory', directory.id, directory.name)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder-x" viewBox="0 0 16 16">
                      <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181L15.546 8H14.54l.265-2.91A1 1 0 0 0 13.81 4H2.19a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91H9v1H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zm6.339-1.577A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
                      <path d="M11.854 10.146a.5.5 0 0 0-.707.708L12.293 12l-1.146 1.146a.5.5 0 0 0 .707.708L13 12.707l1.146 1.147a.5.5 0 0 0 .708-.708L13.707 12l1.147-1.146a.5.5 0 0 0-.707-.708L13 11.293z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-for="file in files" v-bind:key="file.id" class="entry-card entry-card--file">
              <div class="entry-row">
                <button
                  type="button"
                  class="entry-name entry-name--interactive"
                  :title="file.name"
                  @click="setReadingFileInfo(file.id, file.name)"
                >
                  <span class="entry-type-badge">{{ file.type ? file.type.toUpperCase() : 'FILE' }}</span>
                  <span class="entry-name__text">{{ file.name }}</span>
                </button>
                <div class="entry-meta entry-meta--created">
                  <span class="entry-meta__label">{{ t('fileDisk.created') }}</span>
                  <span class="entry-meta__value" :title="file.creation_time">{{ file.creation_time }}</span>
                </div>
                <div class="entry-meta entry-meta--updated">
                  <span class="entry-meta__label">{{ t('fileDisk.updated') }}</span>
                  <span class="entry-meta__value" :title="file.last_modified_time">{{ file.last_modified_time }}</span>
                </div>
                <div class="entry-actions">
                  <button
                    type="button"
                    class="icon-action"
                    :aria-label="t('fileDisk.renameFile')"
                    @click="openRenameDialog('file', file.id, file.name)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                      <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                  </button>
                  <el-divider direction="vertical" />
                  <button
                    type="button"
                    class="icon-action icon-action--danger"
                    :aria-label="t('fileDisk.deleteFile')"
                    @click="openDeleteDialog('file', file.id, file.name)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-x" viewBox="0 0 16 16">
                      <path d="M6.854 7.146a.5.5 0 1 0-.708.708L7.293 9l-1.147 1.146a.5.5 0 0 0 .708.708L8 9.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 9l1.147-1.146a.5.5 0 0 0-.708-.708L8 8.293z"/>
                      <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                    </svg>
                  </button>
                  <el-divider direction="vertical" />
                  <button
                    type="button"
                    class="icon-action"
                    :aria-label="t('fileDisk.downloadFile')"
                    @click="downloadFile(file.id, file.name)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
    </div>
    <ContentField v-else class="text-center login-reminder-field">
        <div class="login-reminder-content">
          <div>{{ t('auth.loginFirst') }}</div>
          <el-button class="login-reminder-button" size="large" round @click="go_to_login">{{ t('common.login') }}</el-button>
        </div>
    </ContentField>
</template>

<script>
import ContentField from '@/components/ContentField.vue';
import { UploadFilled } from '@element-plus/icons-vue'
import { computed, nextTick, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import router from '@/router';
import ElMessage from '@/utils/message';
import $ from 'jquery';
import OSS from 'ali-oss';
import { BASE_URL } from "@/config"
import { getCurrentLanguage, getHttpErrorMessage } from '@/utils/http';

export default {
  name: "FileDisk",
  components: {
    ContentField,
    UploadFilled,
  },
  setup(){
    const store = useStore();
    const { t } = useI18n();
    let is_logined = computed(() => store.state.user.is_logined);
    let path_level = computed(() => store.state.file.path_level);
    let paths = computed(() => store.state.file.paths);
    let raw_directories = ref([]);
    let raw_files = ref([]);
    let directories = ref([]);
    let files = ref([]);
    const SORT_KEYS = Object.freeze({
      NAME: 'name',
      CREATED: 'creation_time',
      UPDATED: 'last_modified_time',
    });
    const SORT_DIRECTIONS = Object.freeze({
      ASC: 'asc',
      DESC: 'desc',
    });
    const directory_sort_direction = ref(SORT_DIRECTIONS.ASC);
    const file_sort_key = ref(SORT_KEYS.NAME);
    const file_sort_direction = ref(SORT_DIRECTIONS.ASC);
    const mobile_sort_visible = ref(false);
    let cached_name_collator = null;
    let cached_name_collator_locale = '';
    const DIRECTORY_VIEW_STATES = Object.freeze({
      LOADING: 'loading',
      READY: 'ready',
      EMPTY: 'empty',
      ERROR: 'error',
    });
    const directory_view_state = ref(DIRECTORY_VIEW_STATES.LOADING);
    const directory_status_detail = ref('');
    let active_directory_request = null;
    const show_directory_feedback = computed(() => directory_view_state.value !== DIRECTORY_VIEW_STATES.READY);
    const directory_feedback_message = computed(() => {
      if (directory_view_state.value === DIRECTORY_VIEW_STATES.LOADING) return t('fileDisk.directoryLoading');
      if (directory_view_state.value === DIRECTORY_VIEW_STATES.ERROR) return t('fileDisk.directoryLoadFailed');
      if (directory_view_state.value === DIRECTORY_VIEW_STATES.EMPTY) return t('fileDisk.directoryEmpty');
      return '';
    });
    const directory_feedback_detail = computed(() => (
      directory_view_state.value === DIRECTORY_VIEW_STATES.ERROR
        ? directory_status_detail.value
        : ''
    ));
    const directory_feedback_tone = computed(() => {
      if (directory_view_state.value === DIRECTORY_VIEW_STATES.ERROR) return 'directory-feedback--error';
      if (directory_view_state.value === DIRECTORY_VIEW_STATES.LOADING) return 'directory-feedback--loading';
      return 'directory-feedback--empty';
    });

    let new_dir_name = ref('');
    let show_upload_progress = ref(false);
    let upload_dialog_visible = ref(false);
    const rename_input_ref = ref(null);
    const rename_dialog_visible = ref(false);
    const rename_dialog_type = ref('directory');
    const rename_target_id = ref(null);
    const rename_original_name = ref('');
    const rename_draft = ref('');
    const rename_validation_message = ref('');
    const rename_dialog_close_intent = ref('dismiss');
    const delete_dialog_visible = ref(false);
    const delete_dialog_type = ref('directory');
    const delete_target_id = ref(null);
    const delete_target_name = ref('');

    const selection_value = ref('Dir');
    const selection_options = computed(() => [
      { label: t('fileDisk.uploadTypeDirectory'), value: 'Dir' },
      { label: t('fileDisk.uploadTypeFile'), value: 'File' },
    ]);
    const rename_dialog_target_label = computed(() => (
      rename_dialog_type.value === 'directory'
        ? t('fileDisk.uploadTypeDirectory')
        : t('fileDisk.uploadTypeFile')
    ));
    const rename_dialog_title = computed(() => (
      rename_dialog_type.value === 'directory'
        ? t('fileDisk.changeDirectoryTitle')
        : t('fileDisk.changeFileTitle')
    ));
    const delete_dialog_target_label = computed(() => (
      delete_dialog_type.value === 'directory'
        ? t('fileDisk.uploadTypeDirectory')
        : t('fileDisk.uploadTypeFile')
    ));
    const delete_dialog_title = computed(() => (
      delete_dialog_type.value === 'directory'
        ? t('fileDisk.deleteDirectory')
        : t('fileDisk.deleteFile')
    ));
    const displayPathName = (name) => {
      return name === 'root' ? t('fileDisk.root') : name;
    }

    const getNameCollator = () => {
      const locale = getCurrentLanguage();
      if (!cached_name_collator || cached_name_collator_locale !== locale) {
        cached_name_collator = new Intl.Collator(locale, {
          numeric: true,
          sensitivity: 'base',
        });
        cached_name_collator_locale = locale;
      }
      return cached_name_collator;
    }

    const compareNumbers = (left, right) => {
      if (left === right) return 0;
      return left < right ? -1 : 1;
    }

    const compareIdentifiers = (left, right) => {
      const left_number = Number(left);
      const right_number = Number(right);
      if (Number.isFinite(left_number) && Number.isFinite(right_number)) {
        return compareNumbers(left_number, right_number);
      }
      return getNameCollator().compare(String(left ?? ''), String(right ?? ''));
    }

    const getDirectionalResult = (value, direction) => (
      direction === SORT_DIRECTIONS.DESC ? value * -1 : value
    )

    const normalizeTimestamp = (value) => {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (value instanceof Date) {
        const timestamp = value.getTime();
        return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
      }
      if (typeof value !== 'string') return Number.NEGATIVE_INFINITY;

      const trimmedValue = value.trim();
      if (!trimmedValue) return Number.NEGATIVE_INFINITY;

      const normalizedValue = trimmedValue.includes('T')
        ? trimmedValue
        : trimmedValue.replace(' ', 'T');
      const parsedTimestamp = Date.parse(normalizedValue);
      if (Number.isFinite(parsedTimestamp)) return parsedTimestamp;

      const fallbackTimestamp = Date.parse(trimmedValue.replace(/-/g, '/'));
      return Number.isFinite(fallbackTimestamp) ? fallbackTimestamp : Number.NEGATIVE_INFINITY;
    }

    const sortEntriesByName = (entries, direction) => (
      [...entries]
        .map((entry) => ({
          entry,
          name: String(entry?.name ?? ''),
          id: entry?.id,
        }))
        .sort((left, right) => {
          const name_result = getNameCollator().compare(left.name, right.name);
          if (name_result !== 0) {
            return getDirectionalResult(name_result, direction);
          }
          return compareIdentifiers(left.id, right.id);
        })
        .map(({ entry }) => entry)
    )

    const sortFilesByTime = (entries, sort_key, direction) => (
      [...entries]
        .map((entry) => ({
          entry,
          timestamp: normalizeTimestamp(entry?.[sort_key]),
          name: String(entry?.name ?? ''),
          id: entry?.id,
        }))
        .sort((left, right) => {
          const time_result = compareNumbers(left.timestamp, right.timestamp);
          if (time_result !== 0) {
            return getDirectionalResult(time_result, direction);
          }

          const name_result = getNameCollator().compare(left.name, right.name);
          if (name_result !== 0) {
            return name_result;
          }

          return compareIdentifiers(left.id, right.id);
        })
        .map(({ entry }) => entry)
    )

    const applyCurrentSort = () => {
      directories.value = sortEntriesByName(raw_directories.value, directory_sort_direction.value);
      files.value = file_sort_key.value === SORT_KEYS.NAME
        ? sortEntriesByName(raw_files.value, file_sort_direction.value)
        : sortFilesByTime(raw_files.value, file_sort_key.value, file_sort_direction.value);
    }

    const resetSortState = () => {
      directory_sort_direction.value = SORT_DIRECTIONS.ASC;
      file_sort_key.value = SORT_KEYS.NAME;
      file_sort_direction.value = SORT_DIRECTIONS.ASC;
    }

    const setSortState = (key, direction) => {
      if (key === SORT_KEYS.NAME) {
        directory_sort_direction.value = direction;
      }
      file_sort_key.value = key;
      file_sort_direction.value = direction;
      applyCurrentSort();
    }

    const isSortActive = (key) => file_sort_key.value === key;
    const is_default_sort = computed(() => (
      directory_sort_direction.value === SORT_DIRECTIONS.ASC &&
      file_sort_key.value === SORT_KEYS.NAME &&
      file_sort_direction.value === SORT_DIRECTIONS.ASC
    ));

    const getSortDirection = (key) => {
      if (key === SORT_KEYS.NAME) {
        return file_sort_key.value === SORT_KEYS.NAME ? file_sort_direction.value : null;
      }
      return file_sort_key.value === key ? file_sort_direction.value : null;
    }

    const getSortDirectionLabel = (direction) => (
      direction === SORT_DIRECTIONS.DESC
        ? t('fileDisk.sortDescending')
        : t('fileDisk.sortAscending')
    )

    const getSortButtonTitle = (key, label) => {
      const direction = getSortDirection(key);
      if (!direction) {
        return t('fileDisk.sortByColumn', { label });
      }
      return t('fileDisk.sortByColumnWithDirection', {
        label,
        direction: getSortDirectionLabel(direction),
      });
    }

    const mobile_sort_options = computed(() => ([
      {
        id: 'name-asc',
        key: SORT_KEYS.NAME,
        direction: SORT_DIRECTIONS.ASC,
        label: t('fileDisk.sortNameAscending'),
      },
      {
        id: 'name-desc',
        key: SORT_KEYS.NAME,
        direction: SORT_DIRECTIONS.DESC,
        label: t('fileDisk.sortNameDescending'),
      },
      {
        id: 'created-desc',
        key: SORT_KEYS.CREATED,
        direction: SORT_DIRECTIONS.DESC,
        label: t('fileDisk.sortCreationNewest'),
      },
      {
        id: 'created-asc',
        key: SORT_KEYS.CREATED,
        direction: SORT_DIRECTIONS.ASC,
        label: t('fileDisk.sortCreationOldest'),
      },
      {
        id: 'updated-desc',
        key: SORT_KEYS.UPDATED,
        direction: SORT_DIRECTIONS.DESC,
        label: t('fileDisk.sortModifiedNewest'),
      },
      {
        id: 'updated-asc',
        key: SORT_KEYS.UPDATED,
        direction: SORT_DIRECTIONS.ASC,
        label: t('fileDisk.sortModifiedOldest'),
      },
    ]));

    const isMobileSortOptionActive = (option) => (
      file_sort_key.value === option.key &&
      file_sort_direction.value === option.direction &&
      (option.key !== SORT_KEYS.NAME || directory_sort_direction.value === option.direction)
    )

    const mobile_current_sort_label = computed(() => (
      mobile_sort_options.value.find((option) => isMobileSortOptionActive(option))?.label
      ?? t('fileDisk.sortNameAscending')
    ));

    const mobile_sort_trigger_label = computed(() => (
      t('fileDisk.openSortOptionsWithCurrent', { label: mobile_current_sort_label.value })
    ));

    const openMobileSortSheet = () => {
      mobile_sort_visible.value = true;
    }

    const applyMobileSortOption = (option) => {
      setSortState(option.key, option.direction);
      mobile_sort_visible.value = false;
    }

    const toggleSort = (key) => {
      if (key === SORT_KEYS.NAME) {
        const next_direction = file_sort_key.value === SORT_KEYS.NAME && file_sort_direction.value === SORT_DIRECTIONS.ASC
          ? SORT_DIRECTIONS.DESC
          : SORT_DIRECTIONS.ASC;
        setSortState(SORT_KEYS.NAME, next_direction);
        return;
      }

      const next_direction = file_sort_key.value === key && file_sort_direction.value === SORT_DIRECTIONS.ASC
        ? SORT_DIRECTIONS.DESC
        : SORT_DIRECTIONS.ASC;
      setSortState(key, next_direction);
    }

    const showHttpError = (resp) => {
      ElMessage.error(getHttpErrorMessage(t, resp?.status))
    }

    const getCurrentPath = () => paths.value[path_level.value] ?? null;

    const abortActiveDirectoryRequest = () => {
      if (active_directory_request && active_directory_request.readyState !== 4) {
        active_directory_request.abort();
      }
      active_directory_request = null;
    }

    const beginDirectoryRequest = () => {
      abortActiveDirectoryRequest();
      raw_directories.value = [];
      raw_files.value = [];
      directories.value = [];
      files.value = [];
      directory_view_state.value = DIRECTORY_VIEW_STATES.LOADING;
      directory_status_detail.value = '';
    }

    const resolveDirectoryRequest = (nextDirectories = [], nextFiles = []) => {
      const safeDirectories = Array.isArray(nextDirectories) ? nextDirectories : [];
      const safeFiles = Array.isArray(nextFiles) ? nextFiles : [];

      raw_directories.value = safeDirectories;
      raw_files.value = safeFiles;
      applyCurrentSort();
      directory_status_detail.value = '';
      directory_view_state.value = safeDirectories.length > 0 || safeFiles.length > 0
        ? DIRECTORY_VIEW_STATES.READY
        : DIRECTORY_VIEW_STATES.EMPTY;
    }

    const rejectDirectoryRequest = (detail = '') => {
      raw_directories.value = [];
      raw_files.value = [];
      directories.value = [];
      files.value = [];
      directory_view_state.value = DIRECTORY_VIEW_STATES.ERROR;
      directory_status_detail.value = detail;
    }

    const handleDirectoryHttpError = (resp, textStatus) => {
      if (textStatus === 'abort') return;

      active_directory_request = null;
      const message = getHttpErrorMessage(t, resp?.status);
      rejectDirectoryRequest(message);
      ElMessage.error(message);
    }

    const handleDirectoryBusinessError = (resp) => {
      const message = resp?.error_message || t('common.unknownError');
      rejectDirectoryRequest(message);
      ElMessage({
        message: message,
        type: 'error',
      })
    }

    const loadDirectory = ({ url, data, onSuccess, resetSort = false }) => {
      if (resetSort) {
        resetSortState();
      }
      beginDirectoryRequest();
      active_directory_request = $.ajax({
        url,
        type: "POST",
        headers: {
          Authorization:"Bearer " + store.state.user.access,
        },
        data,
        success(resp){
          active_directory_request = null;

          if(resp.error_message !== 'success'){
            handleDirectoryBusinessError(resp);
            return;
          }

          resolveDirectoryRequest(resp.directories, resp.files);
          onSuccess?.(resp);
        },
        error(resp, textStatus){
          handleDirectoryHttpError(resp, textStatus);
        }
      })
    }

    const go_to_login = () => {
      router.push({name: 'accountmanagement'});
    }

    const resetUploadDialogState = () => {
      percentage.value = 0;
      show_upload_progress.value = false;
    }

    const openUploadDialog = () => {
      upload_dialog_visible.value = true;
    }

    const validateRenameValue = (type, value) => {
      if (value === '') return t('fileDisk.emptyText')
      if (type === 'directory' && (value === 'root' || value === 'root_parent')) {
        return t('fileDisk.invalidDirectoryName')
      }
      return ''
    }

    const openRenameDialog = (type, id, name) => {
      rename_dialog_type.value = type;
      rename_target_id.value = id;
      rename_original_name.value = name;
      rename_draft.value = name;
      rename_validation_message.value = '';
      rename_dialog_close_intent.value = 'dismiss';
      rename_dialog_visible.value = true;

      nextTick(() => {
        rename_input_ref.value?.focus?.();
        rename_input_ref.value?.select?.();
      });
    }

    const closeRenameDialog = (intent = 'dismiss') => {
      rename_dialog_close_intent.value = intent;
      rename_dialog_visible.value = false;
    }

    const cancelRenameDialog = () => {
      closeRenameDialog('cancel');
    }

    const handleRenameDialogClosed = () => {
      if (rename_dialog_close_intent.value !== 'confirm') {
        ElMessage({
          type: 'info',
          message: t('fileDisk.inputCanceled'),
        })
      }

      rename_dialog_type.value = 'directory';
      rename_target_id.value = null;
      rename_original_name.value = '';
      rename_draft.value = '';
      rename_validation_message.value = '';
      rename_dialog_close_intent.value = 'dismiss';
    }

    const requestModifyDirectoryName = (id, value) => {
      $.ajax({
        url: `${BASE_URL}/api/directory/modify/name/`,
        type: "POST",
        headers: {
            Authorization:"Bearer " + store.state.user.access,
        },
        data: {
          id: id,
          name: value,
          language: getCurrentLanguage(),
        },
        success(resp){
            if(resp.error_message !== 'success'){
              ElMessage({
                message: resp.error_message,
                type: 'error',
              })
            }else{
              refreshCurrentDirectory();
              ElMessage({
                message: t('fileDisk.renamed'),
                type: 'success',
              })
            }
        },
        error: showHttpError
    })
    }

    const requestModifyFileName = (id, value) => {
      $.ajax({
        url: `${BASE_URL}/api/file/modify/name/`,
        type: "POST",
        headers: {
            Authorization:"Bearer " + store.state.user.access,
        },
        data: {
          username: store.state.user.username,
          parentId: paths.value[path_level.value].id,
          fileId: id,
          filenameNew: value,
          language: getCurrentLanguage(),
        },
        success(resp){
            if(resp.error_message !== 'success'){
              ElMessage({
                message: resp.error_message,
                type: 'error',
              })
            }else{
              ElMessage({
                message: t('fileDisk.renamed'),
                type: 'success',
              })
              refreshCurrentDirectory();
              store.commit("setReadingFileName", value);
            }
        },
        error: showHttpError
    })
    }

    const confirmRenameDialog = () => {
      const value = rename_draft.value;
      const validationMessage = validateRenameValue(rename_dialog_type.value, value);

      if (validationMessage) {
        rename_validation_message.value = validationMessage;
        nextTick(() => rename_input_ref.value?.focus?.());
        return;
      }

      const targetType = rename_dialog_type.value;
      const targetId = rename_target_id.value;
      closeRenameDialog('confirm');

      if (targetType === 'directory') {
        requestModifyDirectoryName(targetId, value);
      } else {
        requestModifyFileName(targetId, value);
      }
    }

    const submitModifyDirectory = (id, name) => {
      openRenameDialog('directory', id, name);
    }

    const submitModifyFileName = (id, name) => {
      openRenameDialog('file', id, name);
    }

    const openDeleteDialog = (type, id, name) => {
      delete_dialog_type.value = type;
      delete_target_id.value = id;
      delete_target_name.value = name;
      delete_dialog_visible.value = true;
    }

    const closeDeleteDialog = () => {
      delete_dialog_visible.value = false;
    }

    const resetDeleteDialogState = () => {
      delete_dialog_type.value = 'directory';
      delete_target_id.value = null;
      delete_target_name.value = '';
    }

    const confirmDeleteDialog = () => {
      const targetType = delete_dialog_type.value;
      const targetId = delete_target_id.value;
      closeDeleteDialog();

      if (targetType === 'directory') {
        submitDeleteDirectory(targetId);
      } else {
        submitDeleteFile(targetId);
      }
    }

    const submitCreateDirectory = () => {
      $.ajax({
        url: `${BASE_URL}/api/directory/create/`,
        type: "POST",
        headers: {
            Authorization:"Bearer " + store.state.user.access,
        },
        data: {
          name: new_dir_name.value,
          parent_id: paths.value[path_level.value].id,
          username: store.state.user.username,
          language: getCurrentLanguage(),
        },
        success(resp){
            if(resp.error_message !== 'success'){
                ElMessage({
                  message: resp.error_message,
                  type: 'error',
                })
            }else{
              refreshCurrentDirectory();
            }
        },
        error: showHttpError
     })
     new_dir_name.value = '';
    }

    const submitDeleteDirectory = (id) => {
      $.ajax({
        url: `${BASE_URL}/api/directory/delete/`,
        type: "POST",
        headers: {
            Authorization:"Bearer " + store.state.user.access,
        },
        data: {
          id: id,
          language: getCurrentLanguage(),
        },
        success(resp){
            if(resp.error_message !== 'success'){
              ElMessage({
                message: resp.error_message,
                type: 'error',
              })
            }else{
              refreshCurrentDirectory();
              ElMessage({
                message: t('fileDisk.deleted'),
                type: 'success',
              })
            }
        },
        error: showHttpError
     })
    }

    const submitDeleteFile = (id) => {
      $.ajax({
        url: `${BASE_URL}/api/file/delete/`,
        type: "POST",
        headers: {
            Authorization:"Bearer " + store.state.user.access,
        },
        data: {
          id: id,
          username: store.state.user.username,
          language: getCurrentLanguage(),
        },
        success(resp){
            if(resp.error_message !== 'success'){
              ElMessage({
                message: resp.error_message,
                type: 'error',
              })
            }else{
              refreshCurrentDirectory();
              ElMessage({
                message: t('fileDisk.deleted'),
                type: 'success',
              })
            }
        },
        error: showHttpError
     })
    }

    const requestDirectoryById = (id, onSuccess, resetSort = false) => {
      loadDirectory({
        url: `${BASE_URL}/api/directory/id/`,
        data: {
          parent_id: id,
          username: store.state.user.username,
        },
        onSuccess,
        resetSort,
      });
    }

    const refreshCurrentDirectory = () => {
      const currentPath = getCurrentPath();
      if (!currentPath) {
        requestDirectoryRoot();
        return;
      }
      requestDirectoryById(currentPath.id);
    }

    const requestDirectoryRoot = (resetSort = true) => {
      loadDirectory({
        url: `${BASE_URL}/api/directory/init/`,
        data: {
          username: store.state.user.username,
        },
        onSuccess(resp) {
          store.dispatch("refreshPathsInfo", {
            path_level: 0,
            paths: [{
              level: 0,
              id: Number(resp.root_id),
              name: "root",
            }],
          });
        },
        resetSort,
      });
    }

    const buildNextPathsInfo = (path_level, directory_id, directory_name, go_back) => {
      let pathsOld = Array.from(store.state.file.paths);
      if (go_back) {
        pathsOld.splice(path_level + 1)
        return { path_level, paths: pathsOld };
      }

      const nextPathLevel = path_level + 1;
      pathsOld.splice(nextPathLevel);
      pathsOld.push({
        level: nextPathLevel,
        id: directory_id,
        name: directory_name,
      });

      return { path_level: nextPathLevel, paths: pathsOld };
    }

    const refresh = (path_level, directory_id, directory_name, go_back) => {
      const nextPathsInfo = buildNextPathsInfo(path_level, directory_id, directory_name, go_back);
      requestDirectoryById(directory_id, () => {
        store.dispatch("refreshPathsInfo", nextPathsInfo);
      }, true);
    }

    const refreshCurrentPath = () => {
      refreshCurrentDirectory();
    }

    const judgeDiskOrToLogin = () => {
      if(is_logined.value){
        if(store.state.firstLogin){
          requestDirectoryRoot();
          store.commit("cleanFirstLogin");
        }else refreshCurrentDirectory();
      }
      store.commit("cleanAutoLogin");
    }

    watch(() => store.state.autoLogin, (autoLogin) => {
      if (autoLogin) {
        judgeDiskOrToLogin();
      }
    })
    watch(rename_draft, () => {
      if (rename_validation_message.value) {
        rename_validation_message.value = '';
      }
    })

    onMounted(() => { judgeDiskOrToLogin(); })
    onBeforeUnmount(() => { abortActiveDirectoryRequest(); })

    const fileList = ref([]);
    const elFileList = ref([]);
    let percentage = ref(0);

    const getSTS = (string_of_path, filename) => {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `${BASE_URL}/api/oss/sts/`,
          type: 'GET',
          headers: {
            Authorization: 'Bearer ' + store.state.user.access,
          },
          data: {
            username: store.state.user.username,
            string_of_path: string_of_path,
            filename: filename,
            parent_id: paths.value[path_level.value].id,
            language: getCurrentLanguage(),
          },
          success(resp) {
            if (resp.error_message !== 'success'&& resp.error_message !== 'same_file_name'){
              ElMessage.error(resp.error_message)
              reject(new Error('STS error'))
            }
            if (resp.error_message === 'same_file_name') {
              ElMessage.warning(t('fileDisk.overwriteSameName'))
            }
            resolve(resp)
          },
          error(resp) {
            const message = getHttpErrorMessage(t, resp.status)
            ElMessage.error(message)
            reject(new Error(message))
          },
        })
      })
    }

    const createOssClient = (sts) => {
      return new OSS({
        region: sts.region,
        bucket: sts.bucket,
        accessKeyId: sts.accessKeyId,
        accessKeySecret: sts.accessKeySecret,
        stsToken: sts.securityToken,
      })
    }

    const handleChange = (file, files) => {
      fileList.value = files.map(f => f.raw);
      elFileList.value = [...files];
    }

    const handleRemove = (file, files) => {
      fileList.value = files.map(f => f.raw);
      elFileList.value = [...files];
    }

    const uploadAll = async () => {
      percentage.value = 0;
      const total = fileList.value.length;
      let uploadedCount = 0;
      if (total === 0){
        ElMessage.warning(t('fileDisk.noFileSelected'))
      } else {
        show_upload_progress.value = true
        for (const file of [...fileList.value]) {
          try {
            await uploadFile(file);
            fileList.value = fileList.value.filter(f => f !== file);
            elFileList.value = elFileList.value.filter(item => item.raw !== file);
            uploadedCount += 1;
            percentage.value = Math.floor(uploadedCount / total * 100);
          } catch (err) {
            console.warn('Upload failed but handled:', file.name)
          }
        }
        refreshCurrentDirectory();
        if (fileList.value.length !== 0) percentage.value = 0;
      }
    }

    const insertFileInfo = (string_of_path, filename) => {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `${BASE_URL}/api/file/insert/`,
          type: 'POST',
          headers: {
            Authorization: 'Bearer ' + store.state.user.access,
          },
          data: {
            username: store.state.user.username,
            string_of_path: string_of_path,
            filename: filename,
            parent_id: paths.value[path_level.value].id,
            language: getCurrentLanguage(),
          },
          success(resp) {
            if (resp.error_message !== 'success') {
              ElMessage.error(t('common.networkError'))
              reject(new Error('Insert File Info error'))
            } else {
              resolve(resp)
            }
          },
          error(resp) {
            const message = getHttpErrorMessage(t, resp.status)
            ElMessage.error(message)
            reject(new Error(message))
          },
        })
      })
    }

    const uploadFile = async (file) => {
      const string_of_path = paths.value.map((path) => `${path.name}/`).join('');

      try {
        const sts = await getSTS(string_of_path, file.name);

        if (sts === null) {
          throw new Error('STS not ready')
        }

        let client = createOssClient(sts);

        await client.multipartUpload(sts.objectKey, file)

        await insertFileInfo(string_of_path, file.name);

        ElMessage.success(t('fileDisk.uploadSuccess', { name: file.name }))

      } catch (err) {
        console.error(err)
        show_upload_progress.value = false
        ElMessage.error(t('fileDisk.uploadFailed', { name: file.name }))
        throw err
      }
    }

    const setReadingFileInfo = (id, file_name) => {
        store.commit("setReadingFileId", id);
        store.commit("setReadingFileName", file_name);
        ElMessage.success(t('fileDisk.selected'));
    }

    const getFileURL = (id) => {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `${BASE_URL}/api/file/url/`,
          type: "POST",
          headers: {
            Authorization: "Bearer " + store.state.user.access,
          },
          data: {
            id: id,
            username: store.state.user.username,
            language: getCurrentLanguage(),
          },
          success(resp) {
            if (resp.error_message !== 'success') {
              ElMessage.error(resp.error_message)
              reject(new Error(resp.error_message))
            } else resolve(resp.url)
          },
          error(resp) {
            const message = getHttpErrorMessage(t, resp.status)
            ElMessage.error(message)
            reject(new Error(message))
          }
        })
      })
    }

    const downloadFile = async (id, file_name) => {
        try {
            const a = document.createElement('a');
            a.href = await getFileURL(id);
            a.download = file_name;
            a.rel = 'noopener';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            ElMessage({
                message: t('fileDisk.downloadStarted'),
                type: 'success',
            });
        } catch (error) {
            ElMessage.error(t('common.networkError'));
        }
    }

    return{
      t,
      is_logined,
      path_level,
      paths,
      directories,
      files,
      sort_keys: SORT_KEYS,
      sort_directions: SORT_DIRECTIONS,
      mobile_sort_visible,
      mobile_sort_options,
      mobile_current_sort_label,
      mobile_sort_trigger_label,
      is_default_sort,
      isSortActive,
      getSortDirection,
      getSortButtonTitle,
      isMobileSortOptionActive,
      openMobileSortSheet,
      applyMobileSortOption,
      toggleSort,
      show_directory_feedback,
      directory_feedback_message,
      directory_feedback_detail,
      directory_feedback_tone,
      new_dir_name,
      show_upload_progress,
      upload_dialog_visible,
      rename_input_ref,
      rename_dialog_visible,
      rename_dialog_type,
      rename_dialog_target_label,
      rename_dialog_title,
      rename_original_name,
      rename_draft,
      rename_validation_message,
      delete_dialog_visible,
      delete_dialog_type,
      delete_dialog_target_label,
      delete_dialog_title,
      delete_target_name,
      selection_value,
      selection_options,
      displayPathName,
      elFileList,
      percentage,
      go_to_login,
      openUploadDialog,
      resetUploadDialogState,
      openRenameDialog,
      cancelRenameDialog,
      confirmRenameDialog,
      handleRenameDialogClosed,
      openDeleteDialog,
      closeDeleteDialog,
      resetDeleteDialogState,
      confirmDeleteDialog,
      submitCreateDirectory,
      submitDeleteDirectory,
      submitModifyDirectory,
      submitModifyFileName,
      submitDeleteFile,
      requestDirectoryRoot,
      refresh,
      refreshCurrentPath,
      handleChange,
      handleRemove,
      uploadAll,
      setReadingFileInfo,
      downloadFile,
    }
  }
}
</script>

<style scoped>
div.content-field.file-disk-page {
  margin-top: 8px;
  padding: 10px 14px 14px;
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  background: var(--content-panel-bg);
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  --entry-meta-width: 9rem;
  --entry-actions-width: 7rem;
}

div.content-field.login-reminder-field {
  margin-top: 20px;
}

.login-reminder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

div.content-field.login-reminder-field :deep(.card) {
  width: min(100%, 28rem);
  margin: 0 auto;
}

:deep(.login-reminder-button.el-button) {
  min-width: 7.5rem;
  max-width: 100%;
  min-height: 2.45rem;
  padding: 0 1.05rem;
  border-width: 1px;
  border-color: color-mix(in srgb, var(--border-accent) 72%, var(--border-soft));
  border-radius: 999px;
  background: linear-gradient(180deg, var(--surface-card-strong) 0%, var(--surface-accent-strong) 100%);
  color: var(--accent-strong);
  font-size: 0.94rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--accent-soft) 60%, transparent);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

:deep(.login-reminder-button.el-button:focus),
:deep(.login-reminder-button.el-button:focus-visible) {
  border-color: var(--border-accent);
  background: linear-gradient(180deg, var(--surface-card-strong) 0%, var(--surface-accent-strong) 100%);
  color: var(--accent-strong);
}

:deep(.login-reminder-button.el-button:focus:active),
:deep(.login-reminder-button.el-button:focus-visible:active) {
  transform: translateY(1px);
  background: linear-gradient(180deg, var(--surface-soft-hover) 0%, var(--surface-accent-strong) 100%);
  box-shadow: 0 6px 14px color-mix(in srgb, var(--accent-soft) 55%, transparent);
}

.disk-card-body {
  padding: 0;
}

.disk-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.breadcrumb-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 24rem;
  min-width: 0;
}

.breadcrumb-scroll {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 2.25rem;
  overflow-x: auto;
  overflow-y: visible;
  padding: 0;
}

:deep(.breadcrumb-scroll .el-breadcrumb) {
  display: flex;
  flex-wrap: nowrap;
  width: max-content;
  min-width: 100%;
  align-items: center;
  min-height: 1.9rem;
}

:deep(.breadcrumb-scroll .el-breadcrumb__item) {
  display: inline-flex;
  align-items: center;
}

:deep(.ep-breadcrumb-item .el-breadcrumb__inner) {
  display: inline-flex;
  align-items: center;
  max-width: min(18rem, 50vw);
  min-width: 0;
  min-height: 1.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-secondary);
  transition: color 0.15s ease;
}

:deep(.breadcrumb-scroll .el-breadcrumb__separator) {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  font-size: 1rem;
  line-height: 1.5;
}

:deep(.ep-breadcrumb-item .el-breadcrumb__inner:hover) {
  color: var(--accent-strong);
}

.breadcrumb-item-text {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}

.page-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-card-strong);
  color: var(--text-secondary);
  line-height: 1;
  transition: color 0.15s ease, transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}

.icon-action:hover {
  color: var(--accent-strong);
  border-color: var(--border-accent);
  background: var(--surface-soft-hover);
  transform: translateY(-1px);
}

.icon-action--plain {
  width: 2.25rem;
  height: 2.25rem;
}

.mobile-sort-trigger {
  display: none;
}

.mobile-sort-trigger--active {
  border-color: var(--border-accent);
  background: var(--surface-accent);
  color: var(--accent-strong);
}

.icon-action--danger {
  border-color: var(--border-strong);
  background: var(--surface-card-strong);
  color: var(--text-secondary);
}

.icon-action--danger:hover {
  border-color: color-mix(in srgb, var(--danger) 42%, var(--border-strong));
  background: color-mix(in srgb, var(--danger) 12%, var(--surface-soft-hover));
  color: color-mix(in srgb, var(--danger) 92%, var(--text-primary));
}

.table-header {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.directory-feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 240px;
  margin: 12px 0 6px;
  padding: 28px 20px;
  border-radius: 18px;
  text-align: center;
}

.directory-feedback__message {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-secondary);
  line-height: 1.5;
}

.directory-feedback__detail {
  max-width: 32rem;
  color: var(--text-muted);
  font-size: 0.86rem;
  line-height: 1.6;
  word-break: break-word;
}

.directory-feedback--loading .directory-feedback__message {
  color: var(--text-muted);
  animation: directory-feedback-pulse 1.15s ease-in-out infinite alternate;
}

.directory-feedback--error .directory-feedback__message {
  color: color-mix(in srgb, var(--danger) 88%, var(--text-primary));
}

.entry-card + .entry-card {
  margin-top: 6px;
}

@keyframes directory-feedback-pulse {
  from {
    opacity: 0.6;
  }

  to {
    opacity: 1;
  }
}

.entry-row {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) var(--entry-meta-width) var(--entry-meta-width) var(--entry-actions-width);
  align-items: center;
  gap: 10px;
  padding: 8px 11px;
  border: 1px solid var(--border-muted);
  border-radius: 12px;
  background: var(--surface-card-strong);
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.entry-card:hover .entry-row {
  background: var(--surface-soft-hover);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-accent);
}

.entry-row--header {
  margin: 8px 0 4px;
  padding: 0 12px;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.entry-name {
  min-width: 0;
}

.entry-sort-button {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  min-width: 0;
  width: 100%;
  padding: 6px 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  text-align: left;
  transition: transform 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, background-color 0.15s ease;
}

.entry-sort-button:focus {
  outline: none;
}

.entry-sort-button:focus-visible {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-soft) 88%, transparent);
}

.entry-sort-button:hover {
  transform: translateY(-1px);
}

.entry-sort-button:active {
  transform: translateY(1px);
}

.entry-sort-button.is-active {
  color: var(--text-secondary);
}

.entry-sort-button__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-sort-button__indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 0.95rem;
  height: 0.95rem;
  color: var(--text-faint);
  opacity: 0.55;
  transition: opacity 0.15s ease, color 0.15s ease;
}

.entry-sort-button:hover .entry-sort-button__indicator,
.entry-sort-button.is-active .entry-sort-button__indicator {
  opacity: 1;
}

.entry-sort-button__indicator.is-asc,
.entry-sort-button__indicator.is-desc {
  color: var(--accent-strong);
}

.entry-name {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
}

.entry-name--interactive:hover {
  color: var(--accent-strong);
}

.entry-name__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.93rem;
  font-weight: 600;
}

.entry-icon {
  flex-shrink: 0;
}

.entry-type-badge {
  flex-shrink: 0;
  min-width: 2.75rem;
  padding: 0.12rem 0.4rem;
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--text-secondary);
  font-size: 0.66rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.04em;
}

.entry-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.entry-meta__label {
  display: none;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.entry-meta__value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-meta--placeholder {
  color: transparent;
  user-select: none;
}

.entry-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  gap: 0;
  min-width: max-content;
}

.entry-actions .icon-action {
  width: 2rem;
  height: 2rem;
}

.entry-actions--header {
  justify-content: flex-end;
  color: var(--text-muted);
}

:deep(.el-popover__reference) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-divider--vertical) {
  height: 14px;
  margin: 0 1px;
}

.upload-dialog__shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
  --upload-switcher-radius: 18px;
  --upload-accent-surface: color-mix(in srgb, var(--accent) 6%, var(--surface-accent-strong));
  --upload-accent-surface-hover: color-mix(in srgb, var(--accent) 10%, var(--surface-soft-hover));
  --upload-accent-surface-disabled: color-mix(in srgb, var(--accent) 5%, var(--surface-card-muted));
}

.upload-switcher {
  display: flex;
  justify-content: center;
  padding: 2px 0 0;
}

.upload-switcher__frame {
  padding: 6px;
  border: 1px solid color-mix(in srgb, var(--border-soft) 82%, transparent);
  border-radius: var(--upload-switcher-radius);
  background: var(--upload-accent-surface);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 18%, transparent);
}

.upload-glass-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--border-soft) 82%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface-card-strong) 92%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 28%, transparent);
}

.upload-glass-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-glass-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 15px;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 24%, transparent);
}

.upload-glass-card__icon--directory {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 14%, transparent),
    color-mix(in srgb, var(--surface-card-strong) 70%, transparent)
  );
  color: var(--accent-strong);
}

.upload-glass-card__icon--file {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent-soft) 82%, transparent),
    color-mix(in srgb, var(--surface-card-strong) 68%, transparent)
  );
  color: var(--text-accent);
}

.upload-glass-card__heading {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.upload-glass-card__title {
  margin: 0;
  font-size: 1.04rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
}

.upload-glass-card__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.5rem;
  padding: 0 0.55rem;
  border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--border-soft));
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 10%, transparent),
    color-mix(in srgb, var(--surface-card-strong) 60%, transparent)
  );
  color: var(--accent-strong);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.upload-glass-card__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.upload-glass-card--file .upload-glass-card__body {
  gap: 0px;
}

.upload-form-item {
  margin-bottom: 0;
}

.upload-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.upload-actions--file {
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-progress {
  flex: 1 1 12rem;
  min-width: min(100%, 12rem);
}

.upload-actions--file .upload-progress {
  width: 100%;
  margin-right: 0;
}

.mobile-sort-sheet {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  padding: 10px 14px calc(16px + env(safe-area-inset-bottom));
  background: transparent;
}

.mobile-sort-sheet__handle {
  align-self: center;
  width: 2.5rem;
  height: 0.3rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--border-strong) 58%, var(--text-faint));
}

.mobile-sort-sheet__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-sort-sheet__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.mobile-sort-sheet__current {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.mobile-sort-sheet__options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow-y: auto;
}

.mobile-sort-option {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid color-mix(in srgb, var(--border-soft) 86%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--surface-card-strong) 92%, transparent);
  color: var(--text-secondary);
  text-align: left;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 28%, transparent);
  transition: transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

.mobile-sort-option:hover {
  transform: translateY(-1px);
  border-color: var(--border-accent);
  background: var(--surface-soft-hover);
}

.mobile-sort-option:active {
  transform: translateY(1px);
}

.mobile-sort-option.is-active {
  border-color: color-mix(in srgb, var(--accent) 28%, var(--border-accent));
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 10%, var(--surface-card-strong)) 0%,
    color-mix(in srgb, var(--accent-soft) 68%, var(--surface-elevated)) 100%
  );
  color: var(--accent-strong);
  box-shadow:
    0 10px 22px color-mix(in srgb, var(--accent-soft) 46%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 18%, transparent);
}

.mobile-sort-option__label {
  min-width: 0;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.35;
}

.mobile-sort-option__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.15rem;
  height: 1.15rem;
}

.disk-action-shell {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.disk-action-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.disk-action-heading {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.disk-action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 14px;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 36%, transparent);
}

.disk-action-icon--directory {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 16%, transparent),
    color-mix(in srgb, var(--surface-card-strong) 72%, transparent)
  );
  color: var(--accent-strong);
}

.disk-action-icon--file {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent-soft) 80%, transparent),
    color-mix(in srgb, var(--surface-card-strong) 70%, transparent)
  );
  color: var(--text-accent);
}

.disk-action-icon--danger {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--danger) 16%, transparent),
    color-mix(in srgb, var(--surface-card-strong) 72%, transparent)
  );
  color: color-mix(in srgb, var(--danger) 90%, var(--text-primary));
}

.disk-action-title {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
}

.disk-action-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.5rem;
  padding: 0 0.55rem;
  border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--border-soft));
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 12%, transparent),
    color-mix(in srgb, var(--surface-card-strong) 62%, transparent)
  );
  color: var(--accent-strong);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.disk-action-chip--danger {
  border-color: color-mix(in srgb, var(--danger) 22%, var(--border-soft));
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--danger) 12%, transparent),
    color-mix(in srgb, var(--surface-card-strong) 62%, transparent)
  );
  color: color-mix(in srgb, var(--danger) 86%, var(--text-primary));
}

.disk-action-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--border-soft) 82%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--surface-card-strong) 92%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 28%, transparent);
}

.disk-action-panel--danger {
  border-color: color-mix(in srgb, var(--danger) 16%, var(--border-soft));
}

.disk-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.disk-action-row__label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.disk-action-row__value {
  min-width: 0;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
}

.disk-action-field {
  display: flex;
  flex-direction: column;
}

.disk-action-field__label {
  margin-bottom: 5px;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.disk-action-error {
  margin: 6px 2px 0;
  font-size: 0.76rem;
  line-height: 1.45;
  color: var(--danger);
  font-weight: 600;
}

.disk-action-warning {
  padding: 8px 10px;
  border: 1px solid color-mix(in srgb, var(--danger) 16%, var(--border-soft));
  border-radius: 12px;
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--danger) 12%, transparent),
      color-mix(in srgb, var(--surface-card-strong) 56%, transparent)
    );
  backdrop-filter: blur(10px) saturate(145%);
  -webkit-backdrop-filter: blur(10px) saturate(145%);
  color: color-mix(in srgb, var(--danger) 84%, var(--text-primary));
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.45;
}

.disk-action-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}

.disk-dialog-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 6.75rem;
  min-height: 2.6rem;
  padding: 0.58rem 0.95rem;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-card-muted);
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;
}

.disk-dialog-button:hover {
  transform: translateY(-1px);
}

.disk-dialog-button:disabled,
.disk-dialog-button:disabled:hover {
  transform: none;
  cursor: not-allowed;
  box-shadow: none;
}

.disk-dialog-button--ghost:hover {
  border-color: var(--border-accent);
  background: var(--surface-soft-hover);
}

.disk-dialog-button--ghost-danger {
  border-color: color-mix(in srgb, var(--danger) 22%, var(--border-strong));
  background: color-mix(in srgb, var(--danger) 4%, var(--surface-card-muted));
  color: color-mix(in srgb, var(--danger) 78%, var(--text-primary));
}

.disk-dialog-button--ghost-danger:hover {
  border-color: color-mix(in srgb, var(--danger) 36%, var(--border-strong));
  background: color-mix(in srgb, var(--danger) 8%, var(--surface-soft-hover));
  color: color-mix(in srgb, var(--danger) 88%, var(--text-primary));
}

.disk-dialog-button--accent {
  border-color: color-mix(in srgb, var(--accent-strong) 34%, var(--border-accent));
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--accent) 14%, var(--surface-card-strong)) 0%,
    color-mix(in srgb, var(--accent) 10%, var(--surface-accent-strong)) 100%
  );
  color: var(--accent-strong);
  box-shadow: 0 12px 22px color-mix(in srgb, var(--accent-soft) 90%, transparent);
}

.disk-dialog-button--accent:hover {
  border-color: color-mix(in srgb, var(--accent-strong) 52%, var(--border-accent));
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--accent) 20%, var(--surface-card-strong)) 0%,
    color-mix(in srgb, var(--accent) 14%, var(--surface-soft-hover)) 100%
  );
}

.disk-dialog-button--accent:disabled,
.disk-dialog-button--accent:disabled:hover {
  border-color: color-mix(in srgb, var(--accent) 16%, var(--border-soft));
  background: color-mix(in srgb, var(--accent) 7%, var(--surface-card-muted));
  color: color-mix(in srgb, var(--accent-strong) 62%, var(--text-muted));
}

.disk-dialog-button--danger {
  border-color: color-mix(in srgb, var(--danger) 34%, var(--border-strong));
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--danger) 14%, var(--surface-card-strong)) 0%,
    color-mix(in srgb, var(--danger) 11%, var(--surface-card-muted)) 100%
  );
  color: color-mix(in srgb, var(--danger) 90%, var(--text-primary));
  box-shadow: 0 12px 22px color-mix(in srgb, var(--danger) 12%, transparent);
}

.disk-dialog-button--danger:hover {
  border-color: color-mix(in srgb, var(--danger) 52%, var(--border-strong));
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--danger) 18%, var(--surface-card-strong)) 0%,
    color-mix(in srgb, var(--danger) 15%, var(--surface-soft-hover)) 100%
  );
}

:deep(.upload-switcher__control.el-segmented) {
  --el-segmented-bg-color: transparent;
  --el-segmented-item-selected-bg-color: color-mix(in srgb, var(--surface-card-strong) 52%, transparent);
  --el-segmented-item-selected-color: var(--text-primary);
  --el-segmented-item-hover-color: var(--text-accent);
  --el-segmented-item-hover-bg-color: color-mix(in srgb, var(--accent) 10%, var(--surface-soft-hover));
  --el-segmented-item-active-bg-color: color-mix(in srgb, var(--accent) 18%, var(--surface-soft-hover));
}

:deep(.upload-switcher__control.el-segmented .el-segmented__item-selected) {
  border-radius: var(--upload-switcher-radius);
}

:deep(.upload-switcher__control.el-segmented .el-segmented__item) {
  min-width: 7rem;
  min-height: 2.5rem;
  border-radius: var(--upload-switcher-radius);
  color: var(--text-secondary);
  font-weight: 700;
  transition: color 0.16s ease, transform 0.16s ease;
}

:deep(.upload-switcher__control.el-segmented .el-segmented__item:not(.is-disabled):not(.is-selected):hover) {
  color: var(--text-accent);
}

:deep(.upload-switcher__control.el-segmented .el-segmented__item.is-selected) {
  color: var(--text-primary);
}

:deep(.upload-form-item .el-form-item__label) {
  display: flex;
  align-items: center;
  min-height: 2.9rem;
  padding-bottom: 0;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.35;
}

:deep(.upload-form-item .el-form-item__content) {
  width: 100%;
  align-items: center;
}

:deep(.upload-dialog__input .el-input__wrapper) {
  min-height: 2.9rem;
  padding: 0 12px;
  border-radius: 14px;
  background: transparent;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--border-soft) 82%, transparent) inset;
  transition: box-shadow 0.16s ease, background 0.16s ease;
}

:deep(.upload-dialog__input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--border-accent) inset;
}

:deep(.upload-dialog__input .el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--border-accent) inset,
    0 0 0 4px color-mix(in srgb, var(--accent-soft) 88%, transparent);
}

:deep(.upload-dialog__input .el-input__inner) {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.upload-demo--glass .el-upload) {
  width: 100%;
}

:deep(.upload-demo--glass .el-upload-dragger) {
  width: 100%;
  min-height: 12.75rem;
  border-radius: 16px;
  border: 1px dashed color-mix(in srgb, var(--border-accent) 68%, var(--border-soft));
  background: transparent;
}

:deep(.upload-demo--glass .el-upload-dragger:hover) {
  border-color: var(--border-accent);
}

:deep(.upload-demo--glass .el-icon--upload) {
  margin-bottom: 10px;
  color: var(--accent-strong);
}

:deep(.upload-demo--glass .el-upload__text) {
  color: var(--text-primary);
  font-size: 0.96rem;
  font-weight: 700;
}

:deep(.upload-demo--glass .el-upload__tip) {
  margin-top: 10px;
  color: var(--text-muted);
  line-height: 1.5;
}

:deep(.upload-demo--glass .el-upload-list__item) {
  border-radius: 12px;
  background: color-mix(in srgb, var(--surface-card) 72%, transparent);
  border: 1px solid color-mix(in srgb, var(--border-soft) 78%, transparent);
}

.upload-dialog-button.disk-dialog-button--accent {
  background: var(--upload-accent-surface);
}

.upload-dialog-button.disk-dialog-button--accent:hover {
  background: var(--upload-accent-surface-hover);
}

.upload-dialog-button.disk-dialog-button--accent:disabled,
.upload-dialog-button.disk-dialog-button--accent:disabled:hover {
  background: var(--upload-accent-surface-disabled);
}

:deep(.disk-action-input .el-input__wrapper) {
  min-height: 2.8rem;
  padding: 0 12px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--surface-card-muted) 94%, transparent);
  box-shadow: 0 0 0 1px var(--border-soft) inset;
  transition: box-shadow 0.16s ease, background 0.16s ease, transform 0.16s ease;
}

:deep(.disk-action-input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--border-accent) inset;
}

:deep(.disk-action-input .el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--border-accent) inset,
    0 0 0 4px color-mix(in srgb, var(--accent-soft) 90%, transparent);
}

:deep(.disk-action-input .el-input__inner) {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 991px) {
  div.content-field.file-disk-page {
    margin-top: 6px;
    padding: 10px;
  }

  .mobile-sort-trigger {
    display: inline-flex;
  }

  .entry-row--header {
    display: none;
  }

  .entry-row {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      "name actions"
      "created created"
      "updated updated";
    gap: 10px;
    align-items: start;
  }

  .entry-name {
    grid-area: name;
    padding-top: 2px;
  }

  .entry-meta--created {
    grid-area: created;
  }

  .entry-meta--updated {
    grid-area: updated;
  }

  .entry-actions {
    grid-area: actions;
    align-self: start;
  }

  .entry-meta__label {
    display: inline-block;
  }

  .entry-card--directory .entry-meta {
    display: none;
  }
}

:deep(.mobile-sort-drawer) {
  border-radius: 22px 22px 0 0;
  background: transparent;
}

:deep(.mobile-sort-drawer .el-drawer__header) {
  display: none;
}

:deep(.mobile-sort-drawer .el-drawer__body) {
  padding: 0;
}

@media (max-width: 768px) {
  div.content-field.login-reminder-field :deep(.card) {
    width: min(100%, 32rem);
  }
}

@media (max-width: 640px) {
  :deep(.login-reminder-button.el-button) {
    width: 100%;
  }

  .disk-toolbar {
    align-items: stretch;
    margin-bottom: 8px;
  }

  .breadcrumb-wrapper {
    flex-basis: 100%;
  }

  .page-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .entry-row {
    padding: 8px 10px;
  }

  .entry-name__text {
    font-size: 0.9rem;
  }

  .entry-type-badge {
    min-width: 2.55rem;
    font-size: 0.62rem;
  }

  .upload-glass-card {
    padding: 14px;
  }

  .upload-progress {
    width: 100%;
  }

  .disk-action-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .disk-action-row__value {
    max-width: 100%;
    text-align: left;
  }
}

@media (max-width: 480px) {
  div.content-field.file-disk-page {
    margin-top: 4px;
    padding: 8px;
  }

  .disk-action-heading {
    align-items: flex-start;
  }

  .upload-glass-card__header,
  .upload-glass-card__heading,
  .upload-actions--file {
    align-items: flex-start;
    flex-direction: column;
  }

  .disk-action-footer {
    flex-direction: column-reverse;
  }

  .disk-dialog-button {
    width: 100%;
  }

}
</style>

<style>
.el-overlay.disk-action-dialog-mask {
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--accent-soft) 42%, transparent), transparent 42%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--surface-overlay) 28%, transparent),
      color-mix(in srgb, var(--surface-card) 18%, transparent)
    ) !important;
  backdrop-filter: blur(8px) saturate(120%);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
}

.el-dialog.upload-dialog {
  --el-dialog-margin-top: 8vh;
  position: relative;
  border: 1px solid color-mix(in srgb, var(--border-soft) 92%, transparent);
  border-radius: 20px;
  overflow: hidden;
  background: color-mix(in srgb, var(--surface-card-strong) 96%, transparent);
  box-shadow:
    var(--shadow-medium),
    inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 22%, transparent);
  backdrop-filter: blur(18px) saturate(165%);
  -webkit-backdrop-filter: blur(18px) saturate(165%);
}

.el-dialog.upload-dialog .el-dialog__header,
.el-dialog.upload-dialog .el-dialog__body {
  position: relative;
  z-index: 1;
}

.el-dialog.upload-dialog .el-dialog__header {
  margin-right: 0;
  padding: 16px 18px 0;
}

.el-dialog.upload-dialog .el-dialog__body {
  padding: 6px 18px 18px;
}

.el-dialog.disk-action-dialog {
  --el-dialog-margin-top: 8vh;
  --el-dialog-border-radius: 16px;
  position: relative;
  border: 1px solid color-mix(in srgb, var(--border-soft) 92%, transparent);
  border-radius: 16px;
  overflow: hidden;
  background: color-mix(in srgb, var(--surface-card-strong) 96%, transparent);
  box-shadow:
    var(--shadow-soft),
    inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 22%, transparent);
  backdrop-filter: blur(18px) saturate(165%);
  -webkit-backdrop-filter: blur(18px) saturate(165%);
}

.el-dialog.disk-action-dialog .el-dialog__header {
  display: none;
}

.el-dialog.disk-action-dialog .el-dialog__body,
.el-dialog.disk-action-dialog .el-dialog__footer {
  position: relative;
  z-index: 1;
}

.el-dialog.disk-action-dialog .el-dialog__body {
  padding: 14px 14px 6px;
}

.el-dialog.disk-action-dialog .el-dialog__footer {
  padding: 0 14px 14px;
}

@media (max-width: 480px) {
  .el-dialog.disk-action-dialog .el-dialog__body {
    padding: 12px 12px 4px;
  }

  .el-dialog.disk-action-dialog .el-dialog__footer {
    padding: 0 12px 12px;
  }
}
</style>
