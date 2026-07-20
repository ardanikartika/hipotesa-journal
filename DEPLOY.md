# 🚀 Deploy Hipotesa Journal ke Cloud

Aplikasi ini bisa diakses dari **seluruh dunia** (bukan hanya WiFi lokal) setelah di-deploy.

---

## Opsi 1: Railway.app (Recommended - Free Tier)

### Langkah 1: Buat GitHub Repository

1. Buka https://github.com → Login → **New repository**
2. Nama: `hipotesa-journal`
3. Public/Private: sesuai keinginan
4. Klik **Create repository**

### Langkah 2: Push Kode ke GitHub

```bash
cd C:\Users\PLN\Documents\hipotesa-journal
git init
git add .
git commit -m "Hipotesa Journal"
git branch -M main
git remote add origin https://github.com/USERNAME/hipotesa-journal.git
git push -u origin main
```

### Langkah 3: Deploy ke Railway

1. Buka https://railway.app → Login (pakai GitHub)
2. Klik **New Project** → **Deploy from GitHub repo**
3. Pilih repository `hipotesa-journal`
4. Klik **Configure** (gear icon)
5. Set:

   **Build Command:**
   ```
   npm install && npm run build
   ```

   **Start Command:**
   ```
   cd server && npm install && node index.js
   ```

6. Klik **Deploy**

### Langkah 4: Selesai! 🎉

Tunggu ~2 menit, lalu buka URL Railway (misal: `https://hipotesa-journal.up.railway.app`)

---

## Opsi 2: Render.com (Free Tier)

1. Buka https://render.com → Login
2. **New** → **Web Service**
3. Connect GitHub repo
4. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Environment: `Node`
6. Klik **Create Web Service**

---

## Opsi 3: Fly.io (Free Tier)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
cd C:\Users\PLN\Documents\hipotesa-journal
fly launch
fly deploy
```

---

## Opsi 4: localtunnel (Instant - Tidak perlu deploy)

Kalau mau coba dulu tanpa deploy:

```bash
# Install
npm install -g localtunnel

# Jalankan server
cd C:\Users\PLN\Documents\hipotesa-journal
npm run build
npm run start:prod

# Di terminal lain
lt --port 3001
```

Akan muncul URL seperti `https://your-url.loca.lt` - buka di HP!

---

## 📱 Mengakses dari HP

Setelah deploy berhasil:

1. Buka **Settings** → **Network Info** di HP
2. Atau minta orang lain buka URL-nya
3. Semua orang di **jaringan manapun** bisa akses!

---

## ⚙️ Konfigurasi Tambahan

### Custom Domain (Railway)

1. Railway Dashboard → Project → **Settings**
2. Scroll ke **Domains**
3. Add custom domain
4. Set DNS record sesuai instruksi

### Environment Variables

| Variable | Value | Keterangan |
|----------|-------|------------|
| `NODE_ENV` | `production` | Wajib untuk production |
| `PORT` | `3001` | Default Railway |
| `VITE_API_URL` | `/api` | Relative URL untuk production |

---

## 🔧 Troubleshooting

### CORS Error
Pastikan server mengizinkan semua origin (sudah dikonfigurasi di `server/index.js`)

### Build Failed
```bash
# Test build lokal dulu
npm run build
```

### Data Tidak Tersimpan
Pastikan folder `server/data/` ada. Di Railway, bisa mount persistent disk atau pakai environment variable `DATA_FILE`.

---

## 💡 Tips

- **Gratis**: Railway free tier 500 jam/bulan, cukup untuk testing
- **Sewa domain**: beli domain ~Rp 10rb/th di Niagahoster
- **Auto-deploy**: Setiap push ke GitHub → auto deploy
- **Backup**: Rutin export data via fitur Export di aplikasi
