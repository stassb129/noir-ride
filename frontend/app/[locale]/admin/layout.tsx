'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './admin-layout.module.scss';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<any>(null);

  const isLoginPage = pathname?.endsWith('/login') || pathname?.endsWith('/admin/login');

  useEffect(() => {
    setMounted(true);
    
    const storedToken = localStorage.getItem('admin_token');
    const storedAdmin = localStorage.getItem('admin_user');
    
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  useEffect(() => {
    if (mounted && !token && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [mounted, token, isLoginPage, router]);

  const handleLogout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  // Show loading
  if (!mounted) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Загрузка...</p>
      </div>
    );
  }

  // Login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Protected pages
  if (!token) {
    return null;
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>NOIR RIDE</div>
        
        <nav className={styles.nav}>
          <a href="/admin" className={styles.navLink}>
            📊 Дашборд
          </a>
          <a href="/admin/bookings" className={styles.navLink}>
            📋 Все заявки
          </a>
          <a href="/admin/intercity" className={styles.navLink}>
            🗺️ Межгород
          </a>
          <a href="/admin/fleet" className={styles.navLink}>
            🚗 Автопарк
          </a>
          <a href="/admin/pricing" className={styles.navLink}>
            💰 Цены
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <div className={styles.adminName}>{admin?.name}</div>
            <div className={styles.adminEmail}>{admin?.email}</div>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Выйти
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
