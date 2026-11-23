export const TONE_OPTIONS = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'professional', label: 'Professional' },
] as const

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fa', label: 'Persian' },
  { value: 'ar', label: 'Arabic' },
  { value: 'tr', label: 'Turkish' },
  { value: 'de', label: 'German' },
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
  purchase_intent: 'Purchase intent',
  product_inquiry: 'Product inquiry',
  pricing_inquiry: 'Pricing inquiry',
  shipping_inquiry: 'Shipping inquiry',
  order_issue: 'Order issue',
  complaint: 'Complaint',
  technical_question: 'Technical question',
  contact_request: 'Contact request',
  positive_feedback: 'Positive feedback',
  negative_feedback: 'Negative feedback',
  general_question: 'General question',
  spam: 'Spam',
  other: 'Other',
  // Legacy intent values remain readable for comments classified before Stage 1.
  question: 'General question',
  praise: 'Positive feedback',
}

export const INTENT_OPTIONS = [
  { value: 'purchase_intent', label: 'Purchase intent' },
  { value: 'product_inquiry', label: 'Product inquiry' },
  { value: 'pricing_inquiry', label: 'Pricing inquiry' },
  { value: 'shipping_inquiry', label: 'Shipping inquiry' },
  { value: 'order_issue', label: 'Order issue' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'technical_question', label: 'Technical question' },
  { value: 'contact_request', label: 'Contact request' },
  { value: 'positive_feedback', label: 'Positive feedback' },
  { value: 'negative_feedback', label: 'Negative feedback' },
  { value: 'general_question', label: 'General question' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
] as const

export const URGENCY_LABELS: Record<string, string> = {
  low: 'Low urgency',
  normal: 'Normal urgency',
  high: 'High urgency',
}
