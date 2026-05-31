// ============================================================
// MedMaster AI — Revision Schedule
// Spaced repetition: Day 7 → 14 → 21 → 45 → 90
// ============================================================

import { addDays } from 'date-fns'

/** The five revision intervals in days from when the topic was studied */
export const REVISION_INTERVALS = [7, 14, 21, 45, 90] as const

export type RevisionIntervalIndex = 0 | 1 | 2 | 3 | 4

/**
 * Given a study date, returns the scheduled datetime for a given revision number (1-indexed).
 */
export function getRevisionDate(studiedAt: Date, revisionNumber: number): Date {
  const intervalIndex = Math.min(revisionNumber - 1, REVISION_INTERVALS.length - 1)
  const days = REVISION_INTERVALS[intervalIndex] ?? REVISION_INTERVALS[REVISION_INTERVALS.length - 1]!
  return addDays(studiedAt, days)
}

/**
 * Returns the next revision date for a topic.
 * After the 5th revision (Day 90), the topic is considered Mastered — no further revisions.
 */
export function getNextRevisionDate(
  studiedAt: Date,
  revisionCount: number
): Date | null {
  const nextRevisionNumber = revisionCount + 1
  if (nextRevisionNumber > REVISION_INTERVALS.length) return null // Mastered
  return getRevisionDate(studiedAt, nextRevisionNumber)
}

/**
 * Builds the full revision schedule entries for a newly-studied topic.
 * Returns all 5 entries, each with their scheduled_for date.
 */
export function buildRevisionSchedule(
  userId: string,
  topicId: string,
  studiedAt: Date
): Array<{
  user_id: string
  topic_id: string
  scheduled_for: string
  status: 'scheduled'
  revision_number: number
}> {
  return REVISION_INTERVALS.map((_, index) => ({
    user_id: userId,
    topic_id: topicId,
    scheduled_for: getRevisionDate(studiedAt, index + 1).toISOString(),
    status: 'scheduled' as const,
    revision_number: index + 1,
  }))
}

/**
 * Determines if a topic is overdue based on next_revision_at.
 * A topic becomes overdue 7 days after its scheduled revision date (grace + snooze limit).
 */
export function isTopicOverdue(nextRevisionAt: string | null): boolean {
  if (!nextRevisionAt) return false
  const revisionDate = new Date(nextRevisionAt)
  const overdueDate = addDays(revisionDate, 7) // 7-day snooze limit
  return new Date() > overdueDate
}

/**
 * Snooze a revision by a given number of days.
 * Max snooze is 7 days from today.
 */
export function getSnoozeDate(days: 1 | 2 | 3 | 7): Date {
  return addDays(new Date(), days)
}

/**
 * Calculates the retention score delta after a revision.
 * Good score → retention increases toward 100
 * Poor score → retention stays flat or drops slightly
 */
export function calculateRetentionDelta(
  currentRetention: number,
  mcqScore: number | null
): number {
  if (mcqScore === null) {
    // Completed revision without MCQs → small boost
    return Math.min(100 - currentRetention, 8)
  }

  if (mcqScore >= 80) {
    // Great performance
    return Math.min(100 - currentRetention, 15)
  } else if (mcqScore >= 60) {
    // Moderate
    return Math.min(100 - currentRetention, 8)
  } else if (mcqScore >= 40) {
    // Weak
    return 0 // No change — needs more work
  } else {
    // Very poor
    return -5 // Slight penalty
  }
}

/**
 * Calculates the new topic level based on revision count and MCQ performance.
 */
export function calculateNewLevel(
  currentLevel: number,
  revisionCount: number,
  mcqAvgScore: number
): number {
  if (revisionCount === 0) return 1 // Studied
  if (revisionCount >= 1 && mcqAvgScore >= 60) return 2 // Completed
  if (revisionCount >= 2 && mcqAvgScore >= 70) return 3 // Revised
  if (revisionCount >= 4 && mcqAvgScore >= 80) return 4 // Mastered
  return Math.max(currentLevel, 2) // At minimum Completed after first revision
}

/** Label for each topic level */
export const LEVEL_LABELS: Record<number, string> = {
  0: 'Not Started',
  1: 'Studied',
  2: 'Completed',
  3: 'Revised',
  4: 'Mastered',
}

/** Color class for each topic level */
export const LEVEL_COLORS: Record<number, string> = {
  0: 'text-3 bg-surface-2',
  1: 'text-amber-800 bg-amber-100',
  2: 'text-green-800 bg-green-100',
  3: 'text-green-900 bg-green-200',
  4: 'text-green-900 bg-green-300',
}
