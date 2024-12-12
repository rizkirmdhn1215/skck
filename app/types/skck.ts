export interface SKCKApplication {
  id: string;
  userId: string;
  namaLengkap: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  statusPerkawinan: string;
  pekerjaan: string;
  alamatLengkap: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  keperluanSKCK: string;
  namaInstansi: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  pernahTerlibatKasus: boolean;
  tinggiBadan: string;
  beratBadan: string;
  tandaKhusus?: string;
} 