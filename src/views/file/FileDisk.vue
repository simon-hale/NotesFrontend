<template>
    <div class="container content-field" v-if="is_logined">
        <div class="card-body">
          <div class="row">
            <div class="col-11 breadcrumb-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16" @click="requestDirectoryRoot(false)" style="cursor: pointer;">
                <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
              </svg>
              <el-breadcrumb separator=">">
                <el-breadcrumb-item v-for="path in paths" v-bind:key="path.level" class="ep-breadcrumb-item" @click="refresh(path.level, path.id, path.name, true)" style="cursor: pointer;">{{ path.name }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="col-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-cloud-plus" viewBox="0 0 16 16" data-bs-toggle="modal" data-bs-target="#uploadBackdrop" style="cursor: pointer;">
                <path fill-rule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"/>
                <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
              </svg>
              <el-divider direction="vertical" />
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16" style="cursor: pointer;" @click="refreshCurrentPath">
                <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
              </svg>
              <div class="modal fade" id="uploadBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="uploadBackdropLabel">Upload</h5>
                    </div>
                    <div class="flex flex-col items-start gap-4 text-center" style="margin-top: 10px; margin-bottom: 10px;">
                      <el-segmented v-model="selection_value" :options="selection_options" size="large" />
                    </div>
                    <div class="card upload-content-card" v-if="selection_value === 'Dir'">
                      <div class="card-body">
                        <el-form-item label="Dir Name" :label-position="itemLabelPosition">
                          <el-input v-model="new_dir_name" />
                        </el-form-item>
                        <div class="button-container text-center">
                          <el-button type="success" disabled v-if="new_dir_name.length === 0">Create</el-button>
                          <el-button class="ml-3" type="success" @click="submitCreateDirectory" v-if="new_dir_name.length !== 0">
                            Create
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
                            Drop file here or <em>click to upload</em>
                          </div>
                          <template #tip>
                            <div class="el-upload__tip text-center">
                              No restrictions on quantity or size. But be cautious of potential bugs.
                            </div>
                          </template>
                        </el-upload>
                        <div class="button-container text-center" style="margin-top: 15px;">
                          <el-button class="ml-3" type="success" @click="uploadAll()">
                            Upload
                          </el-button>
                          <div class="upload-progress" v-show="show_upload_progress">
                            <el-progress :percentage="percentage" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="percentage = 0">Close</button>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>        
          
          <el-divider style="margin-top: 5px; margin-bottom: 5px;" />
          <div class="row table-header">
            <div class="col-7">NAME</div>
            <div class="col-2">CREATION TIME</div>
            <div class="col-2">LAST MODIFIED</div>
          </div>
          <el-divider style="margin-top: 5px; margin-bottom: 5px;" />

          <div v-for="directory in directories" v-bind:key="directory.id" class="directory">
            <div class="row">
              <div class="col-7" @click="refresh(path_level, directory.id, directory.name, false)" style="cursor: pointer; display: flex; gap: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder-fill" viewBox="0 0 16 16">
                  <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"/>
                </svg>
                {{ directory.name }}
              </div>
              <div class="col-2"></div>
              <div class="col-2"></div>
              <div class="col-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16" style="cursor: pointer;" v-on:click="submitModifyDirectory(directory.id, directory.name)">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                </svg>
                <el-divider direction="vertical" />
                <el-popover
                  placement="left"
                  trigger="click"
                >
                  <el-button type="danger" v-on:click="submitDeleteDirectory(directory.id)">Confirm Delete</el-button>
                  <template #reference>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder-x" viewBox="0 0 16 16" style="cursor: pointer;">
                      <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181L15.546 8H14.54l.265-2.91A1 1 0 0 0 13.81 4H2.19a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91H9v1H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zm6.339-1.577A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
                      <path d="M11.854 10.146a.5.5 0 0 0-.707.708L12.293 12l-1.146 1.146a.5.5 0 0 0 .707.708L13 12.707l1.146 1.147a.5.5 0 0 0 .708-.708L13.707 12l1.147-1.146a.5.5 0 0 0-.707-.708L13 11.293z"/>
                    </svg>
                  </template>
                </el-popover>
              </div>
            </div>
          </div>
          <div v-for="file in files" v-bind:key="file.id" class="file">
            <div class="row">
              <div class="col-7" style="cursor: pointer; display: flex; gap: 6px;" @click="setReadingFileInfo(file.id, file.name)">
                <svg xmlns="http://www.w3.org/2000/svg" v-if="file.type === 'pdf'" width="16" height="16" fill="currentColor" class="bi bi-filetype-pdf" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM1.6 11.85H0v3.999h.791v-1.342h.803q.43 0 .732-.173.305-.175.463-.474a1.4 1.4 0 0 0 .161-.677q0-.375-.158-.677a1.2 1.2 0 0 0-.46-.477q-.3-.18-.732-.179m.545 1.333a.8.8 0 0 1-.085.38.57.57 0 0 1-.238.241.8.8 0 0 1-.375.082H.788V12.48h.66q.327 0 .512.181.185.183.185.522m1.217-1.333v3.999h1.46q.602 0 .998-.237a1.45 1.45 0 0 0 .595-.689q.196-.45.196-1.084 0-.63-.196-1.075a1.43 1.43 0 0 0-.589-.68q-.396-.234-1.005-.234zm.791.645h.563q.371 0 .609.152a.9.9 0 0 1 .354.454q.118.302.118.753a2.3 2.3 0 0 1-.068.592 1.1 1.1 0 0 1-.196.422.8.8 0 0 1-.334.252 1.3 1.3 0 0 1-.483.082h-.563zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" v-else-if="file.type === 'md'" width="16" height="16" fill="currentColor" class="bi bi-filetype-md" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2H9v-1h3a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM.706 13.189v2.66H0V11.85h.806l1.14 2.596h.026l1.14-2.596h.8v3.999h-.716v-2.66h-.038l-.946 2.159h-.516l-.952-2.16H.706Zm3.919 2.66V11.85h1.459q.609 0 1.005.234t.589.68q.195.445.196 1.075 0 .634-.196 1.084-.197.451-.595.689-.396.237-1 .237H4.626Zm1.353-3.354h-.562v2.707h.562q.279 0 .484-.082a.8.8 0 0 0 .334-.252 1.1 1.1 0 0 0 .196-.422q.067-.252.067-.592a2.1 2.1 0 0 0-.117-.753.9.9 0 0 0-.354-.454q-.238-.152-.61-.152"/>
                </svg>
                <!-- <svg xmlns="http://www.w3.org/2000/svg" v-if="file.type === 'doc'" width="16" height="16" fill="currentColor" class="bi bi-filetype-doc" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2v-1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zm-7.839 9.166v.522q0 .384-.117.641a.86.86 0 0 1-.322.387.9.9 0 0 1-.469.126.9.9 0 0 1-.471-.126.87.87 0 0 1-.32-.386 1.55 1.55 0 0 1-.117-.642v-.522q0-.386.117-.641a.87.87 0 0 1 .32-.387.87.87 0 0 1 .471-.129q.264 0 .469.13a.86.86 0 0 1 .322.386q.117.255.117.641m.803.519v-.513q0-.565-.205-.972a1.46 1.46 0 0 0-.589-.63q-.381-.22-.917-.22-.533 0-.92.22a1.44 1.44 0 0 0-.589.627q-.204.406-.205.975v.513q0 .563.205.973.205.406.59.627.386.216.92.216.535 0 .916-.216.383-.22.59-.627.204-.41.204-.973M0 11.926v4h1.459q.603 0 .999-.238a1.45 1.45 0 0 0 .595-.689q.196-.45.196-1.084 0-.63-.196-1.075a1.43 1.43 0 0 0-.59-.68q-.395-.234-1.004-.234zm.791.645h.563q.371 0 .609.152a.9.9 0 0 1 .354.454q.118.302.118.753a2.3 2.3 0 0 1-.068.592 1.1 1.1 0 0 1-.196.422.8.8 0 0 1-.334.252 1.3 1.3 0 0 1-.483.082H.79V12.57Zm7.422.483a1.7 1.7 0 0 0-.103.633v.495q0 .369.103.627a.83.83 0 0 0 .298.393.85.85 0 0 0 .478.131.9.9 0 0 0 .401-.088.7.7 0 0 0 .273-.248.8.8 0 0 0 .117-.364h.765v.076a1.27 1.27 0 0 1-.226.674q-.205.29-.55.454a1.8 1.8 0 0 1-.786.164q-.54 0-.914-.216a1.4 1.4 0 0 1-.571-.627q-.194-.408-.194-.976v-.498q0-.568.197-.978.195-.411.571-.633.378-.223.911-.223.328 0 .607.097.28.093.489.272a1.33 1.33 0 0 1 .466.964v.073H9.78a.85.85 0 0 0-.12-.38.7.7 0 0 0-.273-.261.8.8 0 0 0-.398-.097.8.8 0 0 0-.475.138.87.87 0 0 0-.301.398"/>
                </svg> -->
                <svg xmlns="http://www.w3.org/2000/svg" v-else-if="file.type === 'docx'" width="16" height="16" fill="currentColor" class="bi bi-filetype-docx" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zm-6.839 9.688v-.522a1.5 1.5 0 0 0-.117-.641.86.86 0 0 0-.322-.387.86.86 0 0 0-.469-.129.87.87 0 0 0-.471.13.87.87 0 0 0-.32.386 1.5 1.5 0 0 0-.117.641v.522q0 .384.117.641a.87.87 0 0 0 .32.387.9.9 0 0 0 .471.126.9.9 0 0 0 .469-.126.86.86 0 0 0 .322-.386 1.55 1.55 0 0 0 .117-.642m.803-.516v.513q0 .563-.205.973a1.47 1.47 0 0 1-.589.627q-.381.216-.917.216a1.86 1.86 0 0 1-.92-.216 1.46 1.46 0 0 1-.589-.627 2.15 2.15 0 0 1-.205-.973v-.513q0-.569.205-.975.205-.411.59-.627.386-.22.92-.22.535 0 .916.22.383.219.59.63.204.406.204.972M1 15.925v-3.999h1.459q.609 0 1.005.235.396.233.589.68.196.445.196 1.074 0 .634-.196 1.084-.197.451-.595.689-.396.237-.999.237zm1.354-3.354H1.79v2.707h.563q.277 0 .483-.082a.8.8 0 0 0 .334-.252q.132-.17.196-.422a2.3 2.3 0 0 0 .068-.592q0-.45-.118-.753a.9.9 0 0 0-.354-.454q-.237-.152-.61-.152Zm6.756 1.116q0-.373.103-.633a.87.87 0 0 1 .301-.398.8.8 0 0 1 .475-.138q.225 0 .398.097a.7.7 0 0 1 .273.26.85.85 0 0 1 .12.381h.765v-.073a1.33 1.33 0 0 0-.466-.964 1.4 1.4 0 0 0-.49-.272 1.8 1.8 0 0 0-.606-.097q-.534 0-.911.223-.375.222-.571.633-.197.41-.197.978v.498q0 .568.194.976.195.406.571.627.375.216.914.216.44 0 .785-.164t.551-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.765a.8.8 0 0 1-.117.364.7.7 0 0 1-.273.248.9.9 0 0 1-.401.088.85.85 0 0 1-.478-.131.83.83 0 0 1-.298-.393 1.7 1.7 0 0 1-.103-.627zm5.092-1.76h.894l-1.275 2.006 1.254 1.992h-.908l-.85-1.415h-.035l-.852 1.415h-.862l1.24-2.015-1.228-1.984h.932l.832 1.439h.035z"/>
                </svg>
                <!-- <svg xmlns="http://www.w3.org/2000/svg" v-if="file.type === 'ppt'" width="16" height="16" fill="currentColor" class="bi bi-filetype-ppt" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM1.6 11.85H0v3.999h.791v-1.342h.803q.43 0 .732-.173.305-.175.463-.474a1.4 1.4 0 0 0 .161-.677q0-.375-.158-.677a1.2 1.2 0 0 0-.46-.477q-.3-.18-.732-.179m.545 1.333a.8.8 0 0 1-.085.38.57.57 0 0 1-.238.241.8.8 0 0 1-.375.082H.788V12.48h.66q.327 0 .512.181.185.183.185.522m2.817-1.333h-1.6v3.999h.791v-1.342h.803q.43 0 .732-.173.305-.175.463-.474.162-.302.161-.677 0-.375-.158-.677a1.2 1.2 0 0 0-.46-.477q-.3-.18-.732-.179m.545 1.333a.8.8 0 0 1-.085.38.57.57 0 0 1-.238.241.8.8 0 0 1-.375.082H4.15V12.48h.66q.327 0 .512.181.185.183.185.522m2.767-.67v3.336H7.48v-3.337H6.346v-.662h3.065v.662z"/>
                </svg> -->
                <svg xmlns="http://www.w3.org/2000/svg" v-else-if="file.type === 'pptx'" width="16" height="16" fill="currentColor" class="bi bi-filetype-pptx" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM1.5 11.85h1.6q.434 0 .732.179.302.175.46.477t.158.677-.16.677q-.159.299-.464.474a1.45 1.45 0 0 1-.732.173H2.29v1.342H1.5zm2.06 1.714a.8.8 0 0 0 .085-.381q0-.34-.185-.521-.185-.182-.513-.182h-.659v1.406h.66a.8.8 0 0 0 .374-.082.57.57 0 0 0 .238-.24m1.302-1.714h1.6q.434 0 .732.179.302.175.46.477t.158.677-.16.677q-.158.299-.464.474a1.45 1.45 0 0 1-.732.173h-.803v1.342h-.79zm2.06 1.714a.8.8 0 0 0 .085-.381q0-.34-.185-.521-.184-.182-.513-.182H5.65v1.406h.66a.8.8 0 0 0 .374-.082.57.57 0 0 0 .238-.24m2.852 2.285v-3.337h1.137v-.662H7.846v.662H8.98v3.337zm3.796-3.999h.893l-1.274 2.007 1.254 1.992h-.908l-.85-1.415h-.035l-.853 1.415h-.861l1.24-2.016-1.228-1.983h.931l.832 1.439h.035z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" v-else-if="file.type === 'xls'" width="16" height="16" fill="currentColor" class="bi bi-filetype-xls" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM6.472 15.29a1.2 1.2 0 0 1-.111-.449h.765a.58.58 0 0 0 .254.384q.106.073.25.114.143.041.319.041.246 0 .413-.07a.56.56 0 0 0 .255-.193.5.5 0 0 0 .085-.29.39.39 0 0 0-.153-.326q-.152-.12-.462-.193l-.619-.143a1.7 1.7 0 0 1-.539-.214 1 1 0 0 1-.351-.367 1.1 1.1 0 0 1-.123-.524q0-.366.19-.639.19-.272.527-.422.338-.15.777-.149.457 0 .78.152.324.153.5.41.18.255.2.566h-.75a.56.56 0 0 0-.12-.258.6.6 0 0 0-.247-.181.9.9 0 0 0-.369-.068q-.325 0-.513.152a.47.47 0 0 0-.184.384q0 .18.143.3a1 1 0 0 0 .405.175l.62.143q.326.075.566.211a1 1 0 0 1 .375.358q.135.222.135.56 0 .37-.188.656a1.2 1.2 0 0 1-.539.439q-.351.158-.858.158-.381 0-.665-.09a1.4 1.4 0 0 1-.478-.252 1.1 1.1 0 0 1-.29-.375m-2.945-3.358h-.893L1.81 13.37h-.036l-.832-1.438h-.93l1.227 1.983L0 15.931h.861l.853-1.415h.035l.85 1.415h.908L2.253 13.94zm2.727 3.325H4.557v-3.325h-.79v4h2.487z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" v-else-if="file.type === 'xlsx'" width="16" height="16" fill="currentColor" class="bi bi-filetype-xlsx" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM7.86 14.841a1.13 1.13 0 0 0 .401.823q.195.162.479.252.284.091.665.091.507 0 .858-.158.355-.158.54-.44a1.17 1.17 0 0 0 .187-.656q0-.336-.135-.56a1 1 0 0 0-.375-.357 2 2 0 0 0-.565-.21l-.621-.144a1 1 0 0 1-.405-.176.37.37 0 0 1-.143-.299q0-.234.184-.384.188-.152.513-.152.214 0 .37.068a.6.6 0 0 1 .245.181.56.56 0 0 1 .12.258h.75a1.1 1.1 0 0 0-.199-.566 1.2 1.2 0 0 0-.5-.41 1.8 1.8 0 0 0-.78-.152q-.44 0-.777.15-.336.149-.527.421-.19.273-.19.639 0 .302.123.524t.351.367q.229.143.54.213l.618.144q.31.073.462.193a.39.39 0 0 1 .153.326.5.5 0 0 1-.085.29.56.56 0 0 1-.255.193q-.168.07-.413.07-.176 0-.32-.04a.8.8 0 0 1-.249-.115.58.58 0 0 1-.255-.384zm-3.726-2.909h.893l-1.274 2.007 1.254 1.992h-.908l-.85-1.415h-.035l-.853 1.415H1.5l1.24-2.016-1.228-1.983h.931l.832 1.438h.036zm1.923 3.325h1.697v.674H5.266v-3.999h.791zm7.636-3.325h.893l-1.274 2.007 1.254 1.992h-.908l-.85-1.415h-.035l-.853 1.415h-.861l1.24-2.016-1.228-1.983h.931l.832 1.438h.036z"/>
                </svg>
                <!-- <svg xmlns="http://www.w3.org/2000/svg" v-if="file.type === 'txt'" width="16" height="16" fill="currentColor" class="bi bi-filetype-txt" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-2v-1h2a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM1.928 15.849v-3.337h1.136v-.662H0v.662h1.134v3.337zm4.689-3.999h-.894L4.9 13.289h-.035l-.832-1.439h-.932l1.228 1.983-1.24 2.016h.862l.853-1.415h.035l.85 1.415h.907l-1.253-1.992zm1.93.662v3.337h-.794v-3.337H6.619v-.662h3.064v.662H8.546Z"/>
                </svg> -->
                <svg xmlns="http://www.w3.org/2000/svg" v-else width="16" height="16" fill="currentColor" class="bi bi-file-earmark" viewBox="0 0 16 16">
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
                </svg>
                {{ file.name }}
              </div>
              <div class="col-2">{{ file.creation_time }}</div>
              <div class="col-2">{{ file.last_modified_time }}</div>
              <div class="col-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16" style="cursor: pointer;" v-on:click="submitModifyFileName(file.id, file.name)">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                </svg>
                <el-divider direction="vertical" />
                <el-popover
                  placement="left"
                  trigger="click"
                >
                  <el-button type="danger" v-on:click="submitDeleteFile(file.id)">Confirm Delete</el-button>
                  <template #reference>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-x" viewBox="0 0 16 16" style="cursor: pointer;">
                    <path d="M6.854 7.146a.5.5 0 1 0-.708.708L7.293 9l-1.147 1.146a.5.5 0 0 0 .708.708L8 9.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 9l1.147-1.146a.5.5 0 0 0-.708-.708L8 8.293z"/>
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                  </svg>
                  </template>
                </el-popover>
                <el-divider direction="vertical" />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16" @click="downloadFile(file.id, file.name)" style="cursor: pointer;">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
    </div>
    <ContentField v-else class="text-center">
        Please login first.
        <div><el-button type="primary" round @click="go_to_login" style="margin-top: 10px;">Login</el-button></div>
    </ContentField>
</template>

<script>
import ContentField from '@/components/ContentField.vue';
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import router from '@/router';
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
    let is_logined = computed(() => store.state.user.is_logined);
    let access = computed(() => store.state.user.access);
    let path_level = computed(() => store.state.file.path_level);
    let paths = computed(() => store.state.file.paths);
    let directories = ref([]);
    let files = ref([]);
    
    let new_dir_name = ref('');

    let upload = ref(false);
    let show_upload_progress = ref(false);

    const selection_value = ref('Dir');

    const selection_options = ['Dir', 'File'];

    const go_to_login = () => {
      router.push({name: 'accountmanagement'});
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
              requestDirectoryById(paths.value[path_level.value].id);
            }
        },
        error() {
          ElMessage({
            message: 'Network error...',
            type: 'error',
          })
        }
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
              requestDirectoryById(paths.value[path_level.value].id);
              ElMessage({
                message: 'Deleted',
                type: 'success',
              })
            }
        },
        error() {
          ElMessage({
            message: 'Network error...',
            type: 'error',
          })
        }
     })
    }

    const submitModifyDirectory = (id, name) => {
      ElMessageBox.prompt('Please input the new directory name here.', 'Change Directory Name', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',

        inputValue: name,

        inputValidator(value) {
          if (value === '') return 'Empty text.'
          else if (value === 'root' || value === 'root_parent') return 'This name is not allowed'
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
                requestDirectoryById(paths.value[path_level.value].id);
                ElMessage({
                  message: 'Renamed',
                  type: 'success',
                })
              }
          },
          error() {
            ElMessage({
              message: 'Network error...',
              type: 'error',
            })
          }
      })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Input canceled',
        })
      })
    }

    const submitModifyFileName = (id, name) => {
      ElMessageBox.prompt('Please input the new file name here.', 'Change File Name', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',

        inputValue: name,

        inputValidator(value) {
          if (value === '') return 'Empty text.'
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
                  message: 'Renamed',
                  type: 'success',
                })
                requestDirectoryById(paths.value[path_level.value].id);
                store.commit("setReadingFileName", value);
              }
          },
          error() {
            ElMessage({
              message: 'Network error...',
              type: 'error',
            })
          }
      })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Input canceled',
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
              requestDirectoryById(paths.value[path_level.value].id);
              ElMessage({
                message: 'Deleted',
                type: 'success',
              })
            }
        },
        error() {
          ElMessage({
            message: 'Network error...',
            type: 'error',
          })
        }
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
                directories.value = resp.directories,
                files.value = resp.files
            }
        },
        error() {
          ElMessage({
            message: 'Network error...',
            type: 'error',
          })
        }
     })
    }

    const requestDirectoryRoot = (init_bool) => {
      let root_id = ref(0);
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
                    message: 'Oops, an error occured.',
                    type: 'error',
                  })
              }else{
                if (init_bool)
                  ElMessage({
                    message: 'Welcome back.',
                    type: 'success',
                  })
                directories.value = resp.directories,
                files.value = resp.files,
                root_id.value = Number(resp.root_id)
              }
          },
          error() {
            ElMessage({
              message: 'Network error...',
              type: 'error',
            })
          }
      })
      if (init_bool) refreshPaths(store.state.file.path_level, root_id, "root", false);
      else refreshPaths(0, root_id, "root", true);
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
      } else ElMessage.warning("Please wait for network request.")

      let data = {path_level, paths: pathsOld};
      store.dispatch("refreshPathsInfo", data);
    }

    const refresh = (path_level, directory_id, directory_name, go_back) => {
      requestDirectoryById(directory_id);
      refreshPaths(path_level, directory_id, directory_name, go_back);
    }

    const refreshCurrentPath = () => {
      directories.value = [],
      files.value = []
      requestDirectoryById(paths.value[path_level.value].id);
    }

    if(is_logined.value){
      if(store.state.firstLogin){
        requestDirectoryRoot(true);
        store.commit("cleanFirstLogin");
      }else requestDirectoryById(paths.value[path_level.value].id);
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
              ElMessage.warning('Overwrite with the same name.')
            }
            resolve(resp)
          },
          error() {
            ElMessage.error('Network error...')
            reject(new Error('Network error'))
          },
        })
      })
    }

    const createOssClient = (sts) => {
      return new OSS({
        region: sts.value.region,          // oss-cn-xxx
        bucket: sts.value.bucket,
        accessKeyId: sts.value.accessKeyId,
        accessKeySecret: sts.value.accessKeySecret,
        stsToken: sts.value.securityToken,
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
      let number = ref(fileList.value.length);
      let count = ref(0);
      if (number.value === 0){
        ElMessage.warning('No File Selected.')
      } else {
        show_upload_progress.value = true
        for (const file of [...fileList.value]) {
          try {
            await uploadFile(file);
            fileList.value = fileList.value.filter(f => f !== file);
            elFileList.value = elFileList.value.filter(item => item.raw !== file);
            count.value = count.value + 1;
            percentage.value = Math.floor( count.value / number.value * 100 );
          } catch (err) {
            // 👇 这里吃掉异常，不让它继续冒泡
            console.warn('Upload failed but handled:', file.name)
            // 可以选择 continue
          }
        }
        requestDirectoryById(paths.value[path_level.value].id);
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
              ElMessage.error('Oops, Insert File Info error.')
              reject(new Error('Insert File Info error'))
            } else {
              resolve(resp)
            }
          },
          error() {
            ElMessage.error('Network error...')
            reject(new Error('Network error'))
          },
        })
      })
    }

    const uploadFile = async (file) => {

      let string_of_path = ref('');

      for (const path of paths.value) string_of_path.value += path.name + '/';

      try {

        let sts = ref(await getSTS(string_of_path.value, file.name));

        if (sts.value === null) {
          throw new Error('STS not ready')
        }

        let client = createOssClient(sts);

        await client.multipartUpload( sts.value.objectKey, file )

        await insertFileInfo(string_of_path.value, file.name);

        ElMessage.success(`Upload success: ${file.name}`)

      } catch (err) {
        console.error(err)
        show_upload_progress.value = false
        ElMessage.error(`Upload failed: ${file.name}`)
        throw err   // 如果你希望 uploadAll 感知失败
      }
    }

    const setReadingFileInfo = (id, file_name) => {
        store.commit("setReadingFileId", id);
        store.commit("setReadingFileName", file_name);
        ElMessage.success("Selected");
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
            ElMessage.error('Network error...')
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
                message: 'Download has started.',
                type: 'success',
            });
        } catch (error) {
            ElMessage.error('Network error.');
        }
    }

    return{
      is_logined,
      access,
      path_level,
      paths,
      directories,
      files,
      new_dir_name,
      ElMessage,
      upload,
      show_upload_progress,
      selection_value,
      selection_options,
      fileList,
      elFileList,
      percentage,
      go_to_login,
      submitCreateDirectory,
      submitDeleteDirectory,
      submitModifyDirectory,
      submitModifyFileName,
      submitDeleteFile,
      requestDirectoryById,
      requestDirectoryRoot,
      refreshPaths,
      refresh,
      refreshCurrentPath,
      getSTS,
      createOssClient,
      handleChange,
      handleRemove,
      uploadAll,
      insertFileInfo,
      uploadFile,
      setReadingFileInfo,
      getFileURL,
      downloadFile,
    }
  }
}
</script>

