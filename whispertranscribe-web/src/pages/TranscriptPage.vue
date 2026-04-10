<template>
  <q-page class="column transcript-page" style="min-height: 0">
    <!-- Page Header -->
    <div class="q-px-lg q-pt-md">
      <div class="row items-center q-mb-xs">
        <q-icon name="sym_o_arrow_back" size="16px" class="text-primary q-mr-xs cursor-pointer" @click="$router.push('/start')" />
        <span class="text-caption text-primary cursor-pointer" @click="$router.push('/start')">{{ breadcrumbRoot }}</span>
        <span class="text-caption text-grey-5 q-mx-xs">/</span>
        <span class="text-caption text-primary cursor-pointer">{{ breadcrumbSection }}</span>
        <q-space />
        <q-btn flat dense round icon="sym_o_settings" size="sm" color="grey-7" />
      </div>

      <div class="row items-center q-mb-sm">
        <span class="text-h5 text-weight-bold">{{ resolvedRecordTitle }}</span>
        <q-btn flat dense round icon="sym_o_edit_square" size="sm" color="grey-7" class="q-ml-sm" />
        <q-btn flat dense round icon="sym_o_more_vert" size="sm" color="grey-7" />
      </div>

      <!-- Main Tabs -->
      <div class="row q-gutter-x-md" style="border-bottom: 1px solid #e0e0e0">
        <div
          v-for="tab in mainTabs"
          :key="tab.value"
          class="cursor-pointer q-pb-sm"
          :class="activeTab === tab.value ? 'text-weight-medium' : 'text-grey-7'"
          :style="activeTab === tab.value ? 'border-bottom: 2px solid var(--brand-primary); color: var(--brand-primary)' : ''"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </div>
      </div>
    </div>

    <!-- Tab 1: Transcript -->
    <template v-if="activeTab === 'transcript'">
      <div class="col column" style="min-height: 0">
        <!-- Toolbar -->
        <div class="row items-center q-px-lg q-py-sm" style="border-bottom: 1px solid #f0f0f0">
          <div class="toolbar-group row items-center no-wrap q-gutter-x-xs q-mr-sm">
            <q-input
              v-model="searchText"
              dense
              outlined
              placeholder="Find and Replace"
              style="width: 220px"
              class="default-input"
            >
              <template v-slot:prepend>
                <q-icon name="sym_o_search" size="18px" />
              </template>
            </q-input>
          </div>
          <div class="toolbar-group row items-center no-wrap q-mr-sm">
            <q-btn flat dense round icon="sym_r_undo" color="grey-7" size="sm" />
            <q-btn flat dense round icon="sym_r_redo" color="grey-7" size="sm" />
          </div>
          <q-space />
          <div class="toolbar-group row items-center no-wrap">
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              :color="isEditMode ? 'primary' : 'grey-7'"
              icon="sym_o_edit_square"
              :label="isEditMode ? 'Done' : 'Edit mode'"
              @click="toggleEditMode"
            />
            <q-btn flat dense no-caps size="sm" color="grey-7" icon="sym_o_file_copy" label="Copy" />
            <q-btn flat dense no-caps size="sm" color="grey-7" icon="sym_o_translate" label="Translate" />
            <q-btn flat dense no-caps size="sm" color="grey-7" icon="sym_o_download" label="Export" />
          </div>
          <q-btn flat dense round icon="sym_o_more_vert" color="grey-7" size="sm" class="q-ml-xs" />
        </div>

        <!-- Bulk speaker assignment (edit mode only) -->
        <div v-if="isEditMode" class="q-px-lg q-mt-sm q-mb-md">
          <div class="row items-center q-col-gutter-sm">
            <div class="col-12 col-md-4">
              <q-select
                dense
                outlined
                v-model="bulkSpeakerValue"
                :options="bulkSpeakerOptions"
                option-label="label"
                option-value="value"
                label="Speaker for selected segments"
                class="default-input"
              />
            </div>
            <div class="col-auto">
              <q-btn
                no-caps
                color="primary"
                unelevated
                :disable="selectedSegments.length === 0"
                label="Apply to selected"
                style="border-radius: 20px"
                @click="applyBulkSpeaker"
              />
            </div>
            <div class="col-auto">
              <q-btn
                no-caps
                outline
                color="grey-7"
                :disable="selectedSegments.length === 0"
                label="Clear"
                style="border-radius: 20px"
                @click="selectedSegments = []"
              />
            </div>
            <div class="col-12 col-md">
              <div class="text-caption text-grey-7">
                {{ selectedSegments.length }} segment{{ selectedSegments.length === 1 ? '' : 's' }} selected
              </div>
            </div>
          </div>
        </div>

        <!-- Example actions section (prototype) -->
        <q-card v-if="segmentsToRender.length" flat bordered class="q-mx-lg q-mt-md" style="border-radius: 12px; overflow: hidden">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-mb-sm">
              <div class="text-h6 text-weight-bold">{{ exampleHeaderTitle }}</div>
              <q-space />
              <q-badge outline color="primary">Prototype</q-badge>
            </div>
            <div class="text-caption text-grey-7 q-mb-md">
              This section demonstrates how the requested features would look for a single patient. No real EMR/PDF extraction or medical advice.
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="text-body2 text-weight-medium q-mb-xs">Clinical note (SOAP)</div>
                <div class="text-caption text-grey-7 q-mb-sm">Generate a template SOAP note from the transcript.</div>
                <q-btn no-caps outline color="primary" label="Generate SOAP" style="border-radius: 20px" @click="generateSoapFromTranscript" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-body2 text-weight-medium q-mb-xs">Billing suggestions</div>
                <div class="text-caption text-grey-7 q-mb-sm">Prototype ICD-like suggestions derived from the SOAP note.</div>
                <q-btn no-caps outline color="primary" label="Generate billing codes" style="border-radius: 20px" @click="generateBillingCodes" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-body2 text-weight-medium q-mb-xs">Patient history + smart search</div>
                <div class="text-caption text-grey-7 q-mb-sm">Mocked history dataset and instant Q&A.</div>
                <q-btn
                  no-caps
                  outline
                  color="primary"
                  :label="quickAskLabel"
                  style="border-radius: 20px"
                  @click="patientQuery = quickAskQuestion; answerPatientQuery()"
                />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-body2 text-weight-medium q-mb-xs">Referral letter</div>
                <div class="text-caption text-grey-7 q-mb-sm">Draft a referral letter using the SOAP note.</div>
                <q-btn no-caps outline color="primary" label="Generate referral draft" style="border-radius: 20px" @click="generateReferralDraft" />
              </div>
              <div class="col-12">
                <div class="text-body2 text-weight-medium q-mb-xs">Docs extraction (PDF/Fax)</div>
                <div class="text-caption text-grey-7 q-mb-sm">Simulated upload + extraction summary output.</div>
                <q-btn
                  no-caps
                  outline
                  color="grey-7"
                  icon="sym_o_attach_file"
                  label="Upload a document (prototype)"
                  style="border-radius: 20px"
                  @click="docFileInputRef?.click()"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Transcript Segments -->
        <div class="col scroll q-px-lg q-py-sm">
          <SpeakerSegment
            v-for="(p, i) in segmentsToRender"
            :key="i"
            :speaker="p.speaker"
            :speaker-label="p.speakerLabel"
            :start-time="p.startTime"
            :end-time="p.endTime"
            :text="p.text"
            :edit-mode="isEditMode"
            :can-move-up="i > 0"
            :can-move-down="i < segmentsToRender.length - 1"
            :segment-selected="selectedSegments.includes(i)"
            @updateText="val => updateSegmentText(i, val)"
            @moveUp="() => moveSegmentUp(i)"
            @moveDown="() => moveSegmentDown(i)"
            @toggleSelect="val => toggleSegmentSelection(i, val)"
          />
        </div>

        <!-- SOAP clinical note -->
        <q-card v-if="segmentsToRender.length" flat bordered class="q-mt-md" style="border-radius: 12px; overflow: hidden">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="text-h6 text-weight-bold">SOAP Clinical Note</div>
              <q-space />
              <q-select
                dense
                outlined
                v-model="selectedSoapTemplateValue"
                :options="soapTemplates"
                option-label="label"
                option-value="value"
                label="Template"
                style="min-width: 220px"
                class="q-mr-sm"
              />
              <q-btn
                no-caps
                unelevated
                color="primary"
                icon="sym_o_auto_awesome"
                label="Generate SOAP"
                style="border-radius: 20px"
                @click="generateSoapFromTranscript"
              />
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="soapNote.cc"
                  outlined
                  dense
                  type="textarea"
                  autogrow
                  label="Chief Complaint (CC)"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="soapNote.symptoms"
                  outlined
                  dense
                  type="textarea"
                  autogrow
                  label="Symptoms / HPI"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="soapNote.assessment"
                  outlined
                  dense
                  type="textarea"
                  autogrow
                  label="Assessment"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="soapNote.plan"
                  outlined
                  dense
                  type="textarea"
                  autogrow
                  label="Plan"
                />
              </div>
            </div>

            <div class="q-mt-md">
              <div class="text-caption text-grey-7 q-mb-xs">Timestamp footnotes (prototype)</div>
              <div v-if="soapFootnotes.length" class="column" style="gap: 6px">
                <div v-for="(f, idx) in soapFootnotes" :key="idx" class="text-caption text-grey-7">
                  <b class="text-primary"> {{ f.marker }} </b>
                  {{ f.time }}: {{ f.excerpt }}
                </div>
              </div>
              <div v-else class="text-caption text-grey-7">Generate SOAP to add footnotes.</div>
            </div>

            <div class="text-caption text-grey-7 q-mt-md">
              Prototype-only clinical note. Do not use for real medical decisions.
            </div>
          </q-card-section>
        </q-card>

        <!-- Billing coding suggestions -->
        <q-card v-if="segmentsToRender.length" flat bordered class="q-mt-md" style="border-radius: 12px; overflow: hidden">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="text-h6 text-weight-bold">Billing Coding Suggestions</div>
              <q-space />
              <q-btn
                no-caps
                unelevated
                color="primary"
                icon="sym_o_receipt_long"
                label="Generate codes"
                style="border-radius: 20px"
                @click="generateBillingCodes"
              />
            </div>

            <div class="text-caption text-grey-7 q-mb-sm">Prototype suggestions based on the current SOAP note.</div>

            <div v-if="billingSuggestions.length" class="column" style="gap: 10px">
              <div
                v-for="(s, idx) in billingSuggestions"
                :key="idx"
                class="rounded-borders"
                style="border: 1px solid rgba(0,0,0,0.06); padding: 10px 12px"
              >
                <div class="text-body2">
                  <b class="text-primary">{{ s.code }}</b> — {{ s.label }}
                </div>
                <div class="text-caption text-grey-7" style="margin-top: 2px; line-height: 1.4">
                  {{ s.reason }}
                </div>
              </div>
            </div>
            <div v-else class="text-caption text-grey-7">Generate codes to see suggestions.</div>

            <div class="text-caption text-grey-7 q-mt-md">
              Prototype-only. Not medical or billing advice. Always verify with your coding workflow and local payer rules.
            </div>
          </q-card-section>
        </q-card>

        <!-- Patient history + smart record search -->
        <q-card v-if="segmentsToRender.length" flat bordered class="q-mt-md" style="border-radius: 12px; overflow: hidden">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="text-h6 text-weight-bold">Patient History (prototype)</div>
              <q-space />
              <q-select
                dense
                outlined
                v-model="selectedPatientId"
                :options="patientOptions"
                option-label="label"
                option-value="value"
                label="Patient"
                class="default-input"
                style="min-width: 220px"
              />
            </div>

            <div class="text-caption text-grey-7 q-mb-xs">Synthesized overview</div>
            <div class="text-body2" style="line-height: 1.7; color: #424242">
              <div v-for="(line, idx) in patientOverview" :key="idx">{{ line }}</div>
            </div>

            <div class="q-mt-md">
              <q-input
                v-model="patientQuery"
                outlined
                dense
                :label="smartSearchLabel"
                class="default-input"
                @keyup.enter="answerPatientQuery"
              />
              <div class="row items-center q-mt-sm">
                <q-btn
                  no-caps
                  unelevated
                  color="primary"
                  icon="sym_o_search"
                  label="Ask"
                  style="border-radius: 20px"
                  @click="answerPatientQuery"
                />
                <div class="text-caption text-grey-7 q-ml-sm" style="line-height: 1.4">
                  Prototype answers use mocked patient data only.
                </div>
              </div>
            </div>

            <div v-if="patientAnswer" class="q-mt-md">
              <div class="text-caption text-grey-7 q-mb-xs">Answer</div>
              <div class="rounded-borders" style="border: 1px solid rgba(0,0,0,0.06); padding: 10px 12px; background: rgba(255,255,255,0.6)">
                <div class="text-body2" style="color: #424242; white-space: pre-wrap">{{ patientAnswer }}</div>
              </div>
            </div>

            <div class="text-caption text-grey-7 q-mt-md">
              Prototype-only. Do not use for real clinical decisions.
            </div>
          </q-card-section>
        </q-card>

        <!-- Referral letter + PDF/Fax extraction (prototype) -->
        <q-card v-if="segmentsToRender.length" flat bordered class="q-mt-md" style="border-radius: 12px; overflow: hidden">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="text-h6 text-weight-bold">Referral Letter Draft (prototype)</div>
              <q-space />
              <q-btn
                no-caps
                unelevated
                color="primary"
                icon="sym_o_edit"
                label="Generate draft"
                style="border-radius: 20px"
                @click="generateReferralDraft"
              />
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="referralForm.recipient" outlined dense label="Recipient" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="referralForm.reason" outlined dense label="Reason for referral" />
              </div>
              <div class="col-12">
                <q-input
                  v-model="referralForm.requestedTests"
                  outlined
                  dense
                  label="Requested tests / considerations"
                  type="textarea"
                  autogrow
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="referralForm.summary"
                  outlined
                  dense
                  label="Clinical summary (auto-filled on generate)"
                  type="textarea"
                  autogrow
                />
              </div>
            </div>

            <div v-if="referralDraft" class="q-mt-md">
              <div class="text-caption text-grey-7 q-mb-xs">Draft output</div>
              <q-input :model-value="referralDraft" outlined type="textarea" readonly autogrow />
              <div class="text-caption text-grey-7 q-mt-sm">
                Prototype-only draft text for UI demonstration.
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card v-if="segmentsToRender.length" flat bordered class="q-mt-md" style="border-radius: 12px; overflow: hidden">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="text-h6 text-weight-bold">PDF/Fax Extraction (prototype)</div>
              <q-space />
              <q-btn
                no-caps
                unelevated
                color="primary"
                icon="sym_o_cloud_upload"
                label="Extract & summarize"
                style="border-radius: 20px"
                :disable="!docFile || docExtracting"
                @click="extractAndSummarizeDocs"
              />
            </div>

            <input
              ref="docFileInputRef"
              type="file"
              accept="application/pdf,image/*"
              style="display:none"
              @change="onDocFileChange"
            />
            <q-btn
              outline
              no-caps
              color="grey-7"
              icon="sym_o_attach_file"
              label="Upload PDF/Fax"
              style="border-radius: 20px"
              @click="docFileInputRef?.click()"
            />

            <div v-if="docFileName" class="text-caption text-grey-7 q-mt-sm">
              Selected: {{ docFileName }}
            </div>

            <div v-if="docExtractionStatus" class="text-caption text-grey-7 q-mt-sm">
              {{ docExtractionStatus }}
            </div>

            <div v-if="extractedDocSummary" class="q-mt-md">
              <div class="text-caption text-grey-7 q-mb-xs">Extracted summary (prototype)</div>
              <q-input
                :model-value="extractedDocSummary"
                outlined
                type="textarea"
                readonly
                autogrow
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Audio Player -->
        <AudioPlayer :duration="record.duration" />
      </div>
    </template>

    <!-- Tab 2: Content Hub -->
    <template v-if="activeTab === 'content'">
      <div class="col column" style="min-height: 0">
        <!-- Sub-tabs row -->
        <div class="row items-center q-px-lg q-py-sm q-gutter-x-sm no-wrap scroll-x">
          <div
            v-for="tab in contentSubTabs"
            :key="tab"
            class="tab-transcript-navigation q-px-md rounded-borders row items-center"
            :class="{ 'tab-transcript-navigation-active': activeContentTab === tab }"
            @click="activeContentTab = tab; showMagicChat = false"
          >
            {{ tab }}
          </div>
          <q-btn
            outline
            no-caps
            dense
            color="primary"
            icon="sym_o_add"
            label="New content"
            class="q-ml-sm"
            style="border-radius: 20px; white-space: nowrap"
          />
          <q-btn
            unelevated
            no-caps
            dense
            color="accent"
            text-color="white"
            class="q-ml-sm"
            style="border-radius: 20px; white-space: nowrap"
            @click="showMagicChat = !showMagicChat"
          >
            <img src="/icons/magic_staff.svg" style="width: 18px; height: 18px" class="q-mr-xs" />
            Magic Chat
          </q-btn>
        </div>

        <!-- Magic Chat view -->
        <div v-if="showMagicChat" class="col column q-px-lg q-py-md">
          <div class="text-h5 text-weight-bold q-mb-lg">Magic Chat</div>
          <q-space />
          <div class="row items-end q-gutter-x-sm">
            <q-input
              v-model="chatMessage"
              outlined
              placeholder="Ask me anything about the transcript..."
              class="col default-input"
            />
            <q-btn
              unelevated
              no-caps
              color="primary"
              label="Send"
              style="border-radius: 8px; height: 40px"
              :disable="!chatMessage.trim || chatIsOffTopic"
              @click="sendMagicChat"
            />
          </div>

          <div v-if="chatIsOffTopic && chatMessage.trim" class="q-mt-sm text-negative text-caption">
            This looks off-topic for the medical transcription prototype. Try asking about symptoms, SOAP notes, billing codes, medications, or patient history.
          </div>

          <div v-if="magicChatAnswer" class="q-mt-md">
            <div class="text-caption text-grey-7 q-mb-xs">Prototype answer</div>
            <div class="rounded-borders" style="border: 1px solid rgba(0,0,0,0.06); padding: 10px 12px; background: rgba(255,255,255,0.6); white-space: pre-wrap; color: #424242; line-height: 1.5">
              {{ magicChatAnswer }}
            </div>
          </div>
        </div>

        <!-- Content area -->
        <div v-else class="col scroll">
          <!-- Content header -->
          <div class="q-px-lg q-py-sm bg-purple-1 row items-center" style="border-bottom: 1px solid #e3d8fa">
            <span class="text-primary text-body2 text-weight-medium">{{ activeContentTab }}</span>
          </div>
          <!-- Action icons -->
          <div class="q-px-lg q-py-xs row items-center q-gutter-x-xs">
            <q-btn flat dense round icon="sym_o_file_copy" color="grey-7" size="sm" />
            <q-btn flat dense round icon="sym_o_edit_square" color="grey-7" size="sm" />
            <q-btn flat dense round icon="sym_o_refresh" color="grey-7" size="sm" />
          </div>
          <div class="q-px-lg q-pb-lg">
            <div
              v-if="activeContentBody"
              class="content-body text-body2"
              style="max-width: 800px; line-height: 1.8; color: #424242"
              v-html="renderMarkdown(activeContentBody)"
            />
            <div v-else class="text-grey-5 text-body1 q-pa-xl text-center">
              No content available for this tab yet.
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Tab 3: Visual Hub -->
    <template v-if="activeTab === 'visual'">
      <div class="col column q-px-lg q-py-md" style="min-height: 0">
        <!-- Top bar -->
        <div class="row items-center q-mb-md">
          <div class="row no-wrap q-gutter-x-sm">
            <div
              v-for="ar in aspectRatios"
              :key="ar.value"
              class="column items-center cursor-pointer q-px-xs"
              @click="aspectRatio = ar.value"
            >
              <div
                class="aspect-icon rounded-borders"
                :class="{ 'aspect-icon--active': aspectRatio === ar.value }"
                :style="ar.style"
              />
              <span class="text-caption q-mt-xs" :class="aspectRatio === ar.value ? 'text-weight-medium' : 'text-grey-7'">{{ ar.label }}</span>
            </div>
          </div>
          <q-space />
          <q-btn outline no-caps dense color="grey-7" icon="sym_o_download" label="Export history" style="border-radius: 20px" />
        </div>

        <!-- Main visual area -->
        <div class="row col q-gutter-x-lg" style="min-height: 0">
          <!-- Preview area -->
          <div class="col column" style="min-height: 0">
            <div
              class="col rounded-borders column items-center justify-center"
              style="background: #f0f0f0; min-height: 350px"
            >
              <q-icon name="sym_o_image" size="64px" color="grey-4" />
              <div class="text-caption text-grey-5 q-mt-md cursor-pointer">
                Create your first clip <q-icon name="sym_o_arrow_forward" size="14px" />
              </div>
            </div>
          </div>

          <!-- Right panel -->
          <div style="width: 340px; border: 1px solid #e0e0e0; border-radius: 12px" class="column q-pa-lg">
            <div class="text-h6 text-weight-bold text-primary text-center q-mb-md">What do you want to create?</div>

            <div class="text-body2 text-weight-medium q-mb-sm">1. Please select video clips or audiograms</div>
            <div class="row q-gutter-sm q-mb-lg justify-center">
              <div
                class="clip-type rounded-borders column items-center justify-center cursor-pointer"
                :class="{ 'clip-type-selected': clipType === 'audiogram' }"
                @click="clipType = 'audiogram'"
              >
                <q-icon name="sym_o_image" size="40px" color="dark" class="q-mb-xs" />
                <span class="text-body2 text-weight-bold">Audiogram</span>
                <span class="text-caption text-grey-7 text-center">Add text and image to your audio</span>
              </div>
              <div
                class="clip-type rounded-borders column items-center justify-center cursor-pointer"
                :class="{ 'clip-type-selected': clipType === 'video' }"
                @click="clipType = 'video'"
              >
                <q-icon name="sym_o_movie" size="40px" color="dark" class="q-mb-xs" />
                <span class="text-body2 text-weight-bold">Video Clip</span>
                <span class="text-caption text-grey-7 text-center">Create clips from your video</span>
              </div>
            </div>

            <div class="text-body2 text-weight-medium q-mb-md">2. Chose your starting point</div>
            <div class="column items-center">
              <q-btn
                unelevated
                no-caps
                color="primary"
                label="Create AI clips"
                style="border-radius: 20px; min-width: 180px"
                class="q-mb-sm"
              />
              <span class="text-caption text-grey-7 q-mb-sm">or</span>
              <q-btn
                outline
                no-caps
                color="primary"
                label="Start from scratch"
                style="border-radius: 20px; min-width: 180px"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getTranscriptById, formatTime } from '../data/transcript'
