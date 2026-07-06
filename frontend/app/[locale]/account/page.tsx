'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { useUser } from '@/lib/hooks/useUser';
import { getToken, getAuthHeaders } from '@/lib/user-auth';
import AccountBookings from '@/components/AccountBookings/AccountBookings';
import styles from './account.module.scss';

function getInitials(name: string | null, phone: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return phone.replace(/\D/g, '').slice(-2);
}

export default function AccountPage() {
  const locale = useLocale();
  const ru = locale === 'ru';
  const router = useRouter();
  const { user, isLoading, logout, setUser } = useUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !getToken()) {
      router.replace(`/${locale}/account/login`);
    }
  }, [isLoading, locale, router]);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          name: name || undefined,
          email: email || undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingPage}>
        {ru ? 'Загрузка...' : 'Loading...'}
      </div>
    );
  }

  if (!user) return null;

  const initials = getInitials(user.name, user.phone);
  const displayName = user.name || (ru ? 'Гость' : 'Guest');

  const quickLinks = [
    {
      href: `/${locale}/routes`,
      label: ru ? 'Межгород' : 'Intercity',
      hint: ru ? 'Заказать поездку' : 'Book a ride',
    },
    {
      href: `/${locale}/airport`,
      label: ru ? 'Аэропорт' : 'Airport',
      hint: ru ? 'Трансфер' : 'Transfer',
    },
    {
      href: `/${locale}/hourly`,
      label: ru ? 'Почасовая' : 'Hourly',
      hint: ru ? 'Аренда с водителем' : 'Chauffeur rental',
    },
  ];

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.avatar} aria-hidden>{initials}</div>
            <div className={styles.heroText}>
              <p className={styles.heroEyebrow}>
                {ru ? 'Личный кабинет' : 'Personal account'}
              </p>
              <h1 className={styles.heroTitle}>{displayName}</h1>
              <p className={styles.heroPhone}>{user.phone}</p>
            </div>
            <div className={styles.heroActions}>
              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                {ru ? 'Выйти' : 'Log out'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className={styles.quickActions}>
          {quickLinks.map(({ href, label, hint }) => (
            <Link key={href} href={href} className={styles.quickAction}>
              <span className={styles.quickActionLabel}>{label}</span>
              <span className={styles.quickActionHint}>{hint}</span>
            </Link>
          ))}
        </div>

        {/* Profile + Bookings */}
        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>{ru ? 'Профиль' : 'Profile'}</h2>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className={styles.formFields}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{ru ? 'Телефон' : 'Phone'}</label>
                  <input className={styles.input} value={user.phone} readOnly />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{ru ? 'Имя' : 'Name'}</label>
                  <input
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={ru ? 'Ваше имя' : 'Your name'}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              <div className={styles.formFooter}>
                <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                  {isSaving ? (ru ? 'Сохранение...' : 'Saving...') : (ru ? 'Сохранить' : 'Save')}
                </button>
                {saveSuccess && (
                  <span className={styles.saveSuccess}>{ru ? 'Сохранено!' : 'Saved!'}</span>
                )}
              </div>
            </form>
          </section>

          <section className={`${styles.panel} ${styles.bookingsPanel}`}>
            <AccountBookings embedded />
          </section>
        </div>
      </div>
    </motion.div>
  );
}