<style scoped>
/* ================================
   主内容区域
================================ */
div.content-field {
  margin-top: 20px;
  padding: 10px 20px;

  background: #ffffff;
  border-radius: 14px;
}

/* ================================
   Breadcrumb
================================ */
:deep(.ep-breadcrumb-item .el-breadcrumb__inner) {
  font-size: 1.1rem;
  color: #495057;
  transition: color 0.15s ease;
}

:deep(.ep-breadcrumb-item .el-breadcrumb__inner:hover) {
  color: #0d6efd;
}

/* breadcrumb + home icon 同一行 */
.breadcrumb-wrapper {
  display: flex;
  align-items: center;   /* 垂直居中 */
  gap: 8px;              /* 图标和路径的间距 */
}

/* SVG 轻微基线微调（可选，但推荐） */
.breadcrumb-wrapper svg {
  position: relative;
  top: 1px;
}

/* ================================
   顶部操作 Icon（上传 / 刷新）
================================ */
svg.bi {
  transition: color 0.15s ease, transform 0.15s ease;
}

svg.bi:hover {
  color: #0d6efd;
  transform: scale(1.05);
}

/* ================================
   表头行（名称 / 时间）
================================ */
.table-header {
  font-size: 17px;
  font-weight: 700;
  color: #3b4a5a;
}