import SpeakerSegment from '../components/SpeakerSegment.vue'
import AudioPlayer from '../components/AudioPlayer.vue'

const route = useRoute()

const isJohnSmith = computed(() => route.params.id === 'john-smith')

const transcript = computed(() => getTranscriptById(route.params.id))
const record = computed(() => transcript.value.record)
const paragraphs = computed(() => transcript.value.paragraphs)
const contentItems = computed(() => transcript.value.contentItems)

const overriddenParagraphs = ref(null)
const recordTitle = ref('')

// Prototype bridge from StartPage.vue -> TranscriptPage.vue.
// If present, render the mocked transcript once and then clear it.
try {
  const raw = localStorage.getItem('mock-transcript-paragraphs')
  if (raw) {
    overriddenParagraphs.value = JSON.parse(raw)
    localStorage.removeItem('mock-transcript-paragraphs')
  }
  const rawTitle = localStorage.getItem('mock-transcript-title')
  if (rawTitle) {
    recordTitle.value = rawTitle
    localStorage.removeItem('mock-transcript-title')
  }
} catch (e) {
  // If parsing fails, just fall back to the default example transcript.
  overriddenParagraphs.value = null
}

const paragraphsToRender = computed(() => overriddenParagraphs.value || paragraphs.value)

const resolvedRecordTitle = computed(() => recordTitle.value || record.value.title || 'Transcript')

