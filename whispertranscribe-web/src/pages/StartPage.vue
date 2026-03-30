<template>
  <q-page class="q-pa-md q-pa-lg-md start-wrap">
    <div class="start-header q-mb-md q-mb-lg-md">
      <div class="text-h4" style="font-weight: 400">New Clinical Transcription</div>
      <div class="text-body2 text-grey-7 q-mt-xs">
        Choose a source, add audio/video, then generate a draft transcript (prototype).
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Left column -->
      <div class="col-12 col-md-8">
        <!-- Source tabs -->
        <div class="row q-col-gutter-sm q-mb-md">
          <div v-for="tab in sourceTabs" :key="tab.id" class="col-6 col-sm-3">
            <div
              class="option-box q-pa-md text-center border-radius-8"
              :class="{ 'option-box-active': activeTab === tab.id }"
              style="border: 1px solid #e0e0e0; min-height: 88px"
              role="button"
              tabindex="0"
              @click="activeTab = tab.id"
              @keydown.enter.prevent="activeTab = tab.id"
              @keydown.space.prevent="activeTab = tab.id"
            >
              <q-icon :name="tab.icon" size="28px" class="option-icon q-mb-xs" />
              <div class="text-caption text-weight-medium">{{ tab.label }}</div>
            </div>
          </div>
        </div>

        <!-- Main card -->
        <q-card flat class="start-card">
          <q-card-section class="q-pa-md q-pa-lg-md">
            <!-- Upload file -->
            <div v-if="activeTab === 'upload'" class="column items-center q-py-md q-py-lg-md">
              <input
                ref="fileInputRef"
                type="file"
                class="file-input-hidden"
                multiple
                :accept="fileAccept"
                @change="onFileInputChange"
              />

              <div
                class="upload-drop-zone column flex-center q-pa-lg q-pa-xl-md full-width"
                :class="{ 'upload-drop-zone--active': isDragOver }"
                @dragenter.prevent="isDragOver = true"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="onDragLeave"
                @drop.prevent="onDrop"
              >
                <q-icon name="sym_o_cloud_upload" size="42px" color="grey-6" class="q-mb-sm" />
                <div class="text-body2 text-grey-7 q-mb-sm">Drag &amp; drop a file here, or</div>
                <q-btn
                  outline
                  color="primary"
                  icon="sym_o_attach_file"
                  label="Select files"
                  class="q-mb-sm default-input"
                  no-caps
                  @click="fileInputRef?.click()"
                />
                <div class="text-caption text-grey-7">
                  Select up to <strong>10</strong> files at once
                </div>
              </div>

              <div class="row items-start q-col-gutter-md full-width q-mt-md">
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">Supported file formats</div>
                  <div class="text-caption text-grey-7" style="line-height: 1.5">
                    {{ supportedFormatsLine }}
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">Selected</div>
                  <div v-if="selectedFiles.length" class="selected-files">
                    <div v-for="(f, idx) in selectedFiles" :key="idx" class="selected-file-row">
                      <q-icon name="sym_o_audio_file" size="18px" class="q-mr-sm text-grey-7" />
                      <div class="ellipsis">{{ f.name }}</div>
                    </div>
                  </div>
                  <div v-else class="text-caption text-grey-7">
                    No files selected yet.
                  </div>
                </div>
              </div>
            </div>

            <!-- Record audio -->
            <div v-else-if="activeTab === 'record'" class="column" style="min-height: 220px">
              <div class="text-body1 text-weight-medium q-mb-xs">Live Capture (prototype)</div>
              <div class="text-body2 text-grey-7 q-mb-md">
                This simulates real-time clinical transcription. When complete, open the transcript editor.
              </div>

              <div class="row q-col-gutter-md items-center">
                <q-btn
                  color="primary"
                  no-caps
                  unelevated
                  :disable="isLiveRecording"
                  :label="isLiveRecording ? 'Capturing…' : 'Start real-time capture'"
                  style="border-radius: 20px"
                  @click="startLiveCapture"
                />
                <q-btn
                  outline
                  no-caps
                  color="grey-7"
                  :disable="!isLiveRecording"
                  label="Stop"
                  style="border-radius: 20px"
                  @click="stopLiveCapture"
                />
              </div>

              <div v-if="isLiveRecording || liveTranscriptSegments.length" class="q-mt-md">
                <q-linear-progress :value="liveProgress / 100" color="primary" />
                <div class="text-caption text-grey-7 q-mt-xs">{{ liveStatus }}</div>
              </div>

              <q-input
                class="q-mt-md"
                filled
                :model-value="liveDraftText"
                type="textarea"
                readonly
                autogrow
              />

              <div v-if="!isLiveRecording && liveTranscriptSegments.length" class="q-mt-md">
                <q-btn
                  no-caps
                  outline
                  color="primary"
                  icon="sym_o_arrow_forward"
                  label="Open transcript editor"
                  style="border-radius: 20px"
                  @click="onTranscribe"
                />
              </div>
            </div>

            <!-- From the web -->
            <div v-else-if="activeTab === 'web'" class="q-py-sm">
              <div class="text-body1 text-weight-medium q-mb-xs">Add from the web</div>
              <div class="text-body2 text-grey-7 q-mb-md">
                Add videos from YouTube, Vimeo, or any other website, including direct links to files.
              </div>
              <q-input
                v-model="webUrl"
                outlined
                dense
                class="default-input"
                placeholder="E.g., https://www.youtube.com/watch?v=xxxxxxxx, https://www.example.com/video.mp4"
              />
            </div>

            <!-- Podcast library -->
            <div v-else-if="activeTab === 'podcast'" class="flex flex-center text-body2 text-grey-7" style="min-height: 220px">
              Podcast library coming soon...
            </div>
          </q-card-section>
        </q-card>

        <!-- Primary CTA -->
        <div class="row justify-end q-mt-md q-mt-lg-md">
          <q-btn
            unelevated
            no-caps
            :disable="!canTranscribe"
            :class="['text-white', 'transcribe-cta', { 'bg-gradient-animate': true, disabled: !canTranscribe }]"
            style="border-radius: 20px; padding: 8px 24px; font-size: 14px; min-width: 180px"
            :label="canTranscribe ? 'Transcribe Now' : 'Select files to continue'"
            @click="onTranscribe"
          />
        </div>
      </div>

      <!-- Right column (desktop) / below (mobile) -->
      <div class="col-12 col-md-4">
        <q-card flat class="start-sidecard">
          <q-card-section class="q-pa-md q-pa-lg-md">
            <div
              class="row items-center no-wrap cursor-pointer"
              role="button"
              tabindex="0"
              @click="showSettings = !showSettings"
              @keydown.enter.prevent="showSettings = !showSettings"
              @keydown.space.prevent="showSettings = !showSettings"
            >
              <q-icon :name="showSettings ? 'sym_o_expand_less' : 'sym_o_expand_more'" color="primary" size="20px" class="q-mr-sm" />
              <span class="text-primary text-body2 text-weight-medium">Settings</span>
              <q-space />
              <q-badge outline color="primary" class="q-ml-sm">Prototype</q-badge>
            </div>
            <q-slide-transition>
              <div v-show="showSettings" class="q-pt-md text-caption text-grey-7">
                Transcription settings will appear here.
              </div>
            </q-slide-transition>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const activeTab = ref('upload')
