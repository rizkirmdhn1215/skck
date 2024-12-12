'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

interface Application {
  id: string;
  namaLengkap: string;
  nik: string;
  status: 'approved' | 'rejected';
  createdAt: any;
  reviewedAt: any;
  keperluanSKCK: string;
  alasanPenolakan?: string;
}

export default function Riwayat() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchReviewedApplications();
  }, []);

  const fetchReviewedApplications = async () => {
    try {
      const applicationsRef = collection(db, 'skck_applications');
      const q = query(
        applicationsRef,
        where('status', 'in', ['approved', 'rejected']),
        orderBy('reviewedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const apps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application));

      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'approved' ? 'success' : 'error';
  };

  const getStatusText = (status: string) => {
    return status === 'approved' ? 'Disetujui' : 'Ditolak';
  };

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' ? true : app.status === filterStatus
  );

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
      <Box className="space-y-4">
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h5" component="h1" gutterBottom>
              Riwayat Pengajuan SKCK
            </Typography>
          </Grid>
          <Grid item>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                label="Filter Status"
                size="small"
              >
                <MenuItem value="all">Semua</MenuItem>
                <MenuItem value="approved">Disetujui</MenuItem>
                <MenuItem value="rejected">Ditolak</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent>
              <Typography>Tidak ada riwayat pengajuan</Typography>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <Card key={app.id}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" component="h2">
                        {app.namaLengkap}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        NIK: {app.nik}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Keperluan: {app.keperluanSKCK}
                      </Typography>
                      {app.status === 'rejected' && app.alasanPenolakan && (
                        <Typography variant="body2" color="error" className="mt-2">
                          Alasan Penolakan: {app.alasanPenolakan}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4} className="flex flex-col items-end justify-between">
                      <Chip
                        label={getStatusText(app.status)}
                        color={getStatusColor(app.status)}
                        className="mb-2"
                      />
                      <div className="text-right">
                        <Typography variant="body2" color="textSecondary">
                          Tanggal Pengajuan: {app.createdAt?.toDate().toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Tanggal Review: {app.reviewedAt?.toDate().toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Typography>
                      </div>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Box>
    </DashboardLayout>
  );
} 