const breadcrumbRoot = computed(() => (isJohnSmith.value ? 'Patients' : 'Projects'))
const breadcrumbSection = computed(() => (isJohnSmith.value ? 'Patient overview' : 'Examples'))
const exampleHeaderTitle = computed(() =>
  isJohnSmith.value ? 'Patient overview: John Smith (prototype)' : 'Example: Joe Smith (prototype)',
)

const isEditMode = ref(false)
const editableSegments = ref([])
const selectedSegments = ref([])

const bulkSpeakerOptions = [
  { label: 'Clinician', value: 0, speakerLabel: 'Clinician' },
  { label: 'Patient', value: 1, speakerLabel: 'Patient' },
  { label: 'Other', value: 2, speakerLabel: 'Other' },
]

const bulkSpeakerValue = ref(1)

const segmentsToRender = computed(() => (isEditMode.value ? editableSegments.value : paragraphsToRender.value))

function toggleEditMode() {
  isEditMode.value = !isEditMode.value
  if (isEditMode.value) {
    // Create a local editable copy so view mode stays unchanged.
    editableSegments.value = paragraphsToRender.value.map(p => ({ ...p }))
    selectedSegments.value = []
  }
}

function updateSegmentText(idx, val) {
  if (!isEditMode.value) return
  if (!editableSegments.value[idx]) return
  editableSegments.value[idx].text = val
}

