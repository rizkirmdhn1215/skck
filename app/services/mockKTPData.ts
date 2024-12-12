import { KTPData } from '../types/KTPTypes';

const MOCK_NAMES = ['Budi Santoso', 'Siti Rahayu', 'Ahmad Wijaya', 'Dewi Kusuma', 'Raden Suparman'];
const MOCK_PLACES = ['Jakarta', 'Surabaya', 'Bandung', 'Semarang', 'Yogyakarta'];
const MOCK_RELIGIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha'];
const MOCK_JOBS = ['Wiraswasta', 'PNS', 'Karyawan Swasta', 'Guru', 'Dokter'];
const MOCK_MARRIAGES = ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'];

export function generateMockKTP(nik: string): KTPData {
  // Use the NIK to generate consistent data for the same NIK
  const randomSeed = parseInt(nik.slice(-4));
  
  return {
    nik: nik,
    nama: MOCK_NAMES[randomSeed % MOCK_NAMES.length],
    tempatLahir: MOCK_PLACES[randomSeed % MOCK_PLACES.length],
    tanggalLahir: `${1980 + (randomSeed % 30)}-${String(1 + (randomSeed % 12)).padStart(2, '0')}-${String(1 + (randomSeed % 28)).padStart(2, '0')}`,
    jenisKelamin: randomSeed % 2 === 0 ? 'LAKI-LAKI' : 'PEREMPUAN',
    alamat: `Jl. Merdeka No. ${randomSeed % 100}`,
    rt: String(1 + (randomSeed % 20)).padStart(2, '0'),
    rw: String(1 + (randomSeed % 10)).padStart(2, '0'),
    kelurahan: 'Kebayoran Baru',
    kecamatan: 'Kebayoran Lama',
    agama: MOCK_RELIGIONS[randomSeed % MOCK_RELIGIONS.length],
    statusPerkawinan: MOCK_MARRIAGES[randomSeed % MOCK_MARRIAGES.length],
    pekerjaan: MOCK_JOBS[randomSeed % MOCK_JOBS.length],
  };
} 