const router = useRouter()
const webUrl = ref('')
const showSettings = ref(false)
const fileInputRef = ref(null)
const selectedFiles = ref([])
const isDragOver = ref(false)
const isLiveRecording = ref(false)
const liveProgress = ref(0)
const liveStatus = ref('Ready')
const liveTranscriptSegments = ref([])
let liveTimer = null

const liveScriptSegments = [
  { speaker: 1, speakerLabel: 'Patient', startTime: 0, endTime: 10, text: 'My main complaint is persistent headache and fatigue for the past two weeks.' },
  { speaker: 0, speakerLabel: 'Clinician', startTime: 10, endTime: 18, text: 'Any associated symptoms like nausea, fever, or vision changes?' },
  { speaker: 1, speakerLabel: 'Patient', startTime: 18, endTime: 28, text: 'There is mild nausea, no fever, and no vision changes. The headache is worse in the evening.' },
  { speaker: 0, speakerLabel: 'Clinician', startTime: 28, endTime: 40, text: 'Have you changed medications, diet, or sleep recently?' },
  { speaker: 1, speakerLabel: 'Patient', startTime: 40, endTime: 52, text: 'I’ve had more stress at work and less sleep. No medication changes.' },
  { speaker: 0, speakerLabel: 'Clinician', startTime: 52, endTime: 68, text: 'Let’s review red flags, and we’ll plan basic labs if symptoms persist.' },
]

const liveDraftText = computed(() => liveTranscriptSegments.value.map(s => s.text).join('\n'))

