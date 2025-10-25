# Feature Specification: NagaCacing MVP V1.0

**Feature Branch**: `001-nagacacing-mvp-spec`  
**Created**: 2025-10-25  
**Status**: Draft  
**Input**: User description: "seperti di docs/PRD.md" (Translate product PRD into a user-focused, implementation-agnostic spec)

## User Scenarios & Testing (mandatory)

### User Story 1 - Explore Market Story Map (Priority: P1)

Pengunjung membuka situs dan melihat peta gelembung yang menceritakan rotasi kekuatan pasar: cluster "Naga" (grup konglomerasi) dan gelembung "Cacing" (saham independen). Headline harian tampil di atas peta; legenda dan disclaimer tersedia.

**Why this priority**: Nilai inti produk—memahami dinamika pasar secara makro dalam sekali lihat.

**Independent Test**: Dengan satu data publik yang valid, sistem memuat, memetakan, dan menampilkan peta beserta headline, legenda, dan badge versi.

**Acceptance Scenarios**:

1. Given data publik tersedia, When halaman dimuat, Then peta menampilkan ≥ 900 gelembung tanpa overlap berlebihan dan badge versi menampilkan `version` dan `generatedAt` dari data.
2. Given setiap `changePct`, When peta di-render, Then warna gelembung memetakan skala merah–netral–hijau konsisten (−10% lebih merah daripada −5%; +10% lebih hijau daripada +5%).
3. Given metrik volume z-score, When z ≥ 2, Then gelembung mendapat efek penonjolan; When z < 1, Then efek non-aktif.

---

### User Story 2 - Inspect Ticker via Pop-up (Priority: P1)

Pengguna mengklik gelembung untuk membuka kartu informasi ringkas: `name`, `symbol`, `price`, `changePct`, `volume`, `marketCap`, dan mini-chart bila `spark7` tersedia.

**Why this priority**: Memberi konteks mendalam tanpa meninggalkan peta.

**Independent Test**: Klik pada satu gelembung menampilkan informasi kunci dan dapat ditutup klik luar/Esc.

**Acceptance Scenarios**:

1. Given sebuah gelembung terlihat, When diklik, Then kartu muncul ≤ 120 ms di posisi yang tidak memotong tepi layar.
2. Given `spark7` tersedia, When kartu tampil, Then mini-chart tampil; When tidak tersedia, Then placeholder tampil.

---

### User Story 3 - Find and Narrow with Filters (Priority: P2)

Pengguna mencari ticker/nama emiten dan membatasi tampilan berdasarkan rentang kapitalisasi pasar.

**Why this priority**: Mempercepat penemuan dan fokus pada segmen relevan.

**Independent Test**: Pencarian dan slider berjalan lokal, mengubah tampilan peta tanpa ketergantungan eksternal.

**Acceptance Scenarios**:

1. Given input pengguna, When mengetik pada kotak pencarian, Then hasil filter muncul < 100 ms setelah jeda input (debounce wajar) dengan pencocokan case-insensitive (prefix dan substring).
2. Given slider kuantil kapitalisasi, When digeser, Then peta memperbarui < 200 ms untuk 900 gelembung.
3. Given pencarian aktif dan slider disetel, When keduanya digunakan, Then hasil memenuhi logika AND dan dapat di-reset.

---

### User Story 4 - Share a Snapshot (Priority: P2)

Pengguna mengekspor PNG dari area visual saat ini dengan watermark produk untuk dibagikan.

**Why this priority**: Mendorong pertumbuhan melalui konten yang mudah dibagikan.

**Independent Test**: Tanpa fitur lain, pengguna dapat mengekspor PNG ber-watermark yang terbaca.

**Acceptance Scenarios**:

1. Given peta terlihat, When pengguna memilih ekspor, Then PNG dihasilkan dengan resolusi layar saat ini dan ukuran ≤ 3 MB.
2. Given watermark produk, When PNG dihasilkan, Then watermark terlihat dengan kontras minimal 4.5:1 terhadap latar.

---

### User Story 5 - First-time Guidance and Feedback (Priority: P3)

Pengguna pertama kali melihat onboarding singkat tentang konsep "Naga vs Cacing" dan dapat mengirim masukan lewat formulir eksternal.

**Why this priority**: Mengurangi kebingungan awal dan membuka kanal umpan balik.

**Independent Test**: Onboarding dan tombol feedback berfungsi tanpa ketergantungan pada fitur lain.

