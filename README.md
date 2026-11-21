# HabitTrack

Aplikasi Android pelacak kebiasaan, mengikuti PRD HabitTrack v1.0. Backend dan frontend dipisah dalam satu folder.

```
habittrack/
├── backend/   Node.js + Express + Sequelize + MariaDB (REST API /api/v1)
└── mobile/    React Native (Expo + TypeScript), tema dark navy & ungu
```

## Fitur yang sudah ada

Semua fitur MVP dan lanjutan di PRD: register/login (JWT + bcrypt), dashboard dengan progres harian, CRUD kebiasaan (kategori, ikon, harian/mingguan, hari aktif, target, pengingat), checklist harian dengan pembatalan, streak (saat ini dan terbaik), kalender bulanan, statistik mingguan/bulanan dengan grafik, kategori pribadi, reminder lokal, profil, dan pengaturan notifikasi.

## 1. Menjalankan backend

Prasyarat: Node.js 18+ dan MariaDB 10.5+.

### Pasang MariaDB (sekali saja, bila belum ada)

```bash
# Linux Mint / Ubuntu / Debian
sudo apt install mariadb-server
sudo systemctl enable --now mariadb

# CachyOS / Arch
sudo pacman -S mariadb
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl enable --now mariadb
```

### Setup database (satu perintah)

```bash
cd backend
npm run db:init
```

Skrip `scripts/setup-db.sh` melakukan semuanya: membuat database `habittrack_db`, membuat user khusus `habittrack` dengan password acak (bukan root), membuat/mengisi `backend/.env` (termasuk `JWT_SECRET` acak), lalu menjalankan `npm install`, migration, dan seeder kategori bawaan. Aman dijalankan berulang; password dan `JWT_SECRET` yang sudah ada tidak diubah. Nama bisa diganti: `DB_NAME=nama_db DB_USER=nama_user npm run db:init`.

Saat diminta, masukkan password sudo (Linux Mint/Ubuntu/CachyOS memakai login root lewat sudo) atau password root MariaDB.

Lalu jalankan server:

```bash
npm run dev                 # atau: npm start
```

Cek: `http://localhost:3000/health`.

### Alternatif: impor SQL manual

Tanpa skrip dan tanpa sequelize-cli, misalnya lewat DBeaver/HeidiSQL:

```bash
cd backend
sudo mariadb < database/schema.sql      # membuat habittrack_db, semua tabel, dan kategori bawaan
cp .env.example .env                    # lalu isi DB_USER, DB_PASSWORD, JWT_SECRET
npm install && npm run dev
```

`schema.sql` setara dengan migration dan mencatatnya di `SequelizeMeta`, jadi `npm run db:migrate` sesudahnya tidak membuat ulang tabel. Pilih salah satu jalur (skrip atau SQL) untuk satu database.

### Perintah database lain

| Perintah | Fungsi |
| --- | --- |
| `npm run db:setup` | Migration + seeder (tanpa membuat database/user) |
| `npm run db:migrate:undo:all` | Membatalkan semua migration (menghapus tabel) |
| `npm run db:seed` | Menjalankan seeder kategori bawaan |

Unit test (tanpa database): `npm test`

### Foto profil

Foto disimpan di `backend/uploads/avatars/` (tidak masuk git; sertakan folder ini dalam backup) dan alamatnya di kolom `users.photo_url`. Tipe file diperiksa dari isi file (bukan nama atau Content-Type dari klien), dan nama file dibuat server. Menambah fitur ini pada database yang sudah ada:

```bash
cd backend
npm install multer     # pustaka unggah file
npm run db:migrate     # menambah kolom users.photo_url — jalankan SEBELUM menyalakan ulang server
```

## 2. Menjalankan aplikasi mobile

Proyek ini memakai **Expo SDK 57** (React Native 0.86, React 19.2).

```bash
cd mobile
npm install
# Tiga paket ini sengaja tidak dikunci di package.json; expo install memilih versi yang cocok dengan SDK 57
npx expo install expo-status-bar expo-build-properties @react-native-community/datetimepicker
npx expo install --fix      # menyelaraskan semua versi paket dengan SDK
cp .env.example .env        # atur EXPO_PUBLIC_API_URL
npx expo start -c
```

Alamat API di `.env`:

| Perangkat | EXPO_PUBLIC_API_URL |
| --- | --- |
| Emulator Android | `http://10.0.2.2:3000/api/v1` |
| HP fisik (satu Wi-Fi dengan laptop) | `http://<IP-LAN-laptop>:3000/api/v1` |

Catatan penting:

- Di Expo Go Android, hanya notifikasi *push* (remote) yang tidak tersedia sejak SDK 53; notifikasi lokal untuk pengingat tetap tersedia. Peringatan kuning `expo-notifications` di Expo Go dapat diabaikan. Untuk perilaku yang sama dengan aplikasi final, pakai development build (`npx expo run:android`) atau build APK di bawah.
- Foto profil memakai `expo-image-picker` (sudah ada di `package.json`).
- Expo Go di HP harus SDK 57 juga. Bila `npx expo start --android` memasang Expo Go lewat `adb`, versinya otomatis cocok.
- Firewall laptop harus mengizinkan port 3000 bila memakai HP fisik.

