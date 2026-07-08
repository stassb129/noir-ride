'use client';

import { useLocale } from 'next-intl';
import ContactForm from '@/components/ContactForm/ContactForm';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import { MessageSquare } from 'lucide-react';
import styles from './LeadFormSection.module.scss';

export default function LeadFormSection() {
  const locale = useLocale();
  const ru = locale.startsWith('ru');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeading
          as="h2"
          size="section"
          eyebrow={ru ? 'Заявка' : 'Request'}
          title={ru ? 'Оставьте заявку — перезвоним за 30 минут' : 'Leave a request — we call back in 30 minutes'}
          description={
            ru
              ? 'Заполните короткую форму, менеджер уточнит детали и предложит лучший вариант поездки.'
              : 'Fill in a short form, and our manager will confirm details and suggest the best ride option.'
          }
          icon={MessageSquare}
          align="center"
          animate
        />

        <div className={styles.formWrap}>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

