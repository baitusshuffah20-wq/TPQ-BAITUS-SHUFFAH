# 📋 Sistem Manajemen Kriteria Perilaku

## 🎯 **Overview**

Sistem Manajemen Kriteria Perilaku adalah fitur baru yang memungkinkan admin TPQ untuk mengelola kriteria penilaian perilaku santri secara dinamis melalui interface web. Sistem ini terintegrasi penuh dengan database MySQL dan menyediakan CRUD operations lengkap.

## 🏗️ **Arsitektur Sistem**

### **1. Database Layer**

- **Tabel**: `behavior_criteria`
- **Lokasi**: Database MySQL `tpq_baitus_shuffahh`
- **Migration**: `database/migrations/create_behavior_tables_clean.sql`

### **2. API Layer**

- **Endpoint Utama**: `/api/behavior-criteria`
- **Endpoint Detail**: `/api/behavior-criteria/[id]`
- **Methods**: GET, POST, PUT, DELETE

### **3. Frontend Layer**

- **Halaman Admin**: `/dashboard/admin/behavior/criteria`
- **Komponen Form**: `BehaviorCriteriaForm`
- **Komponen Detail**: `BehaviorCriteriaDetail`

## 📊 **Struktur Database**

### **Tabel `behavior_criteria`**

```sql
CREATE TABLE behavior_criteria (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    name_arabic VARCHAR(100),
    description TEXT,
    category ENUM('AKHLAQ', 'IBADAH', 'ACADEMIC', 'SOCIAL', 'DISCIPLINE', 'LEADERSHIP') NOT NULL,
    type ENUM('POSITIVE', 'NEGATIVE', 'NEUTRAL') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
    points INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    age_group VARCHAR(20) DEFAULT '5+',
    examples JSON,
    consequences JSON,
    rewards JSON,
    islamic_reference JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Field Descriptions**

| Field               | Type         | Description                                                        |
| ------------------- | ------------ | ------------------------------------------------------------------ |
| `id`                | VARCHAR(36)  | UUID unik untuk setiap kriteria                                    |
| `name`              | VARCHAR(100) | Nama kriteria dalam bahasa Indonesia                               |
| `name_arabic`       | VARCHAR(100) | Nama kriteria dalam bahasa Arab                                    |
| `description`       | TEXT         | Deskripsi lengkap kriteria                                         |
| `category`          | ENUM         | Kategori: AKHLAQ, IBADAH, ACADEMIC, SOCIAL, DISCIPLINE, LEADERSHIP |
| `type`              | ENUM         | Tipe: POSITIVE, NEGATIVE, NEUTRAL                                  |
| `severity`          | ENUM         | Tingkat: LOW, MEDIUM, HIGH, CRITICAL                               |
| `points`            | INT          | Poin yang diberikan (positif/negatif)                              |
| `is_active`         | BOOLEAN      | Status aktif/nonaktif                                              |
| `age_group`         | VARCHAR(20)  | Kelompok usia target                                               |
| `examples`          | JSON         | Array contoh perilaku                                              |
| `consequences`      | JSON         | Array konsekuensi (untuk perilaku negatif)                         |
| `rewards`           | JSON         | Array penghargaan (untuk perilaku positif)                         |
| `islamic_reference` | JSON         | Referensi Al-Qur'an/Hadits                                         |

## 🔌 **API Endpoints**

### **1. GET /api/behavior-criteria**

Mengambil daftar kriteria perilaku dengan pagination dan filter.

**Query Parameters:**

- `page` (number): Halaman (default: 1)
- `limit` (number): Jumlah per halaman (default: 50)
- `category` (string): Filter kategori
- `type` (string): Filter tipe
- `isActive` (boolean): Filter status aktif
- `search` (string): Pencarian teks

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "akhlaq_honest",
      "name": "Jujur",
      "nameArabic": "الصدق",
      "description": "Berkata dan bertindak dengan jujur",
      "category": "AKHLAQ",
      "type": "POSITIVE",
      "severity": "LOW",
      "points": 5,
      "isActive": true,
      "ageGroup": "5+",
      "examples": ["Mengakui kesalahan dengan jujur"],
      "rewards": ["Pujian di depan kelas"],
      "islamicReference": {
        "hadith": "عليكم بالصدق فإن الصدق يهدي إلى البر",
        "explanation": "Hendaklah kalian berlaku jujur..."
      },
      "usage": {
        "total": 15,
        "recent": 3
      },
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### **2. GET /api/behavior-criteria/[id]**

Mengambil detail kriteria perilaku berdasarkan ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "akhlaq_honest",
    "name": "Jujur",
    // ... field lainnya
    "usage": {
      "total": 15,
      "recent": 3
    }
  }
}
```

