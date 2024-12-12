'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: [{
    description: string;
  }];
  name: string;
}

interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface RecentApplication {
  id: string;
  namaLengkap: string;
  createdAt: any;
  status: string;
  keperluanSKCK: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<ApplicationStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Fetch applications statistics
        const applicationsRef = collection(db, 'skck_applications');
        const userApplicationsQuery = query(
          applicationsRef,
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(userApplicationsQuery);
        const applications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as { id: string; status: 'pending' | 'approved' | 'rejected' }));

        // Calculate stats
        const stats = applications.reduce((acc, app) => {
          acc.total++;
          acc[app.status]++;
          return acc;
        }, { total: 0, pending: 0, approved: 0, rejected: 0 });

        setStats(stats);

        // Fetch recent applications
        const recentQuery = query(
          applicationsRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const recentSnapshot = await getDocs(recentQuery);
        const recentApps = recentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as RecentApplication));

        setRecentApplications(recentApps);

        // Fetch weather data (you'll need to get an API key from OpenWeatherMap)
        const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Jakarta&units=metric&appid=${WEATHER_API_KEY}`
        );
        const weatherData = await response.json();
        setWeather(weatherData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <div className="space-y-6">
        {/* Weather Card */}
        {weather && weather.main && weather.weather && weather.weather[0] && (
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-6">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6">Cuaca di {weather.name}</Typography>
                  <Typography variant="h4">{Math.round(weather.main.temp)}°C</Typography>
                  <Typography>{weather.weather[0].description}</Typography>
                </div>
                <div>
                  <FiAlertCircle className="w-10 h-10" />
                  <Typography>Kelembaban: {weather.main.humidity}%</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Pengajuan"
            value={stats.total.toString()}
            icon={<FiUsers className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Menunggu Review"
            value={stats.pending.toString()}
            icon={<FiClock className="w-6 h-6" />}
            color="yellow"
          />
          <StatsCard
            title="Disetujui"
            value={stats.approved.toString()}
            icon={<FiCheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Ditolak"
            value={stats.rejected.toString()}
            icon={<FiXCircle className="w-6 h-6" />}
            color="red"
          />
        </div>

        {/* Recent Applications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Pengajuan Terbaru</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keperluan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentApplications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.namaLengkap}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.createdAt?.toDate().toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={application.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.keperluanSKCK}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => router.push(`/status/${application.id}`)}
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatsCard({ title, value, icon, color }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'green' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusClasses = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
      {status}
    </span>
  );
} 