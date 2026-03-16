<template>
    <div class="container content-field file-disk-page" v-if="is_logined">
        <div class="card-body disk-card-body">
          <div class="disk-toolbar">
            <div class="breadcrumb-wrapper">
              <button
                type="button"
                class="icon-action icon-action--plain"
                :aria-label="t('fileDisk.root')"
                @click="requestDirectoryRoot(false)"
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
                class="icon-action icon-action--primary"
                :aria-label="t('fileDisk.openUploadDialog')"
                @click="openUploadDialog"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-cloud-plus" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"/>
                  <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                </svg>
              </button>
              <el-divider direction="vertical" />
              <button
                type="button"
                class="icon-action"
                :aria-label="t('fileDisk.refreshDirectory')"
                @click="refreshCurrentPath"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                </svg>
              </button>
            </div>
          </div>

          <el-dialog
            v-model="upload_dialog_visible"
            append-to-body
            align-center
            width="min(92vw, 760px)"
            class="upload-dialog"
            :title="t('fileDisk.uploadTitle')"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            @closed="resetUploadDialogState"
          >
            <div class="upload-switcher">
              <el-segmented v-model="selection_value" :options="selection_options" size="large" />
            </div>
            <div class="card upload-content-card" v-if="selection_value === 'Dir'">
              <div class="card-body">
                <el-form-item :label="t('fileDisk.dirName')">
                  <el-input v-model="new_dir_name" />
                </el-form-item>
                <div class="button-container text-center">
                  <el-button type="success" disabled v-if="new_dir_name.length === 0">{{ t('fileDisk.create') }}</el-button>
                  <el-button class="ml-3" type="success" @click="submitCreateDirectory" v-if="new_dir_name.length !== 0">
                    {{ t('fileDisk.create') }}
                  </el-button>
                </div>
              </div>
            </div>
            <div class="card upload-content-card" v-if="selection_value === 'File'">
              <div class="card-body">
                <el-upload
                  class="upload-demo"
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
                <div class="button-container text-center upload-actions">
                  <el-button class="ml-3" type="success" @click="uploadAll()">
                    {{ t('common.upload') }}
                  </el-button>
                  <div class="upload-progress" v-show="show_upload_progress">
                    <el-progress :percentage="percentage" />
                  </div>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="upload-dialog__footer">
                <button type="button" class="btn btn-outline-secondary" @click="closeUploadDialog">
                  {{ t('common.close') }}
                </button>
              </div>
            </template>
          </el-dialog>

          <div class="table-header entry-row entry-row--header">
            <div class="entry-name-cell">{{ t('common.name') }}</div>
            <div class="entry-meta entry-meta--created">{{ t('fileDisk.creationTime') }}</div>
            <div class="entry-meta entry-meta--updated">{{ t('fileDisk.lastModified') }}</div>
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
                  @click="submitModifyDirectory(directory.id, directory.name)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                  </svg>
                </button>
                <el-divider direction="vertical" />
                <el-popover placement="left" trigger="click">
                  <el-button type="danger" v-on:click="submitDeleteDirectory(directory.id)">{{ t('fileDisk.confirmDelete') }}</el-button>
                  <template #reference>
                    <button type="button" class="icon-action" :aria-label="t('fileDisk.deleteDirectory')">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder-x" viewBox="0 0 16 16">
                        <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181L15.546 8H14.54l.265-2.91A1 1 0 0 0 13.81 4H2.19a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91H9v1H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zm6.339-1.577A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
                        <path d="M11.854 10.146a.5.5 0 0 0-.707.708L12.293 12l-1.146 1.146a.5.5 0 0 0 .707.708L13 12.707l1.146 1.147a.5.5 0 0 0 .708-.708L13.707 12l1.147-1.146a.5.5 0 0 0-.707-.708L13 11.293z"/>
                      </svg>
                    </button>
                  </template>
                </el-popover>
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
                  @click="submitModifyFileName(file.id, file.name)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                  </svg>
                </button>
                <el-divider direction="vertical" />
                <el-popover placement="left" trigger="click">
                  <el-button type="danger" v-on:click="submitDeleteFile(file.id)">{{ t('fileDisk.confirmDelete') }}</el-button>
                  <template #reference>
                    <button type="button" class="icon-action" :aria-label="t('fileDisk.deleteFile')">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-x" viewBox="0 0 16 16">
                        <path d="M6.854 7.146a.5.5 0 1 0-.708.708L7.293 9l-1.147 1.146a.5.5 0 0 0 .708.708L8 9.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 9l1.147-1.146a.5.5 0 0 0-.708-.708L8 8.293z"/>
                        <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                      </svg>
                    </button>
                  </template>
                </el-popover>
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
        </div>
    </div>
    <ContentField v-else class="text-center">
        {{ t('auth.loginFirst') }}
        <div><el-button type="primary" round @click="go_to_login" style="margin-top: 10px;">{{ t('common.login') }}</el-button></div>
    </ContentField>
