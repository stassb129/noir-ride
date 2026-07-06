'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import PhoneInput from '@/components/ui/PhoneInput/PhoneInput';
import { setToken } from '@/lib/user-auth';
import { useUser } from '@/lib/hooks/useUser';
import styles from './AuthForm.module.scss';

interface Props {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: Props) {
  const locale = useLocale();
  const ru = locale === 'ru';
  const router = useRouter();
  const { setUser } = useUser();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const endpoint = mode === 'register'
      ? `${process.env.NEXT_PUBLIC_API_URL}/auth/user/register`
      : `${process.env.NEXT_PUBLIC_API_URL}/auth/user/login`;

    const body = mode === 'register'
      ? { phone, password, name: name || undefined }
      : { phone, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? (ru ? 'Произошла ошибка' : 'An error occurred'));
        return;
      }

      setToken(data.access_token);
      setUser(data.user);
      router.push(`/${locale}/account`);
    } catch {
      setError(ru ? 'Ошибка соединения. Проверьте интернет.' : 'Connection error. Check your internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchHref = mode === 'login'
    ? `/${locale}/account/register`
    : `/${locale}/account/login`;

  const switchText = mode === 'login'
    ? (ru ? 'Нет аккаунта? ' : "Don't have an account? ")
    : (ru ? 'Уже есть аккаунт? ' : 'Already have an account? ');

  const switchLink = mode === 'login'
    ? (ru ? 'Зарегистрироваться' : 'Register')
    : (ru ? 'Войти' : 'Log in');

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span>NOIR</span>
          <span>RIDE</span>
        </div>

        <h1 className={styles.title}>
          {mode === 'login'
            ? (ru ? 'Вход в личный кабинет' : 'Sign in to your account')
            : (ru ? 'Создать аккаунт' : 'Create an account')}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'login'
            ? (ru ? 'Войдите, чтобы видеть историю заказов' : 'Sign in to view your booking history')
            : (ru ? 'Зарегистрируйтесь для отслеживания заказов' : 'Register to track your bookings')}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>{ru ? 'Имя (необязательно)' : 'Name (optional)'}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={ru ? 'Иван Иванов' : 'John Doe'}
                className={styles.input}
                autoComplete="name"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>{ru ? 'Телефон' : 'Phone number'}</label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{ru ? 'Пароль' : 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? (ru ? 'Минимум 6 символов' : 'At least 6 characters') : '••••••••'}
              className={styles.input}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading
              ? (ru ? 'Загрузка...' : 'Loading...')
              : mode === 'login'
                ? (ru ? 'Войти' : 'Sign in')
                : (ru ? 'Зарегистрироваться' : 'Create account')}
          </button>
        </form>

        <p className={styles.switch}>
          {switchText}
          <a onClick={() => router.push(switchHref)}>{switchLink}</a>
        </p>
      </div>
    </div>
  );
}
