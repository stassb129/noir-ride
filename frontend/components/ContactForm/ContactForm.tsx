'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import styles from './ContactForm.module.scss';

export default function ContactForm() {
  const locale = useLocale();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, source: 'home' }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setStatus('success');
      setName('');
      setPhone('');
      
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className={styles.form}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
    >
      <h3 className={styles.title}>
        {locale === 'ru' ? 'Укажите ваши контактные данные' : 'Provide your contact details'}
      </h3>
      
      <p className={styles.subtitle}>
        {locale === 'ru' 
          ? 'И наш менеджер свяжется с вами в течение 30 минут в рабочее время'
          : 'And our manager will contact you within 30 minutes during business hours'}
      </p>

      <form onSubmit={handleSubmit} className={styles.formContent}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Как к вам обращаться:' : 'How to address you:'}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={locale === 'ru' ? 'Например: Иван' : 'Example: John'}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Введите ваш телефон:' : 'Enter your phone:'}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (000) 000-00-00"
            className={styles.input}
            required
          />
        </div>

        {status === 'success' && (
          <motion.p 
            className={styles.success}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {locale === 'ru' ? 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.' : 'Request sent! We will contact you soon.'}
          </motion.p>
        )}

        {status === 'error' && (
          <motion.p 
            className={styles.error}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {locale === 'ru' ? 'Ошибка отправки. Попробуйте позже.' : 'Submission error. Try later.'}
          </motion.p>
        )}

        <motion.button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting 
            ? (locale === 'ru' ? 'Отправка...' : 'Sending...') 
            : (locale === 'ru' ? 'Отправить заявку' : 'Send request')}
        </motion.button>

        <p className={styles.notice}>
          {locale === 'ru' 
            ? 'Оставляя заявку, вы соглашаетесь на обработку персональных данных и с условиями бронирования.'
            : 'By submitting a request, you agree to the processing of personal data and booking terms.'}
        </p>
      </form>
    </motion.div>
  );
}
