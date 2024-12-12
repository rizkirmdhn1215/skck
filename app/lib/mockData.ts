import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface NikData {
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  statusPerkawinan: string;
  kewarganegaraan: string;
  golonganDarah: string;
}

export const fetchNikData = async (nik: string): Promise<NikData | null> => {
  try {
    const nikDoc = await getDoc(doc(db, 'nik_data', nik));
    if (nikDoc.exists()) {
      return nikDoc.data() as NikData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching NIK data:', error);
    return null;
  }
}; 