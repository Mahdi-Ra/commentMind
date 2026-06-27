export const TONE_OPTIONS = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'professional', label: 'Professional' },
] as const

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
] as const

export const STATUS_LABELS: Record<string, string> = {
  approved: 'Approved',
  spam: 'Spam',
  replied: 'Replied',
  uncertain: 'Review',
  pending: 'Pending',
}

export const STATUS_VARIANTS: Record<string, 'success' | 'danger' | 'info' | 'warning' | 'neutral'> = {
  approved: 'success',
  spam: 'danger',
  replied: 'info',
  uncertain: 'warning',
  pending: 'neutral',
}

export const INTENT_LABELS: Record<string, string> = {
  question: 'Question',
  complaint: 'Complaint',
  praise: 'Praise',
  spam: 'Spam',
  other: 'Other',
}