</template>

<script>
import ContentField from '@/components/ContentField.vue';
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import router from '@/router';
import ElMessage from '@/utils/message';
import $ from 'jquery';
import OSS from 'ali-oss';
import { BASE_URL } from "@/config"

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
    let directories = ref([]);
    let files = ref([]);

    let new_dir_name = ref('');
    let show_upload_progress = ref(false);
    let upload_dialog_visible = ref(false);

    const selection_value = ref('Dir');
    const selection_options = computed(() => [
      { label: t('fileDisk.uploadTypeDirectory'), value: 'Dir' },
      { label: t('fileDisk.uploadTypeFile'), value: 'File' },
    ]);

    const displayPathName = (name) => {
      return name === 'root' ? t('fileDisk.root') : name;
    }

    const showNetworkError = () => {
      ElMessage({
        message: t('common.networkError'),
        type: 'error',
      })
    }

    const getCurrentPath = () => paths.value[path_level.value] ?? null;

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

    const closeUploadDialog = () => {
      upload_dialog_visible.value = false;
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
        error: showNetworkError
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
        error: showNetworkError
     })
    }

    const submitModifyDirectory = (id, name) => {
      ElMessageBox.prompt(t('fileDisk.changeDirectoryPrompt'), t('fileDisk.changeDirectoryTitle'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        draggable: true,

        inputValue: name,

        inputValidator(value) {
          if (value === '') return t('fileDisk.emptyText')
          else if (value === 'root' || value === 'root_parent') return t('fileDisk.invalidDirectoryName')
          return true
        },
      })
      .then(({ value }) => {
        $.ajax({
          url: `${BASE_URL}/api/directory/modify/name/`,
          type: "POST",
          headers: {
              Authorization:"Bearer " + store.state.user.access,
          },
          data: {
            id: id,
            name: value,
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
          error: showNetworkError
      })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: t('fileDisk.inputCanceled'),
        })
      })
    }

    const submitModifyFileName = (id, name) => {
      ElMessageBox.prompt(t('fileDisk.changeFilePrompt'), t('fileDisk.changeFileTitle'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        draggable: true,

        inputValue: name,

        inputValidator(value) {
          if (value === '') return t('fileDisk.emptyText')
          return true
        },
      })
      .then(({ value }) => {
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
          error: showNetworkError
      })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: t('fileDisk.inputCanceled'),
        })
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
        error: showNetworkError
     })
    }

    const requestDirectoryById = (id) => {
      $.ajax({
        url: `${BASE_URL}/api/directory/id/`,
        type: "POST",
        headers: {
            Authorization:"Bearer " + store.state.user.access,
        },
        data: {
            parent_id: id,
            username: store.state.user.username,
        },
        success(resp){
            if(resp.error_message !== 'success'){
                ElMessage({
                  message: resp.error_message,
                  type: 'error',
                })
            }else{
                directories.value = resp.directories;
                files.value = resp.files;
            }
        },
        error: showNetworkError
     })
    }

    const refreshCurrentDirectory = () => {
      const currentPath = getCurrentPath();
      if (!currentPath) return;
      requestDirectoryById(currentPath.id);
    }

    const requestDirectoryRoot = (showWelcome) => {
      $.ajax({
          url: `${BASE_URL}/api/directory/init/`,
          type: "POST",
          headers: {
              Authorization:"Bearer " + store.state.user.access,
          },
          data: {
              username: store.state.user.username,
          },
          success(resp){
              if(resp.error_message !== 'success'){
                  ElMessage({
                    message: t('common.networkError'),
                    type: 'error',
                  })
              }else{
                if (showWelcome) {
                  ElMessage({
                    message: t('fileDisk.welcomeBack'),
                    type: 'success',
                  });
                }

                directories.value = resp.directories;
                files.value = resp.files;

                store.dispatch("refreshPathsInfo", {
                  path_level: 0,
                  paths: [{
                    level: 0,
                    id: Number(resp.root_id),
                    name: "root",
                  }],
                });
              }
          },
          error: showNetworkError
      })
    }

    const refreshPaths = (path_level, directory_id, directory_name, go_back) => {
      let pathsOld = Array.from(store.state.file.paths);
      if (go_back) {
        pathsOld.splice(path_level + 1)
      } else if (pathsOld.length === 0 || pathsOld[path_level].id !== directory_id) {
        pathsOld.push({
          level: path_level + 1,
          id: directory_id,
          name: directory_name,
        })
        path_level = path_level + 1;
      } else ElMessage.warning(t('fileDisk.waitForRequest'))

      let data = {path_level, paths: pathsOld};
      store.dispatch("refreshPathsInfo", data);
    }

    const refresh = (path_level, directory_id, directory_name, go_back) => {
      requestDirectoryById(directory_id);
      refreshPaths(path_level, directory_id, directory_name, go_back);
    }

    const refreshCurrentPath = () => {
      directories.value = [];
      files.value = [];
      refreshCurrentDirectory();
    }

    if(is_logined.value){
      if(store.state.firstLogin){
        requestDirectoryRoot(true);
        store.commit("cleanFirstLogin");
      }else refreshCurrentDirectory();
    }

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
          error() {
            ElMessage.error(t('common.networkError'))
            reject(new Error('Network error'))
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
          },
          success(resp) {
            if (resp.error_message !== 'success') {
              ElMessage.error(t('common.networkError'))
              reject(new Error('Insert File Info error'))
            } else {
              resolve(resp)
            }
          },
          error() {
            ElMessage.error(t('common.networkError'))
            reject(new Error('Network error'))
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
          },
          success(resp) {
            if (resp.error_message !== 'success') {
              ElMessage.error(resp.error_message)
              reject(new Error(resp.error_message))
            } else resolve(resp.url)
          },
          error() {
            ElMessage.error(t('common.networkError'))
            reject(new Error('Network error'))
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
      new_dir_name,
      show_upload_progress,
      upload_dialog_visible,
      selection_value,
      selection_options,
      displayPathName,
      elFileList,
      percentage,
      go_to_login,
      openUploadDialog,
      closeUploadDialog,
      resetUploadDialogState,
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
  background: var(--surface-card);
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  --entry-meta-width: 9rem;
  --entry-actions-width: 7rem;
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
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  overflow-y: visible;
  padding: 0 0 4px;
}

