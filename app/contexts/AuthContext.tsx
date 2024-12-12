'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
});

// Route configurations
const adminRoutes = ['/admin', '/admin/dashboard', '/admin/users', '/admin/applications'];
const userRoutes = ['/dashboard', '/pengajuan', '/status', '/bantuan'];
const publicRoutes = ['/login', '/daftar', '/'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.exists() ? userDoc.data().role : 'user';
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading || !pathname) return;

    if (!user) {
      // If not logged in and trying to access protected route
      if ([...adminRoutes, ...userRoutes].some(route => pathname.startsWith(route))) {
        router.replace('/login');
      }
      return;
    }

    // Handle route protection based on role
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isUserRoute = userRoutes.some(route => pathname.startsWith(route));

    if (isAdminRoute && userRole !== 'admin') {
      router.replace('/dashboard'); // Redirect non-admins to user dashboard
    } else if (isUserRoute && userRole === 'admin') {
      router.replace('/admin/dashboard'); // Redirect admins to admin dashboard
    }
  }, [pathname, user, userRole, loading, router]);

  // Function to create/update user in Firestore
  const createUserDocument = async (user: User, role: string = 'user') => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, userRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 