const sourceTabs = [
  { id: 'upload', label: 'Upload Audio/Video', icon: 'sym_o_upload' },
  { id: 'record', label: 'Live Capture (prototype)', icon: 'sym_o_adaptive_audio_mic' },
  { id: 'web', label: 'From the Web', icon: 'sym_o_language' },
  { id: 'podcast', label: 'Podcast Library', icon: 'sym_o_podcasts' },
]

const supportedFormatsLine =
  '.3gp, .aac, .amc, .asf, .avi, .flac, .m4a, .m4b, .mkv, .mka, .mov, .mp3, .mp4, .mpeg, .mpga, .oga, .ogg, .opus, .wav, .webm, .wma, and .wmv'

const fileAccept =
  '.3gp,.aac,.amc,.asf,.avi,.flac,.m4a,.m4b,.mkv,.mka,.mov,.mp3,.mp4,.mpeg,.mpga,.oga,.ogg,.opus,.wav,.webm,.wma,.wmv'

const canTranscribe = computed(() => {
  if (selectedFiles.value.length > 0) return true
  // Enable CTA once the live capture simulation has produced a transcript
  if (!isLiveRecording.value && liveTranscriptSegments.value.length > 0) return true
  return false
})

function setFiles(fileList) {
  const files = Array.from(fileList || []).slice(0, 10)
  selectedFiles.value = files
}

function onFileInputChange(e) {
  setFiles(e.target.files)
  e.target.value = ''
}

function onDragLeave(e) {
  const related = e.relatedTarget
  if (related && e.currentTarget.contains(related)) return
  isDragOver.value = false
}

function onDrop(e) {
  isDragOver.value = false
  const dt = e.dataTransfer
  if (!dt?.files?.length) return
  setFiles(dt.files)
}

function persistMockTranscript(paragraphs) {
  // TranscriptPage will consume these and clear them once loaded (prototype flow).
  localStorage.setItem('mock-transcript-title', 'John Doe (prototype)')
  localStorage.setItem('mock-transcript-paragraphs', JSON.stringify(paragraphs))
}

function startLiveCapture() {
  stopLiveCapture()
  isLiveRecording.value = true
  liveProgress.value = 0
  liveStatus.value = 'Capturing…'
  liveTranscriptSegments.value = []

  let idx = 0
  liveTimer = setInterval(() => {
    const seg = liveScriptSegments[idx]
    if (!seg) return
    liveTranscriptSegments.value = [...liveTranscriptSegments.value, seg]
    idx += 1
    liveProgress.value = Math.min(100, Math.round((idx / liveScriptSegments.length) * 100))

    if (idx >= liveScriptSegments.length) {
      stopLiveCapture()
      liveStatus.value = 'Transcription ready.'
      // Persist now so “Open transcript editor” can load immediately.
      persistMockTranscript(liveTranscriptSegments.value)
    }
  }, 700)
}

function stopLiveCapture() {
  if (liveTimer) clearInterval(liveTimer)
  liveTimer = null
  isLiveRecording.value = false
  if (!liveTranscriptSegments.value.length) {
    liveProgress.value = 0
    liveStatus.value = 'Ready'
  }
}

function onTranscribe() {
  if (!canTranscribe.value) return

  // If live capture exists, use it; otherwise fall back to a canned clinical transcript.
  const paragraphs =
    activeTab.value === 'record' && liveTranscriptSegments.value.length
      ? liveTranscriptSegments.value
      : [
          ...liveScriptSegments,
          {
            speaker: 1,
            speakerLabel: 'Patient',
            startTime: 68,
            endTime: 76,
            text: 'I’d like a clearer plan for what to do next and whether these symptoms require urgent care.',
          },
        ]

  persistMockTranscript(paragraphs)
  router.push('/transcript/john-doe')
}
</script>

<style scoped>
.start-wrap {
  max-width: 1200px;
  margin: 0 auto;
}
.start-card,
.start-sidecard {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
}
.selected-files {
  border: 1px solid #eeeeee;
  border-radius: 10px;
  padding: 10px;
  background: #fafafa;
  max-height: 132px;
  overflow: auto;
}
.selected-file-row {
  display: flex;
  align-items: center;
  padding: 6px 6px;
  border-radius: 8px;
}
.selected-file-row + .selected-file-row {
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-input-hidden {
  display: none;
}
.upload-drop-zone {
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
.upload-drop-zone--active {
  border-color: var(--brand-primary);
  background: var(--brand-primary-bg);
}
.transcribe-cta.q-btn--disabled {
  opacity: 1 !important;
}
</style>
