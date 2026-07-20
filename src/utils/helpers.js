import { STATUS_LABELS } from '../types';

export function generateTitle(content) {
  if (!content || content.trim().length === 0) {
    return 'Hipotesa Tanpa Judul';
  }
  const words = content.trim().split(/\s+/);
  const firstFive = words.slice(0, 5);
  const title = firstFive.join(' ');
  return words.length > 5 ? title + '...' : title;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Hari ini';
  } else if (days === 1) {
    return 'Kemarin';
  } else if (days < 7) {
    return `${days} hari lalu`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} minggu lalu`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} bulan lalu`;
  } else {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}

export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch {
        document.body.removeChild(textarea);
        return false;
      }
    });
}

export function formatForWhatsApp(hypothesis) {
  const statusEmoji = {
    'needs-research': '🔍',
    'proven': '✅',
    'broken': '❌'
  };

  const statusText = STATUS_LABELS;

  let text = `📝 *HIPOTESA*\n\n`;
  text += `*${hypothesis.title || 'Tanpa Judul'}*\n`;
  text += `👤 Pencetus: ${hypothesis.author || 'Anonim'}\n`;
  text += `${statusEmoji[hypothesis.status]} Status: ${statusText[hypothesis.status]}\n\n`;

  if (hypothesis.hypothesis) {
    text += `📌 *Hipotesa Utama:*\n${hypothesis.hypothesis}\n\n`;
  }

  if (hypothesis.supporting) {
    text += `👍 *Argumen Pendukung:*\n${hypothesis.supporting}\n\n`;
  }

  if (hypothesis.counter) {
    text += `👎 *Sanggahan:*\n${hypothesis.counter}\n\n`;
  }

  if (hypothesis.timeline && hypothesis.timeline.length > 0) {
    text += `📅 *Perkembangan:*\n`;
    hypothesis.timeline.forEach(update => {
      const date = new Date(update.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      });
      text += `• [${date}] ${update.content}\n`;
    });
    text += `\n`;
  }

  text += `---\nDicatat via Hipotesa Journal`;

  return text;
}

export function parseStructuredContent(content) {
  const lines = content.split('\n');
  let hypothesis = '';
  let supporting = '';
  let counter = '';

  lines.forEach(line => {
    const upperLine = line.toUpperCase().trim();
    if (upperLine.startsWith('H:') || upperLine.startsWith('HIPOTESA:') || upperLine.startsWith('HYPOTHESIS:')) {
      hypothesis = line.substring(line.indexOf(':') + 1).trim();
    } else if (upperLine.startsWith('A:') || upperLine.startsWith('ARGUMEN:') || upperLine.startsWith('SUPPORTING:')) {
      supporting = line.substring(line.indexOf(':') + 1).trim();
    } else if (upperLine.startsWith('K:') || upperLine.startsWith('KONTRA:') || upperLine.startsWith('COUNTER:') || upperLine.startsWith('SANGGAHAN:')) {
      counter = line.substring(line.indexOf(':') + 1).trim();
    }
  });

  return { hypothesis, supporting, counter };
}

export function debounce(func, wait) {
  let timeout = null;
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
