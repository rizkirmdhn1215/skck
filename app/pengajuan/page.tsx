'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { fetchNikData } from '../lib/mockData';
import { fetchProvinces, fetchRegencies, fetchDistricts, fetchVillages } from '../utils/wilayahApi';
import AsyncSelect from 'react-select/async';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface NikData {
  namaLengkap?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: 'Laki-Laki' | 'Perempuan' | '';
  agama?: string;
  statusPerkawinan?: string;
  kewarganegaraan?: 'WNI' | 'WNA';
  golonganDarah?: 'A' | 'B' | 'AB' | 'O';
}

const formSchema = z.object({
  // Data Diri
  namaLengkap: z.string().min(3, 'Nama harus minimal 3 karakter'),
  tempatLahir: z.string().min(3, 'Tempat lahir harus diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir harus diisi'),
  jenisKelamin: z.enum(['Laki-Laki', 'Perempuan', '']),
  nik: z.string().length(16, 'NIK harus 16 digit'),
  agama: z.string().min(1, 'Agama harus dipilih'),
  statusPerkawinan: z.string().min(1, 'Status perkawinan harus dipilih'),
  kewarganegaraan: z.enum(['WNI', 'WNA']),
  golonganDarah: z.enum(['A', 'B', 'AB', 'O']),

  // Alamat dan Kontak
  alamatLengkap: z.string().min(10, 'Alamat harus lengkap'),
  provinsi: z.string().min(1, 'Provinsi harus dipilih'),
  rt: z.string().min(1, 'RT harus diisi'),
  rw: z.string().min(1, 'RW harus diisi'),
  kelurahan: z.string().min(1, 'Kelurahan harus diisi'),
  kecamatan: z.string().min(1, 'Kecamatan harus diisi'),
  kota: z.string().min(1, 'Kota/Kabupaten harus diisi'),
  kodePos: z.string().min(5, 'Kode pos harus 5 digit'),
  nomorTelepon: z.string().min(10, 'Nomor telepon tidak valid'),
  email: z.string().email('Email tidak valid').optional(),

  // Pendidikan
  pendidikanTerakhir: z.string().min(1, 'Pendidikan terakhir harus dipilih'),
  namaSekolah: z.string().min(3, 'Nama sekolah/universitas harus diisi'),
  jurusan: z.string().optional(),
  tahunLulus: z.string().min(4, 'Tahun lulus harus diisi'),

  // Pekerjaan
  pekerjaan: z.string().min(1, 'Pekerjaan harus diisi'),
  namaInstansi: z.string().min(3, 'Nama instansi harus diisi'),
  alamatKantor: z.string().min(10, 'Alamat kantor harus diisi'),
  teleponKantor: z.string().optional(),

  // Keluarga
  namaAyah: z.string().min(3, 'Nama ayah harus diisi'),
  namaIbu: z.string().min(3, 'Nama ibu harus diisi'),
  namaPasangan: z.string().optional(),
  jumlahAnak: z.string().optional(),

  // Informasi Tambahan
  keperluanSKCK: z.string().min(3, 'Keperluan SKCK harus diisi'),
  pernahTerlibatKasus: z.boolean(),
  tinggiBadan: z.string().min(1, 'Tinggi badan harus diisi'),
  beratBadan: z.string().min(1, 'Berat badan harus diisi'),
  tandaKhusus: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const FormField = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 2 }}>
    {children}
    {error && <FormHelperText error>{error}</FormHelperText>}
  </Box>
);

interface SelectOption {
  value: string;
  label: string;
}