function moveSegmentUp(idx) {
  if (!isEditMode.value) return
  if (idx <= 0) return
  const arr = [...editableSegments.value]
  const tmp = arr[idx - 1]
  arr[idx - 1] = arr[idx]
  arr[idx] = tmp
  editableSegments.value = arr
  selectedSegments.value = []
}

function moveSegmentDown(idx) {
  if (!isEditMode.value) return
  if (idx >= editableSegments.value.length - 1) return
  const arr = [...editableSegments.value]
  const tmp = arr[idx + 1]
  arr[idx + 1] = arr[idx]
  arr[idx] = tmp
  editableSegments.value = arr
  selectedSegments.value = []
}

function toggleSegmentSelection(idx, selected) {
  if (!isEditMode.value) return
  const i = selectedSegments.value.indexOf(idx)
  if (selected && i === -1) {
    selectedSegments.value = [...selectedSegments.value, idx]
  } else if (!selected && i !== -1) {
    selectedSegments.value = selectedSegments.value.filter(x => x !== idx)
  }
}

function applyBulkSpeaker() {
  if (!isEditMode.value) return
  const chosen = bulkSpeakerOptions.find(o => o.value === bulkSpeakerValue.value)
  if (!chosen) return

  const arr = [...editableSegments.value]
  selectedSegments.value.forEach(idx => {
    if (!arr[idx]) return
    arr[idx] = { ...arr[idx], speaker: chosen.value, speakerLabel: chosen.speakerLabel }
  })

  editableSegments.value = arr
  selectedSegments.value = []
}