### **3. POST /api/behavior-criteria**

Membuat kriteria perilaku baru.

**Request Body:**

```json
{
  "name": "Jujur",
  "nameArabic": "الصدق",
  "description": "Berkata dan bertindak dengan jujur",
  "category": "AKHLAQ",
  "type": "POSITIVE",
  "severity": "LOW",
  "points": 5,
  "isActive": true,
  "ageGroup": "5+",
  "examples": ["Mengakui kesalahan dengan jujur"],
  "rewards": ["Pujian di depan kelas"],
  "islamicReference": {
    "hadith": "عليكم بالصدق فإن الصدق يهدي إلى البر",
    "explanation": "Hendaklah kalian berlaku jujur..."
  }
}
```

### **4. PUT /api/behavior-criteria**

Memperbarui kriteria perilaku yang ada.

**Request Body:**

```json
{
  "id": "akhlaq_honest",
  "name": "Jujur (Updated)",
  "points": 10
  // field lain yang ingin diupdate
}
```

### **5. DELETE /api/behavior-criteria?id=[id]**

Menghapus kriteria perilaku (hanya jika tidak sedang digunakan).

## 🖥️ **Interface Admin**

### **Halaman Utama**

- **URL**: `/dashboard/admin/behavior/criteria`
- **Akses**: Admin only
- **Fitur**:
  - Tabel daftar kriteria dengan pagination
  - Filter berdasarkan kategori, tipe, dan status
  - Pencarian teks
  - Aksi: Lihat, Edit, Hapus, Toggle Status

### **Form Tambah/Edit**

- **Modal**: `BehaviorCriteriaForm`
- **Fitur**:
  - Validasi input lengkap
  - Dynamic fields (consequences untuk negatif, rewards untuk positif)
  - Support untuk referensi Islam
  - Array input untuk examples, consequences, rewards

### **Detail Modal**

- **Modal**: `BehaviorCriteriaDetail`
- **Fitur**:
  - Tampilan lengkap semua field
  - Statistik penggunaan
  - Format yang mudah dibaca

## 🚀 **Setup & Installation**

### **1. Setup Database**

```bash
# Jalankan script setup
scripts\setup-behavior-tables.bat
```

### **2. Verifikasi API**

```bash
# Test API endpoints
node scripts\test-behavior-api.js
```

### **3. Akses Interface**

1. Login sebagai Admin
2. Navigasi ke: Dashboard → Kriteria Perilaku
3. Mulai mengelola kriteria perilaku

## 📝 **Contoh Data**

### **Kriteria Positif - Akhlaq**

```json
{
  "name": "Jujur",
  "nameArabic": "الصدق",
  "description": "Berkata dan bertindak dengan jujur",
  "category": "AKHLAQ",
  "type": "POSITIVE",
  "severity": "LOW",
  "points": 5,
  "examples": [
    "Mengakui kesalahan dengan jujur",
    "Tidak berbohong kepada guru atau teman",
    "Mengembalikan barang yang bukan miliknya"
  ],
  "rewards": [
    "Pujian di depan kelas",
    "Sticker bintang",
    "Sertifikat kejujuran"
  ],
  "islamicReference": {
    "hadith": "عليكم بالصدق فإن الصدق يهدي إلى البر",
    "explanation": "Hendaklah kalian berlaku jujur, karena kejujuran menuntun kepada kebaikan"
  }
}
```

### **Kriteria Negatif - Disiplin**

```json
{
  "name": "Terlambat",
  "nameArabic": "التأخير",
  "description": "Datang terlambat ke TPQ",
  "category": "DISCIPLINE",
  "type": "NEGATIVE",
  "severity": "LOW",
  "points": -2,
  "examples": [
    "Datang lebih dari 15 menit setelah waktu mulai",
    "Tidak memberitahu alasan keterlambatan"
  ],
  "consequences": [
    "Teguran lisan",
    "Membersihkan kelas",
    "Surat peringatan untuk orang tua"
  ]
}
```

## 🔗 **Integrasi dengan Sistem Lain**

### **1. Behavior Records**

- Kriteria digunakan dalam `behavior_records` table
- Foreign key: `criteria_id`
- Validasi: Kriteria tidak bisa dihapus jika sedang digunakan