export default function AjukanForm() {
  const [currentTab, setCurrentTab] = useState(0);
  const [regencyOptions, setRegencyOptions] = useState<SelectOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [villageOptions, setVillageOptions] = useState<SelectOption[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Define form default values
  const defaultValues: FormData = {
    // Data Diri
    namaLengkap: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '' as '' | 'Laki-Laki' | 'Perempuan',
    nik: '',
    agama: 'Islam',
    statusPerkawinan: 'Belum Menikah',
    kewarganegaraan: 'WNI' as 'WNI' | 'WNA',
    golonganDarah: 'A' as 'A' | 'B' | 'AB' | 'O',

    // Alamat dan Kontak
    alamatLengkap: '',
    provinsi: '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    kodePos: '',
    nomorTelepon: '',
    email: '',

    // Pendidikan
    pendidikanTerakhir: 'SMA',
    namaSekolah: '',
    jurusan: '',
    tahunLulus: '',

    // Pekerjaan
    pekerjaan: '',
    namaInstansi: '',
    alamatKantor: '',
    teleponKantor: '',

    // Keluarga
    namaAyah: '',
    namaIbu: '',
    namaPasangan: '',
    jumlahAnak: '',

    // Informasi Tambahan
    keperluanSKCK: '',
    pernahTerlibatKasus: false,
    tinggiBadan: '',
    beratBadan: '',
    tandaKhusus: ''
  };

  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues
  });



  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser?.email) {
      setUserEmail(currentUser.email);
      setValue('email', currentUser.email);
    }
  }, [setValue]);

  const steps = ['Data Diri', 'Alamat & Kontak', 'Pendidikan', 'Pekerjaan', 'Keluarga', 'Informasi Tambahan'];

  const nextTab = () => {
    // Simply move to next tab while preserving form data
    const nextTabIndex = Math.min(currentTab + 1, 5);
    setCurrentTab(nextTabIndex);
  };

  const previousTab = () => {
    // Simply move to previous tab while preserving form data
    const prevTabIndex = Math.max(currentTab - 1, 0);
    setCurrentTab(prevTabIndex);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast.error('Anda harus login terlebih dahulu!');
        return;
      }

      // Format the data before sending to Firebase
      const applicationData = {
        ...data,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Convert date to string if it's a Date object
        tanggalLahir: data.tanggalLahir ? data.tanggalLahir.toString() : '',
        // Convert number fields from string to number
        tinggiBadan: Number(data.tinggiBadan),
        beratBadan: Number(data.beratBadan),
        jumlahAnak: data.jumlahAnak ? Number(data.jumlahAnak) : 0,
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'skck_applications'), applicationData);
      
      toast.success('Pengajuan SKCK berhasil disimpan!');
      // Redirect to status page
      router.push('/status');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Terjadi kesalahan saat menyimpan data!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabPanels = [
    {
      title: 'Data Diri',
      fields: (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* NIK Field - Full Width */}
          <Box sx={{ gridColumn: 'span 2' }}>
            <FormField label="NIK" error={errors.nik?.message}>
              <Controller
                name="nik"
                control={control}
                key={`nik-field-${currentTab}`}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id={`nik-${currentTab}`}
                    label="NIK"
                    variant="outlined"
                    fullWidth
                    error={!!errors.nik}
                    helperText={errors.nik?.message}
                    inputProps={{ 
                      maxLength: 16,
                      inputMode: 'numeric',
                      pattern: '[0-9]*'
                    }}
                    onChange={async (e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      field.onChange(value);
                      
                      if (value.length === 16) {
                        try {
                          const nikData = await fetchNikData(value);
                          if (nikData) {
                            // Strictly define which fields can be updated from NIK data
                            const allowedFields = [
                              'namaLengkap',
                              'tempatLahir',
                              'tanggalLahir',
                              'jenisKelamin',
                              'agama',
                              'statusPerkawinan',
                              'kewarganegaraan',
                              'golonganDarah'
                            ];

                            // Only update allowed fields
                            allowedFields.forEach(field => {
                              const key = field as keyof NikData;
                              if (nikData[key]) {
                                setValue(field as keyof FormData, nikData[key]);
                              }
                            }); 
                            
                            toast.success('Data diri berhasil diisi otomatis');
                          }
                        } catch (error) {
                          toast.error('Gagal mengambil data NIK');
                          console.error('Error fetching NIK data:', error);
                        }
                      }
                    }}
                  />
                )}
              />
            </FormField>
          </Box>

          {/* Other Fields - Two Columns */}
          <FormField label="Nama Lengkap" error={errors.namaLengkap?.message}>
            <Controller
              name="namaLengkap"
              control={control}
              key={`nama-lengkap-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`nama-lengkap-${currentTab}`}
                  label="Nama Lengkap"
                  variant="outlined"
                  fullWidth
                  error={!!errors.namaLengkap}
                  helperText={errors.namaLengkap?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Tempat Lahir" error={errors.tempatLahir?.message}>
            <Controller
              name="tempatLahir"
              control={control}
              key={`tempat-lahir-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`tempat-lahir-${currentTab}`}
                  label="Tempat Lahir"
                  variant="outlined"
                  fullWidth
                  error={!!errors.tempatLahir}
                  helperText={errors.tempatLahir?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Tanggal Lahir" error={errors.tanggalLahir?.message}>
            <Controller
              name="tanggalLahir"
              control={control}
              key={`tanggal-lahir-${currentTab}`}
              render={({ field }) => {
                const today = dayjs();
                const minDate = today.subtract(90, 'year');
                const maxDate = today.subtract(17, 'year');

                return (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Tanggal Lahir"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date?.format('YYYY-MM-DD'))}
                      minDate={minDate}
                      maxDate={maxDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.tanggalLahir,
                          variant: "outlined",
                          helperText: errors.tanggalLahir?.message || 'Usia minimal 17 tahun dan maksimal 90 tahun'
                        }
                      }}
                    />
                  </LocalizationProvider>
                );
              }}
            />
          </FormField>

          <FormField label="Jenis Kelamin" error={errors.jenisKelamin?.message}>
            <Controller
              name="jenisKelamin"
              control={control}
              key={`jenis-kelamin-${currentTab}`}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.jenisKelamin}>
                  <InputLabel id={`jenis-kelamin-label-${currentTab}`}>Jenis Kelamin</InputLabel>
                  <Select
                    {...field}
                    id={`jenis-kelamin-${currentTab}`}
                    labelId={`jenis-kelamin-label-${currentTab}`}
                    label="Jenis Kelamin"
                  >
                    <MenuItem value="Laki-Laki">Laki-Laki</MenuItem>
                    <MenuItem value="Perempuan">Perempuan</MenuItem>
                  </Select>
                  <FormHelperText>{errors.jenisKelamin?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </FormField>

          <FormField label="Agama" error={errors.agama?.message}>
            <Controller
              name="agama"
              control={control}
              key={`agama-${currentTab}`}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.agama}>
                  <InputLabel id={`agama-label-${currentTab}`}>Agama</InputLabel>
                  <Select
                    {...field}
                    id={`agama-${currentTab}`}
                    labelId={`agama-label-${currentTab}`}
                    label="Agama"
                  >
                    <MenuItem value="Islam">Islam</MenuItem>
                    <MenuItem value="Kristen">Kristen</MenuItem>
                    <MenuItem value="Katolik">Katolik</MenuItem>
                    <MenuItem value="Hindu">Hindu</MenuItem>
                    <MenuItem value="Buddha">Buddha</MenuItem>
                    <MenuItem value="Konghucu">Konghucu</MenuItem>
                  </Select>
                  <FormHelperText>{errors.agama?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </FormField>

          <FormField label="Status Perkawinan" error={errors.statusPerkawinan?.message}>
            <Controller
              name="statusPerkawinan"
              control={control}
              key={`status-perkawinan-${currentTab}`}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.statusPerkawinan}>
                  <InputLabel id={`status-perkawinan-label-${currentTab}`}>Status Perkawinan</InputLabel>
                  <Select
                    {...field}
                    id={`status-perkawinan-${currentTab}`}
                    labelId={`status-perkawinan-label-${currentTab}`}
                    label="Status Perkawinan"
                  >
                    <MenuItem value="Belum Menikah">Belum Menikah</MenuItem>
                    <MenuItem value="Menikah">Menikah</MenuItem>
                    <MenuItem value="Duda">Duda</MenuItem>
                    <MenuItem value="Janda">Janda</MenuItem>
                  </Select>
                  <FormHelperText>{errors.statusPerkawinan?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </FormField>

          <FormField label="Kewarganegaraan" error={errors.kewarganegaraan?.message}>
            <Controller
              name="kewarganegaraan"
              control={control}
              key={`kewarganegaraan-${currentTab}`}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.kewarganegaraan}>
                  <InputLabel id={`kewarganegaraan-label-${currentTab}`}>Kewarganegaraan</InputLabel>
                  <Select
                    {...field}
                    id={`kewarganegaraan-${currentTab}`}
                    labelId={`kewarganegaraan-label-${currentTab}`}
                    label="Kewarganegaraan"
                  >
                    <MenuItem value="WNI">WNI</MenuItem>
                    <MenuItem value="WNA">WNA</MenuItem>
                  </Select>
                  <FormHelperText>{errors.kewarganegaraan?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </FormField>

          <FormField label="Golongan Darah" error={errors.golonganDarah?.message}>
            <Controller
              name="golonganDarah"
              control={control}
              key={`golongan-darah-${currentTab}`}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.golonganDarah}>
                  <InputLabel id={`golongan-darah-label-${currentTab}`}>Golongan Darah</InputLabel>
                  <Select
                    {...field}
                    id={`golongan-darah-${currentTab}`}
                    labelId={`golongan-darah-label-${currentTab}`}
                    label="Golongan Darah"
                  >
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="AB">AB</MenuItem>
                    <MenuItem value="O">O</MenuItem>
                  </Select>
                  <FormHelperText>{errors.golonganDarah?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </FormField>
        </Box>
      ),
    },
    {
      title: 'Alamat & Kontak',
      fields: (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Full width address field */}
          <Box sx={{ gridColumn: 'span 2' }}>
            <FormField label="Alamat Lengkap" error={errors.alamatLengkap?.message}>
              <Controller
                name="alamatLengkap"
                control={control}
                key={`alamat-lengkap-${currentTab}`}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id={`alamat-lengkap-${currentTab}`}
                    label="Alamat Lengkap"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.alamatLengkap}
                    helperText={errors.alamatLengkap?.message}
                  />
                )}
              />
            </FormField>
          </Box>

          {/* RT/RW fields side by side */}
          <FormField label="RT" error={errors.rt?.message}>
            <Controller
              name="rt"
              control={control}
              key={`rt-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`rt-${currentTab}`}
                  label="RT"
                  variant="outlined"
                  fullWidth
                  error={!!errors.rt}
                  helperText={errors.rt?.message}
                  inputProps={{ 
                    maxLength: 3,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    field.onChange(value);
                  }}
                />
              )}
            />
          </FormField>

          <FormField label="RW" error={errors.rw?.message}>
            <Controller
              name="rw"
              control={control}
              key={`rw-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`rw-${currentTab}`}
                  label="RW"
                  variant="outlined"
                  fullWidth
                  error={!!errors.rw}
                  helperText={errors.rw?.message}
                  inputProps={{ 
                    maxLength: 3,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    field.onChange(value);
                  }}
                />
              )}
            />
          </FormField>

          {/* Province Selection */}
          <FormField label="Provinsi" error={errors.provinsi?.message}>
            <Controller
              name="provinsi"
              control={control}
              key={`provinsi-${currentTab}`}
              render={({ field }) => (
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  value={field.value ? { value: field.value, label: field.value } : null}
                  loadOptions={async () => {
                    const provinces = await fetchProvinces();
                    return provinces.map(p => ({ 
                      value: p.id, 
                      label: p.name 
                    }));
                  }}
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: 'white',  // or '#ffffff'
                      zIndex: 2
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
                      '&:hover': {
                        backgroundColor: '#f0f0f0'
                      }
                    })
                  }}
                  onChange={async (option: SelectOption | null) => {
                    if (option) {
                      field.onChange(option.label); // Store the name instead of ID
                      setValue('kota', '');
                      setValue('kecamatan', '');
                      setValue('kelurahan', '');
                      const regencies = await fetchRegencies(option.value);
                      setRegencyOptions(regencies.map(r => ({ value: r.id, label: r.name })));
                    } else {
                      field.onChange('');
                    }
                  }}
                  isClearable
                  isSearchable
                  placeholder="Pilih Provinsi"
                />
              )}
            />
          </FormField>

          {/* Regency/City Selection */}
          <FormField label="Kota/Kabupaten" error={errors.kota?.message}>
            <Controller
              name="kota"
              control={control}
              key={`kota-${currentTab}`}
              render={({ field }) => (
                <AsyncSelect
                  cacheOptions
                  defaultOptions={regencyOptions}
                  value={field.value ? { value: field.value, label: field.value } : null}
                  loadOptions={async () => regencyOptions}
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: 'white',  // or '#ffffff'
                      zIndex: 2
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
                      '&:hover': {
                        backgroundColor: '#f0f0f0'
                      }
                    })
                  }}
                  onChange={async (option: SelectOption | null) => {
                    if (option) {
                      field.onChange(option.label); // Store the name instead of ID
                      setValue('kecamatan', '');
                      setValue('kelurahan', '');
                      const districts = await fetchDistricts(option.value);
                      setDistrictOptions(districts.map(d => ({ value: d.id, label: d.name })));
                    } else {
                      field.onChange('');
                    }
                  }}
                  isClearable
                  isSearchable
                  placeholder="Pilih Kota/Kabupaten"
                  isDisabled={!watch('provinsi')}
                />
              )}
            />
          </FormField>

          {/* District Selection */}
          <FormField label="Kecamatan" error={errors.kecamatan?.message}>
            <Controller
              name="kecamatan"
              control={control}
              key={`kecamatan-${currentTab}`}
              render={({ field }) => (
                <AsyncSelect
                  cacheOptions
                  defaultOptions={districtOptions}
                  value={field.value ? { value: field.value, label: field.value } : null}
                  loadOptions={async () => districtOptions}
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: 'white',  // or '#ffffff'
                      zIndex: 2
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
                      '&:hover': {
                        backgroundColor: '#f0f0f0'
                      }
                    })
                  }}
                  onChange={async (option: SelectOption | null) => {
                    if (option) {
                      field.onChange(option.label); // Store the name instead of ID
                      setValue('kelurahan', '');
                      const villages = await fetchVillages(option.value);
                      setVillageOptions(villages.map(v => ({ value: v.id, label: v.name })));
                    } else {
                      field.onChange('');
                    }
                  }}
                  isClearable
                  isSearchable
                  placeholder="Pilih Kecamatan"
                  isDisabled={!watch('kota')}
                />
              )}
            />
          </FormField>

          {/* Village Selection */}
          <FormField label="Kelurahan" error={errors.kelurahan?.message}>
            <Controller
              name="kelurahan"
              control={control}
              key={`kelurahan-${currentTab}`}
              render={({ field }) => (
                <AsyncSelect
                  cacheOptions
                  defaultOptions={villageOptions}
                  value={field.value ? { value: field.value, label: field.value } : null}
                  loadOptions={async () => villageOptions}
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: 'white',  // or '#ffffff'
                      zIndex: 2
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
                      '&:hover': {
                        backgroundColor: '#f0f0f0'
                      }
                    })
                  }}
                  onChange={(option: SelectOption | null) => {
                    if (option) {
                      field.onChange(option.label); // Store the name instead of ID
                    } else {
                      field.onChange('');
                    }
                  }}
                  isClearable
                  isSearchable
                  placeholder="Pilih Kelurahan"
                  isDisabled={!watch('kecamatan')}
                />
              )}
            />
          </FormField>

          <FormField label="Kode Pos" error={errors.kodePos?.message}>
            <Controller
              name="kodePos"
              control={control}
              key={`kode-pos-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`kode-pos-${currentTab}`}
                  label="Kode Pos"
                  variant="outlined"
                  fullWidth
                  error={!!errors.kodePos}
                  helperText={errors.kodePos?.message}
                  inputProps={{ 
                    maxLength: 5,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    field.onChange(value);
                  }}
                />
              )}
            />
          </FormField>

          {/* Contact fields */}
          <FormField label="Nomor Telepon" error={errors.nomorTelepon?.message}>
            <Controller
              name="nomorTelepon"
              control={control}
              key={`nomor-telepon-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`nomor-telepon-${currentTab}`}
                  label="Nomor Telepon"
                  variant="outlined"
                  fullWidth
                  error={!!errors.nomorTelepon}
                  helperText={errors.nomorTelepon?.message}
                  inputProps={{ 
                    maxLength: 13,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    field.onChange(value);
                  }}
                />
              )}
            />
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <Controller
              name="email"
              control={control}
              defaultValue={userEmail}
              key={`email-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`email-${currentTab}`}
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  placeholder={userEmail || "Masukkan email"}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />
          </FormField>
        </Box>
      ),
    },
    {
      title: 'Pendidikan',
      fields: (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <FormField label="Pendidikan Terakhir" error={errors.pendidikanTerakhir?.message}>
            <Controller
              name="pendidikanTerakhir"
              control={control}
              key={`pendidikan-terakhir-${currentTab}`}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.pendidikanTerakhir}>
                  <InputLabel id={`pendidikan-terakhir-label-${currentTab}`}>Pendidikan Terakhir</InputLabel>
                  <Select
                    {...field}
                    id={`pendidikan-terakhir-${currentTab}`}
                    labelId={`pendidikan-terakhir-label-${currentTab}`}
                    label="Pendidikan Terakhir"
                  >
                    <MenuItem value="SD">SD</MenuItem>
                    <MenuItem value="SMP">SMP</MenuItem>
                    <MenuItem value="SMA">SMA/SMK</MenuItem>
                    <MenuItem value="D3">D3</MenuItem>
                    <MenuItem value="S1">S1</MenuItem>
                    <MenuItem value="S2">S2</MenuItem>
                    <MenuItem value="S3">S3</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </FormField>

          <FormField label="Nama Sekolah" error={errors.namaSekolah?.message}>
            <Controller
              name="namaSekolah"
              control={control}
              key={`nama-sekolah-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`nama-sekolah-${currentTab}`}
                  label="Nama Sekolah/Universitas"
                  fullWidth
                />
              )}
            />
          </FormField>

          <FormField label="Jurusan" error={errors.jurusan?.message}>
            <Controller
              name="jurusan"
              control={control}
              key={`jurusan-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`jurusan-${currentTab}`}
                  label="Jurusan"
                  fullWidth
                />
              )}
            />
          </FormField>

          <FormField label="Tahun Lulus" error={errors.tahunLulus?.message}>
            <Controller
              name="tahunLulus"
              control={control}
              key={`tahun-lulus-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`tahun-lulus-${currentTab}`}
                  label="Tahun Lulus"
                  fullWidth
                  inputProps={{ maxLength: 4 }}
                />
              )}
            />
          </FormField>
        </Box>
      ),
    },
    {
      title: 'Pekerjaan',
      fields: (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <FormField label="Pekerjaan" error={errors.pekerjaan?.message}>
            <Controller
              name="pekerjaan"
              control={control}
              key={`pekerjaan-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`pekerjaan-${currentTab}`}
                  label="Pekerjaan"
                  fullWidth
                />
              )}
            />
          </FormField>

          <FormField label="Nama Instansi" error={errors.namaInstansi?.message}>
            <Controller
              name="namaInstansi"
              control={control}
              key={`nama-instansi-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`nama-instansi-${currentTab}`}
                  label="Nama Instansi/Perusahaan"
                  fullWidth
                />
              )}
            />
          </FormField>

          <Box sx={{ gridColumn: 'span 2' }}>
            <FormField label="Alamat Kantor" error={errors.alamatKantor?.message}>
              <Controller
                name="alamatKantor"
                control={control}
                key={`alamat-kantor-${currentTab}`}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id={`alamat-kantor-${currentTab}`}
                    label="Alamat Kantor"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
            </FormField>
          </Box>

          <FormField label="Telepon Kantor" error={errors.teleponKantor?.message}>
            <Controller
              name="teleponKantor"
              control={control}
              key={`telepon-kantor-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`telepon-kantor-${currentTab}`}
                  label="Telepon Kantor"
                  fullWidth
                />
              )}
            />
          </FormField>
        </Box>
      ),
    },
    {
      title: 'Keluarga',
      fields: (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <FormField label="Nama Ayah" error={errors.namaAyah?.message}>
            <Controller
              name="namaAyah"
              control={control}
              key={`nama-ayah-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`nama-ayah-${currentTab}`}
                  label="Nama Ayah"
                  fullWidth
                />
              )}
            />
          </FormField>

          <FormField label="Nama Ibu" error={errors.namaIbu?.message}>
            <Controller
              name="namaIbu"
              control={control}
              key={`nama-ibu-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`nama-ibu-${currentTab}`}
                  label="Nama Ibu"
                  fullWidth
                />
              )}
            />
          </FormField>

          <FormField label="Nama Pasangan" error={errors.namaPasangan?.message}>
            <Controller
              name="namaPasangan"
              control={control}
              key={`nama-pasangan-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`nama-pasangan-${currentTab}`}
                  label="Nama Pasangan (Jika Menikah)"
                  fullWidth
                />
              )}
            />
          </FormField>

          <FormField label="Jumlah Anak" error={errors.jumlahAnak?.message}>
            <Controller
              name="jumlahAnak"
              control={control}
              key={`jumlah-anak-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`jumlah-anak-${currentTab}`}
                  label="Jumlah Anak"
                  fullWidth
                  type="number"
                  inputProps={{ min: 0 }}
                />
              )}
            />
          </FormField>
        </Box>
      ),
    },
    {
      title: 'Informasi Tambahan',
      fields: (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box sx={{ gridColumn: 'span 2' }}>
            <FormField label="Keperluan SKCK" error={errors.keperluanSKCK?.message}>
              <Controller
                name="keperluanSKCK"
                control={control}
                key={`keperluan-skck-${currentTab}`}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id={`keperluan-skck-${currentTab}`}
                    label="Keperluan SKCK"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
            </FormField>
          </Box>

          <Box sx={{ gridColumn: 'span 2' }}>
            <FormField label="Pernah Terlibat Kasus" error={errors.pernahTerlibatKasus?.message}>
              <Controller
                name="pernahTerlibatKasus"
                control={control}
                key={`pernah-terlibat-kasus-${currentTab}`}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Pernah Terlibat Kasus Kriminal"
                  />
                )}
              />
            </FormField>
          </Box>

          <FormField label="Tinggi Badan" error={errors.tinggiBadan?.message}>
            <Controller
              name="tinggiBadan"
              control={control}
              key={`tinggi-badan-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`tinggi-badan-${currentTab}`}
                  label="Tinggi Badan (cm)"
                  fullWidth
                  type="number"
                  inputProps={{ min: 0 }}
                />
              )}
            />
          </FormField>

          <FormField label="Berat Badan" error={errors.beratBadan?.message}>
            <Controller
              name="beratBadan"
              control={control}
              key={`berat-badan-${currentTab}`}
              render={({ field }) => (
                <TextField
                  {...field}
                  id={`berat-badan-${currentTab}`}
                  label="Berat Badan (kg)"
                  fullWidth
                  type="number"
                  inputProps={{ min: 0 }}
                />
              )}
            />
          </FormField>

          <Box sx={{ gridColumn: 'span 2' }}>
            <FormField label="Tanda Khusus" error={errors.tandaKhusus?.message}>
              <Controller
                name="tandaKhusus"
                control={control}
                key={`tanda-khusus-${currentTab}`}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id={`tanda-khusus-${currentTab}`}
                    label="Tanda Khusus (Ciri Fisik)"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
            </FormField>
          </Box>
        </Box>
      ),
    }
  ];

  // Define fields for each tab
  const tabFields = {
    0: [ // Data Diri
      'namaLengkap', 'tempatLahir', 'tanggalLahir', 'jenisKelamin', 'nik',
      'agama', 'statusPerkawinan', 'kewarganegaraan', 'golonganDarah'
    ],
    1: [ // Alamat & Kontak
      'alamatLengkap', 'provinsi', 'rt', 'rw', 'kelurahan', 'kecamatan',
      'kota', 'kodePos', 'nomorTelepon', 'email'
    ],
    2: [ // Pendidikan
      'pendidikanTerakhir', 'namaSekolah', 'jurusan', 'tahunLulus'
    ],
    3: [ // Pekerjaan
      'pekerjaan', 'namaInstansi', 'alamatKantor', 'teleponKantor'
    ],
    4: [ // Keluarga
      'namaAyah', 'namaIbu', 'namaPasangan', 'jumlahAnak'
    ],
    5: [ // Informasi Tambahan
      'keperluanSKCK', 'pernahTerlibatKasus', 'tinggiBadan', 'beratBadan', 'tandaKhusus'
    ]
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {steps[currentTab]}
              </Typography>
              <Stepper activeStep={currentTab} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              {tabPanels[currentTab].fields}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={previousTab}
                  sx={{ visibility: currentTab === 0 ? 'hidden' : 'visible' }}
                >
                  Sebelumnya
                </Button>
                
                {currentTab === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Submit'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={nextTab}
                    color="primary"
                    disabled={isSubmitting || tabFields[currentTab as keyof typeof tabFields].some(field => 
                      !watch(field as keyof FormData) && 
                      field !== 'email' && 
                      field !== 'jurusan' && 
                      field !== 'teleponKantor' && 
                      field !== 'namaPasangan' && 
                      field !== 'jumlahAnak' &&
                      field !== 'tandaKhusus'
                    )}
                  >
                    Selanjutnya
                  </Button>
                )}
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
} 