:deep(.breadcrumb-scroll .el-breadcrumb) {
  display: flex;
  flex-wrap: nowrap;
  width: max-content;
  min-width: 100%;
  align-items: center;
  min-height: 1.9rem;
}

:deep(.ep-breadcrumb-item .el-breadcrumb__inner) {
  max-width: min(18rem, 50vw);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-secondary);
  transition: color 0.15s ease;
}

:deep(.ep-breadcrumb-item .el-breadcrumb__inner:hover) {
  color: var(--accent-strong);
}

.breadcrumb-item-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.icon-action--primary {
  background: var(--surface-accent);
}

.table-header {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.entry-card + .entry-card {
  margin-top: 6px;
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

.entry-name,
.entry-name-cell {
  min-width: 0;
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

.upload-switcher {
  display: flex;
  justify-content: center;
  padding: 10px 16px 0;
}

.upload-dialog__footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.upload-content-card {
  margin: 18px;
  border-radius: 12px;
  border-color: var(--border-muted);
  background: var(--surface-card-muted);
}

.upload-actions {
  margin-top: 15px;
}

.upload-progress {
  margin-top: 12px;
}

:deep(.upload-demo .el-upload) {
  width: 100%;
}

:deep(.upload-demo .el-upload-dragger) {
  width: 100%;
}

:deep(.upload-dialog .el-dialog) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.upload-dialog .el-dialog__header) {
  margin-right: 0;
}

:deep(.upload-dialog .el-dialog__body) {
  padding-top: 4px;
  padding-bottom: 8px;
}

@media (max-width: 991px) {
  div.content-field.file-disk-page {
    margin-top: 6px;
    padding: 10px;
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

@media (max-width: 640px) {
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

  .upload-content-card {
    margin: 12px;
  }

  .upload-progress {
    width: 100%;
  }
}

@media (max-width: 480px) {
  div.content-field.file-disk-page {
    margin-top: 4px;
    padding: 8px;
  }

  .entry-actions {
    gap: 0;
  }
}
</style>
