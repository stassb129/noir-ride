'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { buildYandexRouteMapUrl } from '@/lib/airport-route';
import styles from './RouteMapPreview.module.scss';

interface Props {
  from: string;
  to: string;
  title?: string;
}

export default function RouteMapPreview({ from, to, title }: Props) {
  const locale = useLocale();
  const ru = locale.startsWith('ru');
  const [open, setOpen] = useState(false);

  const origin = from.trim();
  const destination = to.trim();
  if (!origin || !destination) return null;

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        {open
          ? (ru ? '✕ Скрыть карту' : '✕ Hide map')
          : (ru ? '🗺 Показать маршрут на карте' : '🗺 Show route on map')}
      </button>

      {open && (
        <div className={styles.frameWrap} data-lenis-prevent>
          <iframe
            title={title ?? (ru ? 'Маршрут' : 'Route')}
            src={buildYandexRouteMapUrl(origin, destination, ru)}
            className={styles.frame}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}
