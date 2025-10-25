## PRD NagaCacing.com — MVP V1.0 (Agent-Friendly)

- Versi: 1.0.0
- Pemilik: Product/Tech (Solo Dev)
- Tanggal: 2025-10-25
- Status: Siap diimplementasi (MVP)

### 1. Visi & Brand
- Visi: Visualisasi "Market Storytelling" IHSG dari konflik/rotasi antar kekuatan besar, bukan per-saham.
- Persona brand: Solo dev introvert, jujur, anti-korporat.
- Brand voice: Nakal, fun, slang komunitas, jujur (Opsi B: Teman Nongkrong).

### 2. Definisi Inti (Wajib Dipahami)
- NAGA: Grup konglomerasi (contoh: Barito, Astra) dikelompokkan manual sebagai satu cluster visual.
- CACING: Saham independen yang tidak termasuk grup konglomerasi.

### 3. Ruang Lingkup MVP
- In-scope: Visualisasi inti; Filter esensial (search, slider market cap); Pop-up card; Daily Story; Share snapshot; Onboarding; Legenda; Mobile mode; Feedback; Disclaimer.
- Out-of-scope (tunda): Group by sector; filter time-series (D/M/Q/Y).

### 4. Arsitektur Teknis
- Frontend: Cloudflare Pages (UI statis) menyajikan canvas/WebGL. Membaca `data.json` dari Cloudflare R2 via CDN.
- Backend: VM Free Tier (Oracle/Tencent) menjalankan cron 15 menit untuk membangkitkan `data.json`.
- Sumber data: Yahoo Finance (delay ~15 menit).
- Database manual: Mapping ~20 grup Naga → daftar emiten (file JSON backend).

### 5. Kontrak Data (data.json)
- Lokasi R2: `r2://nagacacing/data/data.json` (dipublikasi via URL CDN)
- Header cache: `Cache-Control: public, max-age=120, stale-while-revalidate=300`
- Skema (ringkas):

```json
{
  "version": "1.0.0",
  "generatedAt": "2025-10-25T08:45:00Z",
  "dataDelayMinutes": 15,
  "dailyStory": "string",
  "groups": [
    { "groupId": "G-BARITO", "groupName": "Grup Barito", "tickers": ["BRPT", "TPIA"] }
  ],
  "tickers": [
    {
      "symbol": "BBCA",
      "name": "Bank Central Asia Tbk",
      "price": 9525.0,
      "changePct": 0.82,
      "volume": 14500000,
      "marketCap": 1150000000000000,
      "groupId": null,
      "sector": "Banking",
      "spark7": [9400, 9450, 9480, 9500, 9525]
    }
  ],
  "stats": {
    "universeSize": 900,
    "volumeAvgWindowDays": 20,
    "minMarketCap": 100000000000,
    "maxMarketCap": 2000000000000000
  }
}
```

- Catatan: `spark7` opsional untuk mini-chart; jika tidak ada, front-end menampilkan placeholder.

### 6. Cron Job Backend
- Jadwal: setiap 15 menit (00, 15, 30, 45) WIB sinkron dengan delay sumber data.
- Langkah: (1) Fetch Yahoo Finance untuk universe ticker; (2) Hitung metrik dan normalisasi; (3) Bangkitkan `dailyStory`; (4) Tulis `data.json`; (5) Upload ke R2 dengan header cache & ETag.
- Target durasi: < 60 detik per siklus pada VM free-tier.
- Observasi: log JSON baris-per-baris; push heartbeat ke monitor uptime; laporkan error ke Sentry.

### 7. Persyaratan Fungsional

