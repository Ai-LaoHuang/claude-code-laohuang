export type FeedbackSurveyResponse = 'dismissed' | 'bad' | 'fine' | 'good'
export type FeedbackSurveyType = 'session' | 'general' | 'memory' | 'post_compact'

export function shouldShowFeedbackSurvey(): boolean {
  return false
}

export function shouldShowMemorySurvey(): boolean {
  return false
}

export function shouldShowPostCompactSurvey(): boolean {
  return false
}
