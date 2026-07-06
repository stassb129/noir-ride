'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import { UserProvider } from '@/lib/providers/UserProvider';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes('/admin');

  return (
    <UserProvider>
      {!isAdminRoute && <Navbar />}
      <main>{children}</main>
      {!isAdminRoute && <Footer />}
    </UserProvider>
  );
}