**Acceptance Scenarios**:

1. Given kunjungan pertama, When halaman dimuat, Then pop-up onboarding muncul satu kali dan hilang setelah "Saya Mengerti" ditekan (persist di perangkat).
2. Given tombol feedback, When diklik, Then formulir eksternal terbuka di tab/jendela baru.

---

### User Story 6 - Mobile-optimized View (Priority: P3)

Pada perangkat mobile, tampilan disederhanakan: cluster Naga tetap, dan hanya subset Cacing prioritas ditampilkan dengan opsi mode.

**Why this priority**: Menjaga keterbacaan dan kinerja pada perangkat terbatas.

**Independent Test**: Mobile menampilkan peta ringan dan dapat digunakan.

**Acceptance Scenarios**:

1. Given perangkat mobile, When halaman dimuat, Then tampilan default hanya menunjukkan cluster Naga dan Top 20 Cacing prioritas dengan tombol mode yang jelas.
2. Given keterbatasan performa, When peta berjalan, Then FPS memenuhi target mobile di viewport utama.

### Accessibility & UX Acceptance

- Kontras teks watermark dan UI minimum 4.5:1.
- Navigasi keyboard dasar: fokus ke kontrol utama; tutup pop-up via Esc; trap fokus saat modal aktif.
- State kosong, loading, dan error ditampilkan konsisten dan dapat diakses.
- Perangkat/browser: versi utama modern desktop dan mobile yang umum digunakan.

### Edge Cases

- Data gagal dimuat: tampilkan UI fallback dengan retry eksponensial (1s, 5s, 30s); bila data lama tersedia, tampilkan terakhir yang valid dengan indikator "stale".
- `spark7` tidak tersedia: mini-chart diganti placeholder tanpa memecah tata letak.
- Nilai `changePct` ekstrem di luar rentang peta warna: clamp ke batas terdekat agar tetap terbaca.
- Gelembung sangat besar/kecil karena kapitalisasi ekstrem: skala radius menjaga keterbacaan minimal dan mencegah dominasi berlebihan.
- `groupId` null: tampil sebagai Cacing (gelembung independen) dan tetap ikut filter umum.

## Requirements (mandatory)

### Functional Requirements

- FR-001: Sistem MUST memuat satu berkas data publik dan menampilkan peta gelembung yang memetakan setiap ticker ke satu gelembung.
- FR-002: Sistem MUST memetakan radius gelembung secara monoton terhadap kapitalisasi pasar yang dinormalisasi untuk keterbacaan.
- FR-003: Sistem MUST memetakan warna gelembung berdasarkan persentase perubahan harian dengan skala merah–netral–hijau yang konsisten.
- FR-004: Sistem MUST mengelompokkan ticker dengan `groupId` yang sama ke dalam cluster visual dan menandai ticker tanpa grup sebagai Cacing.
- FR-005: Sistem MUST mencegah overlap gelembung yang mengganggu dengan penyelesaian tabrakan yang menjaga keterbacaan.
- FR-006: Sistem MUST menonjolkan gelembung dengan volume z-score tinggi (aktif bila z ≥ 2; non-aktif bila z < 1).
- FR-007: Sistem MUST menyediakan pencarian case-insensitive dengan dukungan prefix dan substring untuk `symbol` dan `name`.
- FR-008: Sistem MUST menyediakan slider kapitalisasi berdasarkan kuantil (Q1–Q4) dan mode "Cacing Hunter" untuk menonjolkan small caps (≤ Q2).
- FR-009: Sistem MUST menggabungkan filter pencarian dan slider dengan logika AND dan menyediakan kontrol reset.
- FR-010: Sistem MUST menampilkan pop-up karta saat gelembung diklik yang memuat `name`, `symbol`, `price`, `changePct`, `volume`, `marketCap`, dan mini-chart bila data ringkas tersedia; menutup saat klik luar/Esc.
- FR-011: Sistem MUST menampilkan headline harian yang aman dari XSS (escape/sanitize) dengan panjang ≤ 140 karakter.
- FR-012: Sistem MUST mengekspor PNG area visual saat ini dengan watermark "NagaCacing.com | Visualisasi Naga vs Cacing" dan menjaga ukuran berkas ≤ 3 MB.
- FR-013: Sistem MUST menampilkan onboarding satu kali di kunjungan pertama dan menyimpan persetujuan di perangkat pengguna.
- FR-014: Sistem MUST menyediakan legenda/penjelasan singkat dan menampilkan disclaimer hukum di footer.
- FR-015: Sistem MUST menyediakan mode mobile yang menampilkan cluster Naga dan Top 20 Cacing prioritas serta tombol mode untuk beralih.
- FR-016: Sistem MUST menampilkan fallback UI saat data gagal dimuat dan melakukan retry eksponensial; badge versi (`version`, `generatedAt`) tampil di UI.
- FR-017: Sistem MUST menyediakan tombol feedback yang membuka formulir eksternal di tab/jendela baru.
- FR-018: Sistem MUST memenuhi keteraksesan dasar: fokus keyboard, urutan fokus logis, dan penutupan modal via Esc.
- FR-019: Sistem SHOULD mendukung telemetri anonim (FPS rata-rata, error count) bila diaktifkan pengguna.
- FR-020: [NEEDS CLARIFICATION: Kriteria pemilihan "Top 20 Cacing" di mobile—persentase kenaikan harian, z-score volume, atau kombinasi?]
- FR-021: [NEEDS CLARIFICATION: Area yang diekspor untuk PNG—hanya kanvas visual atau termasuk UI (search/slider/legenda)?]

