interface WilayahData {
  id: string;
  name: string;
}

export const fetchProvinces = async (): Promise<WilayahData[]> => {
  const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
  return response.json();
};

export const fetchRegencies = async (provinceId: string): Promise<WilayahData[]> => {
  const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
  return response.json();
};

export const fetchDistricts = async (regencyId: string): Promise<WilayahData[]> => {
  const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`);
  return response.json();
};

export const fetchVillages = async (districtId: string): Promise<WilayahData[]> => {
  const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);
  return response.json();
}; 