## Research — NagaCacing MVP V1.0

### Unknowns resolved

1) Top 20 Cacing (mobile)
- Decision: Gunakan skor komposit = 0.6 × z-score volume (clamped [0, 4]) + 0.4 × changePct normalisasi (clamped [−10%, +10%] → [0, 1]). Ambil 20 tertinggi non‑Naga.
- Rationale: Volume ekstrem sering menandakan atensi pasar; menggabungkan momentum harga menjaga relevansi naratif harian.
- Alternatives considered: (a) Hanya changePct (risiko manipulasi low‑float); (b) Hanya volume z-score (bisa bias ke news tanpa arah); (c) Ranking kuantil terpisah dan union — kurang stabil.

2) Area ekspor PNG
- Decision: Hanya kanvas visual (tanpa kontrol UI) dengan watermark kontras tinggi di pojok kanan bawah; latar belakang solid/gradient untuk keterbacaan.
- Rationale: Snapshot fokus ke visualisasi, konsisten untuk dibagikan; memudahkan jaga ukuran ≤ 3 MB.
- Alternatives considered: Sertakan UI (membebani komposisi dan ukuran); area seleksi bebas (kompleksitas tinggi, manfaat rendah di MVP).

### Best practices — chosen tech

PixiJS (WebGL)
- Decision: Instancing, texture atlas, spatial hash untuk hit‑testing; memoized scales; batasi re‑layout; gunakan requestAnimationFrame dengan adaptif render.
- Rationale: Target 900+ elemen dengan 60/30 FPS; menghindari biaya DOM/SVG.
- Alternatives considered: Three.js (overkill), Canvas2D (raw) — lebih work untuk batching.

Data pipeline (Yahoo Finance → R2)
- Decision: Batch fetch dengan p-limit; caching lokal 60s; backoff eksponensial; validasi dengan Zod; tulis `data.json` atomik; unggah ke R2 dengan `Cache-Control: public, max-age=120, stale-while-revalidate=300` dan ETag.
- Rationale: Menghormati rate limit, menjaga reliabilitas ≥99.5% dan ketepatan siklus ≥95%.
- Alternatives considered: Penyedia data berbayar; worker CF — non‑prioritas di MVP.

Security & XSS
- Decision: Escape/sanitize semua string dari `data.json` (terutama `dailyStory`); aktifkan CORS hanya untuk GET publik; kunci kredensial di env.
- Rationale: Frontend publik, permukaan XSS kecil namun kritikal.
- Alternatives considered: Templating server‑side — tidak sesuai arsitektur statis.

Testing & Perf
- Decision: Unit (scales, filters), contract (schema `data.json`), E2E (render, popup, filters), perf sampling (FPS, waktu interaksi) di CI smoke untuk regresi.
- Rationale: Menutup P1 alur tanpa membangun rig berat.
- Alternatives considered: Profiling frame‑timeline otomatis — fase berikutnya.

