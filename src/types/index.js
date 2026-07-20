// Type definitions (using JSDoc for IDE support)
/**
 * @typedef {Object} TimelineUpdate
 * @property {string} id
 * @property {string} date
 * @property {string} content
 */

/**
 * @typedef {'needs-research' | 'proven' | 'broken'} ValidationStatus
 */

/**
 * @typedef {Object} Hypothesis
 * @property {string} id
 * @property {string} title
 * @property {string} author
 * @property {string} content
 * @property {string} hypothesis - Main hypothesis (H)
 * @property {string} supporting - Supporting arguments (A)
 * @property {string} counter - Counter arguments (K)
 * @property {ValidationStatus} status
 * @property {string[]} relatedIds
 * @property {TimelineUpdate[]} timeline
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} AppData
 * @property {Hypothesis[]} hypotheses
 * @property {string|null} lastUpdated
 */

export const STATUS_LABELS = {
  'needs-research': 'Butuh Riset',
  'proven': 'Terbukti Benar',
  'broken': 'Terpatahkan'
};

export const STATUS_COLORS = {
  'needs-research': {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30'
  },
  'proven': {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30'
  },
  'broken': {
    bg: 'bg-rose-500/20',
    text: 'text-rose-400',
    border: 'border-rose-500/30'
  }
};

export const VALIDATION_STATUSES = ['needs-research', 'proven', 'broken'];
