// Simple script to add sample santri data via API
const sampleSantri = [
  {
    nis: 'TPQ001',
    name: 'Muhammad Rizki Pratama',
    birthDate: '2010-05-15',
    birthPlace: 'Jakarta',
    gender: 'MALE',
    address: 'Jl. Masjid No. 123, Jakarta Selatan',
    phone: '081234567893',
    email: 'rizki@tpq.com',
    status: 'ACTIVE',
    enrollmentDate: '2023-01-15'
  },
  {
    nis: 'TPQ002',
    name: 'Fatimah Zahra',
    birthDate: '2011-03-20',
    birthPlace: 'Bandung',
    gender: 'FEMALE',
    address: 'Jl. Pondok Pesantren No. 456, Bandung',
    phone: '081234567894',
    email: 'fatimah@tpq.com',
    status: 'ACTIVE',
    enrollmentDate: '2023-02-01'
  },
  {
    nis: 'TPQ003',
    name: 'Ahmad Firdaus',
    birthDate: '2009-08-10',
    birthPlace: 'Surabaya',
    gender: 'MALE',
    address: 'Jl. Al-Quran No. 789, Surabaya',
    phone: '081234567895',
    email: 'firdaus@tpq.com',
    status: 'ACTIVE',
    enrollmentDate: '2022-09-01'
  }
];

console.log('Sample santri data ready to be added via admin interface:');
console.log(JSON.stringify(sampleSantri, null, 2));
console.log('\nYou can copy this data and add it manually through the admin interface at:');
console.log('http://localhost:3000/dashboard/admin/santri');
