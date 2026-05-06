'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main>{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
