'use client';

import { redirect } from 'next/navigation';

export default function RootPage() {
  
  // This page is now a redirect handler
  redirect('/es');

  return null;
}
