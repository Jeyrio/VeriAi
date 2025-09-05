'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChallengePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/challenge');
  }, [router]);

  return null;
}