const soapNote = ref({
  cc: '',
  symptoms: '',
  assessment: '',
  plan: '',
})

const soapTemplates = [
  { label: 'Standard SOAP', value: 'standard' },
  { label: 'Concise SOAP', value: 'concise' },
  { label: 'Patient-friendly SOAP (prototype)', value: 'patientFriendly' },
]

const selectedSoapTemplateValue = ref('standard')

const soapFootnotes = ref([])
const billingSuggestions = ref([])

// Patient history + smart record search (prototype-only)
const patientOptions = computed(() => {
  if (isJohnSmith.value) return [{ label: 'John Smith (prototype)', value: 'john-smith' }]
  return [{ label: 'Joe Smith (prototype)', value: 'joe-smith' }]
})

const selectedPatientId = ref(route.params.id === 'john-smith' ? 'john-smith' : 'joe-smith')

const patientDataset = {
  'john-smith': {
    name: 'John Smith',
    overview: [
      'Chief context: follow-up for type 2 diabetes with elevated home glucose (180–220 mg/dL) and bilateral foot tingling for ~3 months (prototype data).',
      'Key risks: cardiometabolic risk factors include hypertension and overweight (prototype).',
      'Symptoms noted: bilateral foot tingling without ulceration; denies chest pain or shortness of breath (prototype).',
      'Medication context: metformin prescribed; adherence has been inconsistent due to work stress; semaglutide discussed as escalation option (prototype).',
      'Allergies: no known drug allergies (NKDA) in the prototype dataset.',
    ],
    conditions: ['type 2 diabetes mellitus with hyperglycemia', 'suspected peripheral neuropathy', 'essential hypertension'],
    takenMeds: ['metformin', 'lisinopril', 'semaglutide'],
    allergies: 'NKDA',
    notes: [
      'A1C trend: 8.4% currently, up from 7.1% earlier in the year (prototype).',
      'Foot sensory screening (monofilament) planned/performed for objective neuropathy assessment (prototype).',
    ],
  },
  'joe-smith': {
    name: 'Joe Smith',
    overview: [
      'Chief context: stress-related symptoms with recurrent headache episodes (prototype data).',
      'Key history (summary): episodic tension-type headaches; reduced sleep during high-stress periods.',
      'Symptoms noted: mild nausea reported during headache episodes; denies fever and vision changes (prototype).',
      'Medication history: ibuprofen as needed (PRN) for pain control.',
      'Allergies: none listed in prototype dataset.',
    ],
    conditions: ['tension-type headache', 'stress-related symptoms'],
    takenMeds: ['ibuprofen'],
    notes: ['No medication changes reported in the example transcript (prototype).'],
  },
}

