import exampleData from './example-transcript.json'
import johnDoeMedicalData from './john-doe-medical.json'
import johnSmithMedicalData from './john-smith-medical.json'

export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function groupIntoParagraphs(words, speakers) {
  const paragraphs = []
  let current = null

  for (const word of words) {
    if (!current || current.speaker !== word.speaker) {
      if (current) paragraphs.push(current)
      const speakerInfo = speakers.find(s => s.speaker === word.speaker)
      current = {
        speaker: word.speaker,
        speakerLabel: speakerInfo?.speakerLabel || `Speaker ${word.speaker}`,
        startTime: word.start,
        endTime: word.end,
        words: [word.punctuated_word],
      }
    } else {
      current.endTime = word.end
      current.words.push(word.punctuated_word)
    }
  }
  if (current) paragraphs.push(current)

  return paragraphs.map(p => ({
    ...p,
    text: p.words.join(' '),
  }))
}

function resolveSpeakerPlaceholders(text, speakers) {
  let resolved = text
  for (const s of speakers) {
    resolved = resolved.replaceAll(`{{speaker:${s.speaker}}}`, s.speakerLabel)
  }
  return resolved
}

export function buildTranscript(dataset) {
  const record = dataset?.record || {}
  const speakers = record?.speakers || []
  const paragraphs = groupIntoParagraphs(dataset?.words || [], speakers)
  const contentItems = (dataset?.content || []).map(item => ({
    ...item,
    results: (item.results || []).map(r => ({
      ...r,
      body: resolveSpeakerPlaceholders(r.body || '', speakers),
    })),
  }))

  return { record, paragraphs, contentItems }
}

export function getTranscriptById(id) {
  if (id === 'john-smith') return buildTranscript(johnSmithMedicalData)
  if (id === 'john-doe') return buildTranscript(johnDoeMedicalData)
  return buildTranscript(exampleData)
}
