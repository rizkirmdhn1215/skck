'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export default function TawkToChat() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/675acad549e2fd8dfef6edb0/1ietagku8';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');

      script.onload = () => {
        const checkInterval = setInterval(() => {
          if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
            window.Tawk_API.hideWidget();
            setIsLoaded(true);
            clearInterval(checkInterval);
          }
        }, 500);
      };

      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  const handleStartChat = () => {
    if (window.Tawk_API && isLoaded) {
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
    }
  };

  return { handleStartChat };
} 