'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Slide, useTheme } from '@mui/material';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export default function NotificationPopup() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (!user) return;

    // Query for unread notifications
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      setNotifications(newNotifications);

      // Mark notifications as read after 20 seconds
      newNotifications.forEach(notification => {
        setTimeout(async () => {
          await updateDoc(doc(db, 'notifications', notification.id), {
            read: true
          });
        }, 20000);
      });
    });

    return () => unsubscribe();
  }, [user]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Slide
          key={notification.id}
          direction="left"
          in={true}
          mountOnEnter
          unmountOnExit
        >
          <Alert 
            severity={notification.title.includes('Ditolak') ? 'error' : 'success'}
            className="mb-2 shadow-lg dark:bg-gray-800 dark:text-white"
            sx={{
              '& .MuiAlert-icon': {
                color: theme.palette.mode === 'dark' ? 'inherit' : undefined
              }
            }}
          >
            <div className="font-semibold dark:text-white">{notification.title}</div>
            <div className="text-sm dark:text-gray-300">{notification.message}</div>
          </Alert>
        </Slide>
      ))}
    </div>
  );
} 