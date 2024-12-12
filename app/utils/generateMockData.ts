import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { faker } from '@faker-js/faker/locale/id_ID';

const generateNIK = () => {
  try {
    const province = faker.number.int({ min: 11, max: 94 }).toString();
    const city = faker.number.int({ min: 1, max: 99 }).toString().padStart(2, '0');
    const district = faker.number.int({ min: 1, max: 99 }).toString().padStart(2, '0');
    const date = faker.date.between({ 
      from: '1950-01-01', 
      to: '2005-12-31'
    }).toISOString().slice(0,10).replace(/-/g,'').slice(2,8);
    const random = faker.number.int({ min: 1, max: 9999 }).toString().padStart(4, '0');
    
    return `${province}${city}${district}${date}${random}`;
  } catch (error) {
    console.error('Error generating NIK:', error);
    throw error;
  }
};

const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const bloodTypes = ['A', 'B', 'AB', 'O'];
const maritalStatus = ['Belum Menikah', 'Menikah', 'Duda', 'Janda'];

const generatePerson = () => {
  try {
    const gender = faker.person.sex() === 'female' ? 'Perempuan' : 'Laki-Laki';
    const birthDate = faker.date.between({ 
      from: '1950-01-01', 
      to: '2005-12-31'
    }).toISOString().slice(0,10);

    return {
      nik: generateNIK(),
      namaLengkap: faker.person.fullName(),
      tempatLahir: faker.location.city(),
      tanggalLahir: birthDate,
      jenisKelamin: gender,
      agama: faker.helpers.arrayElement(religions),
      statusPerkawinan: faker.helpers.arrayElement(maritalStatus),
      kewarganegaraan: 'WNI',
      golonganDarah: faker.helpers.arrayElement(bloodTypes),
    };
  } catch (error) {
    console.error('Error generating person:', error);
    throw error;
  }
};

export const uploadMockData = async () => {
  try {
    console.log('Starting mock data generation...');
    const people = Array.from({ length: 100 }, generatePerson);
    console.log('Generated people data:', people.length);
    
    let uploaded = 0;
    for (const person of people) {
      const { nik, ...personData } = person;
      await setDoc(doc(db, 'nik_data', nik), personData);
      uploaded++;
      console.log(`Uploaded ${uploaded}/100: NIK ${nik}`);
    }
    
    console.log('Successfully uploaded all records');
    return people;
  } catch (error) {
    console.error('Detailed error in uploadMockData:', error);
    throw new Error(`Failed to upload mock data: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}; 