#### [REQ-F-1] Visualisasi Inti (WebGL)
- Mesin: PixiJS (disarankan) atau setara WebGL.
- Aturan pemetaan:
  - Ukuran: radius ∝ √(marketCap) → dinormalisasi ke [10px, 80px] desktop; [8px, 60px] mobile.
  - Warna: gradasi merah–netral–hijau berdasarkan `changePct` dengan titik -10% (#b91c1c), 0% (#64748b), +10% (#15803d).
  - Glow/pulsing: intensitas ∝ z-score volume terhadap rata-rata 20 hari; aktif jika z ≥ 2.
- Tata letak: Cluster Naga dikelompokkan per `groupId`; Cacing tersebar sebagai gelembung individual. Tabrakan dicegah (collision/packing).

Acceptance Criteria (AC):
- [AC-F-1-1] Desktop (i5/8GB, iGPU) mampu render ≥900 gelembung stabil ≥60 FPS; mobile mid-range ≥30 FPS.
- [AC-F-1-2] Peta warna sesuai nilai `changePct`; -10% lebih merah dari -5%; +10% lebih hijau dari +5%.
- [AC-F-1-3] Radius meningkat monoton terhadap `marketCap`; tidak saling overlap berlebihan (collision resolve <16ms per frame rata-rata).
- [AC-F-1-4] Glow aktif pada ticker dengan volume z ≥ 2; non-aktif ketika z < 1.

#### [REQ-F-1a] Filter Esensial
- Search bar: filter by `symbol` atau `name` (case-insensitive, prefix dan substring).
- Slider Market Cap: filter berdasarkan kuantil (Q1–Q4) dan mode "Cacing Hunter" untuk menonjolkan small caps (≤Q2).

AC:
- [AC-F-1a-1] Hasil pencarian muncul < 100 ms setelah input (client-side debounce 150 ms).
- [AC-F-1a-2] Menggeser slider memperbarui kanvas < 200 ms untuk 900 gelembung.
- [AC-F-1a-3] Kombinasi search+slider berfungsi (AND logic) dan dapat di-reset.

#### [REQ-F-1b] Pop-up Card (On Click)
- Menampilkan: `name`, `symbol`, `price`, `changePct`, `volume`, `marketCap`, mini-chart (dari `spark7` bila tersedia).
- Posisi: dekat gelembung yang diklik; menutup saat klik luar/Esc.

AC:
- [AC-F-1b-1] Pop-up muncul < 120 ms setelah klik; tidak menabrak tepian layar.
- [AC-F-1b-2] Mini-chart tampil bila `spark7` ada; fallback placeholder bila tidak ada.

#### [REQ-F-2] Daily Story (Hook)
- String headline tunggal dari backend (`dailyStory`) dengan brand voice nakal/slang.

AC:
- [AC-F-2-1] `dailyStory` tampil di bagian atas kanvas; panjang ≤140 karakter; aman XSS (escape).

#### [REQ-F-4] Share Snapshot (Growth)
- Ekspor PNG area visual saat ini dengan watermark:
  "NagaCacing.com | Visualisasi Naga vs Cacing".

AC:
- [AC-F-4-1] Gambar PNG resolusi layar saat ini, ukuran file ≤ 3 MB.
- [AC-F-4-2] Watermark selalu terlihat (kontras minimal 4.5:1 terhadap latar).

### 8. Persyaratan Non-Fungsional
- Onboarding: Pop-up sekali saat kunjungan pertama menjelaskan Naga vs Cacing; tombol "Saya Mengerti" (persist via localStorage).
- Legenda: Tombol (?) selalu tersedia untuk membuka penjelasan ringkas definisi.
- Mobile: Default hanya tampil cluster Naga dan Top 20 Cacing (gainer/volume); tombol mode Naga/Cacing.
- Feedback: Tombol melayang membuka Google Form (jenis masukan, isi, kontak opsional).
- Legal: Footer berisi disclaimer wajib berikut:
"DISCLAIMER: Data di NagaCacing.com disajikan 'apa adanya' (as-is) dengan data tertunda (delay ~15 menit) dan bersumber dari API pihak ketiga (Yahoo Finance). Kami tidak menjamin akurasi data. Semua informasi dan visualisasi BUKAN merupakan anjuran beli/jual dan hanya untuk tujuan edukasi dan hiburan semata. Segala keputusan dan risiko investasi adalah tanggung jawab penuh Anda sendiri."

SLO Kinerja & Kualitas:
- Time-to-Interactive: ≤ 2.5s (desktop broadband), ≤ 4s (mobile 4G).
- FPS: ≥ 60 (desktop), ≥ 30 (mobile) di viewport utama.
- Ukuran bundle awal: ≤ 300 KB gzip (tanpa data.json).
- Reliabilitas data.json: ≥ 99.5% ketersediaan bulanan; update tepat waktu ≥ 95% siklus.

Keamanan & Privasi:
- Tidak ada login; tidak menyimpan data pribadi pengguna.
- Hanya telemetry anonim (FPS rata-rata, error count) bila diaktifkan.
- Data publik; validasi CORS, sanitasi `dailyStory`/strings sebelum render.

Observabilitas & Error Handling:
- Jika `data.json` gagal dimuat: tampilkan fallback UI dan retry eksponensial (1s, 5s, 30s).
- Versi data ditampilkan di UI (badge `version` + `generatedAt`).

### 9. Implementasi Frontend (Ringkas)
- Teknologi: TypeScript + PixiJS; State ringan (Zustand/vanilla) cukup.
- Taktik performa: instancing, texture atlas, spatial index untuk hit-testing, memoized scales.
- Aksesibilitas: navigasi keyboard dasar; kontras teks watermark dan UI minimal 4.5:1.

### 10. Implementasi Backend (Ringkas)
- Yahoo Finance endpoints yang digunakan (contoh, dapat diganti setara):
  - Quote summary untuk `price`, `changePct`, `volume`, `marketCap`.
  - Optional spark untuk `spark7`.
- Penamaan grup manual: file `groups.json` di backend, konsisten dengan `groupId`.

### 11. Rencana Peluncuran (GTΜ)
- Fase 1 (H-1): Cerita frustrasi (tanam pain point).
- Fase 2 (H): Pertanyaan kriptik (bangun hype & filtrasi audiens).
- Fase 3 (H sore/malam): Pengungkapan jujur (The Reveal) dengan narasi Naga vs Cacing dan delay data.

### 12. Risiko & Mitigasi
- Ketergantungan Yahoo Finance → siapkan fallback/limiter & cache hasil.
- Kinerja mobile rendah → mode Top 20 Cacing default + pengurangan efek.
- Akurasi mapping grup manual → review berkala dan audit perubahan emiten.

### 13. Keputusan Kunci (ADR Singkat)
- WebGL (PixiJS) untuk skala 900+ elemen; menolak DOM/SVG untuk kinerja.
- Skala √(marketCap) untuk keterbacaan; bisa disesuaikan nanti via config.

### 14. Glosarium
- `changePct`: Persentase perubahan harga harian vs penutupan sebelumnya.
- `spark7`: Deret harga penutupan ringkas untuk mini-chart (≤7 titik).
- `z-score volume`: (volume hari ini − rata-rata 20D) / stddev 20D.

---

Checklist Uji Penerimaan (ringkas):
- [ ] Memuat `data.json` sukses; badge versi tampil.
- [ ] 900+ gelembung dirender dengan FPS sesuai SLO.
- [ ] Filter search & slider bekerja dan responsif.
- [ ] Pop-up menampilkan semua field; mini-chart sesuai data.
- [ ] Daily Story muncul dan aman XSS.
- [ ] Snapshot PNG ber-watermark dan ukuran wajar.
- [ ] Onboarding, legenda, feedback, disclaimer tampil dan berfungsi.