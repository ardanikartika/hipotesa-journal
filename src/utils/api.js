const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  async getAll() {
    const res = await fetch(`${API_BASE}/hypotheses`);
    if (!res.ok) throw new Error('Failed to fetch hypotheses');
    return res.json();
  },

  async getOne(id) {
    const res = await fetch(`${API_BASE}/hypotheses/${id}`);
    if (!res.ok) throw new Error('Hypothesis not found');
    return res.json();
  },

  async create(data) {
    const res = await fetch(`${API_BASE}/hypotheses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create hypothesis');
    return res.json();
  },

  async update(id, data) {
    const res = await fetch(`${API_BASE}/hypotheses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update hypothesis');
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_BASE}/hypotheses/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete hypothesis');
  },

  async addTimeline(id, content) {
    const res = await fetch(`${API_BASE}/hypotheses/${id}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Failed to add timeline update');
    return res.json();
  },

  async getRandom() {
    const res = await fetch(`${API_BASE}/hypotheses/random`);
    if (!res.ok) throw new Error('No hypotheses found');
    return res.json();
  },

  async exportData() {
    const res = await fetch(`${API_BASE}/export`);
    if (!res.ok) throw new Error('Failed to export data');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hipotesa-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return res.json();
  },

  async importData(data) {
    const res = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to import data');
  },

  async sync(lastUpdate) {
    const url = lastUpdate
      ? `${API_BASE}/sync?lastUpdate=${encodeURIComponent(lastUpdate)}`
      : `${API_BASE}/sync`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to sync data');
    return res.json();
  },

  async healthCheck() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
};

export default api;
