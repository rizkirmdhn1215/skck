'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Button,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { SKCKPdf } from '../../components/SKCKPdf';

interface SKCKApplication {
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  keperluanSKCK: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  namaInstansi: string;
  pernahTerlibatKasus: boolean;
  tinggiBadan: string;
  beratBadan: string;
  tandaKhusus?: string;
  // Add other fields as needed
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Menunggu';
    case 'approved':
      return 'Disetujui';
    case 'rejected':
      return 'Ditolak';
    default:
      return 'Unknown';
  }
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [application, setApplication] = useState<SKCKApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          toast.error('Silakan login terlebih dahulu');
          router.push('/login');
          return;
        }

        const docRef = doc(db, 'skck_applications', resolvedParams.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as SKCKApplication;
          // Verify that the current user owns this application
          if (data.userId !== currentUser.uid) {
            toast.error('Anda tidak memiliki akses ke pengajuan ini');
            router.push('/status');
            return;
          }
          setApplication({ ...data, id: docSnap.id });
        } else {
          toast.error('Pengajuan tidak ditemukan');
          router.push('/status');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        toast.error('Gagal mengambil detail pengajuan');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [resolvedParams.id, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Detail Pengajuan SKCK
          </Typography>
          <Box>
            <PDFDownloadLink
              document={<SKCKPdf data={application} />}
              fileName={`SKCK_${application.namaLengkap}.pdf`}
              style={{ textDecoration: 'none' }}
            >
              <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                Unduh PDF
              </Button>
            </PDFDownloadLink>
            <Button variant="outlined" onClick={() => router.push('/status')}>
              Kembali
            </Button>
          </Box>
        </Box>

        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Status Pengajuan
              </Typography>
              <Chip
                label={getStatusText(application.status)}
                color={getStatusColor(application.status)}
                sx={{ mt: 1 }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Tanggal Pengajuan
              </Typography>
              <Typography>
                {application.createdAt?.toDate().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Pribadi
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <DetailItem label="Nama Lengkap" value={application.namaLengkap} />
                  <DetailItem label="NIK" value={application.nik} />
                  <DetailItem label="Tempat Lahir" value={application.tempatLahir} />
                  <DetailItem 
                    label="Tanggal Lahir" 
                    value={new Date(application.tanggalLahir).toLocaleDateString('id-ID')} 
                  />
                  <DetailItem label="Jenis Kelamin" value={application.jenisKelamin} />
                  <DetailItem label="Agama" value={application.agama} />
                  <DetailItem label="Status Perkawinan" value={application.statusPerkawinan} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alamat & Kontak
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <DetailItem label="Alamat Lengkap" value={application.alamatLengkap} />
                  <DetailItem label="RT/RW" value={`${application.rt}/${application.rw}`} />
                  <DetailItem label="Kelurahan" value={application.kelurahan} />
                  <DetailItem label="Kecamatan" value={application.kecamatan} />
                  <DetailItem label="Kota/Kabupaten" value={application.kota} />
                  <DetailItem label="Provinsi" value={application.provinsi} />
                  <DetailItem label="Kode Pos" value={application.kodePos} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informasi Tambahan
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <DetailItem label="Pekerjaan" value={application.pekerjaan} />
                  <DetailItem label="Nama Instansi" value={application.namaInstansi} />
                  <DetailItem label="Keperluan SKCK" value={application.keperluanSKCK} />
                  <DetailItem 
                    label="Pernah Terlibat Kasus" 
                    value={application.pernahTerlibatKasus ? 'Ya' : 'Tidak'} 
                  />
                  <DetailItem label="Tinggi Badan" value={`${application.tinggiBadan} cm`} />
                  <DetailItem label="Berat Badan" value={`${application.beratBadan} kg`} />
                  {application.tandaKhusus && (
                    <DetailItem label="Tanda Khusus" value={application.tandaKhusus} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}

const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    p: 1,
    '&:hover': {
      bgcolor: 'rgba(0, 0, 0, 0.02)',
      borderRadius: 1
    }
  }}>
    <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body1">
      {value || '-'}
    </Typography>
  </Box>
);