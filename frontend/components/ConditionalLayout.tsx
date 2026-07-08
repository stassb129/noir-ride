'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import SmoothScroll from './SmoothScroll/SmoothScroll';
import ScrollProgress from './ScrollProgress/ScrollProgress';
import CursorFollower from './CursorFollower/CursorFollower';
import { UserProvider } from '@/lib/providers/UserProvider';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes('/admin');

  return (
    <UserProvider>
      <SmoothScroll />
      {!isAdminRoute && <ScrollProgress />}
      {!isAdminRoute && <CursorFollower />}
      {!isAdminRoute && <Navbar />}
      <main>{children}</main>
      {!isAdminRoute && <Footer />}
    </UserProvider>
  );
}