const patientOverview = computed(() => patientDataset[selectedPatientId.value]?.overview || [])

const patientQuery = ref('')
const patientAnswer = ref('')

const smartSearchLabel = computed(() =>
  isJohnSmith.value
    ? 'Smart Medical Record Search (example: "Has this patient ever taken metformin?")'
    : 'Smart Medical Record Search (example: "Has this patient ever taken ibuprofen?")',
)

const quickAskQuestion = computed(() =>
  isJohnSmith.value ? 'Has this patient ever taken metformin?' : 'Has this patient ever taken ibuprofen?',
)
const quickAskLabel = computed(() => `Ask: ${quickAskQuestion.value}`)

function answerPatientQuery() {
  const dataset = patientDataset[selectedPatientId.value]
  if (!dataset) {
    patientAnswer.value = 'Prototype patient not found.'
    return
  }

  const q = (patientQuery.value || '').toLowerCase().trim()
  if (!q) {
    patientAnswer.value = 'Type a question first.'
    return
  }

  // Example patterns: "Has this patient ever taken ibuprofen?"
  const takenMatch = q.match(/taken\\s+([a-z0-9\\-]+)/i)
  const drug = takenMatch?.[1]

  if (drug) {
    const drugNorm = drug.replace(/[^a-z0-9\\-]/g, '')
    const has = dataset.takenMeds.some(m => m.includes(drugNorm))
    patientAnswer.value = has
      ? `Yes. Prototype data lists ${drugNorm} as a taken medication (PRN).`
      : `No. Prototype data does not list ${drugNorm} as a taken medication.`
    return
  }

  if (isJohnSmith.value && (q.includes('a1c') || q.includes('hba1c') || q.includes('hemoglobin'))) {
    patientAnswer.value = 'Prototype data: most recent A1C is 8.4%, increased from 7.1% earlier in the year.'
    return
  }

  if (isJohnSmith.value && (q.includes('neuropathy') || q.includes('tingling') || q.includes('feet') || q.includes('foot'))) {
    patientAnswer.value =
      'Prototype data: patient reports bilateral foot tingling for ~3 months; no ulcers noted. Objective screening (monofilament) was planned/performed as part of neuropathy assessment.'
    return
  }

  if (isJohnSmith.value && (q.includes('blood pressure') || q.includes('bp') || q.includes('hypertension') || q.includes('htn'))) {
    patientAnswer.value =
      'Prototype data indicates essential hypertension as part of the patient context (example medication: lisinopril).'
    return
  }

  if (!isJohnSmith.value && (q.includes('headache') || q.includes('tension'))) {
    patientAnswer.value =
      'Prototype data indicates prior episodes consistent with tension-type headache (often tied to stress and sleep changes).'
    return
  }

  if (q.includes('allergy')) {
    patientAnswer.value = isJohnSmith.value
      ? `Prototype allergies: ${dataset.allergies || 'none listed'}.`
      : 'Prototype allergies: none listed in the example patient dataset.'
    return
  }

  patientAnswer.value = isJohnSmith.value
    ? 'Prototype-only search: try questions like "Has this patient ever taken metformin?", "What is the A1C trend?", or "Any neuropathy symptoms?"'
    : 'Prototype-only search: try questions like "Has this patient ever taken ibuprofen?" or "Does the patient have headache history?"'
}

// Referral letter + docs extraction (prototype-only)
const referralForm = ref({
  recipient: 'Neurology Clinic',
  reason: 'Recurrent headaches',
  requestedTests: 'Consider basic labs if indicated; assess for secondary causes if symptoms persist or worsen.',
  summary: '',
})
const referralDraft = ref('')

function generateReferralDraft() {
  const patient = patientDataset[selectedPatientId.value]
  const patientName = patient?.name || 'Patient'

  referralForm.value.summary = `CC: ${soapNote.value.cc}\nHPI: ${soapNote.value.symptoms}\nAssessment: ${soapNote.value.assessment}\nPlan: ${soapNote.value.plan}`

  referralDraft.value =
    `To: ${referralForm.value.recipient}\n` +
    `Re: Referral for ${patientName}\n\n` +
    `Reason for referral:\n${referralForm.value.reason}\n\n` +
    `Clinical summary (prototype):\n${referralForm.value.summary}\n\n` +
    `Requested tests / considerations (prototype):\n${referralForm.value.requestedTests}\n\n` +
    `Sincerely,\nWhisperTranscribe (prototype)\n`
}

const docFileInputRef = ref(null)
const docFile = ref(null)
const docFileName = ref('')
const docExtracting = ref(false)
const docExtractionStatus = ref('')
const extractedDocSummary = ref('')
let docTimer = null

function onDocFileChange(e) {
  const file = e?.target?.files?.[0]
  docFile.value = file || null
  docFileName.value = file?.name || ''
  docExtractionStatus.value = file ? 'Ready to extract (prototype).' : ''
  extractedDocSummary.value = ''
  e.target.value = ''
}

function extractAndSummarizeDocs() {
  if (!docFile.value) return
  if (docTimer) clearTimeout(docTimer)

  docExtracting.value = true
  docExtractionStatus.value = 'Extracting… (prototype)'
  extractedDocSummary.value = ''

  docTimer = setTimeout(() => {
    docExtracting.value = false
    docExtractionStatus.value = 'Extraction complete (prototype).'
    const patientName = patientDataset[selectedPatientId.value]?.name || 'Joe Smith'
    const bullets = isJohnSmith.value
      ? [
          '- Complaint: elevated home glucose and bilateral foot tingling',
          '- Relevant context: A1C 8.4% (prototype), hypertension risk factors',
          '- Suggested next steps: foot sensory screening, medication adherence review, consider endocrine referral',
        ]
      : [
          '- Complaint: headache + fatigue',
          '- Associated symptoms: mild nausea; no fever; no vision changes',
          '- Suggested next steps: follow up; consider basic labs if persistent',
        ]
    extractedDocSummary.value =
      `Document type: ${docFile.value.type || 'unknown'}\n` +
      `Patient: ${patientName}\n\n` +
      `Key extracted items (prototype):\n` +
      `${bullets.join('\n')}\n\n` +
      `Note: This is mocked UI output (no real OCR or extraction performed).`
  }, 900)
}

