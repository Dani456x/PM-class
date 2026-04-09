<template>
  <q-page class="wt-session-page q-pa-md">
    <div v-if="patient" class="row items-center text-caption text-grey-8 q-mb-sm wt-breadcrumbs">
      <span class="cursor-pointer text-primary" @click="$router.push('/start')">Dashboard</span>
      <q-icon name="sym_o_chevron_right" size="14px" class="q-mx-xs" />
      <span class="text-weight-medium">{{ patientLastFirst }}</span>
      <q-icon name="sym_o_chevron_right" size="14px" class="q-mx-xs" />
      <span v-if="activePatientTab === 'interview'">Interview</span>
      <span v-else>Transcription · Apr 2, 2026</span>
    </div>

    <div v-if="consentNeeded" class="q-mb-md">
      <InlineAlert variant="warning" :dismissible="false">
        <strong>Consent.</strong> By continuing you confirm this session is authorized for this patient on this device.
        <q-btn flat dense no-caps label="Acknowledge" color="warning" class="q-ml-sm" @click="ackConsent" />
      </InlineAlert>
    </div>

    <!-- Patient banner -->
    <q-card v-if="patient" flat bordered class="wt-patient-banner q-mb-md">
      <q-card-section class="row items-center q-py-sm q-px-md">
        <PatientAvatar :name="patient.name" size="md" />
        <div class="q-ml-md col">
          <div class="row items-center wrap q-gutter-x-sm">
            <span class="text-h6 wt-h3">{{ patient.name }}</span>
            <span class="text-body2 text-grey-8">·</span>
            <span class="text-body2 text-grey-8">DOB {{ maskedDob ? '••••-••-••' : patient.dob }}</span>
            <q-btn flat dense round size="sm" :icon="maskedDob ? 'sym_o_visibility' : 'sym_o_visibility_off'" @click="maskedDob = !maskedDob" />
            <span class="text-body2 text-grey-8">·</span>
            <span class="text-body2 text-grey-8 font-mono">MRN {{ maskedMrn ? '•••••' : patient.mrn }}</span>
            <q-btn flat dense round size="sm" :icon="maskedMrn ? 'sym_o_visibility' : 'sym_o_visibility_off'" @click="maskedMrn = !maskedMrn" />
            <span class="text-body2 text-grey-8">·</span>
            <span class="text-body2">Insurance: {{ patient.insurance }}</span>
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Last edited by Dr. James Chen at {{ lastEditTime }} · <span class="text-weight-medium">Audit trail on</span>
          </div>
        </div>
        <q-btn flat dense round icon="sym_o_close" color="grey-7" class="q-mr-xs" aria-label="Clear patient" @click="confirmChangePatient" />
        <q-btn flat no-caps color="primary" label="Change patient" @click="confirmChangePatient" />
      </q-card-section>
    </q-card>

    <div v-if="patient" class="q-mb-md">
      <q-tabs
        v-model="activePatientTab"
        dense
        no-caps
        align="left"
        indicator-color="primary"
        active-color="primary"
        class="wt-patient-tabs"
      >
        <q-tab name="interview" label="Patient Interview" />
        <q-tab name="transcription" label="Transcription" />
      </q-tabs>
    </div>

    <div class="row q-col-gutter-md no-wrap items-stretch wt-session-row">
      <!-- Main -->
      <div class="col-12 col-lg">
        <q-card flat bordered class="wt-main-card full-height">
          <q-card-section>
            <!-- Locked state -->
            <div v-if="!patient" class="column flex-center q-pa-xl text-grey-7">
              <q-icon name="sym_o_lock" size="48px" class="q-mb-md" />
              <div class="text-h6">Select a patient to unlock recording</div>
              <q-btn unelevated no-caps color="primary" label="Go to patient search" class="q-mt-md" @click="$router.push('/start')" />
            </div>

            <template v-else>
              <q-tab-panels v-model="activePatientTab" animated>
                <q-tab-panel name="interview" class="q-pa-none">
                  <div class="row items-start justify-between q-mb-md">
                    <div>
                      <div class="text-h6 wt-h3">Clinical Interview Summary</div>
                      <div class="text-caption text-grey-7 q-mt-xs">{{ USER_INTERVIEW.interviewer }} · {{ USER_INTERVIEW.duration }}</div>
                    </div>
                    <q-chip dense outline color="primary">{{ USER_INTERVIEW.date }}</q-chip>
                  </div>

                  <div class="column q-gutter-md">
                    <SectionCard
                      v-for="s in USER_INTERVIEW.sections"
                      :key="s.label"
                      :title="s.label"
                      :default-expanded="true"
                    >
                      <div class="text-body2" style="line-height: 1.65">{{ s.text }}</div>
                    </SectionCard>
                  </div>

                  <div class="row justify-end q-mt-lg">
                    <q-btn unelevated color="primary" no-caps label="Start New Transcription →" @click="activePatientTab = 'transcription'" />
                  </div>
                </q-tab-panel>

                <q-tab-panel name="transcription" class="q-pa-none">
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-h6 wt-h3">Transcription</div>
                    <q-btn flat dense no-caps color="primary" label="View Interview ←" @click="activePatientTab = 'interview'" />
                  </div>
              <!-- Recording bar -->
              <div class="column items-center q-py-lg">
                <div class="row items-center q-gutter-md q-mb-md full-width justify-center wt-mic-row">
                  <q-select
                    v-model="micChoice"
                    :options="micOptions"
                    dense
                    outlined
                    hide-dropdown-icon
                    class="wt-mic-select"
                  >
                    <template v-slot:prepend>
                      <q-icon name="sym_o_mic" size="20px" />
                    </template>
                  </q-select>
                </div>

                <div
                  class="wt-record-btn-wrap"
                  :class="{ 'wt-record-btn-wrap--active': isRecording && !isPaused }"
                >
                  <q-btn
                    round
                    size="xl"
                    class="wt-record-btn"
                    :class="{ 'wt-record-btn--recording': isRecording && !isPaused }"
                    icon="sym_o_fiber_manual_record"
                    @click="toggleRecord"
                  />
                </div>

                <div v-if="isRecording" class="text-h4 wt-timer q-mt-md font-mono">{{ formatTime(recordingSeconds) }}</div>
                <div v-else class="text-body2 text-grey-7 q-mt-md">Ready to capture visit audio (simulated)</div>

                <div v-if="isRecording" class="wt-wave row justify-center q-gutter-xs q-mt-md full-width">
                  <div v-for="(h, i) in waveHeights" :key="i" class="wt-wave-bar" :style="{ height: h + 'px' }" />
                </div>

                <div v-if="isRecording" class="row q-gutter-sm q-mt-lg">
                  <q-btn
                    unelevated
                    no-caps
                    class="wt-pause-btn"
                    :class="{ 'wt-pause-btn--yellow': isRecording && !isPaused, 'wt-pause-btn--active': isPaused }"
                    :label="isPaused ? 'Resume' : 'Pause'"
                    style="min-height: 44px; min-width: 100px; border-radius: 8px"
                    @click="togglePauseOnly"
                  />
                  <ActionButton variant="danger" @click="confirmStop">Stop</ActionButton>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- Transcript -->
              <div class="text-h6 wt-h3 q-mb-sm">Transcript</div>
              <div class="text-caption text-grey-7 q-mb-md">Hover an utterance for edit actions (prototype). Timestamps jump playback (simulated).</div>

              <div ref="transcriptScrollRef" class="wt-transcript-scroll">
                <transition-group name="wt-utter" tag="div">
                  <div
                    v-for="(block, bi) in renderedUtterances"
                    :key="bi"
                    class="wt-utter q-mb-md"
                    :data-idx="bi"
                    @mouseenter="hoverUtterance = bi"
                    @mouseleave="hoverUtterance = null"
                  >
                    <div class="row items-center q-gutter-xs q-mb-xs">
                      <span class="wt-speaker-pill" :class="`wt-speaker-pill--${block.role}`">{{ block.speaker }}</span>
                      <q-btn flat dense no-caps size="sm" class="text-caption font-mono" @click="seekSim(block.startSec)">
                        {{ formatClock(block.startSec) }}
                      </q-btn>
                      <q-badge v-if="block.adapted" outline color="teal" class="q-ml-xs">Learned from Dr. Chen</q-badge>
                    </div>
                    <div class="wt-utter-text text-body2">
                      <template v-for="(w, wi) in block.words" :key="wi">
                        <span
                          v-if="filterSmallTalk && block.smallTalk"
                          class="wt-small-talk"
                        >{{ w }} </span>
                        <span
                          v-else-if="isUncertainWord(w)"
                          class="wt-uncertain-wavy wt-word-correct"
                          @click="openCorrection(w, bi, wi)"
                        >
                          <q-tooltip anchor="top middle" self="bottom middle" class="bg-grey-9 text-body2" :delay="200">
                            Did you mean: <strong>angina</strong> (0.94) / anjina / ?
                          </q-tooltip>
                          {{ w }}
                        </span>
                        <span v-else>{{ w }} </span>
                      </template>
                    </div>
                    <div v-if="hoverUtterance === bi" class="row q-gutter-xs q-mt-xs">
                      <q-btn dense flat no-caps size="sm" label="Edit" color="primary" @click="notifyEdit" />
                      <q-btn dense flat no-caps size="sm" label="Assign speaker" color="grey-8" @click="notifyAssign" />
                    </div>
                  </div>
                </transition-group>
              </div>

              <q-page-sticky v-if="renderedUtterances.length" position="bottom-right" :offset="[18, 88]">
                <q-card flat bordered class="q-pa-sm wt-bulk-speaker" style="border-radius: 8px">
                  <div class="text-caption text-grey-8 q-mb-xs">Assign all unmarked to:</div>
                  <div class="row q-gutter-xs no-wrap items-center">
                    <q-select
                      v-model="bulkSpeaker"
                      :options="bulkSpeakerOptions"
                      dense
                      outlined
                      emit-value
                      map-options
                      style="min-width: 140px"
                    />
                    <q-btn dense unelevated color="primary" no-caps label="Apply" class="min-touch" @click="applyBulkSpeaker" />
                  </div>
                </q-card>
              </q-page-sticky>

              <div v-if="transcriptComplete" class="q-mt-lg">
                <q-btn
                  unelevated
                  no-caps
                  class="wt-generate-soap full-width"
                  icon="sym_o_stethoscope"
                  label="Generate SOAP Notes →"
                  @click="generateSoap"
                />
              </div>

              <!-- SOAP -->
              <q-slide-transition>
                <div v-if="soapVisible" class="q-mt-xl wt-soap-panel">
                  <div class="row items-center q-mb-md">
                    <q-select v-model="soapTemplate" :options="soapTemplateOptions" dense outlined emit-value map-options class="col-grow" style="max-width: 280px" />
                  </div>
                  <div v-if="soapLoading" class="q-pa-lg">
                    <q-skeleton type="text" class="q-mb-sm" />
                    <q-skeleton type="text" class="q-mb-sm" />
                    <q-skeleton type="text" />
                    <div class="text-caption text-grey-7 q-mt-md">Analyzing clinical data…</div>
                  </div>
                  <template v-else>
                    <div v-for="sec in soapSections" :key="sec.key" class="q-mb-md">
                      <div class="row items-center q-mb-xs">
                        <span class="text-weight-bold text-primary">{{ sec.key }}</span>
                        <q-badge outline class="q-ml-sm">{{ sec.words }} words</q-badge>
                        <q-badge v-if="sec.editCount" outline color="grey-7" class="q-ml-xs">{{ sec.editCount }} edit(s)</q-badge>
                        <q-space />
                        <q-btn flat dense no-caps label="Edit" :disable="sec.locked" @click="toggleSoapEdit(sec.key)" />
                        <q-btn flat dense round :icon="sec.locked ? 'sym_o_lock' : 'sym_o_lock_open'" @click="toggleSoapLock(sec)">
                          <q-tooltip>
                            {{
                              sec.locked
                                ? `Locked by Dr. Chen ${sec.lockedAt || '2:18 PM'} — unlock to edit`
                                : 'Lock section (AI will not overwrite)'
                            }}
                          </q-tooltip>
                        </q-btn>
                      </div>
                      <div v-if="soapEditing === sec.key" class="q-mb-sm">
                        <q-btn-group flat class="q-mb-xs">
                          <q-btn flat dense icon="sym_o_format_bold" @click="soapToolbarBold(sec)" />
                          <q-btn flat dense icon="sym_o_format_list_bulleted" @click="soapToolbarBullet(sec)" />
                          <q-btn flat dense icon="sym_o_undo" :disable="!sec.undoStack?.length" @click="soapToolbarUndo(sec)" />
                        </q-btn-group>
                        <q-input v-model="sec.text" type="textarea" autogrow outlined dense />
                        <div class="row q-gutter-sm q-mt-xs">
                          <q-btn dense unelevated color="primary" no-caps label="Save section" @click="saveSoapSection(sec)" />
                          <q-btn dense flat no-caps label="Cancel" @click="cancelSoapSection(sec)" />
                        </div>
                      </div>
                      <div
                        v-else
                        class="wt-soap-body text-body2"
                        v-html="renderSoapSectionHtml(sec)"
                        @click="onSoapBodyClick($event)"
                      />
                    </div>

                    <InlineAlert v-if="billingWarning" variant="warning" class="q-mb-md" :dismissible="false">
                      AI flagged a possible upcoding/undercoding discrepancy — review codes carefully.
                    </InlineAlert>

                    <q-btn
                      unelevated
                      no-caps
                      color="positive"
                      class="full-width q-mb-md min-touch"
                      label="Approve &amp; Send to EMR →"
                      @click="openEmrModal"
                    />

                    <q-card v-if="showReferralCallout" flat bordered class="q-pa-md wt-referral-callout">
                      <div class="text-body2 q-mb-sm">Dr. Chen mentioned a referral to cardiology. Would you like to draft a referral letter?</div>
                      <ActionButton variant="secondary" :loading="referralComposing" @click="draftReferral">Draft Referral Letter →</ActionButton>
                    </q-card>

                    <div v-if="referralComposing" class="q-pa-md text-center">
                      <q-spinner color="primary" size="32px" />
                      <div class="text-caption text-grey-7 q-mt-sm">Composing letter…</div>
                    </div>

                    <q-card v-if="referralLetterVisible" flat bordered class="q-pa-md q-mt-md wt-modal-shadow" style="border-radius: 12px">
                      <div class="row items-center q-mb-sm wrap q-gutter-sm">
                        <span class="text-h6 wt-h3">Referral letter</span>
                        <q-space />
                        <q-select
                          v-model="referralUrgency"
                          :options="urgencyOptionsStyled"
                          dense
                          outlined
                          emit-value
                          map-options
                          style="min-width: 180px"
                        />
                      </div>
                      <div class="q-mb-sm">
                        <div class="text-caption text-grey-7 q-mb-xs">Search specialists…</div>
                        <q-select
                          v-model="referralSpecialist"
                          :options="specialistOptions"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          dense
                          outlined
                          use-input
                          input-debounce="0"
                          @filter="filterSpecialists"
                        />
                      </div>
                      <div class="row q-mb-sm">
                        <q-btn-toggle
                          v-model="referralEditorMode"
                          spread
                          no-caps
                          unelevated
                          toggle-color="primary"
                          :options="[
                            { label: 'Read', value: 'read' },
                            { label: 'Edit', value: 'edit' },
                          ]"
                        />
                      </div>
                      <q-input v-if="referralEditorMode === 'edit'" v-model="referralBody" type="textarea" autogrow outlined />
                      <pre v-else class="wt-referral-pre text-body2">{{ referralBody }}</pre>
                      <div class="text-caption text-grey-7 q-mt-sm">Signature (initials)</div>
                      <q-input v-model="referralInitials" outlined dense placeholder="e.g. JC" maxlength="8" class="q-mb-md" style="max-width: 120px" />
                      <div class="row q-gutter-xs flex-wrap q-mb-md">
                        <q-btn no-caps outline class="min-touch" label="Fax (sim)" @click="sendReferral('fax')" />
                        <q-btn no-caps outline class="min-touch" label="Email to specialist" @click="sendReferral('email')" />
                        <q-btn no-caps outline class="min-touch" label="Print PDF" @click="sendReferral('pdf')" />
                        <q-btn no-caps outline class="min-touch" label="Send via EHR" @click="sendReferral('ehr')" />
                      </div>
                      <q-btn unelevated color="positive" no-caps class="full-width min-touch" label="Confirm &amp; send" @click="confirmReferralSend" />
                    </q-card>

                    <q-banner v-if="referralSentMsg" class="bg-positive text-white q-mt-md rounded-borders">{{ referralSentMsg }}</q-banner>
                  </template>
                </div>
              </q-slide-transition>
                </q-tab-panel>
              </q-tab-panels>
            </template>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right panel -->
      <div v-if="patient" class="col-12 col-lg-auto wt-right-shell" :class="{ 'wt-right-shell--open': !windowNarrow || rightSheetOpen }">
        <div v-if="windowNarrow" class="wt-sheet-handle row items-center justify-center" @click="rightSheetOpen = !rightSheetOpen">
          <q-icon :name="rightSheetOpen ? 'sym_o_expand_more' : 'sym_o_expand_less'" class="q-mr-sm" />
          <span class="text-caption text-weight-medium">Clinical context · billing</span>
        </div>
        <div class="wt-right-panel column q-gutter-md">
          <q-btn v-if="!windowNarrow" flat dense :icon="rightCollapsed ? 'sym_o_chevron_left' : 'sym_o_chevron_right'" :label="rightCollapsed ? '' : 'Collapse'" @click="rightCollapsed = !rightCollapsed" />

          <div v-show="!rightCollapsed || windowNarrow" class="column q-gutter-md">
            <SectionCard title="Clinical Context" :default-expanded="true">
              <template #badge><StatusBadge label="EMR" variant="sent" /></template>
              <div class="text-caption text-grey-8 q-mb-sm">Chief conditions, medications, allergies (simulated)</div>
              <div class="row wrap q-gutter-xs q-mb-md">
                <q-chip dense outline color="primary">HTN</q-chip>
                <q-chip dense outline color="orange">NKDA</q-chip>
                <q-chip dense outline color="teal">Lisinopril 10mg</q-chip>
              </div>
              <q-input dense outlined placeholder="Ask about this patient…" class="q-mb-sm" @keyup.enter="simulateAsk">
                <template v-slot:append>
                  <q-icon name="sym_o_chat" />
                </template>
              </q-input>
              <div v-if="askReply" class="text-body2 q-mb-md">{{ askReply }}</div>
              <div class="text-caption text-weight-medium q-mb-xs">Visit history (last 5)</div>
              <q-list dense bordered separator class="rounded-borders q-mb-md">
                <q-item v-for="v in visitTimeline" :key="v.date + v.code" dense>
                  <q-item-section>
                    <q-item-label class="text-body2">{{ v.label }}</q-item-label>
                    <q-item-label caption>{{ v.date }} · {{ v.code }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-card flat bordered class="q-pa-sm q-mt-md" style="background: #fff8e1; border-color: #ffe082">
                <div class="text-caption text-weight-medium text-warning">Cross-visit patterns</div>
                <div class="text-caption q-mb-xs">Over last 4 visits: BP trending up, HbA1c trending up, weight slowly increasing (simulated).</div>
                <div class="row q-col-gutter-sm q-mt-sm">
                  <div class="col-4">
                    <div class="text-caption text-grey-7">BP</div>
                    <div class="row no-wrap items-end wt-spark-bars">
                      <div
                        v-for="(h, si) in DEMO_SPARK_BP"
                        :key="'bp' + si"
                        class="wt-spark-bar"
                        :style="{ height: Math.max(4, h * 0.3) + 'px' }"
                      />
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="text-caption text-grey-7">HbA1c</div>
                    <div class="row no-wrap items-end wt-spark-bars">
                      <div
                        v-for="(h, si) in DEMO_SPARK_A1C"
                        :key="'a1c' + si"
                        class="wt-spark-bar"
                        :style="{ height: Math.max(4, h * 0.3) + 'px' }"
                      />
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="text-caption text-grey-7">Wt</div>
                    <div class="row no-wrap items-end wt-spark-bars">
                      <div
                        v-for="(h, si) in DEMO_SPARK_WT"
                        :key="'wt' + si"
                        class="wt-spark-bar"
                        :style="{ height: Math.max(4, h * 0.3) + 'px' }"
                      />
                    </div>
                  </div>
                </div>
                <div class="text-caption q-mt-xs">Blood pressure has been trending up over the last 3 visits.</div>
              </q-card>
            </SectionCard>

            <SectionCard title="Clinical notes (live)" :default-expanded="true">
              <template #badge><StatusBadge :label="isRecording ? 'Live' : 'Saved'" :variant="isRecording ? 'flagged' : 'draft'" /></template>
              <div v-if="drugAlert" class="q-mb-sm">
                <InlineAlert variant="warning" :dismissible="false">{{ drugAlert }}</InlineAlert>
              </div>
              <div class="q-mb-sm"><strong>Chief complaint:</strong> {{ clinical.chiefComplaint || '—' }}</div>
              <div class="q-mb-sm"><strong>Symptoms:</strong></div>
              <ul class="q-pl-md q-my-none">
                <li v-for="(s, i) in clinical.symptoms" :key="i">{{ s }}</li>
                <li v-if="!clinical.symptoms.length" class="text-grey-6">—</li>
              </ul>
              <div class="q-mb-sm"><strong>Key terms:</strong> {{ clinical.keyTerms.join(', ') || '—' }}</div>
              <div class="q-mb-sm"><strong>Provisional:</strong> {{ clinical.provisional || '—' }}</div>
              <div class="q-mb-md"><strong>Actions:</strong></div>
              <div class="row wrap q-gutter-xs">
                <q-chip v-for="a in clinical.actions" :key="a" dense color="primary" text-color="white">{{ a }}</q-chip>
              </div>
              <q-toggle v-model="filterSmallTalk" label="De-emphasize small talk" class="q-mt-md" dense />
              <InlineAlert v-if="soapVisible && !soapLoading" variant="info" class="q-mt-md" :dismissible="false">
                Template learning: based on your edits, the Assessment section now defaults to ICD-10-first format (prototype).
              </InlineAlert>
            </SectionCard>

            <SectionCard v-if="soapVisible && !soapLoading" title="Suggested billing codes" :default-expanded="true">
              <template #badge><StatusBadge :label="`${approvedBillingCount} approved`" variant="approved" /></template>
              <BillingCodeChip
                v-for="c in billingCodes"
                :key="c.id"
                :code="c.code"
                :type="c.type"
                :description="c.description"
                :confidence="c.confidence"
                :status="c.status"
                class="q-mb-sm"
                @approve="approveCode(c)"
                @reject="c.status = 'rejected'"
                @modify="c.status = 'modified'"
                @confirm-modify="onBillingConfirmModify(c, $event)"
                @cancel-modify="c.status = 'pending'"
              />
              <div class="text-body2 q-mt-md">{{ approvedBillingCount }} codes approved · Est. reimbursement: ${{ estReimbursement }} (simulated)</div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="stopConfirm">
      <q-card style="min-width: 320px; border-radius: 12px">
        <q-card-section class="text-h6">End session?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated color="primary" label="End" @click="endRecording" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="emrModal" @hide="emrSendStep = 'pick'">
      <q-card class="wt-modal-shadow" style="min-width: 360px; border-radius: 12px">
        <q-card-section v-if="emrSendStep === 'pick'" class="text-h6">Send to Epic / Athena / DrChrono?</q-card-section>
        <q-card-section v-if="emrSendStep === 'pick'" class="q-pt-none text-body2 text-grey-8">
          Select target EMR. Notes and approved billing will be transmitted (simulated).
        </q-card-section>
        <q-card-section v-if="emrSendStep === 'pick'" class="q-pt-none">
          <q-select v-model="emrChoice" :options="emrOptions" outlined dense />
        </q-card-section>
        <q-card-section v-if="emrSendStep === 'sending'" class="text-center q-pa-lg">
          <q-spinner color="positive" size="40px" />
          <div class="text-body2 q-mt-md">Sending to {{ emrChoice }}…</div>
        </q-card-section>
        <q-card-actions v-if="emrSendStep === 'pick'" align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="positive" label="Confirm" @click="confirmEmr" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="correctionOpen">
      <q-card style="min-width: 320px; border-radius: 12px" class="wt-modal-shadow">
        <q-card-section class="text-h6">Correct transcript</q-card-section>
        <q-card-section class="q-pt-none text-body2">Accept a suggestion or type a correction.</q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="correctionCustom" outlined dense label="Custom" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn outline label="angina" @click="applyCorrection('angina')" />
          <q-btn unelevated color="primary" label="Apply" @click="applyCorrection(correctionCustom || 'angina')" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import PatientAvatar from '../components/medical/PatientAvatar.vue'
import ActionButton from '../components/medical/ActionButton.vue'
import SectionCard from '../components/medical/SectionCard.vue'
import StatusBadge from '../components/medical/StatusBadge.vue'
import BillingCodeChip from '../components/medical/BillingCodeChip.vue'
import InlineAlert from '../components/medical/InlineAlert.vue'
import {
  DEMO_BILLING_CODES,
  DEMO_CLINICAL_MILESTONES,
  DEMO_PATIENT,
  DEMO_REFERRAL_LETTER,
  DEMO_SOAP_TEMPLATES,
  DEMO_SPARK_A1C,
  DEMO_SPARK_BP,
  DEMO_SPARK_WT,
  DEMO_SPECIALISTS,
  DEMO_UTTERANCES,
  DEMO_VISIT_TIMELINE,
  USER_INTERVIEW,
  buildSoapBody,
} from '../data/medical-demo.js'

const router = useRouter()
const $q = useQuasar()

const STORAGE_PATIENT = 'wt_selected_patient'
const STORAGE_CONSENT = id => `wt_consent_${id}`

const patient = ref(null)
const maskedDob = ref(true)
const maskedMrn = ref(true)
const consentNeeded = ref(false)
const lastEditTime = ref('2:14 PM')
const activePatientTab = ref('interview')

const micChoice = ref('Integrated Microphone')
const micOptions = ['Integrated Microphone', 'USB Headset', 'Bluetooth']

const isRecording = ref(false)
const isPaused = ref(false)
const recordingSeconds = ref(0)
let recordTimer = null
let wordTimer = null

const utteranceProgress = ref(0)
const wordIndex = ref(0)
const renderedUtterances = ref([])
const transcriptScrollRef = ref(null)
const transcriptComplete = ref(false)
const hoverUtterance = ref(null)

const filterSmallTalk = ref(false)
const clinical = ref({
  chiefComplaint: '',
  symptoms: [],
  keyTerms: [],
  provisional: '',
  actions: [],
})
const drugAlert = ref('')
const askReply = ref('')

const soapVisible = ref(false)
const soapLoading = ref(false)
const soapTemplate = ref('soap')
const soapTemplateOptions = DEMO_SOAP_TEMPLATES.map(t => ({ label: t.label, value: t.value }))
const soapSections = ref([])
const soapEditing = ref(null)

const billingCodes = ref(DEMO_BILLING_CODES.map(c => ({ ...c, status: 'pending' })))
const billingWarning = ref(true)
const showReferralCallout = ref(false)
const referralLetterVisible = ref(false)
const referralBody = ref(DEMO_REFERRAL_LETTER)
const referralUrgency = ref('routine')
const urgencyOptionsStyled = [
  { label: 'Routine', value: 'routine' },
  { label: 'Semi-Urgent', value: 'semi' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'STAT', value: 'stat' },
]
const referralSentMsg = ref('')
const referralComposing = ref(false)
const referralEditorMode = ref('read')
const referralInitials = ref('')
const referralSpecialist = ref(DEMO_SPECIALISTS[0]?.value || 'patel')
const specialistOptions = ref([...DEMO_SPECIALISTS])

const rightCollapsed = ref(false)
const rightSheetOpen = ref(false)
const windowNarrow = ref(false)
const stopConfirm = ref(false)
const emrModal = ref(false)
const emrSendStep = ref('pick')
const emrChoice = ref('Epic')
const emrOptions = ['Epic', 'Athenahealth', 'DrChrono', 'SimplePractice']

const bulkSpeaker = ref('doctor')
const bulkSpeakerOptions = [
  { label: 'Doctor', value: 'doctor' },
  { label: 'Patient', value: 'patient' },
  { label: 'Other', value: 'other' },
]

const correctionOpen = ref(false)
const correctionCustom = ref('')
const correctionCtx = ref(null)
const waveHeights = ref(Array.from({ length: 24 }, () => 4))

let waveTimer = null

const WORD_MS = 300

const visitTimeline = computed(() => DEMO_VISIT_TIMELINE)
const patientLastFirst = computed(() => {
  const n = patient.value?.name || ''
  const p = n.trim().split(/\s+/)
  if (p.length < 2) return n
  return `${p[p.length - 1]}, ${p.slice(0, -1).join(' ')}`
})

function checkWindowNarrow() {
  if (typeof window === 'undefined') return
  windowNarrow.value = window.innerWidth <= 768
}

function loadPatient() {
  try {
    const raw = sessionStorage.getItem(STORAGE_PATIENT)
    patient.value = raw ? JSON.parse(raw) : null
  } catch {
    patient.value = null
  }
  if (patient.value?.id) {
    consentNeeded.value = !localStorage.getItem(STORAGE_CONSENT(patient.value.id))
  }
}

function ackConsent() {
  if (patient.value?.id) {
    localStorage.setItem(STORAGE_CONSENT(patient.value.id), '1')
    consentNeeded.value = false
  }
}

function confirmChangePatient() {
  if (isRecording.value) {
    $q.dialog({
      title: 'Recording in progress',
      message: 'Stop recording and change patient?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      resetRecordingState()
      sessionStorage.removeItem(STORAGE_PATIENT)
      router.push('/start')
    })
  } else {
    sessionStorage.removeItem(STORAGE_PATIENT)
    router.push('/start')
  }
}

function resetRecordingState() {
  isRecording.value = false
  isPaused.value = false
  if (recordTimer) clearInterval(recordTimer)
  recordTimer = null
  if (wordTimer) clearInterval(wordTimer)
  wordTimer = null
  recordingSeconds.value = 0
  utteranceProgress.value = 0
  wordIndex.value = 0
  renderedUtterances.value = []
  transcriptComplete.value = false
  soapVisible.value = false
  soapLoading.value = false
  showReferralCallout.value = false
  referralLetterVisible.value = false
  referralSentMsg.value = ''
  referralComposing.value = false
  referralEditorMode.value = 'read'
  referralInitials.value = ''
  billingCodes.value = DEMO_BILLING_CODES.map(c => ({ ...c, status: 'pending' }))
  clinical.value = { chiefComplaint: '', symptoms: [], keyTerms: [], provisional: '', actions: [] }
  soapEditing.value = null
  emrSendStep.value = 'pick'
}

function toggleRecord() {
  if (!isRecording.value) startRecording()
}

function togglePauseOnly() {
  isPaused.value = !isPaused.value
  if (isPaused.value) pauseWordStream()
  else resumeWordStream()
}

function startRecording() {
  resetRecordingState()
  isRecording.value = true
  isPaused.value = false
  utteranceProgress.value = 0
  wordIndex.value = 0
  renderedUtterances.value = []
  recordingSeconds.value = 0
  recordTimer = setInterval(() => {
    if (!isPaused.value) recordingSeconds.value += 1
  }, 1000)
  startWave()
  runWordStream()
}

function pauseWordStream() {
  if (wordTimer) clearInterval(wordTimer)
  wordTimer = null
  stopWave()
}

function resumeWordStream() {
  startWave()
  runWordStream()
}

function runWordStream() {
  if (wordTimer) clearInterval(wordTimer)
  const tick = () => {
    if (!isRecording.value || isPaused.value) return
    const uIdx = utteranceProgress.value
    const u = DEMO_UTTERANCES[uIdx]
    if (!u) {
      clearInterval(wordTimer)
      wordTimer = null
      transcriptComplete.value = true
      isRecording.value = false
      isPaused.value = false
      if (recordTimer) clearInterval(recordTimer)
      recordTimer = null
      stopWave()
      return
    }
    let block = renderedUtterances.value[uIdx]
    if (!block) {
      block = {
        speaker: u.speaker,
        role: u.role,
        startSec: u.startSec,
        words: [],
        smallTalk: !!u.smallTalk,
        adapted: u.role === 'doctor' && uIdx === 4,
      }
      renderedUtterances.value.push(block)
    }
    if (wordIndex.value < u.words.length) {
      block.words.push(u.words[wordIndex.value])
      wordIndex.value += 1
      nextTick(() => {
        const el = transcriptScrollRef.value
        if (el) el.scrollTop = el.scrollHeight
      })
    } else {
      applyMilestonesForCompletedUtterance(uIdx)
      utteranceProgress.value += 1
      wordIndex.value = 0
    }
  }
  wordTimer = setInterval(tick, WORD_MS)
}

function startWave() {
  stopWave()
  waveTimer = setInterval(() => {
    waveHeights.value = waveHeights.value.map(() => 4 + Math.random() * 28)
  }, 120)
}

function stopWave() {
  if (waveTimer) clearInterval(waveTimer)
  waveTimer = null
  waveHeights.value = waveHeights.value.map(() => 4)
}

function applyMilestonesForCompletedUtterance(completedUtteranceIndex) {
  DEMO_CLINICAL_MILESTONES.forEach(m => {
    if (m.afterUtteranceIndex === completedUtteranceIndex) {
      if (m.chiefComplaint) clinical.value.chiefComplaint = m.chiefComplaint
      if (m.symptoms) clinical.value.symptoms = [...m.symptoms]
      if (m.keyTerms) clinical.value.keyTerms = [...m.keyTerms]
      if (m.provisional) {
        clinical.value.provisional = m.provisional
        drugAlert.value =
          'Patient mentioned exertional symptoms — verify antihypertensive regimen if beta-blocker considered (simulated).'
      }
      if (m.actions) clinical.value.actions = [...m.actions]
    }
  })
}

function confirmStop() {
  stopConfirm.value = true
}

function endRecording() {
  stopConfirm.value = false
  pauseWordStream()
  isRecording.value = false
  if (recordTimer) clearInterval(recordTimer)
  recordTimer = null
  stopWave()
  transcriptComplete.value = true
}

function formatTime(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0')
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function formatClock(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function seekSim(sec) {
  $q.notify({ message: `Seek to ${formatClock(sec)} (simulated)`, color: 'primary', position: 'top' })
}

function isUncertainWord(w) {
  return /angina/i.test(w)
}

function notifyEdit() {
  $q.notify({ message: 'Inline edit (prototype)', color: 'grey-8' })
}

function notifyAssign() {
  $q.notify({ message: 'Speaker assignment (prototype)', color: 'grey-8' })
}

function applyBulkSpeaker() {
  const role = bulkSpeaker.value
  const label = role === 'doctor' ? 'DR. CHEN' : role === 'patient' ? 'PATIENT' : 'OTHER'
  renderedUtterances.value.forEach(b => {
    b.role = role
    b.speaker = label
  })
  $q.notify({ message: `All utterances set to ${label} (prototype)`, color: 'primary' })
}

function openCorrection(w, bi, wi) {
  correctionCtx.value = { bi, wi, w }
  correctionCustom.value = w.replace(/\?/g, '').replace(/[.,]/g, '') === 'angina' ? 'angina' : 'angina'
  correctionOpen.value = true
}

function applyCorrection(suggestion) {
  const ctx = correctionCtx.value
  if (!ctx) return
  const block = renderedUtterances.value[ctx.bi]
  if (block && block.words[ctx.wi] !== undefined) {
    block.words[ctx.wi] = suggestion.match(/angina/i) ? suggestion : 'angina'
  }
  lastEditTime.value = '2:15 PM'
  correctionOpen.value = false
  $q.notify({
    message: 'Corrected by Dr. James Chen at 2:15 PM',
    color: 'positive',
    icon: 'sym_o_edit',
  })
}

function scrollTranscriptToSecond(sec) {
  const idx = renderedUtterances.value.findIndex(b => b.startSec === sec)
  if (idx < 0) return
  nextTick(() => {
    const root = transcriptScrollRef.value
    const el = root?.querySelector?.(`[data-idx="${idx}"]`)
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  })
}

function onSoapBodyClick(ev) {
  const fn = ev.target.closest?.('.wt-soap-fn')
  if (fn) {
    const t = parseInt(fn.dataset.t, 10)
    if (!Number.isNaN(t)) {
      scrollTranscriptToSecond(t)
      seekSim(t)
    }
    return
  }
  const term = ev.target.closest?.('.wt-teal-term')
  if (term) {
    const tip = term.getAttribute('title')
    if (tip) $q.notify({ message: tip, color: 'primary', timeout: 4000 })
  }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderSoapSectionHtml(sec) {
  let html = escHtml(sec.text)
  if (sec.key === 'S') {
    html += ` <sup class="wt-soap-fn" data-t="5" style="cursor:pointer;color:#1565c0;font-weight:600">[0:05]</sup>`
  }
  if (sec.key === 'A') {
    html += ` <sup class="wt-soap-fn" data-t="45" style="cursor:pointer;color:#1565c0;font-weight:600">[0:45]</sup>`
  }
  if (sec.key === 'P') {
    html += ` <sup class="wt-soap-fn" data-t="67" style="cursor:pointer;color:#1565c0;font-weight:600">[1:07]</sup>`
  }
  let terms = [
    { re: /\b(stable angina)\b/gi, tip: 'Stable Angina Pectoris · ICD-10: I20.9 · 94% confidence' },
    { re: /\b(EKG)\b/g, tip: 'Electrocardiogram · CPT: 93000 · 88% confidence' },
    { re: /\b(stress test)\b/gi, tip: 'Cardiovascular stress test · CPT: 93015 · 76% confidence' },
    { re: /\b(cardiologist)\b/gi, tip: 'Specialist referral · documentation tip' },
  ]
  if (!/\bstable angina\b/i.test(sec.text)) {
    terms = [...terms, { re: /\b(angina)\b/gi, tip: 'Angina · ICD-10: I20.9 · 94% confidence' }]
  }
  for (const { re, tip } of terms) {
    html = html.replace(re, m => `<span class="wt-teal-term" title="${escHtml(tip)}">${m}</span>`)
  }
  return html
}

function generateSoap() {
  soapVisible.value = true
  soapLoading.value = true
  setTimeout(() => {
    applySoapTemplate()
    soapLoading.value = false
  }, 2000)
}

function applySoapTemplate() {
  const b = buildSoapBody(soapTemplate.value)
  const mk = (key, text) => ({
    key,
    text,
    words: text.split(/\s+/).filter(Boolean).length,
    locked: false,
    lockedAt: null,
    editCount: 0,
    undoStack: [],
    editBackup: text,
  })
  soapSections.value = [mk('S', b.S), mk('O', b.O), mk('A', b.A), mk('P', b.P)]
}

watch(soapTemplate, () => {
  if (soapVisible.value && !soapLoading.value) applySoapTemplate()
})

function toggleSoapEdit(key) {
  const sec = soapSections.value.find(s => s.key === key)
  if (!sec || sec.locked) return
  if (soapEditing.value === key) return
  soapEditing.value = key
  sec.editBackup = sec.text
  sec.undoStack = []
}

function saveSoapSection(sec) {
  sec.editCount += 1
  sec.words = sec.text.split(/\s+/).filter(Boolean).length
  sec.editBackup = sec.text
  soapEditing.value = null
}

function cancelSoapSection(sec) {
  sec.text = sec.editBackup
  soapEditing.value = null
}

function soapToolbarBold(sec) {
  sec.undoStack.push(sec.text)
  sec.text += ' **emphasis** '
}

function soapToolbarBullet(sec) {
  sec.undoStack.push(sec.text)
  sec.text += '\n• '
}

function soapToolbarUndo(sec) {
  if (sec.undoStack?.length) sec.text = sec.undoStack.pop()
}

function toggleSoapLock(sec) {
  if (sec.locked) {
    sec.locked = false
    sec.lockedAt = null
  } else {
    sec.locked = true
    sec.lockedAt = '2:18 PM'
    if (soapEditing.value === sec.key) soapEditing.value = null
  }
}

const approvedBillingCount = computed(() => billingCodes.value.filter(c => c.status === 'approved').length)
const estReimbursement = computed(() => {
  const n = approvedBillingCount.value
  if (n >= 3) return 342
  return 120 + n * 74
})

watch(approvedBillingCount, n => {
  if (n >= 2 && soapVisible.value && !soapLoading.value) showReferralCallout.value = true
})

function approveCode(c) {
  c.status = 'approved'
}

function openEmrModal() {
  emrSendStep.value = 'pick'
  emrModal.value = true
}

function confirmEmr() {
  emrSendStep.value = 'sending'
  setTimeout(() => {
    emrModal.value = false
    emrSendStep.value = 'pick'
    $q.notify({
      message: 'Notes sent to EMR · Reference ID: #TXN-4492',
      color: 'positive',
      icon: 'sym_o_check_circle',
    })
  }, 1600)
}

function draftReferral() {
  referralComposing.value = true
  referralLetterVisible.value = false
  setTimeout(() => {
    referralComposing.value = false
    referralLetterVisible.value = true
    referralBody.value = DEMO_REFERRAL_LETTER
    referralEditorMode.value = 'read'
  }, 1500)
}

function sendReferral(channel) {
  const labels = {
    fax: 'secure fax',
    email: 'email to specialist',
    pdf: 'Print PDF',
    ehr: 'EHR',
  }
  $q.notify({
    message: `Referral routed via ${labels[channel] || 'fax'} · April 2, 2026 (simulated)`,
    color: 'positive',
  })
}

function filterSpecialists(val, update) {
  update(() => {
    const needle = (val || '').toLowerCase()
    specialistOptions.value = needle
      ? DEMO_SPECIALISTS.filter(o => o.label.toLowerCase().includes(needle))
      : [...DEMO_SPECIALISTS]
  })
}

function confirmReferralSend() {
  if (!referralInitials.value?.trim()) {
    $q.notify({ message: 'Please enter initials to confirm.', color: 'warning' })
    return
  }
  referralSentMsg.value = 'Referral sent to Dr. Patel via secure fax · April 2, 2026, 2:24 PM. · Archived to patient folder (sim).'
  $q.notify({ message: referralSentMsg.value, color: 'positive' })
}

function onBillingConfirmModify(c, newCode) {
  if (newCode) c.code = newCode
  c.status = 'pending'
}

function simulateAsk() {
  askReply.value = 'Simulated: No documented amoxicillin allergy; penicillin allergy not listed (prototype).'
}

function resetDemo() {
  resetRecordingState()
  askReply.value = ''
  drugAlert.value = ''
  soapEditing.value = null
  referralComposing.value = false
  referralEditorMode.value = 'read'
  referralInitials.value = ''
  correctionOpen.value = false
  sessionStorage.setItem(STORAGE_PATIENT, JSON.stringify(DEMO_PATIENT))
  loadPatient()
  consentNeeded.value = false
  $q.notify({ message: 'Demo reset', color: 'primary' })
}

function onWindowKeydown(e) {
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.shiftKey && (e.key === 'r' || e.key === 'R')) {
    e.preventDefault()
    resetDemo()
  }
}

onMounted(() => {
  loadPatient()
  if (!patient.value) router.replace('/start')
  window.addEventListener('keydown', onWindowKeydown, true)
  checkWindowNarrow()
  window.addEventListener('resize', checkWindowNarrow)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkWindowNarrow)
  window.removeEventListener('keydown', onWindowKeydown, true)
  if (recordTimer) clearInterval(recordTimer)
  if (wordTimer) clearInterval(wordTimer)
  stopWave()
})
</script>

<style scoped>
.wt-session-page {
  background: #f8fafb;
  font-family: 'IBM Plex Sans', sans-serif;
}
.wt-h3 {
  font-family: 'DM Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #0f3d3d;
}
.wt-patient-banner {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
}
.font-mono {
  font-family: 'IBM Plex Mono', monospace;
}
.wt-main-card {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
}
.wt-record-btn-wrap {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: box-shadow 0.2s;
}
.wt-record-btn-wrap--active {
  box-shadow: 0 0 0 4px rgba(183, 28, 28, 0.25);
  animation: wt-pulse 1.4s ease-in-out infinite;
}
@keyframes wt-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(183, 28, 28, 0.2);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(183, 28, 28, 0.12);
  }
}
.wt-record-btn {
  width: 64px !important;
  height: 64px !important;
  background: #0f3d3d !important;
  color: #fff !important;
}
.wt-record-btn--recording {
  background: #b71c1c !important;
}
.wt-timer {
  color: #0f3d3d;
}
.wt-wave-bar {
  width: 4px;
  background: #1565c0;
  border-radius: 4px;
  min-height: 4px;
  transition: height 0.12s;
}
.wt-transcript-scroll {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 8px;
}
.wt-utter {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eceff1;
  background: #fafafa;
  animation: wt-fade-in 0.35s ease;
}
@keyframes wt-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.wt-speaker-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid transparent;
}
.wt-speaker-pill--doctor {
  background: #e0f2f1;
  color: #0f3d3d;
  border-color: #b2dfdb;
}
.wt-speaker-pill--patient {
  background: #eceff1;
  color: #37474f;
  border-color: #cfd8dc;
}
.wt-speaker-pill--other {
  background: #fafafa;
  color: #546e7a;
  border-color: #cfd8dc;
}
.wt-uncertain-wavy {
  text-decoration: underline wavy #ffc107;
  text-underline-offset: 3px;
  cursor: pointer;
}
.min-touch {
  min-height: 44px !important;
  min-width: 44px;
}
.wt-mic-row .wt-mic-select :deep(.q-field__native) {
  max-width: 0;
  opacity: 0;
  transition: max-width 0.2s, opacity 0.15s;
}
.wt-mic-row:hover .wt-mic-select :deep(.q-field__native),
.wt-mic-select :deep(.q-field__native:focus) {
  max-width: 200px;
  opacity: 1;
}
.wt-mic-row .wt-mic-select :deep(.q-field__control) {
  min-width: 48px;
}
.wt-pause-btn {
  background: #fff8e1 !important;
  color: #e65100 !important;
  border: 2px solid #ffe082 !important;
}
.wt-pause-btn--yellow {
  box-shadow: 0 0 0 1px rgba(230, 81, 0, 0.25);
}
.wt-pause-btn--active {
  background: #fff3e0 !important;
  border-color: #ffb74d !important;
}
.wt-spark-bars {
  gap: 3px;
  height: 32px;
  align-items: flex-end;
}
.wt-spark-bar {
  flex: 1;
  min-width: 4px;
  background: #1565c0;
  border-radius: 2px;
}
.wt-right-shell {
  max-width: 320px;
}
.wt-sheet-handle {
  min-height: 44px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px 12px 0 0;
  cursor: pointer;
  margin-bottom: 0;
}
@media (max-width: 768px) {
  .wt-session-row {
    flex-wrap: wrap;
  }
  .wt-right-shell {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    max-width: none;
    z-index: 2500;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
  .wt-right-shell:not(.wt-right-shell--open) .wt-right-panel {
    display: none;
  }
  .wt-right-shell.wt-right-shell--open .wt-right-panel {
    max-height: 55vh;
    overflow-y: auto;
    background: #f8fafb;
    border: 1px solid #e0e0e0;
    border-radius: 0;
    padding: 8px;
  }
}
.wt-modal-shadow {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}
.wt-referral-pre {
  white-space: pre-wrap;
  font-family: 'IBM Plex Sans', sans-serif;
  margin: 0;
  padding: 8px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #eceff1;
}
.wt-bulk-speaker {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}
.wt-small-talk {
  text-decoration: line-through;
  opacity: 0.55;
}
.wt-generate-soap {
  background: #0f3d3d !important;
  color: #fff !important;
  min-height: 48px;
  border-radius: 8px;
  animation: wt-pulse-cta 2s ease-in-out infinite;
}
@keyframes wt-pulse-cta {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(15, 61, 61, 0.35);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(15, 61, 61, 0);
  }
}
.wt-right-panel {
  width: 100%;
  max-width: 320px;
}
@media (min-width: 769px) {
  .wt-right-shell {
    max-width: 320px;
  }
}
@media (max-width: 1023px) and (min-width: 769px) {
  .wt-right-panel {
    max-width: 320px;
  }
}
.wt-referral-callout {
  background: #e3f2fd;
  border-color: #90caf9 !important;
}
</style>

<style>
.wt-teal-term {
  text-decoration: underline;
  text-decoration-color: #0f3d3d;
  text-underline-offset: 2px;
}
</style>
