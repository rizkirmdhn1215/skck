import { generateMockKTP } from './mockKTPData';
import { KTPData } from '../types/KTPTypes';

// Simulate an API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock storage
const ktpStorage = new Map<string, KTPData>();

export async function getKTPByNIK(nik: string): Promise<KTPData | null> {
  await delay(500); // Simulate network delay
  return ktpStorage.get(nik) || null;
}

export async function generateAndSaveKTPData(nik: string): Promise<KTPData> {
  await delay(800); // Simulate processing delay
  const ktpData = generateMockKTP(nik);
  ktpStorage.set(nik, ktpData);
  return ktpData;
} 