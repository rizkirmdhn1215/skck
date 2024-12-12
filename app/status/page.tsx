'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CardActionArea,
  CircularProgress
} from '@mui/material';

interface Application {
  id: string;
  namaLengkap: string;
  nik: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  keperluanSKCK: string;
}

export default function StatusPage() {
  const { user, loading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to initialize
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Only fetch data if we have a user
    const fetchApplications = async () => {
      try {
        const applicationsRef = collection(db, 'skck_applications');
        const q = query(
          applicationsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const apps = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Application));

        setApplications(apps);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchApplications();
  }, [user, loading, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      default: return 'Menunggu';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Status Pengajuan SKCK
        </Typography>

        {applications.length === 0 ? (
          <Card>
            <CardContent>
              <Typography>Belum ada pengajuan SKCK</Typography>
            </CardContent>
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id} sx={{ mb: 2 }}>
              <CardActionArea onClick={() => router.push(`/status/${app.id}`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {app.namaLengkap}
                    </Typography>
                    <Chip
                      label={getStatusText(app.status)}
                      color={getStatusColor(app.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography color="text.secondary" gutterBottom>
                    NIK: {app.nik}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Keperluan: {app.keperluanSKCK}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Tanggal Pengajuan: {app.createdAt?.toDate().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))
        )}
      </Box>
    </DashboardLayout>
  );
} 