# 🚀 Hipotesa Journal

Aplikasi pencatat jurnal hipotesa harian dengan fitur input suara (Speech-to-Text), struktur H-A-K, dan sinkronisasi real-time antar perangkat.

## ✨ Fitur Utama

1. **Input Ganda (Teks & Suara)**
   - Input teks manual
   - Input suara menggunakan Web Speech API
   - Animasi waveform saat perekaman aktif
   - Judul otomatis dari 5 kata pertama

2. **Struktur Hipotesa (H-A-K)**
   - Hipotesa Utama (H)
   - Argumen Pendukung (A)
   - Sanggahan / Kontra (K)
   - Parsing otomatis dari teks

3. **Validasi & Status**
   - Butuh Riset 🔍
   - Terbukti Benar ✅
   - Terpatahkan ❌

4. **Koneksi & Timeline**
   - Hubungkan hipotesa terkait
   - Log perkembangan dengan timestamp
   - Navigasi antar hipotesa terkait

5. **Manajemen Data**
   - Sinkronisasi real-time via backend
   - Export/Import backup JSON
   - Salin format WhatsApp
   - Randomizer hipotesa

6. **Mobile-First Design**
   - UI minimalis premium
   - Bottom navigation
   - Optimasi sentuhan

## 📦 Instalasi & Menjalankan

### Prerequisites
- Node.js 18+

### Langkah 1: Install Dependencies

```bash
cd hipotesa-journal
npm install

cd server
npm install
cd ..
```

### Langkah 2: Jalankan Backend Server (Terminal 1)

```bash
cd server
npm start
```

Backend akan berjalan di `http://localhost:3001`

### Langkah 3: Jalankan Frontend (Terminal 2)

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### Langkah 4: Akses dari HP/Mobile

1. Buka terminal/command prompt
2. Jalankan `ipconfig` (Windows) atau `ifconfig` (Mac/Linux)
3. Cari alamat IPv4, contoh: `192.168.1.100`
4. Di browser HP, buka: `http://192.168.1.100:5173`

## 🌐 Konfigurasi Jaringan

### Untuk diakses banyak orang (Local Network)

Pastikan:
1. Semua perangkat terhubung ke **jaringan yang sama** (WiFi/LAN)
2. Firewall mengizinkan koneksi pada port 5173 (frontend) dan 3001 (backend)
3. Gunakan alamat IP lokal (bukan localhost)

### Struktur Folder

```
hipotesa-journal/
├── src/
│   ├── components/     # UI Components
│   ├── context/        # React Context
│   ├── hooks/          # Custom Hooks
│   ├── pages/          # Page Components
│   ├── types/          # Type Definitions
│   ├── utils/          # Utilities & API
│   ├── App.jsx         # Main App
│   └── index.css       # Global Styles
├── server/
│   ├── index.js        # Express Server
│   └── data/           # JSON Database
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## 🔧 Konfigurasi Environment

Buat file `.env` di root project untuk konfigurasi:

```env
VITE_API_URL=http://localhost:3001/api
```

## 📱 Tips Penggunaan Mobile

1. **Tambah ke Homescreen**
   - Safari: Tap Share → "Add to Home Screen"
   - Chrome: Tap menu → "Install app"

2. **Voice Input**
   - Pastikan izin mikrofon diaktifkan
   - Gunakan koneksi internet untuk speech recognition

3. **Offline Mode**
   - App menyimpan data di localStorage saat offline
   - Sinkronisasi otomatis saat kembali online

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Express.js, CORS
- **Database**: JSON file (server/data/hypotheses.json)
- **Fonts**: Playfair Display (serif), Inter (sans), Fira Code (mono)

## 📄 License

MIT
