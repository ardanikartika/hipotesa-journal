import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  Trash2,
  Pencil,
  Sun,
  Moon,
  Sparkles,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  BookOpen,
  Lightbulb,
  Brain,
  Shuffle,
  PenLine,
  Archive,
  Check,
  Link2,
  Plus,
  History,
  User,
  Users,
  RefreshCw,
  CloudOff,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Tokens & constants                                                 */
/* ------------------------------------------------------------------ */

const FONTS_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');";

const THEME = {
  dark: {
    bg: "#0F1013",
    surface: "#17181D",
    surfaceRaised: "#1D1F26",
    border: "#2A2C34",
    borderSoft: "#212329",
    text: "#ECEDF0",
    textSoft: "#9298A6",
    textFaint: "#5C616E",
    accent: "#E8A33D",
    accentSoft: "#3A2F1E",
    danger: "#E2685A",
    dangerSoft: "#3A1F1D",
    link: "#6FA8DC",
    linkSoft: "#1D2A38",
    good: "#6FCF97",
  },
  light: {
    bg: "#F1EFEA",
    surface: "#FFFFFF",
    surfaceRaised: "#FBFAF7",
    border: "#E2DFD6",
    borderSoft: "#EAE7DE",
    text: "#1C1D22",
    textSoft: "#6B6E78",
    textFaint: "#9A9DA6",
    accent: "#B5751F",
    accentSoft: "#F4E6D0",
    danger: "#C24A3D",
    dangerSoft: "#F5DEDA",
    link: "#2F6FB0",
    linkSoft: "#E3EDF6",
    good: "#2F9E5C",
  },
};

const CATEGORIES = [
  { id: "sains", label: "Sains", icon: FlaskConical, color: "#5EC8D8" },
  { id: "filsafat", label: "Filsafat", icon: BookOpen, color: "#B98CE0" },
  { id: "bisnis", label: "Ide Bisnis", icon: Lightbulb, color: "#62C99A" },
  { id: "psikologi", label: "Psikologi", icon: Brain, color: "#E8A33D" },
  { id: "random", label: "Random", icon: Shuffle, color: "#9098A8" },
];

const categoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[4];

// Shared (semua pengguna) vs personal (per perangkat)
const NOTES_KEY = "notes-all";
const THEME_KEY = "theme-pref";
const POLL_INTERVAL_MS = 7000;

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function splitSentences(text) {
  const cleaned = (text || "").trim();
  if (!cleaned) return [];
  const matches = cleaned.match(/[^.!?]+[.!?]*/g) || [cleaned];
  return matches.map((s) => s.trim()).filter(Boolean);
}

function generateStructure(text) {
  const sentences = splitSentences(text);
  if (sentences.length === 0) {
    return { hipotesa: "", argumen: "", argumenKontra: "", kesimpulan: "" };
  }
  if (sentences.length === 1) {
    return { hipotesa: sentences[0], argumen: "", argumenKontra: "", kesimpulan: "" };
  }
  if (sentences.length === 2) {
    return {
      hipotesa: sentences[0],
      argumen: "",
      argumenKontra: "",
      kesimpulan: sentences[1],
    };
  }
  const hipotesa = sentences[0];
  const kesimpulan = sentences[sentences.length - 1];
  const argumen = sentences.slice(1, -1).join(" ");
  return { hipotesa, argumen, argumenKontra: "", kesimpulan };
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(date) {
  if (!date) return "";
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 5) return "baru saja";
  if (sec < 60) return `${sec} dtk lalu`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} mnt lalu`;
  const hr = Math.floor(min / 60);
  return `${hr} jam lalu`;
}

// Judul catatan otomatis: 4-5 kata pertama dari Hipotesa Utama
function getTitle(note) {
  const source = (note?.hipotesa || note?.rawText || "").trim();
  if (!source) return "Tanpa Judul";
  const words = source.split(/\s+/).filter(Boolean);
  const count = Math.min(words.length, 5);
  const titleWords = words.slice(0, Math.max(count, Math.min(4, words.length)));
  let title = titleWords.join(" ");
  if (words.length > titleWords.length) title += "\u2026";
  return title;
}

function excerpt(note) {
  const source = note.argumen || note.rawText || "";
  return source.length > 100 ? source.slice(0, 100).trim() + "\u2026" : source;
}

function uid(prefix = "n") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                               */
/* ------------------------------------------------------------------ */

function CategoryStamp({ category, size = 30 }) {
  const cat = categoryById(category);
  const Icon = cat.icon;
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${cat.color}`,
        color: cat.color,
        transform: "rotate(-4deg)",
        background: "transparent",
      }}
    >
      <Icon size={size * 0.52} strokeWidth={2} />
    </div>
  );
}