### Build APK untuk demo

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview    # menghasilkan APK
```

Untuk APK yang dibagikan, gunakan server dengan **HTTPS** dan isi `EXPO_PUBLIC_API_URL` sesuai. Proyek ini mengizinkan HTTP biasa (cleartext) hanya untuk memudahkan pengembangan; hapus plugin `expo-build-properties` di `app.json` untuk produksi.

## 3. Ringkasan REST API

Base URL `/api/v1`. Endpoint privat memakai `Authorization: Bearer <token>`. Aplikasi juga mengirim header `X-Client-Date: YYYY-MM-DD` (tanggal lokal perangkat) agar "hari ini" dan streak dihitung menurut zona waktu pengguna.

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| POST | /auth/register, /auth/login | Registrasi dan login (publik) |
| GET, PUT | /auth/me | Profil pengguna aktif; ubah nama (`{ "name": "..." }`) |
| PUT, DELETE | /auth/me/photo | Unggah foto profil (multipart, field `photo`, JPG/PNG/WebP maks 5 MB) / hapus foto |
| GET | /uploads/avatars/:file | File foto profil (publik, nama file acak) |
| POST | /auth/logout | Logout (token dihapus di perangkat) |
| GET, POST | /habits | Daftar (filter `is_active`, `category_id`, `page`, `limit`) dan buat kebiasaan |
| GET, PUT, DELETE | /habits/:id | Detail, ubah, hapus |
| GET | /habits/logs/today | Checklist hari ini beserta progres |
| GET | /habits/logs?from&to&habit_id | Riwayat aktivitas |
| POST, DELETE | /habits/:id/complete | Tandai selesai / batalkan (`date` opsional) |
| GET | /calendar?month=YYYY-MM | Ringkasan kalender bulanan |
| GET | /calendar/:date | Aktivitas pada satu tanggal |
| GET | /statistics/overview, /weekly, /monthly, /streaks | Statistik |
| GET, POST | /categories | Kategori bawaan + pribadi, buat kategori |
| PUT, DELETE | /categories/:id | Ubah/hapus kategori pribadi |
| GET, POST | /reminders | Daftar dan buat pengingat |
| PUT, DELETE | /reminders/:id | Ubah/hapus pengingat |

Format respons: `{ "success": true, "message": "...", "data": ... }`. Error: `{ "success": false, "message": "...", "details": [...] }` dengan status 401, 403, 404, 409, atau 422.

Contoh membuat kebiasaan mingguan:

```json
POST /api/v1/habits
{
  "name": "Olahraga",
  "category_id": 2,
  "frequency": "WEEKLY",
  "days_of_week": [1, 3, 5],
  "target_count": 1,
  "reminder_time": "18:00"
}
```

## 4. Keputusan implementasi

- **Kepemilikan data**: identitas pengguna hanya dari JWT; setiap query dibatasi `user_id`. Data milik akun lain menghasilkan 404.
- **Log ganda dicegah** dua lapis: unique constraint `(habit_id, log_date)` dan `findOrCreate` dalam transaksi. `POST /complete` bersifat idempotent.
- **Jadwal**: kebiasaan harian disimpan sebagai tujuh baris `habit_schedules` (Senin–Minggu) sehingga semua perhitungan memakai satu mekanisme.
- **Streak**: hanya hari terjadwal yang dihitung; hari tanpa jadwal tidak memutus streak; hari ini yang belum selesai belum memutus streak. Awal hitungan adalah tanggal kebiasaan dibuat.
- **Progres harian** = selesai / terjadwal × 100%. Bila tidak ada jadwal, ditampilkan 0% dengan keterangan "Tidak ada kebiasaan hari ini".
- **Kalender** membedakan `NO_SCHEDULE` (tidak ada jadwal) dari `MISSED` (terlewat).
- **Kebiasaan nonaktif** tidak muncul di checklist, kalender, dan statistik.
- **Target aktivitas** (`target_count`) disimpan dan ditampilkan, tetapi pencatatan masih biner (selesai/belum) sesuai model `habit_logs` di PRD yang tidak menyimpan hitungan.
- **Reminder**: backend menyimpan preferensi (`habits.reminder_time` dan tabel `reminders`); penjadwalan notifikasi dilakukan di perangkat dan diperbarui setiap kebiasaan dibuat, diubah, atau dihapus. UI saat ini mengatur waktu pengingat lewat form kebiasaan; endpoint `/reminders` tersedia untuk pengingat tambahan.
- **Logout** bersifat stateless: token dihapus dari penyimpanan perangkat (SecureStore).

## 5. Struktur backend

```
backend/src/
├── config/        config.js (dipakai sequelize-cli), database.js, env.js
├── models/        User, Category, Habit, HabitSchedule, HabitLog, Reminder, index (relasi)
├── migrations/    6 migration, urutan sesuai foreign key
├── seeders/       kategori bawaan (Education, Health, Lifestyle, Productivity)
├── controllers/   lapisan HTTP
├── services/      logika bisnis dan query
├── routes/        definisi endpoint
├── middlewares/   auth (JWT), validate (Joi), error
├── validators/    skema Joi
└── utils/         tanggal, streak, response, error
```

Di luar `src/`: `backend/database/schema.sql` (skema SQL setara migration) dan `backend/scripts/setup-db.sh` (setup database satu perintah).