/* ================================
   目录 / 文件 行样式
================================ */

/* 行 hover 区域 */
.directory .row,
.file .row {
  padding: 5px 0;
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.directory .row:hover,
.file .row:hover {
  background-color: #f8f9fa;
}

/* 名称列：图标 + 文字 对齐核心 */
.directory .col-7,
.file .col-7 {
  display: flex;          /* 关键 */
  align-items: center;    /* 关键 */
  gap: 6px;

  font-weight: 500;
  color: #28292a;
  transition: color 0.15s ease;
}

/* 名称 hover */
.directory .col-7:hover,
.file .col-7:hover {
  color: #0d6efd;
}

/* SVG 图标视觉基线微调 */
.directory .col-7 svg,
.file .col-7 svg {
  position: relative;
  /* top: 1px; */
  display: inline-block;
  vertical-align: middle;
}

/* 时间列 */
.file .col-2 {
  font-size: 13px;
  font-weight: 600;
  color: #707275;
  display: flex;          /* 关键 */
  align-items: center;    /* 关键 */
}

/* 工具列：保证整列使用 flex 且垂直居中 */
.file .col-1 {
  display: flex;
  align-items: center;      /* 垂直居中 */
  justify-content: flex-start;/* 靠右显示工具图标 */
}

/* svg 默认是 inline，会受基线影响，改为 block 消除基线偏移 */
.file .col-1 svg {
  display: block;
  width: 16px;
  height: 16px;
  line-height: 1;
}

/* 确保 Element Plus 的 popover 触发器 reference 与其它图标同一行内居中 */
:deep(.el-popover__reference) {
  display: inline-flex;     /* 保持与 svg 大小一致的布局上下文 */
  align-items: center;
  justify-content: center;
  padding: 0;               /* 去掉可能的内边距 */
  line-height: 1;
  vertical-align: middle;
}

/* 调整 Element Plus 的竖直分割线高度与对齐 */
:deep(.el-divider--vertical) {
  height: 16px;             /* 与图标高度一致（或调整为你想要的高度） */
  align-self: center;       /* 在 flex 行内垂直居中 */
  margin: 0 6px;
}

/* 如某些按钮或触发器仍有 line-height 导致偏移，可强制： */
.file .col-1 > * {
  line-height: 1;
  vertical-align: middle;
}

/* ================================
   Divider（Element Plus）
================================ */
:deep(.el-divider) {
  border-color: #e9ecef;
}

:deep(.el-divider--vertical) {
  margin: 3 3px;
}

/* ================================
   上传弹窗内容卡片
================================ */
.upload-content-card {
  margin: 20px;
  border-radius: 12px;
}

</style>