### Non-Functional Requirements (Constitution-aligned)

- NFR-Perf-TTI: Waktu hingga interaktif ≤ 2.5 detik (desktop broadband) dan ≤ 4 detik (mobile 4G).
- NFR-Perf-Interaksi: Perubahan filter memperbarui visual < 200 ms untuk 900 gelembung; hasil pencarian muncul < 100 ms setelah jeda input.
- NFR-Perf-FPS: FPS berkelanjutan ≥ 60 (desktop) dan ≥ 30 (mobile) di viewport utama.
- NFR-Size: Muatan awal non-data tetap ringan untuk memastikan TTI target (budget awal ≤ 300 KB terkompresi, tidak termasuk data).
- NFR-Data-Avail: Data publik tersedia ≥ 99.5% per bulan; pembaruan tepat waktu pada siklus 15 menit ≥ 95%.
- NFR-Security: Tidak ada login; tidak menyimpan data pribadi; sanitasi semua string sebelum render; kebijakan asal lintas domain yang sesuai.
- NFR-Compat: Mendukung peramban desktop dan mobile populer yang masih didukung vendor.
- NFR-Obs: Tampilkan status pemuatan/error yang jelas; retry eksponensial; tampilkan versi data di UI.

### Key Entities (include if feature involves data)

- Dataset Metadata: versi spesifikasi data, waktu pembuatan, indikator jeda data, headline harian.
- Group (Naga): identitas grup dan daftar simbol anggota.
- Ticker (Cacing/Naga member): simbol, nama, harga, perubahan persentase, volume, kapitalisasi, asosiasi grup opsional, sektor, data ringkas historis singkat.
- Stats: ukuran semesta, parameter jendela rata-rata volume, batas kapitalisasi minimum/maksimum.

## Assumptions & Dependencies

- Data publik tersedia via CDN dan dapat dimuat tanpa autentikasi; keterlambatan data sekitar 15 menit.
- Pemetaan grup Naga dikelola manual dan konsisten antara backend dan data publik.
- Tidak ada login; tidak mengumpulkan data pribadi; telemetri anonim opsional.
- Formulir umpan balik menggunakan layanan eksternal yang dapat diakses umum.
- Target perangkat: desktop kelas menengah dan mobile 4G menengah; performa menyesuaikan butir NFR.
- Kriteria Top 20 Cacing (mobile) dan area ekspor PNG menunggu klarifikasi (lihat FR-020/FR-021).

## Success Criteria (mandatory)

### Measurable Outcomes

- SC-001: ≥ 95% sesi berhasil menampilkan peta pertama kali tanpa error fatal dalam ≤ 4 detik (mobile) / ≤ 2.5 detik (desktop).
- SC-002: ≥ 90% interaksi filter menuntaskan pembaruan visual < 200 ms untuk 900+ ticker.
- SC-003: ≥ 80% pengguna pertama kali menyelesaikan onboarding (menekan "Saya Mengerti") pada kunjungan perdana.
- SC-004: ≥ 90% pengguna yang mencoba ekspor berhasil menghasilkan PNG ber-watermark berukuran ≤ 3 MB dalam ≤ 15 detik.
- SC-005: Ketersediaan data bulanan ≥ 99.5% dan ketepatan jadwal pembaruan ≥ 95% dari semua siklus.
