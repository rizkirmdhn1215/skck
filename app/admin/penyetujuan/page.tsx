'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider,
} from '@mui/material';
import toast from 'react-hot-toast';

interface Application {
  id: string;
  namaLengkap: string;
  nik: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  keperluanSKCK: string;
  alasanPenolakan?: string;
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
  namaInstansi: string;
  pernahTerlibatKasus: boolean;
  tinggiBadan: string;
  beratBadan: string;
  tandaKhusus: string;
}

export default function Penyetujuan() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      const applicationsRef = collection(db, 'skck_applications');
      const q = query(
        applicationsRef,
        where('status', '==', 'pending'),
      );

      const querySnapshot = await getDocs(q);
      const apps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application));

      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Gagal memuat data pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (application: Application) => {
    setSelectedApp(application);
    setReviewStatus('approved');
    setRejectionReason('');
    setOpenDialog(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedApp) return;

    try {
      const appRef = doc(db, 'skck_applications', selectedApp.id);
      const updateData: any = {
        status: reviewStatus,
        reviewedAt: new Date(),
      };

      if (reviewStatus === 'rejected') {
        if (!rejectionReason.trim()) {
          toast.error('Alasan penolakan harus diisi');
          return;
        }
        updateData.alasanPenolakan = rejectionReason;
      }

      await updateDoc(appRef, updateData);

      // Create notification in Firestore
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId: selectedApp.userId,
        title: `Pengajuan SKCK ${reviewStatus === 'approved' ? 'Disetujui' : 'Ditolak'}`,
        message: reviewStatus === 'approved' 
          ? 'Pengajuan SKCK Anda telah disetujui'
          : `Pengajuan SKCK Anda ditolak dengan alasan: ${rejectionReason}`,
        createdAt: new Date(),
        read: false,
        type: 'skck_review',
        applicationId: selectedApp.id
      });

      toast.success('Review berhasil disimpan');
      setOpenDialog(false);
      fetchPendingApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Gagal menyimpan review');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Typography variant="h5" component="h1" gutterBottom>
        Penyetujuan SKCK
      </Typography>

      {applications.length === 0 ? (
        <Card>
          <CardContent>
            <Typography>Tidak ada pengajuan yang menunggu review</Typography>
          </CardContent>
        </Card>
      ) : (
        applications.map((app) => (
          <Card key={app.id} className="mb-4">
            <CardContent>
              <Box className="flex justify-between items-start mb-4">
                <div>
                  <Typography variant="h6" component="h2">
                    {app.namaLengkap}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    NIK: {app.nik}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Keperluan: {app.keperluanSKCK}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tanggal Pengajuan: {app.createdAt?.toDate().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Typography>
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleReviewClick(app)}
                >
                  Review
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      {/* Review Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Pengajuan SKCK</DialogTitle>
        <DialogContent>
          {selectedApp && (
            <Box className="space-y-4 mt-2">
              <Typography variant="h6">Data Pemohon</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Nama Lengkap</Typography>
                  <Typography>{selectedApp.namaLengkap}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">NIK</Typography>
                  <Typography>{selectedApp.nik}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Tempat, Tanggal Lahir</Typography>
                  <Typography>{`${selectedApp.tempatLahir}, ${new Date(selectedApp.tanggalLahir).toLocaleDateString('id-ID')}`}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Jenis Kelamin</Typography>
                  <Typography>{selectedApp.jenisKelamin}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Agama</Typography>
                  <Typography>{selectedApp.agama}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Status Perkawinan</Typography>
                  <Typography>{selectedApp.statusPerkawinan}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Pekerjaan</Typography>
                  <Typography>{selectedApp.pekerjaan}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Alamat Lengkap</Typography>
                  <Typography>
                    {`${selectedApp.alamatLengkap}, RT ${selectedApp.rt}/RW ${selectedApp.rw}, 
                    ${selectedApp.kelurahan}, ${selectedApp.kecamatan}, 
                    ${selectedApp.kota}, ${selectedApp.provinsi} ${selectedApp.kodePos}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Keperluan SKCK</Typography>
                  <Typography>{selectedApp.keperluanSKCK}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Nama Instansi</Typography>
                  <Typography>{selectedApp.namaInstansi}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Tinggi/Berat Badan</Typography>
                  <Typography>{`${selectedApp.tinggiBadan} cm / ${selectedApp.beratBadan} kg`}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Tanda Khusus</Typography>
                  <Typography>{selectedApp.tandaKhusus || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Pernah Terlibat Kasus</Typography>
                  <Typography>{selectedApp.pernahTerlibatKasus ? 'Ya' : 'Tidak'}</Typography>
                </Grid>
              </Grid>

              <Divider className="my-4" />
              
              <Typography variant="h6">Keputusan</Typography>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as 'approved' | 'rejected')}
                  label="Status"
                >
                  <MenuItem value="approved">Disetujui</MenuItem>
                  <MenuItem value="rejected">Ditolak</MenuItem>
                </Select>
              </FormControl>

              {reviewStatus === 'rejected' && (
                <TextField
                  fullWidth
                  label="Alasan Penolakan"
                  multiline
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Batal</Button>
          <Button onClick={handleReviewSubmit} variant="contained" color="primary">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
} 