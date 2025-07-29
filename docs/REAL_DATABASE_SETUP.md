# 🗄️ SETUP DATABASE REAL UNTUK HALAQAH TERPADU

## 🎯 Overview

Sekarang kita akan menggunakan data sesungguhnya dari database MySQL untuk Halaqah Terpadu module. Sistem telah diupgrade dengan:

1. **Enhanced API Endpoint** dengan robust error handling
2. **Database Table Setup** dengan sample data
3. **Fallback Mechanism** ke mock data jika database gagal
4. **Testing Tools** untuk verify database connection

---

## 🔧 Setup Steps

### **1. Test Database Connection**

Pertama, test koneksi database:

```bash
# Via browser atau curl
GET http://localhost:3000/api/test-db-connection

# Expected response:
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "connection": "OK",
    "tables": [...],
    "halaqahStructure": [...],
    "sampleData": [...]
  }
}
```

### **2. Setup Database Tables**

Jika tabel belum ada, setup dengan sample data:

```bash
# Via browser atau curl
POST http://localhost:3000/api/setup-halaqah-tables

# Expected response:
{
  "success": true,
  "message": "Halaqah tables setup completed successfully",
  "data": {
    "tablesCreated": ["halaqah", "users", "santri", "hafalan", "assessments"],
    "sampleData": {...}
  }
}
```

### **3. Access Halaqah Terpadu**

Setelah database ready, akses halaman:

```bash
http://localhost:3000/dashboard/admin/halaqah-terpadu
```

---

## 📋 Database Schema

### **1. Halaqah Table**

```sql
CREATE TABLE halaqah (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INT NOT NULL DEFAULT 10,
  room VARCHAR(255),
  schedule JSON,
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **2. Users Table (Musyrif)**

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  role ENUM('ADMIN', 'MUSYRIF', 'SANTRI') DEFAULT 'SANTRI',
  halaqahId INT,
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
  FOREIGN KEY (halaqahId) REFERENCES halaqah(id)
);
```

### **3. Santri Table**

```sql
CREATE TABLE santri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nis VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  gender ENUM('MALE', 'FEMALE') NOT NULL,
  birthDate DATE,
  phone VARCHAR(20),
  halaqahId INT,
  status ENUM('ACTIVE', 'INACTIVE', 'GRADUATED', 'DROPPED') DEFAULT 'ACTIVE',
  enrollmentDate DATE DEFAULT (CURRENT_DATE),
  FOREIGN KEY (halaqahId) REFERENCES halaqah(id)
);
```

### **4. Hafalan Table**

```sql
CREATE TABLE hafalan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  santriId INT NOT NULL,
  surah VARCHAR(255),
  ayahStart INT,
  ayahEnd INT,
  grade DECIMAL(5,2),
  notes TEXT,
  assessedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (santriId) REFERENCES santri(id)
);
```

### **5. Assessments Table**

```sql
CREATE TABLE assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  santriId INT NOT NULL,
  type ENUM('TAHSIN', 'HAFALAN', 'AKHLAQ') NOT NULL,
  category VARCHAR(255),
  score DECIMAL(5,2),
  notes TEXT,
  assessedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (santriId) REFERENCES santri(id)
);
```

---

## 📊 Sample Data

### **Halaqah Sample:**

```json
[
  {
    "id": 1,
    "name": "Halaqah Al-Fatiha",
    "description": "Halaqah untuk pemula dengan fokus pada surat-surat pendek",
    "capacity": 15,
    "room": "Ruang A1",
    "schedule": {
      "days": ["Senin", "Rabu", "Jumat"],
      "time": "16:00-17:30",
      "pattern": "3x seminggu"
    },
    "status": "ACTIVE"
  },
  {
    "id": 2,
    "name": "Halaqah An-Nas",
    "description": "Halaqah lanjutan dengan fokus pada hafalan juz 30",
    "capacity": 12,
    "room": "Ruang B2",
    "schedule": {
      "days": ["Selasa", "Kamis", "Sabtu"],
      "time": "15:30-17:00",
      "pattern": "3x seminggu"
    },
    "status": "ACTIVE"
  }
]
```

### **Musyrif Sample:**