function CategoryPicker({ value, onChange, t }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {CATEGORIES.map((c) => {
        const Icon = c.icon;
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm shrink-0 transition-all"
            style={{
              border: `1.5px solid ${active ? c.color : t.border}`,
              background: active ? `${c.color}1A` : "transparent",
              color: active ? c.color : t.textSoft,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          >
            <Icon size={15} strokeWidth={2.2} />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function MarginRow({ label, tag, value, onChange, editable, t, accent, optional }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-0.5 shrink-0" style={{ width: 26 }}>
        <div
          className="flex items-center justify-center rounded-full text-[11px] font-bold"
          style={{
            width: 22,
            height: 22,
            border: `1.5px solid ${accent}`,
            color: accent,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {tag}
        </div>
        <div className="flex-1 w-px mt-1" style={{ background: t.border }} />
      </div>
      <div className="flex-1 pb-4">
        <div
          className="text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5"
          style={{ color: t.textFaint, fontFamily: "JetBrains Mono, monospace" }}
        >
          {label}
          {optional && (
            <span
              className="normal-case text-[10px] px-1 rounded"
              style={{ background: t.borderSoft, color: t.textFaint }}
            >
              opsional
            </span>
          )}
        </div>
        {editable ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={label.startsWith("Argumen") ? 3 : 2}
            placeholder={optional ? "Tulis sanggahan/bukti tandingan jika ada..." : "\u2014 kosong \u2014"}
            className="w-full resize-none rounded-lg px-2.5 py-2 text-[14px] leading-relaxed outline-none"
            style={{
              background: t.surfaceRaised,
              border: `1px solid ${t.border}`,
              color: t.text,
              fontFamily: "Inter, sans-serif",
            }}
          />
        ) : (
          <p
            className="text-[14px] leading-relaxed whitespace-pre-wrap"
            style={{ color: value ? t.text : t.textFaint, fontFamily: "Inter, sans-serif" }}
          >
            {value || "\u2014 kosong \u2014"}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export default function JurnalHipotesa() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("input");
  const [notes, setNotes] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // sync state (shared storage)
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [, forceTick] = useState(0); // untuk refresh label "x detik lalu"

  // input form state
  const [originator, setOriginator] = useState("");
  const [rawText, setRawText] = useState("");
  const [category, setCategory] = useState("random");
  const [structured, setStructured] = useState(null);
  const [linkedNoteId, setLinkedNoteId] = useState("");
  const [editingId, setEditingId] = useState(null);

  // archive state
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // link jump / scroll
  const noteRefs = useRef({});
  const [pendingScrollId, setPendingScrollId] = useState(null);

  const t = THEME[theme];

  /* -------------------- shared notes: load & poll -------------------- */

  const fetchNotes = async ({ silent = false } = {}) => {
    if (silent) setIsSyncing(true);
    else setIsLoading(true);
    try {
      const result = await window.storage.get(NOTES_KEY, true);
      const remote = result && result.value ? JSON.parse(result.value) : [];
      setNotes(Array.isArray(remote) ? remote : []);
      setLastSyncedAt(new Date());
      setSyncError(null);
    } catch (e) {
      // kunci belum pernah dibuat = arsip masih kosong, bukan error nyata
      if (!silent) setNotes([]);
      else setSyncError("Gagal memuat pembaruan terbaru.");
    } finally {
      if (silent) setIsSyncing(false);
      else setIsLoading(false);
    }
  };

  const persistNotes = async (newNotes) => {
    setNotes(newNotes); // optimistic update di layar ini
    try {
      const result = await window.storage.set(NOTES_KEY, JSON.stringify(newNotes), true);
      if (!result) throw new Error("write returned null");
      setLastSyncedAt(new Date());
      setSyncError(null);
    } catch (e) {
      setSyncError("Perubahan tampil di layarmu, tapi belum tersimpan ke server bersama.");
    }
  };

  useEffect(() => {
    fetchNotes();
    const poll = setInterval(() => fetchNotes({ silent: true }), POLL_INTERVAL_MS);
    const onFocus = () => fetchNotes({ silent: true });
    window.addEventListener("focus", onFocus);
    const clock = setInterval(() => forceTick((x) => x + 1), 5000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // jika catatan yang sedang di-expand ternyata dihapus pengguna lain, tutup detailnya
  useEffect(() => {
    if (expandedId && !notes.find((n) => n.id === expandedId)) {
      setExpandedId(null);
    }
  }, [notes, expandedId]);

  /* -------------------- theme: personal preference -------------------- */

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(THEME_KEY, false);
        if (result && (result.value === "light" || result.value === "dark")) {
          setTheme(result.value);
        }
      } catch (e) {
        // belum ada preferensi tersimpan, pakai default
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.storage.set(THEME_KEY, theme, false).catch(() => {});
  }, [theme, hydrated]);

  /* -------------------- scroll-to-linked-note -------------------- */

  useEffect(() => {
    if (pendingScrollId && noteRefs.current[pendingScrollId]) {
      noteRefs.current[pendingScrollId].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setPendingScrollId(null);
    }
  }, [pendingScrollId, notes, query, filterCategory, activeTab]);

  /* -------------------- form actions -------------------- */

  const handleGenerateStructure = () => {
    if (!rawText.trim()) return;
    setStructured(generateStructure(rawText));
  };

  const resetForm = () => {
    setOriginator("");
    setRawText("");
    setCategory("random");
    setStructured(null);
    setLinkedNoteId("");
    setEditingId(null);
  };

  const handleSave = () => {
    if (!rawText.trim()) return;
    const finalStructured = structured || generateStructure(rawText);
    let newNotes;

    if (editingId) {
      newNotes = notes.map((n) =>
        n.id === editingId
          ? {
              ...n,
              originator,
              rawText,
              category,
              ...finalStructured,
              linkedNoteId: linkedNoteId || null,
              updatedAt: new Date().toISOString(),
            }
          : n
      );
    } else {
      const newNote = {
        id: uid(),
        date: new Date().toISOString(),
        category,
        originator,
        rawText,
        ...finalStructured,
        linkedNoteId: linkedNoteId || null,
        updates: [],
      };
      newNotes = [newNote, ...notes];
    }
    persistNotes(newNotes);
    resetForm();
    setActiveTab("archive");
  };

  const handleEdit = (note) => {
    setOriginator(note.originator || "");
    setRawText(note.rawText);
    setCategory(note.category);
    setStructured({
      hipotesa: note.hipotesa,
      argumen: note.argumen,
      argumenKontra: note.argumenKontra || "",
      kesimpulan: note.kesimpulan,
    });
    setLinkedNoteId(note.linkedNoteId || "");
    setEditingId(note.id);
    setActiveTab("input");
  };

  const handleDelete = (id) => {
    const newNotes = notes.filter((n) => n.id !== id);
    persistNotes(newNotes);
    setConfirmDeleteId(null);
    if (expandedId === id) setExpandedId(null);
  };

  const handleAddUpdate = (noteId, text) => {
    if (!text.trim()) return;
    const newNotes = notes.map((n) =>
      n.id === noteId
        ? {
            ...n,
            updates: [
              ...(n.updates || []),
              { id: uid("log"), date: new Date().toISOString(), text: text.trim() },
            ],
          }
        : n
    );
    persistNotes(newNotes);
  };

  const handleDeleteUpdate = (noteId, updateId) => {
    const newNotes = notes.map((n) =>
      n.id === noteId
        ? { ...n, updates: (n.updates || []).filter((u) => u.id !== updateId) }
        : n
    );
    persistNotes(newNotes);
  };

  const jumpToNote = (id) => {
    setQuery("");
    setFilterCategory("all");
    setExpandedId(id);
    setPendingScrollId(id);
    setActiveTab("archive");
  };

  /* -------------------- derived archive list -------------------- */

  const filteredNotes = notes.filter((n) => {
    const matchesCategory =
      filterCategory === "all" || n.category === filterCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      n.rawText?.toLowerCase().includes(q) ||
      n.hipotesa?.toLowerCase().includes(q) ||
      n.argumen?.toLowerCase().includes(q) ||
      n.kesimpulan?.toLowerCase().includes(q) ||
      n.originator?.toLowerCase().includes(q) ||
      getTitle(n).toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  /* -------------------- render -------------------- */

  return (
    <div
      className="min-h-screen w-full flex justify-center"
      style={{ background: t.bg, transition: "background 0.25s ease" }}
    >
      <style>{`
        ${FONTS_IMPORT}
        * { -webkit-tap-highlight-color: transparent; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        textarea:focus, input:focus, select:focus { outline: none; }
      `}</style>

      <div
        className="w-full flex flex-col relative"
        style={{ maxWidth: 480, minHeight: "100vh" }}
      >
        {/* Header */}
        <header
          className="flex items-start justify-between px-5 pt-6 pb-4 shrink-0"
          style={{ borderBottom: `1px solid ${t.borderSoft}` }}
        >
          <div>
            <div
              className="text-[11px] uppercase tracking-[0.15em] mb-0.5"
              style={{ color: t.accent, fontFamily: "JetBrains Mono, monospace" }}
            >
              Buku Catatan Bersama
            </div>
            <h1
              className="text-[22px] leading-tight mb-1.5"
              style={{
                color: t.text,
                fontFamily: "Fraunces, serif",
                fontWeight: 600,
              }}
            >
              Jurnal Hipotesa
            </h1>
            <SyncBadge
              t={t}
              isLoading={isLoading}
              isSyncing={isSyncing}
              syncError={syncError}
              lastSyncedAt={lastSyncedAt}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchNotes({ silent: true })}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 38,
                height: 38,
                border: `1px solid ${t.border}`,
                color: t.textSoft,
                background: t.surface,
              }}
              aria-label="Segarkan data"
            >
              <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 38,
                height: 38,
                border: `1px solid ${t.border}`,
                color: t.textSoft,
                background: t.surface,
              }}
              aria-label="Ganti tema"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-5 pt-5 pb-28 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center pt-20 gap-3">
              <Loader2 size={26} className="animate-spin" style={{ color: t.accent }} />
              <p
                className="text-[13.5px]"
                style={{ color: t.textSoft, fontFamily: "Inter, sans-serif" }}
              >
                Memuat arsip bersama...
              </p>
            </div>
          ) : activeTab === "input" ? (
            <InputTab
              t={t}
              notes={notes}
              originator={originator}
              setOriginator={setOriginator}
              rawText={rawText}
              setRawText={setRawText}
              category={category}
              setCategory={setCategory}
              structured={structured}
              setStructured={setStructured}
              linkedNoteId={linkedNoteId}
              setLinkedNoteId={setLinkedNoteId}
              handleGenerateStructure={handleGenerateStructure}
              handleSave={handleSave}
              editingId={editingId}
              resetForm={resetForm}
            />
          ) : (
            <ArchiveTab
              t={t}
              allNotes={notes}
              notes={filteredNotes}
              totalCount={notes.length}
              query={query}
              setQuery={setQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              onEdit={handleEdit}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              onDelete={handleDelete}
              onAddUpdate={handleAddUpdate}
              onDeleteUpdate={handleDeleteUpdate}
              onJumpToNote={jumpToNote}
              noteRefs={noteRefs}
              goToInput={() => {
                resetForm();
                setActiveTab("input");
              }}
            />
          )}
        </main>

        {/* Bottom navigation */}
        <nav
          className="fixed bottom-0 left-0 right-0 flex justify-center"
          style={{ background: "transparent" }}
        >
          <div
            className="w-full flex"
            style={{
              maxWidth: 480,
              background: t.surface,
              borderTop: `1px solid ${t.borderSoft}`,
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <NavButton
              icon={PenLine}
              label="Input Baru"
              active={activeTab === "input"}
              onClick={() => setActiveTab("input")}
              t={t}
            />
            <NavButton
              icon={Archive}
              label="Arsip Hipotesa"
              active={activeTab === "archive"}
              onClick={() => setActiveTab("archive")}
              t={t}
              badge={notes.length}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sync badge                                                          */
/* ------------------------------------------------------------------ */

function SyncBadge({ t, isLoading, isSyncing, syncError, lastSyncedAt }) {
  if (isLoading) return null;

  if (syncError) {
    return (
      <div
        className="flex items-center gap-1 text-[11px] w-fit px-2 py-1 rounded-full"
        style={{ background: t.dangerSoft, color: t.danger, fontFamily: "Inter, sans-serif", fontWeight: 600 }}
      >
        <CloudOff size={11} /> {syncError}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 text-[11px] w-fit px-2 py-1 rounded-full"
      style={{ background: t.borderSoft, color: t.textSoft, fontFamily: "Inter, sans-serif", fontWeight: 500 }}
    >
      <Users size={11} style={{ color: t.good }} />
      Bersama semua orang
      {lastSyncedAt && (
        <>
          <span style={{ color: t.textFaint }}>·</span>
          <span>{isSyncing ? "menyinkron..." : timeAgo(lastSyncedAt)}</span>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Nav button                                                          */
/* ------------------------------------------------------------------ */

function NavButton({ icon: Icon, label, active, onClick, t, badge }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 relative"
      style={{ color: active ? t.accent : t.textFaint }}
    >
      <div className="relative">
        <Icon size={21} strokeWidth={active ? 2.4 : 2} />
        {badge > 0 && label.includes("Arsip") && (
          <span
            className="absolute -top-1.5 -right-2 text-[9px] rounded-full flex items-center justify-center"
            style={{
              minWidth: 15,
              height: 15,
              padding: "0 3px",
              background: t.accent,
              color: t.bg,
              fontFamily: "JetBrains Mono, monospace",
              fontWeight: 700,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <span
        className="text-[10.5px]"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: active ? 600 : 500 }}
      >
        {label}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Input Tab                                                           */
/* ------------------------------------------------------------------ */

function InputTab({
  t,
  notes,
  originator,
  setOriginator,
  rawText,
  setRawText,
  category,
  setCategory,
  structured,
  setStructured,
  linkedNoteId,
  setLinkedNoteId,
  handleGenerateStructure,
  handleSave,
  editingId,
  resetForm,
}) {
  const linkableNotes = notes.filter((n) => n.id !== editingId);

  return (
    <div className="flex flex-col gap-5">
      {editingId && (
        <div
          className="flex items-center justify-between rounded-lg px-3 py-2 text-[12.5px]"
          style={{
            background: t.accentSoft,
            color: t.accent,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
          }}
        >
          <span>Mengedit catatan yang tersimpan</span>
          <button onClick={resetForm} className="flex items-center gap-1">
            <X size={14} /> Batal
          </button>
        </div>
      )}

      {/* Pencetus Ide */}
      <div>
        <label
          className="text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5"
          style={{ color: t.textFaint, fontFamily: "JetBrains Mono, monospace" }}
        >
          <User size={12} /> Pencetus Ide
        </label>
        <input
          value={originator}
          onChange={(e) => setOriginator(e.target.value)}
          placeholder="Siapa yang mencetuskan ide ini? (opsional)"
          className="w-full rounded-lg px-3 py-2.5 text-[14px]"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            color: t.text,
            fontFamily: "Inter, sans-serif",
          }}
        />
      </div>

      {/* Category picker */}
      <div>
        <label
          className="block text-[11px] uppercase tracking-wider mb-2"
          style={{ color: t.textFaint, fontFamily: "JetBrains Mono, monospace" }}
        >
          Kategori
        </label>
        <CategoryPicker value={category} onChange={setCategory} t={t} />
      </div>

      {/* Text input */}
      <div>
        <label
          className="block text-[11px] uppercase tracking-wider mb-2"
          style={{ color: t.textFaint, fontFamily: "JetBrains Mono, monospace" }}
        >
          Catatan / Hipotesa
        </label>
        <div
          className="rounded-xl p-3 relative"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
        >
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Tulis ide, cerita teman, atau hipotesa di sini..."
            rows={6}
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed"
            style={{ color: t.text, fontFamily: "Inter, sans-serif" }}
          />
          <div className="flex items-center justify-end mt-2">
            <span
              className="text-[11px]"
              style={{ color: t.textFaint, fontFamily: "JetBrains Mono, monospace" }}
            >
              {rawText.trim().split(/\s+/).filter(Boolean).length} kata
            </span>
          </div>
        </div>
      </div>

      {/* Link Jurnal */}
      <div>
        <label
          className="text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5"
          style={{ color: t.textFaint, fontFamily: "JetBrains Mono, monospace" }}
        >
          <Link2 size={12} /> Hubungkan dengan Catatan Lama
        </label>
        <select
          value={linkedNoteId}
          onChange={(e) => setLinkedNoteId(e.target.value)}
          className="w-full rounded-lg px-3 py-2.5 text-[14px]"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            color: linkedNoteId ? t.text : t.textFaint,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <option value="">Tidak dihubungkan</option>
          {linkableNotes.map((n) => (
            <option key={n.id} value={n.id}>
              {getTitle(n)} — {formatDate(n.date)}
            </option>
          ))}
        </select>
        {linkableNotes.length === 0 && (
          <p
            className="text-[11.5px] mt-1.5"
            style={{ color: t.textFaint, fontFamily: "Inter, sans-serif" }}
          >
            Belum ada catatan lain di arsip untuk dihubungkan.
          </p>
        )}
      </div>

      {/* Generate structure */}
      <button
        onClick={handleGenerateStructure}
        disabled={!rawText.trim()}
        className="flex items-center justify-center gap-2 rounded-xl py-3 text-[14px]"
        style={{
          background: "transparent",
          border: `1.5px dashed ${rawText.trim() ? t.accent : t.border}`,
          color: rawText.trim() ? t.accent : t.textFaint,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
        }}
      >
        <Sparkles size={16} />
        Buat Struktur Ringkasan
      </button>

      {/* Structured preview */}
      {structured && (
        <div
          className="rounded-xl p-4"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
        >
          <div
            className="text-[11px] uppercase tracking-wider mb-3"
            style={{ color: t.textFaint, fontFamily: "JetBrains Mono, monospace" }}
          >
            Catatan Margin
          </div>
          <MarginRow
            label="Hipotesa Utama"
            tag="H"
            value={structured.hipotesa}
            onChange={(v) => setStructured({ ...structured, hipotesa: v })}
            editable
            t={t}
            accent={t.accent}
          />
          <MarginRow
            label="Argumen Pendukung"
            tag="A"
            value={structured.argumen}
            onChange={(v) => setStructured({ ...structured, argumen: v })}
            editable
            t={t}
            accent={categoryById("sains").color}
          />
          <MarginRow
            label="Argumen Kontra / Sanggahan"
            tag="S"
            value={structured.argumenKontra || ""}
            onChange={(v) => setStructured({ ...structured, argumenKontra: v })}
            editable
            optional
            t={t}
            accent={t.danger}
          />
          <MarginRow
            label="Kesimpulan / Catatan Kritis"
            tag="K"
            value={structured.kesimpulan}
            onChange={(v) => setStructured({ ...structured, kesimpulan: v })}
            editable
            t={t}
            accent={categoryById("bisnis").color}
          />
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!rawText.trim()}
        className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] sticky bottom-0"
        style={{
          background: rawText.trim() ? t.accent : t.borderSoft,
          color: rawText.trim() ? t.bg : t.textFaint,
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
        }}
      >
        <Save size={17} />
        {editingId ? "Simpan Perubahan" : "Simpan Catatan"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Archive Tab                                                         */
/* ------------------------------------------------------------------ */

function ArchiveTab({
  t,
  allNotes,
  notes,
  totalCount,
  query,
  setQuery,
  filterCategory,
  setFilterCategory,
  expandedId,
  setExpandedId,
  onEdit,
  confirmDeleteId,
  setConfirmDeleteId,
  onDelete,
  onAddUpdate,
  onDeleteUpdate,
  onJumpToNote,
  noteRefs,
  goToInput,
}) {
  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center pt-16 gap-3">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 56, height: 56, border: `1.5px dashed ${t.border}` }}
        >
          <Archive size={22} style={{ color: t.textFaint }} />
        </div>
        <p
          className="text-[15px] max-w-[220px]"
          style={{ color: t.textSoft, fontFamily: "Inter, sans-serif" }}
        >
          Arsip bersama masih kosong. Jadilah yang pertama mencatat hipotesa.
        </p>
        <button
          onClick={goToInput}
          className="text-[13.5px] px-4 py-2 rounded-lg mt-1"
          style={{
            background: t.accentSoft,
            color: t.accent,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
          }}
        >
          Tulis Catatan Baru
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-xl px-3"
        style={{ background: t.surface, border: `1px solid ${t.border}` }}
      >
        <Search size={16} style={{ color: t.textFaint }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari judul, isi, atau pencetus ide..."
          className="flex-1 bg-transparent py-2.5 text-[14px]"
          style={{ color: t.text, fontFamily: "Inter, sans-serif" }}
        />
        {query && (
          <button onClick={() => setQuery("")}>
            <X size={15} style={{ color: t.textFaint }} />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <button
          onClick={() => setFilterCategory("all")}
          className="rounded-full px-3 py-1.5 text-[13px] shrink-0"
          style={{
            border: `1.5px solid ${filterCategory === "all" ? t.text : t.border}`,
            color: filterCategory === "all" ? t.text : t.textSoft,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
          }}
        >
          Semua
        </button>
        {CATEGORIES.map((c) => {
          const active = filterCategory === c.id;
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setFilterCategory(active ? "all" : c.id)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] shrink-0"
              style={{
                border: `1.5px solid ${active ? c.color : t.border}`,
                background: active ? `${c.color}1A` : "transparent",
                color: active ? c.color : t.textSoft,
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
              }}
            >
              <Icon size={13} />
              {c.label}
            </button>
          );
        })}
      </div>

      {notes.length === 0 ? (
        <p
          className="text-[13.5px] text-center pt-8"
          style={{ color: t.textFaint, fontFamily: "Inter, sans-serif" }}
        >
          Tidak ada catatan yang cocok.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              t={t}
              allNotes={allNotes}
              isExpanded={expandedId === note.id}
              onToggle={() => setExpandedId(expandedId === note.id ? null : note.id)}
              isConfirming={confirmDeleteId === note.id}
              onEdit={onEdit}
              onRequestDelete={() => setConfirmDeleteId(note.id)}
              onDelete={onDelete}
              onAddUpdate={onAddUpdate}
              onDeleteUpdate={onDeleteUpdate}
              onJumpToNote={onJumpToNote}
              registerRef={(el) => {
                if (el) noteRefs.current[note.id] = el;
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Note card (with linked note + timeline updates)                     */
/* ------------------------------------------------------------------ */

function NoteCard({
  note,
  t,
  allNotes,
  isExpanded,
  onToggle,
  isConfirming,
  onEdit,
  onRequestDelete,
  onDelete,
  onAddUpdate,
  onDeleteUpdate,
  onJumpToNote,
  registerRef,
}) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [logText, setLogText] = useState("");

  const cat = categoryById(note.category);
  const linkedNote = note.linkedNoteId
    ? allNotes.find((n) => n.id === note.linkedNoteId)
    : null;
  const updates = note.updates || [];

  const submitLog = () => {
    if (!logText.trim()) return;
    onAddUpdate(note.id, logText);
    setLogText("");
    setShowLogForm(false);
  };

  return (
    <div
      ref={registerRef}
      className="rounded-xl overflow-hidden"
      style={{ background: t.surface, border: `1px solid ${t.border}`, scrollMarginTop: 16 }}
    >
      <button onClick={onToggle} className="w-full flex items-start gap-3 p-3.5 text-left">
        <CategoryStamp category={note.category} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-[11px]"
              style={{ color: t.textFaint, fontFamily: "JetBrains Mono, monospace" }}
            >
              {formatDate(note.date)} · {formatTime(note.date)}
            </span>
            <span
              className="text-[10.5px] px-1.5 py-0.5 rounded"
              style={{
                background: `${cat.color}1A`,
                color: cat.color,
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
              }}
            >
              {cat.label}
            </span>
            {updates.length > 0 && (
              <span
                className="flex items-center gap-1 text-[10.5px] px-1.5 py-0.5 rounded"
                style={{
                  background: t.borderSoft,
                  color: t.textSoft,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                <History size={11} /> {updates.length}
              </span>
            )}
          </div>
          <p
            className="text-[15px] leading-snug mb-0.5"
            style={{ color: t.text, fontFamily: "Fraunces, serif", fontWeight: 600 }}
          >
            {getTitle(note)}
          </p>
          <p
            className="text-[13px] leading-snug"
            style={{ color: t.textSoft, fontFamily: "Inter, sans-serif" }}
          >
            {excerpt(note)}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp size={17} style={{ color: t.textFaint }} className="shrink-0 mt-1" />
        ) : (
          <ChevronDown size={17} style={{ color: t.textFaint }} className="shrink-0 mt-1" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1" style={{ borderTop: `1px solid ${t.borderSoft}` }}>
          {note.originator && (
            <div
              className="flex items-center gap-1.5 mt-3 mb-1 text-[13px]"
              style={{ color: t.textSoft, fontFamily: "Inter, sans-serif" }}
            >
              <User size={13} style={{ color: t.textFaint }} />
              Pencetus ide: <span style={{ color: t.text, fontWeight: 600 }}>{note.originator}</span>
            </div>
          )}

          {/* Linked note */}
          {linkedNote && (
            <button
              onClick={() => onJumpToNote(linkedNote.id)}
              className="flex items-center gap-1.5 mt-2 mb-3 text-[13px] rounded-lg px-2.5 py-2 w-full text-left"
              style={{ background: t.linkSoft, color: t.link, fontFamily: "Inter, sans-serif" }}
            >
              <Link2 size={13} className="shrink-0" />
              <span>
                Berkaitan dengan:{" "}
                <span style={{ fontWeight: 700 }}>{getTitle(linkedNote)}</span>
              </span>
            </button>
          )}

          <div className="pt-2">
            <MarginRow label="Hipotesa Utama" tag="H" value={note.hipotesa} t={t} accent={t.accent} />
            <MarginRow
              label="Argumen Pendukung"
              tag="A"
              value={note.argumen}
              t={t}
              accent={categoryById("sains").color}
            />
            <MarginRow
              label="Argumen Kontra / Sanggahan"
              tag="S"
              value={note.argumenKontra}
              t={t}
              accent={t.danger}
              optional
            />
            <MarginRow
              label="Kesimpulan / Catatan Kritis"
              tag="K"
              value={note.kesimpulan}
              t={t}
              accent={categoryById("bisnis").color}
            />
          </div>

          {/* Timeline updates */}
          <div className="mt-1 mb-3">
            <div
              className="text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5"
              style={{ color: t.textFaint, fontFamily: "JetBrains Mono, monospace" }}
            >
              <History size={12} /> Catatan Perkembangan
            </div>

            {updates.length > 0 && (
              <div className="flex flex-col gap-2 mb-2">
                {updates
                  .slice()
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((u) => (
                    <div
                      key={u.id}
                      className="rounded-lg px-3 py-2 flex items-start justify-between gap-2"
                      style={{ background: t.surfaceRaised, border: `1px solid ${t.border}` }}
                    >
                      <div>
                        <div
                          className="text-[10.5px] mb-0.5"
                          style={{ color: t.textFaint, fontFamily: "JetBrains Mono, monospace" }}
                        >
                          {formatDate(u.date)} · {formatTime(u.date)}
                        </div>
                        <p
                          className="text-[13.5px] leading-snug whitespace-pre-wrap"
                          style={{ color: t.text, fontFamily: "Inter, sans-serif" }}
                        >
                          {u.text}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteUpdate(note.id, u.id)}
                        className="shrink-0 mt-0.5"
                        aria-label="Hapus log"
                      >
                        <X size={14} style={{ color: t.textFaint }} />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {showLogForm ? (
              <div
                className="rounded-lg p-2.5"
                style={{ background: t.surfaceRaised, border: `1px solid ${t.border}` }}
              >
                <textarea
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  placeholder="Bukti baru atau revisi apa yang muncul?"
                  rows={2}
                  autoFocus
                  className="w-full resize-none bg-transparent text-[13.5px] leading-relaxed mb-2"
                  style={{ color: t.text, fontFamily: "Inter, sans-serif" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={submitLog}
                    disabled={!logText.trim()}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12.5px]"
                    style={{
                      background: logText.trim() ? t.accent : t.borderSoft,
                      color: logText.trim() ? t.bg : t.textFaint,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    <Check size={13} /> Simpan Log
                  </button>
                  <button
                    onClick={() => {
                      setShowLogForm(false);
                      setLogText("");
                    }}
                    className="px-3 rounded-md text-[12.5px]"
                    style={{
                      color: t.textSoft,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLogForm(true)}
                className="flex items-center justify-center gap-1.5 w-full rounded-lg py-2 text-[12.5px]"
                style={{
                  border: `1.5px dashed ${t.border}`,
                  color: t.textSoft,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                <Plus size={14} /> Tambah Log Perkembangan
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(note)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px]"
              style={{
                background: t.surfaceRaised,
                border: `1px solid ${t.border}`,
                color: t.textSoft,
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
              }}
            >
              <Pencil size={14} /> Edit
            </button>

            {isConfirming ? (
              <button
                onClick={() => onDelete(note.id)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px]"
                style={{
                  background: t.danger,
                  color: "#FFF",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                <Check size={14} /> Yakin Hapus?
              </button>
            ) : (
              <button
                onClick={onRequestDelete}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px]"
                style={{
                  background: t.dangerSoft,
                  border: `1px solid transparent`,
                  color: t.danger,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                <Trash2 size={14} /> Hapus
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
