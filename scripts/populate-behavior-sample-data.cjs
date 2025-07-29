const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
  port: 3306,
  connectTimeout: 60000,
};

const sampleCriteria = [
  // AKHLAQ - Positive
  {
    id: "akhlaq_honest",
    name: "Jujur",
    name_arabic: "الصدق",
    description: "Berkata dan bertindak dengan jujur",
    category: "AKHLAQ",
    type: "POSITIVE",
    severity: "LOW",
    points: 5,
    examples: [
      "Mengakui kesalahan dengan jujur",
      "Tidak berbohong kepada guru atau teman",
      "Mengembalikan barang yang bukan miliknya",
    ],
    rewards: [
      "Pujian di depan kelas",
      "Sticker bintang",
      "Sertifikat kejujuran",
    ],
    islamic_reference: {
      hadith: "عليكم بالصدق فإن الصدق يهدي إلى البر",
      explanation:
        "Hendaklah kalian berlaku jujur, karena kejujuran menuntun kepada kebaikan",
    },
  },
  {
    id: "akhlaq_respect",
    name: "Menghormati Guru",
    name_arabic: "احترام المعلم",
    description: "Menunjukkan sikap hormat kepada guru dan ustadz",
    category: "AKHLAQ",
    type: "POSITIVE",
    severity: "LOW",
    points: 5,
    examples: [
      "Mengucapkan salam ketika bertemu guru",
      "Mendengarkan dengan baik saat guru berbicara",
      "Tidak memotong pembicaraan guru",
    ],
    rewards: ["Pujian verbal", "Pencatatan positif", "Contoh untuk teman lain"],
    islamic_reference: {
      hadith: "ليس منا من لم يرحم صغيرنا ويوقر كبيرنا",
      explanation:
        "Bukan termasuk golongan kami yang tidak menyayangi yang muda dan menghormati yang tua",
    },
  },
  // IBADAH - Positive
  {
    id: "ibadah_prayer",
    name: "Rajin Sholat",
    name_arabic: "المحافظة على الصلاة",
    description: "Melaksanakan sholat dengan tertib dan tepat waktu",
    category: "IBADAH",
    type: "POSITIVE",
    severity: "MEDIUM",
    points: 10,
    examples: [
      "Sholat berjamaah di masjid",
      "Sholat tepat waktu",
      "Khusyuk dalam sholat",
    ],
    rewards: ["Pencatatan ibadah", "Pujian khusus", "Menjadi imam sholat"],
    islamic_reference: {
      quran: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ",
      explanation: "Dan dirikanlah sholat serta tunaikanlah zakat",
    },
  },
  // ACADEMIC - Positive
  {
    id: "academic_quran",
    name: "Hafalan Lancar",
    name_arabic: "حفظ القرآن",
    description: "Menghafal Al-Quran dengan lancar dan benar",
    category: "ACADEMIC",
    type: "POSITIVE",
    severity: "HIGH",
    points: 15,
    examples: [
      "Hafalan baru sesuai target",
      "Muroja'ah lancar",
      "Tajwid benar",
    ],
    rewards: ["Sertifikat hafalan", "Hadiah buku", "Pujian di depan orang tua"],
    islamic_reference: {
      hadith: "خيركم من تعلم القرآن وعلمه",
      explanation:
        "Sebaik-baik kalian adalah yang mempelajari Al-Quran dan mengajarkannya",
    },
  },
  // DISCIPLINE - Negative
  {
    id: "discipline_late",
    name: "Terlambat",
    name_arabic: "التأخير",
    description: "Datang terlambat ke kelas atau kegiatan",
    category: "DISCIPLINE",
    type: "NEGATIVE",
    severity: "LOW",
    points: -3,
    examples: [
      "Terlambat masuk kelas",
      "Terlambat sholat berjamaah",
      "Tidak tepat waktu mengumpulkan tugas",
    ],
    consequences: [
      "Teguran lisan",
      "Berdiri di depan kelas",
      "Membersihkan kelas",
    ],
    islamic_reference: {
      hadith: "الوقت كالسيف إن لم تقطعه قطعك",
      explanation:
        "Waktu itu seperti pedang, jika kamu tidak memanfaatkannya maka ia akan merugikanmu",
    },
  },
  // SOCIAL - Positive
  {
    id: "social_help",
    name: "Membantu Teman",
    name_arabic: "مساعدة الأصدقاء",
    description: "Membantu teman yang kesulitan",
    category: "SOCIAL",
    type: "POSITIVE",
    severity: "LOW",
    points: 5,
    examples: [
      "Membantu teman yang kesulitan belajar",
      "Berbagi makanan",
      "Menghibur teman yang sedih",
    ],
    rewards: ["Pujian guru", "Contoh untuk yang lain", "Pencatatan positif"],
    islamic_reference: {
      hadith: "والله في عون العبد ما كان العبد في عون أخيه",
      explanation:
        "Allah akan menolong seorang hamba selama hamba itu menolong saudaranya",
    },
  },
];

async function populateSampleData() {
  let connection;
  try {
    console.log("🔌 Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Database connection successful");

    // Check if data already exists
    const [existing] = await connection.execute(
      "SELECT COUNT(*) as count FROM behavior_criteria",
    );
    const existingCount = existing[0].count;

    if (existingCount > 0) {
      console.log(
        `📊 Found ${existingCount} existing criteria. Skipping sample data insertion.`,
      );
      return true;
    }

    console.log("📝 Inserting sample behavior criteria...");

    for (const criteria of sampleCriteria) {
      await connection.execute(
        `
        INSERT INTO behavior_criteria (
          id, name, name_arabic, description, category, type, severity, points,
          is_active, age_group, examples, consequences, rewards, islamic_reference
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          criteria.id,
          criteria.name,
          criteria.name_arabic,
          criteria.description,
          criteria.category,
          criteria.type,
          criteria.severity,
          criteria.points,
          true, // is_active
          "5+", // age_group
          JSON.stringify(criteria.examples || []),
          JSON.stringify(criteria.consequences || []),
          JSON.stringify(criteria.rewards || []),
          JSON.stringify(criteria.islamic_reference || {}),
        ],
      );

      console.log(`✅ Inserted: ${criteria.name}`);
    }

    // Verify insertion
    const [result] = await connection.execute(
      "SELECT COUNT(*) as count FROM behavior_criteria",
    );
    const finalCount = result[0].count;

    console.log(`🎉 Successfully inserted ${finalCount} behavior criteria!`);
    return true;
  } catch (error) {
    console.error("❌ Error populating sample data:", error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run the population
populateSampleData()
  .then((success) => {
    if (success) {
      console.log("\n✅ Sample data population completed successfully!");
      process.exit(0);
    } else {
      console.log("\n❌ Sample data population failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n💥 Unexpected error:", error);
    process.exit(1);
  });