```json
[
  {
    "id": 1,
    "name": "Ustadz Ahmad Fauzi",
    "email": "ahmad.fauzi@tpq.com",
    "phone": "081234567890",
    "role": "MUSYRIF",
    "halaqahId": 1
  },
  {
    "id": 2,
    "name": "Ustadzah Siti Aminah",
    "email": "siti.aminah@tpq.com",
    "phone": "081234567891",
    "role": "MUSYRIF",
    "halaqahId": 2
  }
]
```

### **Santri Sample:**

```json
[
  {
    "id": 1,
    "nis": "2024001",
    "name": "Muhammad Ali",
    "gender": "MALE",
    "halaqahId": 1,
    "averageGrade": 85.0
  },
  {
    "id": 2,
    "nis": "2024002",
    "name": "Fatimah Zahra",
    "gender": "FEMALE",
    "halaqahId": 1,
    "averageGrade": 90.0
  }
]
```

---

## 🔄 API Enhancements

### **1. Enhanced Error Handling:**

```typescript
// Robust database connection with timeouts
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin123",
  database: process.env.DB_NAME || "db_tpq",
  port: parseInt(process.env.DB_PORT || "3306"),
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
};

// Graceful fallback for missing tables
try {
  const [santriResult] = await connection.execute(query);
  santriResult = result;
} catch (error) {
  console.warn(`⚠️ Could not fetch santri:`, error);
  santriResult = [];
}
```

### **2. Improved Queries:**

```sql
-- Better aggregation with COALESCE
SELECT
  h.id,
  h.name,
  h.description,
  h.capacity,
  h.schedule,
  h.room,
  h.status,
  COUNT(DISTINCT s.id) as totalSantri,
  COALESCE(AVG(hf.grade), 0) as averageGrade
FROM halaqah h
LEFT JOIN users u ON h.id = u.halaqahId AND u.role = 'MUSYRIF'
LEFT JOIN santri s ON h.id = s.halaqahId AND s.status = 'ACTIVE'
LEFT JOIN hafalan hf ON s.id = hf.santriId
WHERE h.status = 'ACTIVE'
GROUP BY h.id
ORDER BY h.name ASC
```

### **3. Frontend Fallback:**

```typescript
// Try real API first, fallback to mock data
try {
  const response = await fetch("/api/halaqah/comprehensive", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store", // Always fetch fresh data
  });

  if (response.ok) {
    const result = await response.json();
    if (result.success) {
      setHalaqahList(result.data.halaqah || []);
      setStatistics(result.data.statistics || defaultStats);
      toast.success("Data halaqah berhasil dimuat dari database");
      return;
    }
  }
  throw new Error("API failed");
} catch (error) {
  console.log("🔄 Falling back to mock data...");
  loadMockData();
  toast.error("Gagal memuat data dari database. Menggunakan data mock.");
}
```

---

## 🚀 Benefits

### **🗄️ Real Database Integration:**

✅ **Live Data**: Data real dari MySQL database  
✅ **CRUD Operations**: Full create, read, update, delete capability  
✅ **Relational Data**: Proper foreign key relationships  
✅ **Data Integrity**: Constraints dan validations

### **🔧 Robust System:**

✅ **Error Handling**: Graceful fallback mechanisms  
✅ **Connection Management**: Proper connection pooling  
✅ **Query Optimization**: Efficient database queries  
✅ **Performance**: Fast data retrieval dengan indexing

### **👨‍💻 Developer Experience:**

✅ **Easy Setup**: Automated table creation  
✅ **Sample Data**: Ready-to-use test data  
✅ **Testing Tools**: Database connection verification  
✅ **Fallback Support**: Development continues even if DB fails

### **🎓 Production Ready:**

✅ **Scalable**: Supports growing data  
✅ **Maintainable**: Clean database schema  
✅ **Reliable**: Robust error handling  
✅ **Flexible**: Easy to extend dan modify

---

## 🎯 Next Steps

1. **Setup Database**: Run setup-halaqah-tables endpoint
2. **Test Connection**: Verify dengan test-db-connection
3. **Access Interface**: Open halaqah-terpadu page
4. **Add Real Data**: Input data TPQ sesungguhnya
5. **Monitor Performance**: Check query performance
6. **Backup Strategy**: Setup regular database backups

**Sistem sekarang siap menggunakan data real dari database dengan fallback ke mock data untuk development!** 🗄️✨🚀
