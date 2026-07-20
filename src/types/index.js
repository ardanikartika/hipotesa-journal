// Type definitions (using JSDoc for IDE support)

/**
 * @typedef {Object} Finding
 * @property {string} text - Isi finding/evidence
 * @property {string} date - Tanggal finding ditambahkan
 */

/**
 * @typedef {'to-read' | 'reading' | 'done'} SourceStatus
 */

/**
 * @typedef {'pdf' | 'link'} SourceType
 */

/**
 * @typedef {Object} Source
 * @property {string} title - Judul sumber
 * @property {string} url - URL sumber (opsional)
 * @property {SourceType} type - Tipe: pdf atau link
 * @property {SourceStatus} status - Status baca: to-read, reading, done
 * @property {string} dateAdded - Tanggal ditambahkan
 */

/**
 * @typedef {Object} Hypothesis
 * @property {string} id
 * @property {string} title - Judul hipotesa (pertanyaan utama)
 * @property {string} content - Deskripsi/latar belakang
 * @property {string} topic - Topik riset (philosophy, economics, dll)
 * @property {Finding[]} findings - Daftar finding/evidence
 * @property {Source[]} sources - Daftar source/reading list
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} AppData
 * @property {Hypothesis[]} hypotheses
 * @property {string|null} lastUpdated
 */

// Topik riset - warna simple
export const TOPICS = [
  { key: 'philosophy', label: 'Filsafat', emoji: '🤔', color: '#6366F1' },
  { key: 'economics', label: 'Ekonomi', emoji: '💰', color: '#059669' },
  { key: 'business', label: 'Bisnis', emoji: '💼', color: '#D97706' },
  { key: 'religion', label: 'Agama', emoji: '🕌', color: '#7C3AED' },
  { key: 'science', label: 'Sains', emoji: '🔬', color: '#2563EB' },
  { key: 'tech', label: 'Teknologi', emoji: '💻', color: '#DC2626' },
  { key: 'politics', label: 'Politik', emoji: '🏛️', color: '#DB2777' },
  { key: 'art', label: 'Seni', emoji: '🎨', color: '#EA580C' },
  { key: 'health', label: 'Kesehatan', emoji: '🏥', color: '#0891B2' },
  { key: 'education', label: 'Pendidikan', emoji: '📚', color: '#4F46E5' },
  { key: 'other', label: 'Lainnya', emoji: '📌', color: '#64748B' },
];

export const SOURCE_STATUSES = ['to-read', 'reading', 'done'];

export const SOURCE_TYPES = [
  { key: 'pdf', label: '📄 PDF', icon: '📄' },
  { key: 'link', label: '🔗 Link', icon: '🔗' },
];