function makeExcerpt(text, maxLen = 90) {
  const t = (text || '').trim()
  if (t.length <= maxLen) return t
  return t.slice(0, maxLen) + '…'
}

function generateSoapFromTranscript() {
  const segs = segmentsToRender.value || []
  if (!segs.length) return

  const template = selectedSoapTemplateValue.value

  // Prototype template: build a SOAP note from selected segment text.
  const ccSeg = segs[0]
  const symSegs = [segs[2], segs[3], segs[4]].filter(Boolean)
  const assessSeg = segs[5] || segs[3] || segs[0]
  const planSeg = segs[6] || segs[5] || segs[4] || segs[0]

  const rawCc = ccSeg?.text || ''
  const rawSymptoms = symSegs.map(s => s.text).join(' ')
  const rawAssessment = assessSeg?.text || ''
  const rawPlan = planSeg?.text || ''

  if (template === 'concise') {
    soapNote.value.cc = makeExcerpt(rawCc, 60)
    soapNote.value.symptoms = makeExcerpt(rawSymptoms, 110)
    soapNote.value.assessment = makeExcerpt(rawAssessment, 110)
    soapNote.value.plan = makeExcerpt(rawPlan, 110)
  } else if (template === 'patientFriendly') {
    soapNote.value.cc = `Patient report: ${makeExcerpt(rawCc, 70)}`
    soapNote.value.symptoms = `Patient describes: ${makeExcerpt(rawSymptoms, 160)}`
    soapNote.value.assessment = `Clinician assessment (prototype): ${makeExcerpt(rawAssessment, 160)}`
    soapNote.value.plan = `Next steps (prototype): ${makeExcerpt(rawPlan, 160)}`
  } else {
    // standard
    soapNote.value.cc = rawCc
    soapNote.value.symptoms = rawSymptoms
    soapNote.value.assessment = rawAssessment
    soapNote.value.plan = rawPlan
  }

  const foots = []
  if (ccSeg) {
    foots.push({
      marker: '[1]',
      time: `${formatTime(ccSeg.startTime)}-${formatTime(ccSeg.endTime)}`,
      excerpt: makeExcerpt(ccSeg.text),
    })
  }
  const used = [2, 3, 4].filter(i => segs[i])
  used.forEach((idx, j) => {
    const s = segs[idx]
    foots.push({
      marker: `[${j + 2}]`,
      time: `${formatTime(s.startTime)}-${formatTime(s.endTime)}`,
      excerpt: makeExcerpt(s.text),
    })
  })
  soapFootnotes.value = foots

  // Keep billing suggestions in sync with SOAP for the prototype UX.
  generateBillingCodes()
}

function generateBillingCodes() {
  const text = `${soapNote.value.cc} ${soapNote.value.symptoms} ${soapNote.value.assessment} ${soapNote.value.plan}`.toLowerCase()
  const items = []

  if (isJohnSmith.value && (text.includes('a1c') || text.includes('diabet') || text.includes('glucose') || text.includes('hypergly'))) {
    items.push({
      code: 'E11.65',
      label: 'Type 2 diabetes mellitus with hyperglycemia (example)',
      reason: 'Selected because the SOAP includes elevated glucose / diabetes context (prototype suggestion).',
    })
  }

  if (isJohnSmith.value && (text.includes('tingling') || text.includes('neuropath') || text.includes('feet') || text.includes('foot'))) {
    items.push({
      code: 'E11.40',
      label: 'Type 2 diabetes mellitus with diabetic neuropathy, unspecified (example)',
      reason: 'Selected because neuropathy-like symptoms are mentioned (prototype suggestion).',
    })
  }

  if (isJohnSmith.value && (text.includes('bp') || text.includes('hypertension') || text.includes('htn'))) {
    items.push({
      code: 'I10',
      label: 'Essential (primary) hypertension (example)',
      reason: 'Selected because hypertension is referenced in the clinical context (prototype suggestion).',
    })
  }

  if (isJohnSmith.value && (text.includes('metformin') || text.includes('semaglutide') || text.includes('glp'))) {
    items.push({
      code: 'Z79.84',
      label: 'Long term (current) use of oral hypoglycemic drugs (example)',
      reason: 'Selected because diabetes medications are referenced (prototype suggestion).',
    })
  }

  // Prototype-only heuristic examples for Joe Smith.
  if (!isJohnSmith.value && (text.includes('headache') || text.includes('migraine') || text.includes('tension'))) {
    items.push({
      code: 'G44.209',
      label: 'Unspecified headache (example)',
      reason: 'Selected because the SOAP includes headache symptoms (prototype suggestion).',
    })
  }

  if (!isJohnSmith.value && (text.includes('stress') || text.includes('tension'))) {
    items.push({
      code: 'Z73.3',
      label: 'Stress, not elsewhere classified (example)',
      reason: 'Selected because stress/tension is mentioned as a likely contributing factor (prototype suggestion).',
    })
  }

  if (!isJohnSmith.value && (text.includes('nausea') || text.includes('vomit') || text.includes('queas'))) {
    items.push({
      code: 'R11.0',
      label: 'Nausea (example)',
      reason: 'Selected because nausea appears in the symptoms summary (prototype suggestion).',
    })
  }

  if (!items.length) {
    items.push({
      code: '—',
      label: 'No clear prototype billing match',
      reason: 'Generate a SOAP note first (or adjust CC/symptoms) to see prototype billing suggestions.',
    })
  }

  billingSuggestions.value = items
}

