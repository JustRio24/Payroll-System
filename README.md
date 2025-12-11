# PT Panca Karya Utama - Payroll & HRIS System

Sistem manajemen payroll dan absensi (HRIS) untuk PT Panca Karya Utama.

## Fitur Utama

- **Manajemen Karyawan**: CRUD data karyawan dan jabatan
- **Absensi**: Clock-in/out dengan verifikasi geofence dan foto
- **Pengajuan Cuti**: Workflow pengajuan dan persetujuan cuti
- **Penggajian**: Kalkulasi gaji, potongan, dan generate slip gaji PDF
- **Laporan**: Export PDF/Excel untuk data absensi dan payroll
- **Dashboard**: Visualisasi statistik absensi dan payroll

## Persyaratan Sistem

- **Node.js** versi 18 atau lebih baru
- **npm** versi 8 atau lebih baru
- **XAMPP** (untuk MySQL) - opsional, bisa menggunakan mode demo

## Panduan Instalasi

### Langkah 1: Clone Repository

```bash
git clone <repository-url>
cd <nama-folder-project>
```

### Langkah 2: Install Dependencies

```bash
npm install
```

### Langkah 3: Konfigurasi Environment

1. Copy file `.env.example` menjadi `.env`:

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell) / Mac / Linux
cp .env.example .env
```

2. Edit file `.env` sesuai konfigurasi lokal Anda:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=db_payroll
DB_PORT=3306

# Session Configuration (ganti dengan string random untuk production)
SESSION_SECRET=your-secret-key-here
```

### Langkah 4: Setup Database (Opsional)

> **Catatan**: Jika Anda tidak setup database, aplikasi akan berjalan dalam mode demo dengan data dummy.

#### Menggunakan XAMPP:

1. Download dan install [XAMPP](https://www.apachefriends.org/)
2. Buka XAMPP Control Panel
3. Start **Apache** dan **MySQL**
4. Buka browser, akses http://localhost/phpmyadmin
5. Klik tab **"Import"**
6. Pilih file `database_setup.sql` dari folder project
7. Klik **"Go"** untuk menjalankan script

#### Menggunakan Terminal MySQL:

```bash
mysql -u root < database_setup.sql
```

### Langkah 5: Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:5000**

## Mode Penyimpanan

### Mode MySQL (Produksi)

Aplikasi akan menggunakan MySQL jika:
- Environment variables database dikonfigurasi dengan benar
- MySQL server berjalan dan dapat diakses
- Database `db_payroll` sudah dibuat

### Mode Demo (In-Memory)

Aplikasi akan menggunakan mode demo jika:
- MySQL tidak tersedia atau tidak dapat terhubung
- Environment variable `USE_MEMORY_STORAGE=true` di-set

Mode demo sudah termasuk data dummy lengkap untuk testing.

## Kredensial Login Demo

| Role     | Email              | Password |
|----------|-------------------|----------|
| Admin    | admin@panca.test  | password |
| Employee | budi@panca.test   | password |
| Employee | siti@panca.test   | password |

## Struktur Project

```
project/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Komponen UI
│   │   ├── pages/          # Halaman aplikasi
│   │   ├── lib/            # Utilities & hooks
│   │   └── App.tsx         # Root component
├── server/                 # Backend Express
│   ├── index.ts            # Entry point server
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   └── db.ts               # MySQL connection
├── shared/                 # Shared types & schemas
│   └── schema.ts           # Database schema
├── database_setup.sql      # SQL setup script
├── .env.example            # Template environment
└── package.json
```

## Scripts Tersedia

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm start` | Jalankan production server |
| `npm run check` | Type checking dengan TypeScript |

## API Endpoints

Semua endpoint tersedia di `/api`:

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET/POST | `/api/users` | CRUD karyawan |
| GET/POST | `/api/positions` | CRUD jabatan |
| GET/POST | `/api/attendance` | CRUD absensi |
| GET/POST | `/api/leaves` | CRUD cuti |
| GET/POST | `/api/payroll` | CRUD penggajian |
| GET/POST | `/api/config` | Konfigurasi sistem |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |

## Troubleshooting

### Error: "'NODE_ENV' is not recognized..."

Ini terjadi di Windows versi lama. Pastikan menggunakan kode terbaru yang sudah include `cross-env`.

### Error: MySQL Connection Failed

1. Pastikan XAMPP MySQL berjalan (cek di XAMPP Control Panel)
2. Cek environment variables di file `.env`
3. Pastikan database `db_payroll` sudah dibuat
4. Cek port MySQL (default 3306)

### Error: Table doesn't exist

Jalankan ulang script `database_setup.sql` di phpMyAdmin.

### Aplikasi Berjalan di Mode Demo

Jika melihat log ini di terminal:
```
[storage] MySQL connection failed: ...
[storage] Falling back to in-memory storage with demo data
```

Artinya MySQL tidak terkoneksi. Cek konfigurasi database atau biarkan untuk testing.

### Port 5000 Sudah Digunakan

Ubah port di file `.env`:
```env
PORT=3000
```

## Teknologi yang Digunakan

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL dengan Drizzle ORM
- **Build Tool**: Vite
- **PDF**: jsPDF untuk generate slip gaji

## Catatan Keamanan

> **PENTING**: Aplikasi ini menggunakan password plain text untuk keperluan demo. Untuk penggunaan production:
> 
> 1. Implementasikan password hashing (bcrypt)
> 2. Gunakan HTTPS
> 3. Ganti `SESSION_SECRET` dengan string random yang kuat
> 4. Tambahkan rate limiting pada endpoint login

## Kontak

Untuk pertanyaan atau bantuan, hubungi tim pengembang.

---

**PT Panca Karya Utama** - Construction Payroll & HRIS System