### **2. Achievement System**

- Kriteria dapat memicu achievement badges
- Poin dari kriteria berkontribusi ke total skor santri

### **3. Reporting**

- Data kriteria digunakan dalam laporan perilaku
- Analytics berdasarkan kategori dan tipe kriteria

## ⚠️ **Catatan Penting**

1. **Hak Akses**: Hanya admin yang dapat mengelola kriteria
2. **Validasi**: Semua input divalidasi di frontend dan backend
3. **Backup**: Selalu backup database sebelum menghapus kriteria
4. **Performance**: Gunakan pagination untuk dataset besar
5. **Security**: API menggunakan validasi Zod untuk input sanitization

## 🎉 **Kesimpulan**

Sistem Manajemen Kriteria Perilaku telah berhasil diimplementasi dengan fitur lengkap:

- ✅ CRUD operations lengkap
- ✅ Interface admin yang user-friendly
- ✅ Integrasi database MySQL
- ✅ Validasi dan error handling
- ✅ Navigation menu terintegrasi
- ✅ Documentation lengkap

## 🧪 **Testing & Verifikasi**

### **Script Testing Tersedia:**

1. **Setup Database:**

   ```bash
   scripts\setup-behavior-tables.bat
   ```

2. **Test Koneksi Database:**

   ```bash
   node scripts\test-database-connection.js
   ```

3. **Test API Endpoints:**

   ```bash
   node scripts\test-behavior-api.js
   ```

4. **Test Fungsionalitas Lengkap:**

   ```bash
   node scripts\test-full-functionality.js
   ```

5. **Run All Tests:**
   ```bash
   scripts\run-all-tests.bat
   ```

### **Manual Testing Checklist:**

#### **✅ Database Setup**

- [ ] XAMPP MySQL service berjalan
- [ ] Database `tpq_baitus_shuffahh` ada
- [ ] Tabel `behavior_criteria` ada dengan struktur lengkap
- [ ] Sample data ter-load dengan benar

#### **✅ API Endpoints**

- [ ] GET `/api/behavior-criteria` - List dengan pagination
- [ ] GET `/api/behavior-criteria/[id]` - Detail criteria
- [ ] POST `/api/behavior-criteria` - Create new criteria
- [ ] PUT `/api/behavior-criteria` - Update existing criteria
- [ ] DELETE `/api/behavior-criteria?id=[id]` - Delete criteria

#### **✅ Web Interface**

- [ ] Halaman `/dashboard/admin/behavior/criteria` dapat diakses
- [ ] Tabel menampilkan data dengan benar
- [ ] Search functionality bekerja
- [ ] Filter (category, type, status) bekerja
- [ ] Pagination bekerja
- [ ] Form tambah criteria berfungsi
- [ ] Form edit criteria berfungsi
- [ ] Modal detail menampilkan informasi lengkap
- [ ] Delete criteria dengan validasi usage
- [ ] Toggle status aktif/nonaktif

#### **✅ Error Handling**

- [ ] Error database connection ditangani dengan baik
- [ ] Validasi form input bekerja
- [ ] Error messages informatif
- [ ] Loading states ditampilkan
- [ ] Network errors ditangani

## 🔧 **Troubleshooting**

### **Problem: Database Connection Failed**

**Solution:**

1. Pastikan XAMPP MySQL service berjalan
2. Check port 3306 tidak diblokir
3. Verifikasi credentials database
4. Run: `node scripts\test-database-connection.js`

### **Problem: Table Not Found**

**Solution:**

1. Run migration: `scripts\setup-behavior-tables.bat`
2. Check database name: `tpq_baitus_shuffahh`
3. Verify table creation manually

### **Problem: API Endpoints Not Working**

**Solution:**

1. Pastikan Next.js server berjalan di port 3000
2. Check console untuk error messages
3. Verify API routes di `src/app/api/behavior-criteria/`
4. Test dengan: `node scripts\test-behavior-api.js`

### **Problem: Form Validation Errors**

**Solution:**

1. Check required fields (nama, nama Arab, deskripsi, contoh)
2. Verify JSON structure untuk arrays
3. Check console untuk detailed error messages

### **Problem: Search/Filter Not Working**

**Solution:**

1. Check network tab untuk API calls
2. Verify query parameters
3. Check database indexes
4. Clear browser cache

**Sistem siap digunakan untuk mengelola kriteria penilaian perilaku santri di TPQ Baitus Shuffahh! 🎊**