watch(
  () => route.params.id,
  id => {
    selectedPatientId.value = id === 'john-smith' ? 'john-smith' : 'joe-smith'
    patientAnswer.value = ''
    patientQuery.value = ''
    generateSoapFromTranscript()
  },
)

// Populate initial SOAP note for the example transcript.
generateSoapFromTranscript()

const activeTab = ref('transcript')
const searchText = ref('')
const showMagicChat = ref(false)
const chatMessage = ref('')
const magicChatAnswer = ref('')

const chatIsOffTopic = computed(() => {
  const q = (chatMessage.value || '').toLowerCase().trim()
  if (!q) return false

  // Lightweight heuristic: treat common medical/transcription terms as on-topic.
  const onTopicKeywords = [
    'patient',
    'symptom',
    'symptoms',
    'assessment',
    'plan',
    'soap',
    'billing',
    'icd',
    'cpt',
    'diagnosis',
    'medication',
    'history',
    'history',
    'transcription',
    'transcribe',
    'headache',
    'ibuprofen',
    'nausea',
    'tension',
    'diabetes',
    'glucose',
    'a1c',
    'hba1c',
    'neuropathy',
    'metformin',
    'semaglutide',
    'hypertension',
    'lisinopril',
  ]

  return !onTopicKeywords.some(k => q.includes(k))
})

function sendMagicChat() {
  const q = (chatMessage.value || '').toLowerCase().trim()
  if (!q) return

  if (chatIsOffTopic.value) {
    magicChatAnswer.value = isJohnSmith.value
      ? 'Prototype: this area is for medical transcription and note workflows. Try asking about SOAP notes, billing codes, patient history, or meds (example: "Has the patient taken metformin?").'
      : 'Prototype: this area is for medical transcription and note workflows. Try asking about SOAP notes, billing codes, patient history, or meds (example: "Has the patient taken ibuprofen?").'
    return
  }

  if (q.includes('soap') || q.includes('cc') || q.includes('hpi')) {
    magicChatAnswer.value = `SOAP (prototype)\n\nCC: ${soapNote.value.cc}\nSymptoms/HPI: ${soapNote.value.symptoms}\nAssessment: ${soapNote.value.assessment}\nPlan: ${soapNote.value.plan}`
    return
  }

  if (q.includes('billing') || q.includes('code') || q.includes('icd') || q.includes('cpt')) {
    if (!billingSuggestions.value.length) {
      magicChatAnswer.value = 'Prototype: generate a SOAP note first to get billing code suggestions.'
      return
    }
    magicChatAnswer.value = billingSuggestions.value
      .map(s => `${s.code} — ${s.label}\nReason: ${s.reason}`)
      .join('\n\n')
    return
  }

  // Fallback: guide the user toward known prototype panels.
  magicChatAnswer.value =
    'Prototype: try asking for SOAP generation, billing suggestions, or patient record search. (This is a UI-only prototype; no external API calls.)'
}
const aspectRatio = ref('9:16')
const clipType = ref('audiogram')

const aspectRatios = [
  { value: '9:16', label: '9:16', style: { width: '20px', height: '32px' } },
  { value: '16:9', label: '16:9', style: { width: '32px', height: '20px' } },
  { value: '1:1', label: '1:1', style: { width: '24px', height: '24px' } },
]

const mainTabs = [
  { label: 'Transcript', value: 'transcript' },
  { label: 'Content Hub', value: 'content' },
  { label: 'Visual Hub', value: 'visual' },
]

const contentSubTabs = [
  'Summary',
  'Quotes',
  'Chapters',
  'Summary By Speaker',
  'Summary By Topic',
  'Follow Up Questions (UX Research)',
  'UX Report',
]

const activeContentTab = ref('Summary')

const activeContentBody = computed(() => {
  const item = contentItems.value.find(c => c.name === activeContentTab.value)
  if (!item || !item.results.length) return ''
  return item.results[0].body || ''
})

function renderMarkdown(md) {
  if (!md) return ''

  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const lines = escaped.split('\n')
  const html = []
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    if (line.match(/^###\s+/)) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push(`<h3 style="margin: 1em 0 0.5em; font-size: 1.1rem">${line.replace(/^###\s+/, '')}</h3>`)
      continue
    }
    if (line.match(/^##\s+/)) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push(`<h2 style="margin: 1.2em 0 0.5em; font-size: 1.25rem">${line.replace(/^##\s+/, '')}</h2>`)
      continue
    }

    if (line.match(/^\*\s+/) || line.match(/^-\s+/)) {
      if (!inList) { html.push('<ul style="margin: 0.5em 0; padding-left: 1.5em">'); inList = true }
      const content = line.replace(/^[\*\-]\s+/, '')
      html.push(`<li style="margin-bottom: 0.3em">${applyInline(content)}</li>`)
      continue
    }

    if (inList) { html.push('</ul>'); inList = false }

    if (line.trim() === '') {
      html.push('<br/>')
    } else {
      html.push(`<p style="margin: 0.4em 0">${applyInline(line)}</p>`)
    }
  }

  if (inList) html.push('</ul>')
  return html.join('\n')
}

function applyInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}
</script>

<style scoped>
.transcript-page {
  max-width: 1400px;
  margin: 0 auto;
}
.content-body :deep(h2) {
  color: #1d1d1d;
}
.content-body :deep(h3) {
  color: #424242;
}
.content-body :deep(strong) {
  color: #1d1d1d;
}
.content-body :deep(li) {
  color: #424242;
}
.scroll-x {
  overflow-x: auto;
  scrollbar-width: thin;
}
.aspect-icon {
  border: 2px solid #bdbdbd;
  border-radius: 4px;
  transition: all 0.2s;
}
.aspect-icon--active {
  border-color: var(--brand-primary);
  background: var(--brand-primary);
}
.toolbar-group {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 2px 4px;
}
</style>
