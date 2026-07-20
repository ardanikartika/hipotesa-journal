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
 * @typedef {Object} Source
 * @property {string} title - Judul sumber
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

// Topik riset
export const TOPICS = [
  { key: 'philosophy', label: 'Filsafat', emoji: '🤔', color: '#8B5CF6' },
  { key: 'economics', label: 'Ekonomi', emoji: '📊', color: '#10B981' },
  { key: 'business', label: 'Bisnis', emoji: '💼', color: '#F59E0B' },
  { key: 'religion', label: 'Agama', emoji: '🕌', color: '#6366F1' },
  { key: 'science', label: 'Sains', emoji: '🔬', color: '#3B82F6' },
  { key: 'tech', label: 'Teknologi', emoji: '💻', color: '#EC4899' },
  { key: 'politics', label: 'Politik', emoji: '🏛️', color: '#EF4444' },
  { key: 'art', label: 'Seni', emoji: '🎨', color: '#F97316' },
  { key: 'health', label: 'Kesehatan', emoji: '💊', color: '#14B8A6' },
  { key: 'education', label: 'Pendidikan', emoji: '📚', color: '#A855F7' },
  { key: 'other', label: 'Lainnya', emoji: '📌', color: '#6B7280' },
];

export const SOURCE_STATUSES = ['to-read', 'reading', 'done'];

export const SOURCE_TYPES = [
  { key: 'book', label: '📚 Buku', icon: '📚' },
  { key: 'article', label: '📄 Artikel', icon: '📄' },
  { key: 'video', label: '🎥 Video', icon: '🎥' },
  { key: 'website', label: '🌐 Website', icon: '🌐' },
  { key: 'journal', label: '📖 Jurnal', icon: '📖' },
  { key: 'interview', label: '🎤 Wawancara', icon: '🎤' },
  { key: 'other', label: '📌 Lainnya', icon: '📌' }
];
