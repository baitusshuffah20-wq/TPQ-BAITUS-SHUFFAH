import { NextRequest, NextResponse } from 'next/server';

// Surah data
const surahs = [
  { id: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', totalAyah: 7, type: 'Makkiyah' },
  { id: 2, name: 'Al-Baqarah', arabicName: 'البقرة', totalAyah: 286, type: 'Madaniyah' },
  { id: 3, name: 'Ali \'Imran', arabicName: 'آل عمران', totalAyah: 200, type: 'Madaniyah' },
  { id: 4, name: 'An-Nisa\'', arabicName: 'النساء', totalAyah: 176, type: 'Madaniyah' },
  { id: 5, name: 'Al-Ma\'idah', arabicName: 'المائدة', totalAyah: 120, type: 'Madaniyah' },
  { id: 6, name: 'Al-An\'am', arabicName: 'الأنعام', totalAyah: 165, type: 'Makkiyah' },
  { id: 7, name: 'Al-A\'raf', arabicName: 'الأعراف', totalAyah: 206, type: 'Makkiyah' },
  { id: 8, name: 'Al-Anfal', arabicName: 'الأنفال', totalAyah: 75, type: 'Madaniyah' },
  { id: 9, name: 'At-Tawbah', arabicName: 'التوبة', totalAyah: 129, type: 'Madaniyah' },
  { id: 10, name: 'Yunus', arabicName: 'يونس', totalAyah: 109, type: 'Makkiyah' },
  { id: 11, name: 'Hud', arabicName: 'هود', totalAyah: 123, type: 'Makkiyah' },
  { id: 12, name: 'Yusuf', arabicName: 'يوسف', totalAyah: 111, type: 'Makkiyah' },
  { id: 13, name: 'Ar-Ra\'d', arabicName: 'الرعد', totalAyah: 43, type: 'Madaniyah' },
  { id: 14, name: 'Ibrahim', arabicName: 'ابراهيم', totalAyah: 52, type: 'Makkiyah' },
  { id: 15, name: 'Al-Hijr', arabicName: 'الحجر', totalAyah: 99, type: 'Makkiyah' },
  { id: 16, name: 'An-Nahl', arabicName: 'النحل', totalAyah: 128, type: 'Makkiyah' },
  { id: 17, name: 'Al-Isra\'', arabicName: 'الإسراء', totalAyah: 111, type: 'Makkiyah' },
  { id: 18, name: 'Al-Kahf', arabicName: 'الكهف', totalAyah: 110, type: 'Makkiyah' },
  { id: 19, name: 'Maryam', arabicName: 'مريم', totalAyah: 98, type: 'Makkiyah' },
  { id: 20, name: 'Ta-Ha', arabicName: 'طه', totalAyah: 135, type: 'Makkiyah' },
  { id: 21, name: 'Al-Anbiya\'', arabicName: 'الأنبياء', totalAyah: 112, type: 'Makkiyah' },
  { id: 22, name: 'Al-Hajj', arabicName: 'الحج', totalAyah: 78, type: 'Madaniyah' },
  { id: 23, name: 'Al-Mu\'minun', arabicName: 'المؤمنون', totalAyah: 118, type: 'Makkiyah' },
  { id: 24, name: 'An-Nur', arabicName: 'النور', totalAyah: 64, type: 'Madaniyah' },
  { id: 25, name: 'Al-Furqan', arabicName: 'الفرقان', totalAyah: 77, type: 'Makkiyah' },
  { id: 26, name: 'Ash-Shu\'ara\'', arabicName: 'الشعراء', totalAyah: 227, type: 'Makkiyah' },
  { id: 27, name: 'An-Naml', arabicName: 'النمل', totalAyah: 93, type: 'Makkiyah' },
  { id: 28, name: 'Al-Qasas', arabicName: 'القصص', totalAyah: 88, type: 'Makkiyah' },
  { id: 29, name: 'Al-\'Ankabut', arabicName: 'العنكبوت', totalAyah: 69, type: 'Makkiyah' },
  { id: 30, name: 'Ar-Rum', arabicName: 'الروم', totalAyah: 60, type: 'Makkiyah' },
  { id: 31, name: 'Luqman', arabicName: 'لقمان', totalAyah: 34, type: 'Makkiyah' },
  { id: 32, name: 'As-Sajdah', arabicName: 'السجدة', totalAyah: 30, type: 'Makkiyah' },
  { id: 33, name: 'Al-Ahzab', arabicName: 'الأحزاب', totalAyah: 73, type: 'Madaniyah' },
  { id: 34, name: 'Saba\'', arabicName: 'سبإ', totalAyah: 54, type: 'Makkiyah' },
  { id: 35, name: 'Fatir', arabicName: 'فاطر', totalAyah: 45, type: 'Makkiyah' },
  { id: 36, name: 'Ya-Sin', arabicName: 'يس', totalAyah: 83, type: 'Makkiyah' },
  { id: 37, name: 'As-Saffat', arabicName: 'الصافات', totalAyah: 182, type: 'Makkiyah' },
  { id: 38, name: 'Sad', arabicName: 'ص', totalAyah: 88, type: 'Makkiyah' },
  { id: 39, name: 'Az-Zumar', arabicName: 'الزمر', totalAyah: 75, type: 'Makkiyah' },
  { id: 40, name: 'Ghafir', arabicName: 'غافر', totalAyah: 85, type: 'Makkiyah' },
  { id: 41, name: 'Fussilat', arabicName: 'فصلت', totalAyah: 54, type: 'Makkiyah' },
  { id: 42, name: 'Ash-Shura', arabicName: 'الشورى', totalAyah: 53, type: 'Makkiyah' },
  { id: 43, name: 'Az-Zukhruf', arabicName: 'الزخرف', totalAyah: 89, type: 'Makkiyah' },
  { id: 44, name: 'Ad-Dukhan', arabicName: 'الدخان', totalAyah: 59, type: 'Makkiyah' },
  { id: 45, name: 'Al-Jathiyah', arabicName: 'الجاثية', totalAyah: 37, type: 'Makkiyah' },
  { id: 46, name: 'Al-Ahqaf', arabicName: 'الأحقاف', totalAyah: 35, type: 'Makkiyah' },
  { id: 47, name: 'Muhammad', arabicName: 'محمد', totalAyah: 38, type: 'Madaniyah' },
  { id: 48, name: 'Al-Fath', arabicName: 'الفتح', totalAyah: 29, type: 'Madaniyah' },
  { id: 49, name: 'Al-Hujurat', arabicName: 'الحجرات', totalAyah: 18, type: 'Madaniyah' },
  { id: 50, name: 'Qaf', arabicName: 'ق', totalAyah: 45, type: 'Makkiyah' },
  { id: 51, name: 'Adh-Dhariyat', arabicName: 'الذاريات', totalAyah: 60, type: 'Makkiyah' },
  { id: 52, name: 'At-Tur', arabicName: 'الطور', totalAyah: 49, type: 'Makkiyah' },
  { id: 53, name: 'An-Najm', arabicName: 'النجم', totalAyah: 62, type: 'Makkiyah' },
  { id: 54, name: 'Al-Qamar', arabicName: 'القمر', totalAyah: 55, type: 'Makkiyah' },
  { id: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', totalAyah: 78, type: 'Madaniyah' },
  { id: 56, name: 'Al-Waqi\'ah', arabicName: 'الواقعة', totalAyah: 96, type: 'Makkiyah' },
  { id: 57, name: 'Al-Hadid', arabicName: 'الحديد', totalAyah: 29, type: 'Madaniyah' },
  { id: 58, name: 'Al-Mujadilah', arabicName: 'المجادلة', totalAyah: 22, type: 'Madaniyah' },
  { id: 59, name: 'Al-Hashr', arabicName: 'الحشر', totalAyah: 24, type: 'Madaniyah' },
  { id: 60, name: 'Al-Mumtahanah', arabicName: 'الممتحنة', totalAyah: 13, type: 'Madaniyah' },
  { id: 61, name: 'As-Saff', arabicName: 'الصف', totalAyah: 14, type: 'Madaniyah' },
  { id: 62, name: 'Al-Jumu\'ah', arabicName: 'الجمعة', totalAyah: 11, type: 'Madaniyah' },
  { id: 63, name: 'Al-Munafiqun', arabicName: 'المنافقون', totalAyah: 11, type: 'Madaniyah' },
  { id: 64, name: 'At-Taghabun', arabicName: 'التغابن', totalAyah: 18, type: 'Madaniyah' },
  { id: 65, name: 'At-Talaq', arabicName: 'الطلاق', totalAyah: 12, type: 'Madaniyah' },
  { id: 66, name: 'At-Tahrim', arabicName: 'التحريم', totalAyah: 12, type: 'Madaniyah' },
  { id: 67, name: 'Al-Mulk', arabicName: 'الملك', totalAyah: 30, type: 'Makkiyah' },
  { id: 68, name: 'Al-Qalam', arabicName: 'القلم', totalAyah: 52, type: 'Makkiyah' },
  { id: 69, name: 'Al-Haqqah', arabicName: 'الحاقة', totalAyah: 52, type: 'Makkiyah' },
  { id: 70, name: 'Al-Ma\'arij', arabicName: 'المعارج', totalAyah: 44, type: 'Makkiyah' },
  { id: 71, name: 'Nuh', arabicName: 'نوح', totalAyah: 28, type: 'Makkiyah' },
  { id: 72, name: 'Al-Jinn', arabicName: 'الجن', totalAyah: 28, type: 'Makkiyah' },
  { id: 73, name: 'Al-Muzzammil', arabicName: 'المزمل', totalAyah: 20, type: 'Makkiyah' },
  { id: 74, name: 'Al-Muddaththir', arabicName: 'المدثر', totalAyah: 56, type: 'Makkiyah' },
  { id: 75, name: 'Al-Qiyamah', arabicName: 'القيامة', totalAyah: 40, type: 'Makkiyah' },
  { id: 76, name: 'Al-Insan', arabicName: 'الانسان', totalAyah: 31, type: 'Madaniyah' },
  { id: 77, name: 'Al-Mursalat', arabicName: 'المرسلات', totalAyah: 50, type: 'Makkiyah' },
  { id: 78, name: 'An-Naba\'', arabicName: 'النبإ', totalAyah: 40, type: 'Makkiyah' },
  { id: 79, name: 'An-Nazi\'at', arabicName: 'النازعات', totalAyah: 46, type: 'Makkiyah' },
  { id: 80, name: '\'Abasa', arabicName: 'عبس', totalAyah: 42, type: 'Makkiyah' },
  { id: 81, name: 'At-Takwir', arabicName: 'التكوير', totalAyah: 29, type: 'Makkiyah' },
  { id: 82, name: 'Al-Infitar', arabicName: 'الإنفطار', totalAyah: 19, type: 'Makkiyah' },
  { id: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين', totalAyah: 36, type: 'Makkiyah' },
  { id: 84, name: 'Al-Inshiqaq', arabicName: 'الإنشقاق', totalAyah: 25, type: 'Makkiyah' },
  { id: 85, name: 'Al-Buruj', arabicName: 'البروج', totalAyah: 22, type: 'Makkiyah' },
  { id: 86, name: 'At-Tariq', arabicName: 'الطارق', totalAyah: 17, type: 'Makkiyah' },
  { id: 87, name: 'Al-A\'la', arabicName: 'الأعلى', totalAyah: 19, type: 'Makkiyah' },
  { id: 88, name: 'Al-Ghashiyah', arabicName: 'الغاشية', totalAyah: 26, type: 'Makkiyah' },
  { id: 89, name: 'Al-Fajr', arabicName: 'الفجر', totalAyah: 30, type: 'Makkiyah' },
  { id: 90, name: 'Al-Balad', arabicName: 'البلد', totalAyah: 20, type: 'Makkiyah' },
  { id: 91, name: 'Ash-Shams', arabicName: 'الشمس', totalAyah: 15, type: 'Makkiyah' },
  { id: 92, name: 'Al-Layl', arabicName: 'الليل', totalAyah: 21, type: 'Makkiyah' },
  { id: 93, name: 'Ad-Duha', arabicName: 'الضحى', totalAyah: 11, type: 'Makkiyah' },
  { id: 94, name: 'Ash-Sharh', arabicName: 'الشرح', totalAyah: 8, type: 'Makkiyah' },
  { id: 95, name: 'At-Tin', arabicName: 'التين', totalAyah: 8, type: 'Makkiyah' },
  { id: 96, name: 'Al-\'Alaq', arabicName: 'العلق', totalAyah: 19, type: 'Makkiyah' },
  { id: 97, name: 'Al-Qadr', arabicName: 'القدر', totalAyah: 5, type: 'Makkiyah' },
  { id: 98, name: 'Al-Bayyinah', arabicName: 'البينة', totalAyah: 8, type: 'Madaniyah' },
  { id: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة', totalAyah: 8, type: 'Madaniyah' },
  { id: 100, name: 'Al-\'Adiyat', arabicName: 'العاديات', totalAyah: 11, type: 'Makkiyah' },
  { id: 101, name: 'Al-Qari\'ah', arabicName: 'القارعة', totalAyah: 11, type: 'Makkiyah' },
  { id: 102, name: 'At-Takathur', arabicName: 'التكاثر', totalAyah: 8, type: 'Makkiyah' },
  { id: 103, name: 'Al-\'Asr', arabicName: 'العصر', totalAyah: 3, type: 'Makkiyah' },
  { id: 104, name: 'Al-Humazah', arabicName: 'الهمزة', totalAyah: 9, type: 'Makkiyah' },
  { id: 105, name: 'Al-Fil', arabicName: 'الفيل', totalAyah: 5, type: 'Makkiyah' },
  { id: 106, name: 'Quraysh', arabicName: 'قريش', totalAyah: 4, type: 'Makkiyah' },
  { id: 107, name: 'Al-Ma\'un', arabicName: 'الماعون', totalAyah: 7, type: 'Makkiyah' },
  { id: 108, name: 'Al-Kawthar', arabicName: 'الكوثر', totalAyah: 3, type: 'Makkiyah' },
  { id: 109, name: 'Al-Kafirun', arabicName: 'الكافرون', totalAyah: 6, type: 'Makkiyah' },
  { id: 110, name: 'An-Nasr', arabicName: 'النصر', totalAyah: 3, type: 'Madaniyah' },
  { id: 111, name: 'Al-Masad', arabicName: 'المسد', totalAyah: 5, type: 'Makkiyah' },
  { id: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', totalAyah: 4, type: 'Makkiyah' },
  { id: 113, name: 'Al-Falaq', arabicName: 'الفلق', totalAyah: 5, type: 'Makkiyah' },
  { id: 114, name: 'An-Nas', arabicName: 'الناس', totalAyah: 6, type: 'Makkiyah' }
];

// GET /api/quran/surahs - Get all surahs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const juz = searchParams.get('juz');
    
    let filteredSurahs = [...surahs];
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSurahs = filteredSurahs.filter(surah => 
        surah.name.toLowerCase().includes(searchLower) || 
        surah.arabicName.includes(search) ||
        surah.id.toString() === search
      );
    }
    
    // Filter by type
    if (type && (type === 'Makkiyah' || type === 'Madaniyah')) {
      filteredSurahs = filteredSurahs.filter(surah => surah.type === type);
    }
    
    // Filter by juz (not implemented yet)
    
    return NextResponse.json({
      success: true,
      surahs: filteredSurahs,
      total: filteredSurahs.length
    });
    
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengambil data surah',
        error: String(error)
      },
      { status: 500 }
    );
  }
}