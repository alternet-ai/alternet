'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    void router.push('/home');
  }, [router]);

  return null; // Render nothing while redirecting
};

export default HomePage;